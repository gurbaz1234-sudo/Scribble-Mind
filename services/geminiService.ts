
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeScribble = async (base64Image: string): Promise<GeminiResponse> => {
  try {
    const model = 'gemini-2.5-flash-lite';
    
    // Removing the data:image/png;base64, prefix for the API
    const imageData = base64Image.split(',')[1];

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: imageData,
            },
          },
          {
            text: "Analyze this scribble. Extract any handwritten text you see. Also, identify all geometric shapes present (e.g., circles, squares, triangles, stars, etc.). Return the results in a structured JSON format.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: {
              type: Type.STRING,
              description: "The full text recognized from the handwriting. If no text is found, return an empty string.",
            },
            shapes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "The name of the shape (e.g., circle)." },
                  count: { type: Type.NUMBER, description: "How many instances of this shape were found." },
                },
                required: ["type", "count"],
              },
            },
          },
          required: ["text", "shapes"],
        },
      },
    });

    if (!response.text) {
      throw new Error("No response from Gemini");
    }

    return JSON.parse(response.text.trim()) as GeminiResponse;
  } catch (error) {
    console.error("Gemini analysis error:", error);
    throw error;
  }
};
