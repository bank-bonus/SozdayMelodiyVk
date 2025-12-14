import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SongIdea } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateSongIdea = async (mood: string, genre: string): Promise<SongIdea | null> => {
  try {
    const prompt = `Create a short song idea for a VK music app user. 
    Mood: ${mood}. 
    Genre: ${genre}. 
    Output structured JSON containing a creative title, the genre, a simple chord progression (array of strings), and 4 lines of lyrics (russian).`;

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        genre: { type: Type.STRING },
        chords: { 
            type: Type.ARRAY,
            items: { type: Type.STRING } 
        },
        lyrics: { type: Type.STRING },
      },
      required: ["title", "genre", "chords", "lyrics"],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as SongIdea;
    }
    return null;
  } catch (error) {
    console.error("Gemini generation error:", error);
    return null;
  }
};