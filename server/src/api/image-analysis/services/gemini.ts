// analyze.ts
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const analyze = async (
  filePath: string,
  mimeType: string
): Promise<{ foodName: string; calories: number }> => {
  try {
    const base64ImageFile = fs.readFileSync(filePath, { encoding: "base64" });

    const contents = [
      {
        inlineData: {
          mimeType,
          data: base64ImageFile,
        },
      },
      { text: "Extract the food name and estimate the calories from this image in JSON object." },
    ];

    const config = {
      // correct MIME and config key names
      responseMimeType: "application/json",
      // use the SDK's JSON-schema setting to enforce output shape
      responseJsonSchema: {
        type: "object",
        properties: {
          foodName: { type: "string" },
          calories: { type: "number" },
        },
        required: ["foodName", "calories"],
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview",
      contents,
      config,
    });

    // response.text is usually the JSON string, but sometimes the SDK/model wraps it
    // in markdown/code-fence. sanitize before parsing.
    let text = (response.text ?? "").trim();

    // strip ```json ... ``` or ``` ... ``` fences, and surrounding backticks.
    text = text.replace(/^```json\s*/i, "").replace(/```$/i, "");
    text = text.replace(/^`+|`+$/g, "");

    // final parse (will throw if the model output truly isn't JSON)
    const parsed = JSON.parse(text);

    // Basic runtime validation (optional): ensure keys we expect exist
    if (
      typeof parsed.foodName !== "string" ||
      typeof parsed.calories !== "number"
    ) {
      throw new Error("Response did not match expected schema");
    }

    return parsed;
  } catch (error) {
    console.error("analyze error:", error);
    throw error;
  }
};