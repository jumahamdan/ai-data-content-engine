/**
 * Workflow Integration for Image Generator
 * Bridges the OpenAI content output with the image generator
 */

const path = require('path');
const { generateImageToFile, generateImage, detectIcon, SECTION_COLORS } = require('./index');

// Template to image type mapping
const TEMPLATE_TO_IMAGE_TYPE = {
  'interview_explainer': 'card',
  'optimization': 'card',
  'architecture': 'diagram',
  'layered': 'diagram'
};

/**
 * Determine image type from template if not explicitly provided
 * @param {string} imageType - Explicitly provided type (may be undefined)
 * @param {string} template - Template name
 * @returns {string} "card" or "diagram"
 */
function resolveImageType(imageType, template) {
  if (imageType && ['card', 'diagram'].includes(imageType)) {
    return imageType;
  }
  return TEMPLATE_TO_IMAGE_TYPE[template] || 'card';
}

/**
 * Convert bullets to diagram sections for architecture/layered templates
 * @param {string[]} bullets - Bullet points
 * @param {string} template - Template name
 * @param {string} title - Image title (for context)
 * @returns {object[]} Section objects
 */
function bulletsToSections(bullets, template, title) {
  if (template === 'layered') {
    // Vertical layered format
    return bullets.map((bullet, i) => ({
      title: bullet.split(':')[0] || bullet.substring(0, 30),
      description: bullet.includes(':') ? bullet.split(':').slice(1).join(':').trim() : '',
      icon: detectIcon(bullet),
      color: SECTION_COLORS[i % SECTION_COLORS.length]
    }));
  } else {
    // Horizontal comparison format (architecture)
    return bullets.map((bullet, i) => ({
      title: bullet.split(':')[0] || bullet.substring(0, 20),
      items: bullet.includes(':') ? [bullet.split(':').slice(1).join(':').trim()] : [],
      icon: detectIcon(bullet),
      color: SECTION_COLORS[i % SECTION_COLORS.length]
    }));
  }
}

/**
 * Generate image from workflow content output
 * This is the main integration function for the n8n workflow
 *
 * @param {object} content - Content from OpenAI generation
 * @param {string} content.imageTitle - Title for the image
 * @param {string[]} content.imageBullets - Bullet points
 * @param {string} content.imageType - "card" or "diagram" (optional if template provided)
 * @param {object[]} content.imageSections - Section data for diagrams (optional)
 * @param {string} content.template - Template name
 * @param {object} options - Additional options
 * @param {string} options.outputDir - Directory to save image
 * @param {string} options.filename - Filename (without extension)
 * @param {string} options.theme - "light" or "dark"
 * @returns {Promise<{imagePath: string, imageType: string, buffer: Buffer}>}
 */
async function generateFromWorkflow(content, options = {}) {
  const {
    imageTitle,
    imageBullets = [],
    imageType: explicitType,
    imageSections,
    template
  } = content;

  const {
    outputDir = path.join(__dirname, '..', 'test-outputs'),
    filename = `image-${Date.now()}`,
    theme = 'light'
  } = options;

  // Resolve image type
  const imageType = resolveImageType(explicitType, template);

  // Prepare input for image generator
  const input = {
    imageType,
    imageTitle: imageTitle || 'Untitled',
    imageBullets,
    imageSections: imageSections || (imageType === 'diagram' ? bulletsToSections(imageBullets, template, imageTitle) : []),
    template,
    theme
  };

  // Generate image
  const outputPath = path.join(outputDir, `${filename}.png`);
  const result = await generateImageToFile(input, outputPath);

  // Also get the buffer for direct use (e.g., uploading to LinkedIn)
  const { buffer } = await generateImage(input);

  return {
    imagePath: result.path,
    imageType: result.type,
    buffer
  };
}

/**
 * Generate image buffer only (for API/upload use)
 * @param {object} content - Same as generateFromWorkflow
 * @param {object} options - Options
 * @returns {Promise<{buffer: Buffer, imageType: string}>}
 */
async function generateBufferFromWorkflow(content, options = {}) {
  const {
    imageTitle,
    imageBullets = [],
    imageType: explicitType,
    imageSections,
    template
  } = content;

  const { theme = 'light' } = options;

  const imageType = resolveImageType(explicitType, template);

  const input = {
    imageType,
    imageTitle: imageTitle || 'Untitled',
    imageBullets,
    imageSections: imageSections || (imageType === 'diagram' ? bulletsToSections(imageBullets, template, imageTitle) : []),
    template,
    theme
  };

  const result = await generateImage(input);

  return {
    buffer: result.buffer,
    imageType: result.type
  };
}

module.exports = {
  generateFromWorkflow,
  generateBufferFromWorkflow,
  resolveImageType,
  bulletsToSections,
  TEMPLATE_TO_IMAGE_TYPE
};
