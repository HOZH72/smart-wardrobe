/**
 * Model loader for TensorFlow Lite
 */
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

export interface ModelInfo {
  loaded: boolean;
  modelPath: string | null;
  labels: string[];
  inputShape: number[];
  outputShape: number[];
}

let modelInfo: ModelInfo = {
  loaded: false,
  modelPath: null,
  labels: [],
  inputShape: [1, 28, 28, 1],
  outputShape: [1, 10],
};

export async function loadModel(): Promise<ModelInfo> {
  if (modelInfo.loaded) return modelInfo;
  try {
    // Load labels
    const labelsAsset = Asset.fromModule(require('../../ml/labels.txt'));
    await labelsAsset.downloadAsync();
    const labelsContent = await FileSystem.readAsStringAsync(labelsAsset.localUri!);
    const labels = labelsContent
      .split('\n')
      .filter(l => l.trim())
      .map(l => l.replace(/^\d+\s+/, '').trim());

    // Load model
    const modelAsset = Asset.fromModule(require('../../ml/model.tflite'));
    await modelAsset.downloadAsync();

    modelInfo = {
      loaded: true,
      modelPath: modelAsset.localUri!,
      labels,
      inputShape: [1, 28, 28, 1],
      outputShape: [1, labels.length],
    };
    return modelInfo;
  } catch (error) {
    console.warn('⚠️ Model loading failed:', error);
    return modelInfo;
  }
}

export function getModelInfo(): ModelInfo {
  return modelInfo;
}

export function isModelReady(): boolean {
  return modelInfo.loaded;
}
