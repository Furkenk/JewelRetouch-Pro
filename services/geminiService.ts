
import { GoogleGenAI } from "@google/genai";
import { RetouchOptions, MetalType, FashionOptions, ProductType } from "../types";

const buildRetouchPrompt = (options: RetouchOptions, targetMetal: MetalType) => {
  const bgValue = options.bgMode === 'white' ? 'PURE WHITE #FFFFFF' : 
                 (options.bgMode === 'black' ? 'DEEP BLACK #000000' : `SOLID COLOR HEX ${options.bgHex}`);
  
  return `JEWELRY PHOTOGRAPHY RETOUCHING TASK.
Target Metal Color: ${targetMetal.toUpperCase()} GOLD.
Lighting: ${options.lighting.toUpperCase()} studio setup.
Background: ${bgValue}.
Product Scale: ${options.productScale}x (1.0 is standard size).

CRITICAL INSTRUCTIONS:
1. BACKGROUND: You MUST completely remove the original background and replace it with ${bgValue}. This is mandatory for every single image.
2. METAL COLOR: You MUST change all metal parts of the jewelry to ${targetMetal.toUpperCase()} GOLD. If the target is YELLOW gold, it MUST be yellow. If WHITE gold, it MUST be white. If ROSE gold, it MUST be rose.
3. SHAPE & ANGLE: DO NOT CHANGE THE SHAPE, ANGLE, OR PERSPECTIVE OF THE JEWELRY. The output MUST be a 1:1 exact structural match to the input image.
4. STONES: DO NOT ADD, REMOVE, OR CHANGE ANY STONES. Keep the exact same stones in their exact original positions.
5. PRODUCT SCALE: Render the jewelry at exactly ${options.productScale}x its original size relative to the frame. If scale < 1.0, make it smaller. If > 1.0, make it larger.
6. ENHANCEMENT: Clean all dust, scratches, and micro-flaws. Enhance the existing gemstones' brilliance, clarity, and scintillation to look like a high-end studio photograph.
7. SHADOWS: Apply professional contact shadows at the base.
8. The final output must be a professional e-commerce product shot.
9. NO checkerboard patterns, NO text, NO watermarks.

Format: High Resolution Studio JPG.`;
};

const buildFashionPrompt = (options: FashionOptions, assetPrompt?: string) => {
  const products = options.productTypes.join(' and ');
  
  let fingerSizePrompt = '';
  if (options.productTypes.includes('ring')) {
    if (options.fingerSize === 'normal') {
      fingerSizePrompt = `\n[GLOBAL SCALE LOCK: HYPER-MICRO ASSEMBLY]- **PROPORTIONAL SHRINK:** Reduce the entire 3D volume of the ring (stone + shank + setting) to 40% of the reference scale.- **ANATOMICAL STABILITY:** Maintain natural, slender finger proportions. DO NOT thin the finger or arm.- **VISUAL EFFECT:** The ring appears as a microscopic, precious spark, occupying a minimal footprint on the finger surface.`;
    } else if (options.fingerSize === 'medium') {
      fingerSizePrompt = `\n[GLOBAL SCALE LOCK: REFINED DAINTY ASSEMBLY]- **PROPORTIONAL SHRINK:** Reduce the entire ring assembly to 70% of the reference scale.- **PROPORTION:** The center stone and band thickness must decrease together to maintain design integrity.- **VISUAL EFFECT:** A delicate, minimalist accent that feels sophisticated and secondary to the hand's elegance.`;
    } else if (options.fingerSize === 'large') {
      fingerSizePrompt = `\n[GLOBAL SCALE LOCK: REGAL BOLD ASSEMBLY]- **PROPORTIONAL LOCK:** High-impact, voluminous presence (1:1 with reference).- **STYLE:** Maximum luxury, hero-focused.- **VISUAL EFFECT:** A statement piece that commands the entire finger.`;
    }
  }

  return `LUXURY FASHION POST-PRODUCTION TASK.
Target Products: ${products.toUpperCase()}.
Environment: ${options.environment.toUpperCase()}.
Model Skin Tone: ${options.skinTone.toUpperCase()}.
Model Hair Color: ${options.hairColor.toUpperCase()}.
Product Scale: ${options.productScale}x (1.0 is standard size).${fingerSizePrompt}${assetPrompt ? `\n\n--- ASSET SPECIFIC INSTRUCTIONS ---\n${assetPrompt}` : ''}

CRITICAL INSTRUCTIONS:
1. Generate a high-end fashion photograph featuring a professional model.
2. JEWELRY INTEGRATION: The model MUST be wearing the EXACT jewelry shown in the "JEWELRY REFERENCE IMAGE(S)". Do not invent jewelry. If a ring is provided, place it on the finger. If a necklace, on the neck. If earrings, on the ears. This is the most important requirement.
3. PRODUCT SCALE: The jewelry should be rendered at ${options.productScale}x its natural relative size on the model. Adjust the scale of the jewelry accordingly.
4. POSE MATCHING: ${options.modelStyle === 'style-reference' ? 'The model MUST match the EXACT pose, body angle, and framing of the "POSE REFERENCE IMAGE".' : `Use a ${options.modelStyle} style pose.`}
5. OUTFIT: ${options.outfitType === 'reference' ? 'The model MUST wear the exact clothing shown in the "OUTFIT REFERENCE IMAGE".' : `The model should wear a ${options.outfitType} style outfit.`}
6. MODEL FEATURES: The model MUST have ${options.skinTone} skin tone and ${options.hairColor} hair. ${options.faceType === 'reference' ? 'The model MUST have the exact face shown in the "FACE REFERENCE IMAGE(S)".' : ''}
7. The lighting should be cinematic and high-end, matching a luxury brand campaign (e.g., Cartier, Bulgari style).
8. NO text, NO watermarks, NO distorted features.

Format: High Resolution Fashion Campaign JPG.`;
};

/**
 * Sanitizes base64 string by removing data URL prefix
 */
function sanitizeBase64(base64: string): string {
  if (base64.includes(',')) {
    return base64.split(',')[1];
  }
  return base64;
}

export async function processJewelryRetouch(
  rawBase64: string,
  options: RetouchOptions,
  targetMetal: MetalType,
  refBase64?: string,
  consistentModelBase64?: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const parts: any[] = [
    { text: `--- ORIGINAL JEWELRY IMAGE ---\nThe output MUST be an exact structural replica of this image. YOU MUST REMOVE THE BACKGROUND. YOU MUST CHANGE THE METAL TO ${targetMetal.toUpperCase()} GOLD. DO NOT change the angle, shape, or the gemstones. Keep the exact same stones.` },
    {
      inlineData: {
        data: sanitizeBase64(rawBase64),
        mimeType: 'image/jpeg'
      }
    },
    {
      text: buildRetouchPrompt(options, targetMetal)
    }
  ];

  if (refBase64) {
    parts.push({
      inlineData: {
        data: sanitizeBase64(refBase64),
        mimeType: 'image/jpeg'
      }
    });
    parts.push({ text: "Use this lighting and contrast style." });
  }

  if (consistentModelBase64) {
    parts.push({ text: "--- CONSISTENT MODEL REFERENCE ---\nThe model MUST have the exact facial features, hair, and identity of the person in this image:" });
    parts.push({
      inlineData: {
        data: sanitizeBase64(consistentModelBase64),
        mimeType: 'image/jpeg'
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: { 
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/jpeg;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("Empty response from Engine");
  } catch (error: any) {
    console.error("Gemini API Request Failed:", error);
    throw new Error(error.message || "Internal Engine Error");
  }
}

export async function processFashionProduction(
  productImages: string[],
  options: FashionOptions,
  modelRefBase64?: string,
  outfitRefBase64?: string,
  accessoryRefBase64?: string,
  faceReferencesBase64?: string[],
  consistentModelBase64?: string,
  assetPrompt?: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const parts: any[] = [];

  parts.push({ text: "--- JEWELRY REFERENCE IMAGE(S) ---\nThe model MUST wear these exact items:" });
  productImages.forEach(base64 => {
    parts.push({
      inlineData: {
        data: sanitizeBase64(base64),
        mimeType: 'image/jpeg'
      }
    });
  });

  if (modelRefBase64 && options.modelStyle === 'style-reference') {
    parts.push({ text: "--- POSE REFERENCE IMAGE ---\nThe model MUST replicate this exact pose, posture, and camera angle:" });
    parts.push({
      inlineData: {
        data: sanitizeBase64(modelRefBase64),
        mimeType: 'image/jpeg'
      }
    });
  }

  if (outfitRefBase64 && options.outfitType === 'reference') {
    parts.push({ text: "--- OUTFIT REFERENCE IMAGE ---\nThe model MUST wear this exact style of clothing:" });
    parts.push({
      inlineData: {
        data: sanitizeBase64(outfitRefBase64),
        mimeType: 'image/jpeg'
      }
    });
  }

  if (accessoryRefBase64 && options.hasAdditionalAccessory) {
    parts.push({ text: "--- ADDITIONAL ACCESSORY REFERENCE IMAGE ---\nThe model MUST also wear/hold this accessory:" });
    parts.push({
      inlineData: {
        data: sanitizeBase64(accessoryRefBase64),
        mimeType: 'image/jpeg'
      }
    });
  }

  if (faceReferencesBase64 && faceReferencesBase64.length > 0 && options.faceType === 'reference') {
    parts.push({ text: "--- FACE REFERENCE IMAGE(S) ---\nThe model MUST have the exact facial features, identity, and likeness of the person in these images:" });
    faceReferencesBase64.forEach(base64 => {
      parts.push({
        inlineData: {
          data: sanitizeBase64(base64),
          mimeType: 'image/jpeg'
        }
      });
    });
  }

  if (consistentModelBase64) {
    parts.push({ text: "--- CONSISTENT MODEL REFERENCE ---\nThe model MUST have the exact facial features, hair, and identity of the person in this image:" });
    parts.push({
      inlineData: {
        data: sanitizeBase64(consistentModelBase64),
        mimeType: 'image/jpeg'
      }
    });
  }

  parts.push({
    text: buildFashionPrompt(options, assetPrompt)
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: { 
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/jpeg;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("Empty response from Engine");
  } catch (error: any) {
    console.error("Gemini API Request Failed:", error);
    throw new Error(error.message || "Internal Engine Error");
  }
}

export async function enhancePrompt(prompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const systemPrompt = `You are a professional prompt engineer for high-end fashion and jewelry photography. 
  Your task is to take a simple user prompt and expand it into a detailed, cinematic, and technical prompt that describes lighting, composition, model features, and atmosphere. 
  Keep the focus on luxury and high-end aesthetics. 
  Return ONLY the enhanced prompt text, no explanations.`;

  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: systemPrompt }, { text: prompt }] }
  });
  
  return result.text || "";
}

export async function analyzeImageForPrompt(imageBase64: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const systemPrompt = `Analyze this image and describe its exact pose, composition, lighting, and atmosphere in detail. 
  Focus on the elements that would be needed to recreate this EXACT SAME POSE in a new photograph, but explicitly state that the clothing and the person should be different. 
  Return ONLY the descriptive prompt text, no explanations.`;

  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { text: systemPrompt },
        {
          inlineData: {
            data: sanitizeBase64(imageBase64),
            mimeType: "image/jpeg"
          }
        }
      ]
    }
  });
  
  return result.text || "";
}

export async function processPromptToImage(
  productBase64: string,
  prompt: string,
  scale: number,
  referenceBase64?: string,
  consistentModelBase64?: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const parts: any[] = [];

  parts.push({ text: "--- PRODUCT TO BE PLACED ---\nThe model MUST wear this exact item:" });
  parts.push({
    inlineData: {
      data: sanitizeBase64(productBase64),
      mimeType: 'image/jpeg'
    }
  });

  if (referenceBase64) {
    parts.push({ text: "--- POSE REFERENCE IMAGE ---\nReplicate the EXACT SAME POSE, body angle, lighting, and composition of this image, but change the clothing and the person:" });
    parts.push({
      inlineData: {
        data: sanitizeBase64(referenceBase64),
        mimeType: 'image/jpeg'
      }
    });
  }

  if (consistentModelBase64) {
    parts.push({ text: "--- CONSISTENT MODEL REFERENCE ---\nThe model MUST have the exact facial features, hair, and identity of the person in this image:" });
    parts.push({
      inlineData: {
        data: sanitizeBase64(consistentModelBase64),
        mimeType: 'image/jpeg'
      }
    });
  }

  const finalPrompt = `LUXURY PRODUCT PLACEMENT TASK.
  
  INSTRUCTIONS:
  1. Generate a high-end photograph based on this description: ${prompt}
  2. PRODUCT INTEGRATION: The model MUST be wearing the EXACT jewelry shown in the "PRODUCT TO BE PLACED". Do not invent jewelry.
  3. PRODUCT SCALE: The jewelry should be rendered at ${scale}x its natural relative size in the scene. Adjust the scale of the jewelry accordingly.
  4. POSE & COMPOSITION: If a Pose Reference Image is provided, the model MUST be in the exact same pose, but the person and clothing must be different.
  5. The lighting should be cinematic and high-end.
  6. NO text, NO watermarks, NO distorted features.
  
  Format: High Resolution JPG.`;

  parts.push({ text: finalPrompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: { 
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/jpeg;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("Empty response from Engine");
  } catch (error: any) {
    console.error("Gemini API Request Failed:", error);
    throw new Error(error.message || "Internal Engine Error");
  }
}

export async function processUpscale(imageBase64: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const prompt = `Do NOT alter the face, body, pose, background, colors, or camera angle. Do NOT crop, zoom, or reframe the image. Do NOT add new elements, effects, makeup, or stylization. Maintain natural skin texture, pores, and realistic details. The final result should look like a professionally shot, ultra-sharp 8K photograph taken with a high-end camera lens. Photorealistic, clean, high dynamic range, ultra-detailed, true-to-original upscale only.
Do NOT alter the face, body, pose, background, colors, or camera angle. Do NOT crop, zoom, or reframe the image. Do NOT add new elements, effects, makeup, or stylization. Maintain natural skin texture, pores, and realistic details. The final result should look like a professionally shot, ultra-sharp 8K photograph taken with a high-end camera lens. Photorealistic, clean, high dynamic range, ultra-detailed, true-to-original upscale only.`;

  const parts: any[] = [
    { text: prompt },
    {
      inlineData: {
        data: sanitizeBase64(imageBase64),
        mimeType: 'image/jpeg'
      }
    }
  ];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts }
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/jpeg;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("Empty response from Engine");
  } catch (error: any) {
    console.error("Gemini API Request Failed:", error);
    throw new Error(error.message || "Internal Engine Error");
  }
}

