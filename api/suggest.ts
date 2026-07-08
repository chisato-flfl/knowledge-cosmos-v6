import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TYPE_LABELS: Record<string, string> = {
  book: '本',
  experience: '経験',
  question: '問い',
};

function buildPrompt(nodeType: string, nodeTitle: string, nodeDescription?: string): string {
  const label = TYPE_LABELS[nodeType] ?? nodeType;
  const desc = nodeDescription ? `\n説明: ${nodeDescription}` : '';

  return `あなたは知識宇宙の案内人です。ユーザーの${label}「${nodeTitle}」${desc} から、関連する本・経験・問いを提案し、思考を深める「次の問い」を1つ返してください。

重要なルール:
- AIは「答え」を出さない。必ず「問い」の形で返す。
- 宇宙・静けさ・哲学・余白を大切にしたトーン。
- 提案は3〜4件。

レスポンスは以下のJSON形式で返してください（コードブロック不要、JSONのみ）:
{
  "suggestions": [
    {"type": "book"|"experience"|"question", "title": "タイトル", "reason": "なぜこれが関連するかを1〜2文で（問いの形で終わる）"},
    ...
  ],
  "nextQuestion": "次の問い（？で終わる）"
}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nodeType, nodeTitle, nodeDescription } = req.body as {
    nodeType?: string;
    nodeTitle?: string;
    nodeDescription?: string;
  };

  if (!nodeType || !nodeTitle) {
    return res.status(400).json({ error: 'nodeType and nodeTitle are required' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [
        { role: 'user', content: buildPrompt(nodeType, nodeTitle, nodeDescription) },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';

    let parsed: { suggestions: Array<{ type: string; title: string; reason: string }>; nextQuestion: string };
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
