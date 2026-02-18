/**
 * Pillar-to-Theme/Layout Mapping
 *
 * Maps each of the 6 content pillar categories to a default theme + layout pairing.
 * These pairings are chosen based on the natural fit between content type and visual style.
 *
 * Whiteboard theme family:
 *   wb-glass-sticky     Glass-mounted whiteboard with sticky-note accents
 *   wb-glass-clean      Glass-mounted whiteboard, minimal and clean
 *   wb-standing-marker  Standing whiteboard with bold marker style
 *   wb-standing-minimal Standing whiteboard, clean corporate
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
 * - pipelines_architecture: Sequential flows as vertical flowchart on standing whiteboard
 * - cloud_lakehouse: Architecture comparisons as side-by-side columns on clean board
 * - ai_data_workflows: Dense AI/ML content in multi-section grid on premium glass board
 * - automation_reliability: Operational checklists as numbered sections on standing board
 * - governance_trust: Governance models with sticky-note elements on glass board
 * - real_world_lessons: Practitioner stories as vertical progression on glass board
 *
 * @type {Object.<string, {theme: string, layout: string}>}
 */
const PILLAR_THEME_MAP = {
  pipelines_architecture: { theme: 'wb-standing-marker', layout: 'evolution' },
  cloud_lakehouse: { theme: 'wb-standing-minimal', layout: 'comparison' },
  ai_data_workflows: { theme: 'wb-glass-clean', layout: 'dense-infographic' },
  automation_reliability: { theme: 'wb-standing-marker', layout: 'dense-infographic' },
  governance_trust: { theme: 'wb-glass-sticky', layout: 'whiteboard' },
  real_world_lessons: { theme: 'wb-glass-clean', layout: 'evolution' }
};

/**
 * Get theme and layout for a content pillar category
 *
 * @param {string} category - Content pillar category
 * @returns {{theme: string, layout: string}} Theme and layout pairing
 *
 * @example
 * const { theme, layout } = getThemeForPillar('pipelines_architecture');
 * // Returns: { theme: 'wb-standing-marker', layout: 'evolution' }
 */
function getThemeForPillar(category) {
  if (!category || typeof category !== 'string') {
    console.warn(
      `[PillarThemeMap] Invalid category: ${category}. Falling back to default (wb-standing-minimal/comparison).`
    );
    return { theme: 'wb-standing-minimal', layout: 'comparison' };
  }

  const mapping = PILLAR_THEME_MAP[category];

  if (!mapping) {
    console.warn(
      `[PillarThemeMap] Unknown category: ${category}. Falling back to default (wb-standing-minimal/comparison).`
    );
    return { theme: 'wb-standing-minimal', layout: 'comparison' };
  }

  return mapping;
}

module.exports = {
  PILLAR_THEME_MAP,
  getThemeForPillar
};
