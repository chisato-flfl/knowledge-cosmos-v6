import type { StarNode, StarType } from '../types';
import { NODE_COLOR, NODE_LABEL } from '../types';

interface Props {
  nodes: StarNode[];
  onAdd: (type: StarType) => void;
  onScanBookshelf: () => void;
  onDemo: () => void;
  onSelectNode: (id: string) => void;
}

const BTN_CONFIG: { type: StarType; icon: string; label: string }[] = [
  { type: 'book',       icon: '📚', label: '本を追加' },
  { type: 'experience', icon: '🌱', label: '経験を追加' },
  { type: 'question',   icon: '✨', label: '問いを追加' },
];

export default function LeftMenu({ nodes, onAdd, onScanBookshelf, onDemo, onSelectNode }: Props) {
  const bookCount = nodes.filter(n => n.type === 'book').length;
  const expCount  = nodes.filter(n => n.type === 'experience').length;
  const qCount    = nodes.filter(n => n.type === 'question').length;

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col z-20 select-none"
      style={{
        width: 240,
        background: 'rgba(4, 10, 28, 0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Header */}
      <div className="px-5 pt-8 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">✦</span>
          <span className="text-white font-semibold tracking-wide text-sm">Knowledge Cosmos</span>
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(123,104,238,0.25)', color: '#a89cf0', border: '1px solid rgba(123,104,238,0.4)' }}
          >
            v6
          </span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>
          自分の知識に問いかける宇宙
        </p>
      </div>

      {/* Divider */}
      <div className="mx-5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />

      {/* Add buttons */}
      <nav className="px-3 pt-5 flex flex-col gap-1.5">
        {/* Bookshelf scan */}
        <button
          onClick={onScanBookshelf}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left"
          style={{ color: 'rgba(255,255,255,0.78)', background: 'transparent', border: '1px solid transparent' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = `${NODE_COLOR.book}14`;
            e.currentTarget.style.borderColor = `${NODE_COLOR.book}30`;
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.color = 'rgba(255,255,255,0.78)';
          }}
        >
          <span className="text-base w-6 text-center">📷</span>
          <span>本棚を撮影する</span>
        </button>

        <div className="my-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} />

        {BTN_CONFIG.map(({ type, icon, label }) => (
          <button
            key={type}
            onClick={() => onAdd(type)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left"
            style={{
              color: 'rgba(255,255,255,0.78)',
              background: 'transparent',
              border: '1px solid transparent',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget;
              el.style.background = `${NODE_COLOR[type]}14`;
              el.style.borderColor = `${NODE_COLOR[type]}30`;
              el.style.color = '#fff';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget;
              el.style.background = 'transparent';
              el.style.borderColor = 'transparent';
              el.style.color = 'rgba(255,255,255,0.78)';
            }}
          >
            <span className="text-base w-6 text-center">{icon}</span>
            <span>{label}</span>
          </button>
        ))}

        <div className="my-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

        <button
          onClick={onDemo}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left"
          style={{ color: 'rgba(255,255,255,0.5)', background: 'transparent', border: '1px solid transparent' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.78)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
          }}
        >
          <span className="text-base w-6 text-center">⭐</span>
          <span>デモで試す</span>
        </button>
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Stats */}
      {nodes.length > 0 && (
        <div className="mx-4 mb-5 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-xs font-medium mb-2.5" style={{ color: 'rgba(255,255,255,0.4)' }}>宇宙の構成</p>
          <div className="flex flex-col gap-1.5">
            {([['book', bookCount, '📚'], ['experience', expCount, '🌱'], ['question', qCount, '✨']] as const).map(([type, count, icon]) => (
              count > 0 && (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{icon}</span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{NODE_LABEL[type]}</span>
                  </div>
                  <span className="text-xs font-semibold tabular-nums" style={{ color: NODE_COLOR[type] }}>{count}</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Recent nodes */}
      {nodes.length > 0 && (
        <div className="px-4 pb-6">
          <p className="text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>最近追加した星</p>
          <div className="flex flex-col gap-1">
            {[...nodes].reverse().slice(0, 5).map(n => (
              <button
                key={n.id}
                onClick={() => onSelectNode(n.id)}
                className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-left transition-all duration-100"
                style={{ background: 'transparent', border: '1px solid transparent' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: NODE_COLOR[n.type] }}
                />
                <span
                  className="text-xs truncate"
                  style={{ color: 'rgba(255,255,255,0.55)' }}
                >
                  {n.title.replace('\n', ' ')}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
