/**
 * Claude API Client
 * 
 * Streaming Claude API integration with tool_use support.
 * Handles SSE proxy, retry logic, and content block separation.
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  getInitialAnalysisPrompt,
  getScopingPrompt,
  getAdditionalPhotoPrompt,
  getEstimateGenerationPrompt,
  UPDATE_UNDERSTANDING_TOOL,
  GENERATE_ESTIMATE_TOOL
} from './prompts.js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const MODEL = 'claude-3-5-sonnet-20241022';
const MAX_RETRIES = 2;
const INITIAL_RETRY_DELAY = 1000;

/**
 * Sleep utility for retry delays
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable (529 or 5xx)
 */
function isRetryableError(error) {
  if (!error.status) return false;
  return error.status === 529 || (error.status >= 500 && error.status < 600);
}

/**
 * Send SSE event to response stream
 */
function sendSSE(writer, event, data) {
  const encoder = new TextEncoder();
  writer.write(encoder.encode(`event: ${event}\n`));
  writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
}

/**
 * Stream Claude response with SSE events
 * @param {Object} options - Streaming options
 * @param {string} options.systemPrompt - System prompt
 * @param {Array} options.messages - Message history
 * @param {Array} options.tools - Tool definitions (optional)
 * @param {WritableStreamDefaultWriter} options.writer - SSE writer
 * @param {number} options.retryCount - Current retry attempt
 */
async function streamClaudeResponse({ systemPrompt, messages, tools = [], writer, retryCount = 0 }) {
  try {
    const requestParams = {
      model: MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages,
      stream: true
    };

    // Add tools if provided
    if (tools.length > 0) {
      requestParams.tools = tools;
    }

    const stream = await anthropic.messages.stream(requestParams);

    let textBuffer = '';
    let toolUseBlock = null;
    let toolUseName = null;
    let toolUseInput = '';

    for await (const event of stream) {
      // Content block start
      if (event.type === 'content_block_start') {
        if (event.content_block.type === 'tool_use') {
          toolUseName = event.content_block.name;
          toolUseInput = '';
        }
      }
      
      // Content block delta (streaming chunks)
      if (event.type === 'content_block_delta') {
        if (event.delta.type === 'text_delta') {
          textBuffer += event.delta.text;
          
          // Send text tokens in small batches (every ~50 chars for responsiveness)
          if (textBuffer.length >= 50) {
            sendSSE(writer, 'token', { text: textBuffer });
            textBuffer = '';
          }
        }
        
        if (event.delta.type === 'input_json_delta') {
          toolUseInput += event.delta.partial_json;
        }
      }
      
      // Content block stop
      if (event.type === 'content_block_stop') {
        // Flush any remaining text
        if (textBuffer.length > 0) {
          sendSSE(writer, 'token', { text: textBuffer });
          textBuffer = '';
        }
        
        // Parse and send tool_use metadata
        if (toolUseName && toolUseInput) {
          try {
            const parsedInput = JSON.parse(toolUseInput);
            sendSSE(writer, 'metadata', parsedInput);
            toolUseBlock = { name: toolUseName, input: parsedInput };
          } catch (parseError) {
            console.error('Failed to parse tool input:', parseError);
            console.error('Raw input:', toolUseInput);
          }
          toolUseName = null;
          toolUseInput = '';
        }
      }
      
      // Message complete
      if (event.type === 'message_stop') {
        // If tools were expected but not received, log warning
        if (tools.length > 0 && !toolUseBlock) {
          console.warn('Expected tool_use block but none received');
        }
        
        sendSSE(writer, 'done', {});
      }
    }

    return { success: true, toolUseBlock };

  } catch (error) {
    console.error('Claude API error:', error);
    
    // Retry on retryable errors
    if (isRetryableError(error) && retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      console.log(`Retrying after ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await sleep(delay);
      
      return streamClaudeResponse({
        systemPrompt,
        messages,
        tools,
        writer,
        retryCount: retryCount + 1
      });
    }
    
    // Send error event after exhausting retries
    const isRetryable = isRetryableError(error);
    sendSSE(writer, 'error', {
      message: error.message || 'An error occurred while processing your request',
      retryable: isRetryable
    });
    
    return { success: false, error };
  }
}

/**
 * Get photo from Supabase storage as base64
 */
async function getPhotoBase64(supabase, storagePath) {
  const { data, error } = await supabase.storage
    .from('project-photos')
    .download(storagePath);
  
  if (error) {
    throw new Error(`Failed to download photo: ${error.message}`);
  }
  
  const buffer = await data.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  
  // Detect MIME type from path extension
  const ext = storagePath.split('.').pop().toLowerCase();
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp'
  };
  const mimeType = mimeTypes[ext] || 'image/jpeg';
  
  return { base64, mimeType };
}

/**
 * Stream initial photo analysis (Prompt 6A)
 */
export async function streamInitialAnalysis(storagePath, supabase, writer) {
  const { base64, mimeType } = await getPhotoBase64(supabase, storagePath);
  
  const systemPrompt = getInitialAnalysisPrompt();
  
  const messages = [
    {
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mimeType,
            data: base64
          }
        },
        {
          type: 'text',
          text: 'What project do you see here?'
        }
      ]
    }
  ];
  
  return streamClaudeResponse({
    systemPrompt,
    messages,
    tools: [],
    writer
  });
}

/**
 * Stream scoping Q&A (Prompt 6B)
 */
export async function streamScopingQA(projectContext, userInput, writer) {
  const systemPrompt = getScopingPrompt(projectContext);
  
  const messages = [
    {
      role: 'user',
      content: userInput
    }
  ];
  
  return streamClaudeResponse({
    systemPrompt,
    messages,
    tools: [UPDATE_UNDERSTANDING_TOOL],
    writer
  });
}

/**
 * Stream additional photo analysis (Prompt 6C)
 */
export async function streamAdditionalPhoto(projectContext, storagePath, supabase, writer) {
  const { base64, mimeType } = await getPhotoBase64(supabase, storagePath);
  
  const systemPrompt = getAdditionalPhotoPrompt(projectContext);
  
  const messages = [
    {
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mimeType,
            data: base64
          }
        },
        {
          type: 'text',
          text: 'Here is an additional photo of the project. What new information does this provide?'
        }
      ]
    }
  ];
  
  return streamClaudeResponse({
    systemPrompt,
    messages,
    tools: [UPDATE_UNDERSTANDING_TOOL],
    writer
  });
}

/**
 * Stream correction analysis (re-run Prompt 6A with correction)
 */
export async function streamCorrectionAnalysis(storagePath, correctionText, supabase, writer) {
  const { base64, mimeType } = await getPhotoBase64(supabase, storagePath);
  
  const systemPrompt = getInitialAnalysisPrompt();
  
  const messages = [
    {
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mimeType,
            data: base64
          }
        },
        {
          type: 'text',
          text: `What project do you see here? The user says: "${correctionText}"`
        }
      ]
    }
  ];
  
  return streamClaudeResponse({
    systemPrompt,
    messages,
    tools: [],
    writer
  });
}

/**
 * Generate cost estimate (Prompt 6D)
 * Returns both narrative and structured estimate via tool_use
 */
export async function generateEstimate(projectContext, writer) {
  const systemPrompt = getEstimateGenerationPrompt(projectContext);
  
  const messages = [
    {
      role: 'user',
      content: 'Generate the complete scope and cost estimate for this project.'
    }
  ];
  
  const result = await streamClaudeResponse({
    systemPrompt,
    messages,
    tools: [GENERATE_ESTIMATE_TOOL],
    writer
  });
  
  // Return the tool_use block for database storage
  return result.toolUseBlock;
}
