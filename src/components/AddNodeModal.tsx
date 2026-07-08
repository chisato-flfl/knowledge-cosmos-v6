import { useState, useEffect, useRef } from 'react';
import type { StarType } from '../types';
import { NODE_COLOR, NODE_ICON, NODE_LABEL } from '../types';

interface Props {
  type: StarType;
  onClose: () => void;
  onSubmit: (title: string, description: string) => void;
}

const PLACEHOLDER: Record<StarType, { title: string; desc: string; examples: string[] }> = {
  book: {
    title: '本のタイトル',
    desc: '著者・感想・キーワードなど',
    examples: ['LIFE SHIFT', 'サピエンス全史', '武器になる哲学'],
  },
  experience: {
    title: '経験を一言で',
    desc: 'いつ・何が起きたか・何を感じたか',
    examples: ['転職した', 'SNSをやめた', 'AI大学講師でプロダクトを作った'],
  },
  question: {
    title: '問いを入力',
    desc: 'なぜ・何が・どうすれば…',
    examples: ['自由とは？', 'なぜ学ぶ？', '幸せとは？'],
  },
};

export default function AddNodeModal({ type, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const color = NODE_COLOR[type];
  const ph = PLACEHOLDER[type];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit(title.trim(), desc.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md mx-4 rounded-2xl p-6"
        style={{
          background: 'rgba(8, 14, 36, 0.95)',
          border: `1px solid ${color}30`,
          boxShadow: `0 0 60px ${color}15, 0 24px 48px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">{NODE_ICON[type]}</span>
          <div>
            <h2 className="text-white font-semibold text-base">
              {NODE_LABEL[type]}を宇宙に追加
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              あなたの{NODE_LABEL[type]}が星になります
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-sm px-2 py-1 rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.35)', background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.background = 'transparent'; }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {ph.title}
            </label>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={ph.examples[0]}
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${title ? color + '60' : 'rgba(255,255,255,0.1)'}`,
                caretColor: color,
              }}
              onFocus={e => { e.currentTarget.style.border = `1px solid ${color}80`; e.currentTarget.style.boxShadow = `0 0 0 3px ${color}15`; }}
              onBlur={e => { e.currentTarget.style.border = `1px solid ${title ? color + '60' : 'rgba(255,255,255,0.1)'}`; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {ph.desc}
              <span className="ml-1" style={{ color: 'rgba(255,255,255,0.25)' }}>(任意)</span>
            </label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="詳細を入力..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none resize-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                caretColor: color,
              }}
              onFocus={e => { e.currentTarget.style.border = `1px solid ${color}60`; e.currentTarget.style.boxShadow = `0 0 0 3px ${color}10`; }}
              onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Examples */}
          <div>
            <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>例：</p>
            <div className="flex flex-wrap gap-1.5">
              {ph.examples.map(ex => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setTitle(ex)}
                  className="text-xs px-2.5 py-1 rounded-full transition-all"
                  style={{
                    background: `${color}14`,
                    border: `1px solid ${color}30`,
                    color: 'rgba(255,255,255,0.55)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${color}25`; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${color}14`; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all mt-1"
            style={{
              background: title.trim() ? `linear-gradient(135deg, ${color}CC, ${color}88)` : 'rgba(255,255,255,0.08)',
              border: `1px solid ${title.trim() ? color + '60' : 'rgba(255,255,255,0.08)'}`,
              cursor: title.trim() ? 'pointer' : 'not-allowed',
              opacity: title.trim() ? 1 : 0.5,
            }}
          >
            宇宙に追加する →
          </button>
        </form>
      </div>
    </div>
  );
}
