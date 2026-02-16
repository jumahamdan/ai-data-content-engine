/**
 * Pillar-to-Theme/Layout Mapping
 *
 * Maps each of the 6 content pillar categories to a default theme + layout pairing.
 * These pairings are chosen based on the natural fit between content type and visual style.
 *
 * Usage:
 *   const { getThemeForPillar } = require('./pillar-theme-map');
 *   const { theme, layout } = getThemeForPillar('pipelines_architecture');
 *
 * Phase 7 Plan 01 - Pipeline Integration
 */

/**
 * Content pillar to theme/layout mapping
 *
 * Rationale for each pairing:
 * - pipelines_architecture: Pipeline flows are sequential progressions (whiteboard/evolution)
 * - cloud_lakehouse: Architecture comparisons use side-by-side columns (whiteboard/comparison)
 * - ai_data_workflows: AI workflows are dense and technical (tech/dense-infographic)
 * - automation_reliability: Guides feel like sketch notes (notebook/notebook)
 * - governance_trust: Layered models need packed multi-section display (dense-infographic/dense-infographic)
 * - real_world_lessons: Practitioner stories are single narrative (chalkboard/single)
 *
 * @type {Object.<string, {theme: string, layout: string}>}
 */
const PILLAR_THEME_MAP = {
  pipelines_architecture: { theme: 'whiteboard', layout: 'evolution' },
  cloud_lakehouse: { theme: 'whiteboard', layout: 'comparison' },
  ai_data_workflows: { theme: 'tech', layout: 'dense-infographic' },
  automation_reliability: { theme: 'notebook', layout: 'notebook' },
  governance_trust: { theme: 'dense-infographic', layout: 'dense-infographic' },
  real_world_lessons: { theme: 'chalkboard', layout: 'single' }
};

/**
 * Get theme and layout for a content pillar category
 *
 * @param {string} category - Content pillar category
 * @returns {{theme: string, layout: string}} Theme and layout pairing
 *
 * @example
 * const { theme, layout } = getThemeForPillar('pipelines_architecture');
 * // Returns: { theme: 'whiteboard', layout: 'evolution' }
 */
function getThemeForPillar(category) {
  if (!category || typeof category !== 'string') {
    console.warn(
      `[PillarThemeMap] Invalid category: ${category}. Falling back to default (chalkboard/single).`
    );
    return { theme: 'chalkboard', layout: 'single' };
  }

  const mapping = PILLAR_THEME_MAP[category];

  if (!mapping) {
    console.warn(
      `[PillarThemeMap] Unknown category: ${category}. Falling back to default (chalkboard/single).`
    );
    return { theme: 'chalkboard', layout: 'single' };
  }

  return mapping;
}

module.exports = {
  PILLAR_THEME_MAP,
  getThemeForPillar
};
