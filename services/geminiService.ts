import { GoogleGenAI, Type } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const getZenQuote = async (): Promise<string> => {
  const client = getClient();
  if (!client) {
    return "API Key not found. Inner peace comes from within (and environment variables).";
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate a very short, profound Zen Buddhist-style quote or blessing in Chinese (Simplified). Maximum 20 characters. Do not include quotes or explanations. Just the text.",
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        temperature: 0.9,
      }
    });

    return response.text?.trim() || "心如止水，万事皆安。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "心静自然凉。";
  }
};

export interface FortuneResult {
  id: number;
  luck: string; // 大吉, 吉, 凶 etc.
  poem: string[]; // 4 lines of the poem
  explanation: string;
}

export const getFortune = async (): Promise<FortuneResult> => {
  const client = getClient();
  // We still generate a random ID for flavor (1-100), but the content is creative.
  const fortuneId = Math.floor(Math.random() * 100) + 1;

  if (!client) {
    return {
      id: 1,
      luck: "大吉",
      poem: ["七宝浮图塔", "高峰顶上安", "众人皆仰望", "莫作等闲看"],
      explanation: "万事如意，功德圆满。（API Key 缺失模式）"
    };
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a traditional Buddhist fortune stick (Omikuji) result in the style of Asakusa Senso-ji Temple.
      
      It should be poetic, mysterious, and Zen-like.
      
      1. **Luck**: Randomly assign a luck status from this list: [大吉, 吉, 中吉, 小吉, 末吉, 凶].
      2. **Poem**: Write a 4-line classical Chinese poem (Kanbun style, 5 or 7 chars per line) that reflects the luck.
      3. **Explanation**: Provide a brief, warm, and wise interpretation in Simplified Chinese.
      
      The Fortune ID is ${fortuneId}.
      
      Return a JSON object with:
      - id: The integer ${fortuneId}.
      - luck: The luck string (e.g., "大吉").
      - poem: An array of 4 strings.
      - explanation: The interpretation string.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            luck: { type: Type.STRING },
            poem: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            explanation: { type: Type.STRING }
          },
          required: ["id", "luck", "poem", "explanation"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as FortuneResult;
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini Fortune Error:", error);
    return {
      id: fortuneId,
      luck: "吉",
      poem: ["春来花发好", "秋至月轮圆", "万事皆成就", "福禄自天然"],
      explanation: "心诚则灵，万事顺遂。（备用签文）"
    };
  }
};