import { useEffect, useState, useRef } from 'react';
import type { StarNode, AISuggestion } from '../types';
import { NODE_COLOR, NODE_ICON, NODE_LABEL } from '../types';

interface Props {
  node: StarNode | null;
  onClose: () => void;
  onAddSuggestion: (type: StarNode['type'], title: string) => void;
}

interface AIResponse {
  suggestions: AISuggestion[];
  nextQuestion: string;
}

async function fetchSuggestions(node: StarNode): Promise<AIResponse> {
  const res = await fetch('/api/suggest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodeType: node.type, nodeTitle: node.title, nodeDescription: node.description }),
  });
  if (!res.ok) throw new Error('API error');
  return res.json() as Promise<AIResponse>;
}

export default function AIPanel({ node, onClose, onAddSuggestion }: Props) {
  const [result, setResult] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const prevId = useRef('');

  useEffect(() => {
    if (!node || node.id === prevId.current) return;
    prevId.current = node.id;
    setResult(null);
    setError('');
    setLoading(true);
    fetchSuggestions(node)
      .then(setResult)
      .catch(() => setError('AI接続に失敗しました'))
      .finally(() => setLoading(false));
  }, [node]);

  if (!node) return null;

  const color = NODE_COLOR[node.type];

  return (
    <div
      className="fixed right-0 top-0 h-full z-20 flex flex-col"
      style={{
        width: 300,
        background: 'rgba(4, 10, 28, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Header */}
      <div className="px-5 pt-8 pb-5 flex-shrink-0">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{NODE_ICON[node.type]}</span>
            <div>
              <div className="text-xs font-medium" style={{ color }}>
                {NODE_LABEL[node.type]}
              </div>
              <div className="text-sm font-semibold text-white leading-snug mt-0.5 max-w-[170px]">
                {node.title.replace('\n', ' ')}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 rounded-lg mt-0.5 flex-shrink-0 transition-all"
            style={{ color: 'rgba(255,255,255,0.35)', background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.background = 'transparent'; }}
          >
            ✕
          </button>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: `${color}40`, borderTopColor: color }} />
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>AIが思考中…</p>
          </div>
        )}

        {error && (
          <div className="py-6 text-center">
            <p className="text-xs" style={{ color: 'rgba(255,80,80,0.7)' }}>{error}</p>
            <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
              APIキーを設定してください
            </p>
          </div>
        )}

        {result && (
          <div className="flex flex-col gap-5">
            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-3" style={{ color: 'rgba(255,255,255,0.38)' }}>
                  つながりの候補
                </p>
                <div className="flex flex-col gap-2">
                  {result.suggestions.map((s, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl"
                      style={{ background: `${NODE_COLOR[s.type]}0d`, border: `1px solid ${NODE_COLOR[s.type]}20` }}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{NODE_ICON[s.type]}</span>
                          <span className="text-xs" style={{ color: NODE_COLOR[s.type] }}>{NODE_LABEL[s.type]}</span>
                        </div>
                        <button
                          onClick={() => onAddSuggestion(s.type, s.title)}
                          className="text-xs px-2 py-0.5 rounded-full transition-all"
                          style={{
                            background: `${NODE_COLOR[s.type]}20`,
                            border: `1px solid ${NODE_COLOR[s.type]}40`,
                            color: 'rgba(255,255,255,0.55)',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = `${NODE_COLOR[s.type]}35`; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = `${NODE_COLOR[s.type]}20`; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
                        >
                          + 追加
                        </button>
                      </div>
                      <p className="text-sm font-medium text-white mb-1">{s.title}</p>
                      <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next question */}
            {result.nextQuestion && (
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.38)' }}>
                  次の問い
                </p>
                <div
                  className="p-3.5 rounded-xl"
                  style={{ background: `${NODE_COLOR.question}0d`, border: `1px solid ${NODE_COLOR.question}25` }}
                >
                  <p className="text-sm font-medium text-white mb-2">{result.nextQuestion}</p>
                  <button
                    onClick={() => onAddSuggestion('question', result.nextQuestion)}
                    className="text-xs px-3 py-1.5 rounded-full transition-all"
                    style={{
                      background: `${NODE_COLOR.question}20`,
                      border: `1px solid ${NODE_COLOR.question}40`,
                      color: 'rgba(255,255,255,0.6)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${NODE_COLOR.question}35`; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${NODE_COLOR.question}20`; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                  >
                    ✨ この問いを追加する
                  </button>
                </div>
              </div>
            )}

            <p
              className="text-xs text-center pt-2"
              style={{ color: 'rgba(255,255,255,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12 }}
            >
              AIは答えを出しません。問いを深めます。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
