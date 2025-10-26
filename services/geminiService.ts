import { GoogleGenAI, Type } from "@google/genai";
import type { GeminiAnalysisResult } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const systemInstruction = `You are an expert audio engineer specializing in vocal processing.
Analyze the provided audio sample to determine the speaker's vocal characteristics.
Identify the fundamental frequency range, prominent harmonics, and any problematic frequencies (e.g., sibilance, plosives, muddiness).
Based on this analysis, generate a 10-band graphic EQ preset to enhance vocal clarity, presence, and warmth. The preset should be suitable for a standard podcast or voice-over.
Provide the output in a JSON format with three main keys: 'vocalProfile', 'eqPreset', and 'audacityXml'.
- 'vocalProfile' should be an object containing 'description' (a paragraph summarizing the voice), 'fundamentalRange' (e.g., '100Hz - 250Hz'), and 'keyCharacteristics' (an array of strings like 'Slightly sibilant', 'Warm low-mids').
- 'eqPreset' should be an array of objects, where each object has 'frequency' (in Hz) and 'gain' (in dB).
- 'audacityXml' should be a string containing a valid Audacity EQ preset in XML format. The curve should be named 'Gemini Vocal Preset' and contain <point> elements for each frequency and gain setting.`;

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        vocalProfile: {
            type: Type.OBJECT,
            properties: {
                description: { type: Type.STRING },
                fundamentalRange: { type: Type.STRING },
                keyCharacteristics: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            },
            required: ["description", "fundamentalRange", "keyCharacteristics"]
        },
        eqPreset: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    frequency: { type: Type.NUMBER },
                    gain: { type: Type.NUMBER }
                },
                required: ["frequency", "gain"]
            }
        },
        audacityXml: { type: Type.STRING }
    },
    required: ["vocalProfile", "eqPreset", "audacityXml"]
};

export async function analyzeAudio(audioBase64: string, mimeType: string): Promise<GeminiAnalysisResult> {
    try {
        const audioPart = {
            inlineData: {
                data: audioBase64,
                mimeType: mimeType,
            },
        };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: [audioPart] },
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema: responseSchema,
            }
        });
        
        const text = response.text;
        
        if (!text) {
            throw new Error('Gemini returned an empty response.');
        }

        // The response should be valid JSON due to responseMimeType
        return JSON.parse(text) as GeminiAnalysisResult;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if(error instanceof Error && error.message.includes('SAFETY')) {
            throw new Error("The audio could not be processed due to safety settings. Please try a different audio sample.");
        }
        throw new Error("Failed to get analysis from Gemini. Please check the console for more details.");
    }
}