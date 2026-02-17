/**
 * Email Delivery via Resend
 * 
 * Sends Property Summary Report PDF via email
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send Property Summary Report email
 * @param {string} to - Recipient email address
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @param {Object} reportSummary - Report summary data
 */
export async function sendReportEmail(to, pdfBuffer, reportSummary) {
  const { projectCount, totalLow, totalHigh } = reportSummary;

  try {
    const { data, error } = await resend.emails.send({
      from: 'BuildIt USA <noreply@builditusa.com>',
      to: [to],
      subject: 'Your BuildIt USA Property Summary Report',
      html: `
        <h2>Your Property Summary Report is Ready</h2>
        <p>Thank you for using BuildIt USA! Your complete property improvement plan is attached.</p>
        
        <h3>Report Summary:</h3>
        <ul>
          <li><strong>Projects analyzed:</strong> ${projectCount}</li>
          <li><strong>Total investment range:</strong> $${totalLow.toLocaleString()} - $${totalHigh.toLocaleString()}</li>
        </ul>
        
        <p>Your report includes:</p>
        <ul>
          <li>Priority sequencing for all projects</li>
          <li>Smart savings opportunities through bundling</li>
          <li>Quick wins under $2,000</li>
          <li>Complete investment summary</li>
          <li>What contractors need from you</li>
          <li>Recommended next steps</li>
        </ul>
        
        <p>Questions? Reply to this email or contact support@builditusa.com</p>
        
        <p>Best regards,<br>The BuildIt USA Team</p>
      `,
      attachments: [
        {
          filename: 'BuildIt-USA-Property-Report.pdf',
          content: pdfBuffer
        }
      ]
    });

    if (error) {
      console.error('Resend API error:', error);
      throw error;
    }

    console.log('Report email sent successfully:', data.id);
    return data;

  } catch (error) {
    console.error('Failed to send report email:', error);
    throw error;
  }
}
