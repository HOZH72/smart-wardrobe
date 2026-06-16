/**
 * AI Services — barrel exports
 */
export { loadModel, getModelInfo, isModelReady } from './modelLoader';
export type { ModelInfo } from './modelLoader';

export { classifyImage, classifyRuleBased, preprocessImage } from './classifier';
export type { ClassificationPrediction } from './classifier';

export {
  extractDominantColor,
  rgbToColorName,
  hexToRgb,
  rgbToHex,
} from './colorExtractor';
export type { ColorResult } from './colorExtractor';

export { getLabels, translateLabel, getLabelCategory } from './labelService';
export type { LabelInfo } from './labelService';
