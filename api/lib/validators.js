/**
 * JSON Schema Validators
 * 
 * Validates tool_use responses from Claude API against locked schemas.
 */

/**
 * Validate update_understanding tool response
 * Used by /api/analyze and /api/scope endpoints
 */
export function validateUnderstandingUpdate(json) {
  if (!json || typeof json !== 'object') {
    return { valid: false, error: 'Invalid JSON object' };
  }

  // Check required fields
  const requiredFields = [
    'understanding',
    'dimensions_resolved',
    'delta',
    'delta_reason',
    'next_unresolved'
  ];

  for (const field of requiredFields) {
    if (!(field in json)) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  // Validate understanding score (0-100)
  if (typeof json.understanding !== 'number' || 
      json.understanding < 0 || 
      json.understanding > 100) {
    return { valid: false, error: 'understanding must be a number between 0-100' };
  }

  // Validate dimensions_resolved object
  if (!json.dimensions_resolved || typeof json.dimensions_resolved !== 'object') {
    return { valid: false, error: 'dimensions_resolved must be an object' };
  }

  const requiredDimensions = [
    'project_type',
    'scope_direction',
    'space_dimensions',
    'condition',
    'materials_preference',
    'budget_framing',
    'timeline',
    'constraints'
  ];

  for (const dim of requiredDimensions) {
    if (typeof json.dimensions_resolved[dim] !== 'boolean') {
      return { valid: false, error: `dimensions_resolved.${dim} must be boolean` };
    }
  }

  // Validate delta
  if (typeof json.delta !== 'number') {
    return { valid: false, error: 'delta must be a number' };
  }

  // Validate delta_reason
  if (typeof json.delta_reason !== 'string') {
    return { valid: false, error: 'delta_reason must be a string' };
  }

  // Validate next_unresolved
  if (typeof json.next_unresolved !== 'string') {
    return { valid: false, error: 'next_unresolved must be a string' };
  }

  // cost_flag is optional, can be string or null
  if ('cost_flag' in json && 
      json.cost_flag !== null && 
      typeof json.cost_flag !== 'string') {
    return { valid: false, error: 'cost_flag must be string or null' };
  }

  return { valid: true };
}

/**
 * Validate cost estimate (generate_estimate tool response)
 * Used by /api/scope endpoint for estimate generation
 */
export function validateCostEstimate(json) {
  if (!json || typeof json !== 'object') {
    return { valid: false, error: 'Invalid JSON object' };
  }

  // Check required fields
  const requiredFields = [
    'line_items',
    'total_low',
    'total_high',
    'confidence',
    'unresolved_areas',
    'regional_note'
  ];

  for (const field of requiredFields) {
    if (!(field in json)) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  // Validate line_items array
  if (!Array.isArray(json.line_items)) {
    return { valid: false, error: 'line_items must be an array' };
  }

  for (let i = 0; i < json.line_items.length; i++) {
    const item = json.line_items[i];
    
    // Check required item fields
    const requiredItemFields = ['item', 'category', 'low', 'high', 'assumed'];
    for (const field of requiredItemFields) {
      if (!(field in item)) {
        return { valid: false, error: `line_items[${i}] missing field: ${field}` };
      }
    }

    // Validate types
    if (typeof item.item !== 'string') {
      return { valid: false, error: `line_items[${i}].item must be string` };
    }
    if (typeof item.category !== 'string') {
      return { valid: false, error: `line_items[${i}].category must be string` };
    }
    if (typeof item.low !== 'number') {
      return { valid: false, error: `line_items[${i}].low must be number` };
    }
    if (typeof item.high !== 'number') {
      return { valid: false, error: `line_items[${i}].high must be number` };
    }
    if (typeof item.assumed !== 'boolean') {
      return { valid: false, error: `line_items[${i}].assumed must be boolean` };
    }
    
    // notes is optional but must be string if present
    if ('notes' in item && typeof item.notes !== 'string') {
      return { valid: false, error: `line_items[${i}].notes must be string` };
    }
  }

  // Validate totals
  if (typeof json.total_low !== 'number') {
    return { valid: false, error: 'total_low must be number' };
  }
  if (typeof json.total_high !== 'number') {
    return { valid: false, error: 'total_high must be number' };
  }

  // Validate confidence enum
  if (!['low', 'medium', 'high'].includes(json.confidence)) {
    return { valid: false, error: 'confidence must be: low, medium, or high' };
  }

  // Validate unresolved_areas array
  if (!Array.isArray(json.unresolved_areas)) {
    return { valid: false, error: 'unresolved_areas must be an array' };
  }
  for (const area of json.unresolved_areas) {
    if (typeof area !== 'string') {
      return { valid: false, error: 'unresolved_areas items must be strings' };
    }
  }

  // Validate regional_note
  if (typeof json.regional_note !== 'string') {
    return { valid: false, error: 'regional_note must be string' };
  }

  return { valid: true };
}

/**
 * Validate cross-project analysis response
 * Used by payment webhook for Property Summary Report generation
 * 
 * @param {Object} json - Analysis JSON
 * @param {Array<string>} validProjectIds - Array of valid project UUIDs
 */
export function validateCrossProjectAnalysis(json, validProjectIds) {
  if (!json || typeof json !== 'object') {
    return { valid: false, error: 'Invalid JSON object' };
  }

  // Check required top-level fields
  const requiredFields = [
    'sequenced_projects',
    'bundle_groups',
    'quick_wins',
    'total_cost_range',
    'optimization_summary'
  ];

  for (const field of requiredFields) {
    if (!(field in json)) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  // Validate sequenced_projects array
  if (!Array.isArray(json.sequenced_projects)) {
    return { valid: false, error: 'sequenced_projects must be an array' };
  }

  for (let i = 0; i < json.sequenced_projects.length; i++) {
    const proj = json.sequenced_projects[i];
    
    // Check required fields
    const requiredProjFields = ['project_id', 'priority_score', 'recommended_sequence', 'reasoning'];
    for (const field of requiredProjFields) {
      if (!(field in proj)) {
        return { valid: false, error: `sequenced_projects[${i}] missing field: ${field}` };
      }
    }

    // Validate project_id exists in validProjectIds
    if (!validProjectIds.includes(proj.project_id)) {
      return { valid: false, error: `sequenced_projects[${i}].project_id not in valid projects` };
    }

    // Validate priority_score (1-100)
    if (typeof proj.priority_score !== 'number' || 
        proj.priority_score < 1 || 
        proj.priority_score > 100 ||
        !Number.isInteger(proj.priority_score)) {
      return { valid: false, error: `sequenced_projects[${i}].priority_score must be integer 1-100` };
    }

    // Validate recommended_sequence (positive integer)
    if (typeof proj.recommended_sequence !== 'number' || 
        proj.recommended_sequence < 1 ||
        !Number.isInteger(proj.recommended_sequence)) {
      return { valid: false, error: `sequenced_projects[${i}].recommended_sequence must be positive integer` };
    }

    // Validate reasoning
    if (typeof proj.reasoning !== 'string') {
      return { valid: false, error: `sequenced_projects[${i}].reasoning must be string` };
    }
  }

  // Validate bundle_groups array
  if (!Array.isArray(json.bundle_groups)) {
    return { valid: false, error: 'bundle_groups must be an array' };
  }

  for (let i = 0; i < json.bundle_groups.length; i++) {
    const bundle = json.bundle_groups[i];
    
    const requiredBundleFields = ['bundle_name', 'project_ids', 'estimated_savings_percent', 'reasoning'];
    for (const field of requiredBundleFields) {
      if (!(field in bundle)) {
        return { valid: false, error: `bundle_groups[${i}] missing field: ${field}` };
      }
    }

    // Validate project_ids array
    if (!Array.isArray(bundle.project_ids)) {
      return { valid: false, error: `bundle_groups[${i}].project_ids must be array` };
    }

    for (const pid of bundle.project_ids) {
      if (!validProjectIds.includes(pid)) {
        return { valid: false, error: `bundle_groups[${i}].project_ids contains invalid project_id` };
      }
    }

    // Validate estimated_savings_percent (0-100)
    if (typeof bundle.estimated_savings_percent !== 'number' || 
        bundle.estimated_savings_percent < 0 || 
        bundle.estimated_savings_percent > 100) {
      return { valid: false, error: `bundle_groups[${i}].estimated_savings_percent must be 0-100` };
    }

    // Validate strings
    if (typeof bundle.bundle_name !== 'string') {
      return { valid: false, error: `bundle_groups[${i}].bundle_name must be string` };
    }
    if (typeof bundle.reasoning !== 'string') {
      return { valid: false, error: `bundle_groups[${i}].reasoning must be string` };
    }
  }

  // Validate quick_wins array (project_ids)
  if (!Array.isArray(json.quick_wins)) {
    return { valid: false, error: 'quick_wins must be an array' };
  }

  for (const qwId of json.quick_wins) {
    if (!validProjectIds.includes(qwId)) {
      return { valid: false, error: 'quick_wins contains invalid project_id' };
    }
  }

  // Validate total_cost_range
  if (!json.total_cost_range || typeof json.total_cost_range !== 'object') {
    return { valid: false, error: 'total_cost_range must be object' };
  }
  if (typeof json.total_cost_range.low !== 'number') {
    return { valid: false, error: 'total_cost_range.low must be number' };
  }
  if (typeof json.total_cost_range.high !== 'number') {
    return { valid: false, error: 'total_cost_range.high must be number' };
  }

  // Validate optimization_summary
  if (typeof json.optimization_summary !== 'string') {
    return { valid: false, error: 'optimization_summary must be string' };
  }

  return { valid: true };
}
