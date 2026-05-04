
export type AppMode = 'retoucher' | 'fashion' | 'prompt-to-image' | 'upscale' | 'video';
export type ProductType = 'ring' | 'necklace' | 'earrings';
export type AspectRatio = 'Auto' | '1:1' | '21:9' | '16:9' | '3:2' | '4:3' | '5:4' | '4:5' | '3:4' | '2:3' | '9:16';
export type StoneType = 'original' | 'diamond' | 'emerald' | 'ruby' | 'sapphire' | 'amethyst';

export interface ImageState {
  file: File | null;
  preview: string | null;
  base64: string | null;
  name?: string;
  id?: string;
}

export type MetalType = 'white' | 'yellow' | 'rose';
export type LightingProfile = 'catalog' | 'edge' | 'balanced';

export interface BrandKit {
  backgroundColor: string;
  lightingPreference: LightingProfile;
  isLocked: boolean;
}

export interface RetouchResult {
  id: string;
  metal: MetalType;
  url: string;
  sourceName?: string;
  sourcePreview: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  hasWatermark: boolean;
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
  aspectRatio: AspectRatio;
  stoneTypes: StoneType[];
  isPackagingShot: boolean;
}

export type SkinTone = 'porcelain' | 'ivory' | 'warm-ivory' | 'sand' | 'beige' | 'warm-beige' | 'natural' | 'honey' | 'golden' | 'almond' | 'chestnut' | 'espresso';
export type HairColor = 'black' | 'brown-black' | 'darkest-brown' | 'dark-brown' | 'medium-brown' | 'light-brown' | 'dark-blonde' | 'medium-blonde' | 'light-blonde';
export type Language = 'en' | 'tr' | 'fr' | 'de' | 'id' | 'it' | 'es' | 'pt';

export interface WatermarkConfig {
  type: 'text' | 'image';
  text: string;
  image: ImageState;
}

export type FingerSize = 'normal' | 'medium' | 'large';

export interface FashionOptions {
  productTypes: ProductType[];
  modelStyle: 'editorial' | 'lifestyle' | 'minimal' | 'style-reference';
  environment: 'studio' | 'outdoor' | 'luxury-interior' | 'reference';
  referenceEnvType: 'prompt' | 'image';
  referenceEnvPrompt: string;
  referenceEnvImage: ImageState;
  skinTone: SkinTone;
  hairColor: HairColor;
  outfitType: 'reference' | 'luxury' | 'daily';
  hasAdditionalAccessory: boolean;
  faceType: 'random' | 'reference';
  productScale: number; // 0.1 to 2.0
  fingerSize: FingerSize;
  aspectRatio: AspectRatio;
  isLifestyleCollage: boolean;
  styleRange: {
    enabled: boolean;
    bgColor: string;
  };
}

export interface PromptToImageOptions {
  inputType: 'prompt' | 'image';
  userPrompt: string;
  enhancedPrompt: string;
  referenceImage: ImageState;
  productImage: ImageState;
  productScale: number; // 0.1 to 2.0
  aspectRatio: AspectRatio;
}

export interface VideoOptions {
  rotationSpeed: string;
  backgroundColor: string;
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
  videoOptions: VideoOptions;
  upscaleImage: ImageState;
  consistentModel: ImageState; // Manken Sabitleme (Model Consistency)
  isConsistentModelEnabled: boolean;
  isDarkMode: boolean;
  retouchedResults: RetouchResult[];
  isProcessing: boolean;
  processingProgress: number;
  error: string | null;
  brandKit: BrandKit;
  isWatermarkEnabled: boolean;
  watermark: WatermarkConfig;
  exportCounter: number;
  language: Language;
}
