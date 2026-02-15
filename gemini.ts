import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from './constants';
import { Message, UserContext } from './types';

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// The model to use for complex academic tasks
const MODEL_NAME = 'gemini-3-pro-preview';

/**
 * Sends a message to the Gemini API, optionally with an image.
 */
export const sendMessageToGemini = async (
  history: Message[],
  currentText: string,
  context: UserContext,
  imageBase64?: string
): Promise<string> => {
  try {
    // Construct the prompt with context
    const contextString = `Student Level: ${context.level}\nCurrent Subject: ${context.subject}\n\n`;
    const fullPrompt = `${contextString}${currentText}`;

    // Prepare contents
    // We will send a simplified history to save tokens/complexity for this demo, 
    // or just the current turn if image is present (images in history can be heavy).
    // For a robust chat, we usually structure history. 
    // Here we'll treat it as a fresh turn with history context if text-only, 
    // or a single turn if image is involved (simplification for reliability).

    let response: GenerateContentResponse;

    if (imageBase64) {
      // Image + Text request
      const imagePart = {
        inlineData: {
          mimeType: 'image/jpeg', // Assuming JPEG for simplicity from camera/upload
          data: imageBase64
        }
      };
      const textPart = { text: fullPrompt };

      response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: { parts: [imagePart, textPart] },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingBudget: 1024 } // Allow some thinking for math/logic
        }
      });

    } else {
      // Text-only request - we can use chat history
      // Mapping internal Message type to Gemini Content type is manual.
      // For simplicity in this demo, we will concatenate recent history or use chat session.
      
      const chat = ai.chats.create({
        model: MODEL_NAME,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
        history: history.filter(h => !h.isError && !h.isLoading).map(h => ({
            role: h.role,
            parts: [{ text: h.text }] // Simplified: ignoring old images in history for now
        }))
      });

      response = await chat.sendMessage({
        message: fullPrompt
      });
    }

    // Extract text
    const text = response.text;
    if (!text) {
      throw new Error("No response text received from AI.");
    }
    return text;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
