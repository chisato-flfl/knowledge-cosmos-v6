import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PROMPT = `この画像に写っている本棚や本のタイトル・著者名をすべて読み取ってください。
背表紙・表紙どちらでも構いません。

以下のJSON形式で返してください（コードブロック不要、JSONのみ）:
{
  "books": [
    {"title": "タイトル", "author": "著者名（わかる場合のみ）"},
    ...
  ]
}

タイトルが読み取れない場合はそのまま省略してください。
著者名が不明な場合は author フィールドを省略してください。`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { imageBase64, mimeType } = req.body as { imageBase64?: string; mimeType?: string };

  if (!imageBase64 || !mimeType) {
    return res.status(400).json({ error: 'imageBase64 and mimeType are required' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(mimeType)) {
    return res.status(400).json({ error: 'Unsupported image type' });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: imageBase64,
              },
            },
            { type: 'text', text: PROMPT },
          ],
        },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';

    let parsed: { books: Array<{ title: string; author?: string }> };
    try {
      parsed = JSON.parse(text) as typeof parsed;
    } catch {
      return res.status(500).json({ error: 'Failed to parse AI response', raw: text });
    }

    return res.status(200).json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
