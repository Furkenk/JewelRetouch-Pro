
export type AppMode = 'retoucher' | 'fashion' | 'prompt-to-image' | 'upscale';
export type ProductType = 'ring' | 'necklace' | 'earrings';

export interface ImageState {
  file: File | null;
  preview: string | null;
  base64: string | null;
  name?: string;
}

export type MetalType = 'white' | 'yellow' | 'rose';
export type LightingProfile = 'catalog' | 'edge' | 'balanced';

export interface RetouchResult {
  metal: MetalType;
  url: string;
  sourceName?: string;
  sourcePreview: string;
}

export interface RetouchOptions {
  metalTypes: MetalType[];
  texture: 'low' | 'medium' | 'high';
  brilliance: 'natural' | 'enhanced';
  shadow: 'subtle' | 'standard';
  lighting: LightingProfile;
  bgMode: 'white' | 'black' | 'custom';
  bgHex: string;
  reflection: boolean;
  isBulkMode: boolean;
  productScale: number; // 0.1 to 2.0
}

export type SkinTone = 'porcelain' | 'ivory' | 'warm-ivory' | 'sand' | 'beige' | 'warm-beige' | 'natural' | 'honey' | 'golden' | 'almond' | 'chestnut' | 'espresso';
export type HairColor = 'black' | 'brown-black' | 'darkest-brown' | 'dark-brown' | 'medium-brown' | 'light-brown' | 'dark-blonde' | 'medium-blonde' | 'light-blonde';

export interface FashionOptions {
  productTypes: ProductType[];
  modelStyle: 'editorial' | 'lifestyle' | 'minimal' | 'style-reference';
  environment: 'studio' | 'outdoor' | 'luxury-interior';
  skinTone: SkinTone;
  hairColor: HairColor;
  fingerType: 'slender' | 'normal';
  outfitType: 'reference' | 'luxury' | 'daily';
  hasAdditionalAccessory: boolean;
  faceType: 'random' | 'reference';
  productScale: number; // 0.1 to 2.0
}

export interface PromptToImageOptions {
  inputType: 'prompt' | 'image';
  userPrompt: string;
  enhancedPrompt: string;
  referenceImage: ImageState;
  productImage: ImageState;
  productScale: number; // 0.1 to 2.0
}

export interface AppState {
  activeMode: AppMode;
  rawImages: ImageState[]; // Support for multiple images
  referenceImage: ImageState;
  fashionReferences: ImageState[]; // Multiple refs for fashion mode
  modelReference: ImageState; // Reference for pose/style in fashion mode
  outfitReference: ImageState; // Reference for outfit in fashion mode
  accessoryReference: ImageState; // Additional accessory reference
  faceReferences: ImageState[]; // Multiple refs for face
  promptToImage: PromptToImageOptions;
  upscaleImage: ImageState;
  consistentModel: ImageState; // Manken Sabitleme (Model Consistency)
  retouchedResults: RetouchResult[];
  isProcessing: boolean;
  processingProgress: number;
  error: string | null;
}
