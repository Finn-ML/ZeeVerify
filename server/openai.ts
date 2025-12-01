import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ModerationResult {
  category: "clean" | "needs_review" | "rejected";
  sentiment: "positive" | "negative" | "neutral";
  sentimentScore: number;
  flags: string[];
  summary: string;
}

export async function moderateContent(content: string, title: string): Promise<ModerationResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a content moderation AI for a franchise review platform. Analyze the following review and provide:
1. A moderation category: "clean" (appropriate), "needs_review" (questionable), or "rejected" (violates guidelines)
2. Sentiment: "positive", "negative", or "neutral"
3. A sentiment score from -1.0 (very negative) to 1.0 (very positive)
4. Any flags (e.g., "profanity", "spam", "defamatory", "personal_attack", "fake_review")
5. A brief summary of the review

Guidelines for rejection:
- Profanity or hate speech
- Personal attacks on individuals
- Clearly defamatory statements without evidence
- Spam or promotional content
- Off-topic content

Respond in JSON format:
{
  "category": "clean|needs_review|rejected",
  "sentiment": "positive|negative|neutral",
  "sentimentScore": 0.0,
  "flags": [],
  "summary": ""
}`
        },
        {
          role: "user",
          content: `Title: ${title}\n\nContent: ${content}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      category: result.category || "needs_review",
      sentiment: result.sentiment || "neutral",
      sentimentScore: result.sentimentScore || 0,
      flags: result.flags || [],
      summary: result.summary || "",
    };
  } catch (error) {
    console.error("OpenAI moderation error:", error);
    return {
      category: "needs_review",
      sentiment: "neutral",
      sentimentScore: 0,
      flags: ["moderation_error"],
      summary: "Unable to analyze content automatically",
    };
  }
}

export async function extractKeywords(content: string): Promise<{ word: string; sentiment: string }[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Extract key words and phrases from this franchise review. For each, identify if the context is positive, negative, or neutral. Return as JSON array:
[{"word": "string", "sentiment": "positive|negative|neutral"}]

Focus on franchise-relevant terms like: support, training, profit, culture, communication, fees, marketing, territory, etc.`
        },
        {
          role: "user",
          content: content
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.keywords || result || [];
  } catch (error) {
    console.error("OpenAI keyword extraction error:", error);
    return [];
  }
}
