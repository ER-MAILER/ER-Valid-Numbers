
import { GoogleGenAI, Type } from "@google/genai";
import { PhoneNumberRecord, ValidationStatus } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * High-speed batch processing using Gemini 3 Flash.
 * Optimized for rapid response and pattern accuracy.
 */
export const processBatch = async (numbers: string[]): Promise<PhoneNumberRecord[]> => {
  const prompt = `
    Verify the following phone numbers with extreme speed and high strictness.
    
    VALIDATION PROTOCOL:
    1. STRICT: Mark "isValid: true" ONLY if it matches international phone patterns.
    2. CLEAN: Remove spaces/dashes. Format to E.164 (e.g., +1234567890).
    3. DETECT: Identify country name.
    4. REJECT: Mark "isValid: false" for sequential (123456), repetitive (000000), or non-phone strings. 
    5. BRIEF: In "notes", give a 3-word reason for invalidity.
    
    NUMBERS:
    ${numbers.join('\n')}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              original: { type: Type.STRING },
              formatted: { type: Type.STRING },
              country: { type: Type.STRING },
              isValid: { type: Type.BOOLEAN },
              notes: { type: Type.STRING }
            },
            required: ["original", "formatted", "country", "isValid", "notes"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((item: any, idx: number) => ({
      id: `num-${idx}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      original: item.original,
      formatted: item.formatted,
      country: item.country,
      status: item.isValid ? ValidationStatus.VALID : ValidationStatus.INVALID,
      notes: item.notes
    }));
  } catch (error) {
    console.error("Rapid processing error:", error);
    throw error;
  }
};
