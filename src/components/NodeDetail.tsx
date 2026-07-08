import type { StarNode, Connection } from '../types';
import { NODE_COLOR, NODE_ICON, NODE_LABEL } from '../types';

interface Props {
  node: StarNode;
  nodes: StarNode[];
  connections: Connection[];
  onClose: () => void;
  onConnect: (targetId: string) => void;
  onOpenAI: () => void;
}

export default function NodeDetail({ node, nodes, connections, onClose, onConnect, onOpenAI }: Props) {
  const color = NODE_COLOR[node.type];

  const connected = connections
    .filter(c => c.sourceId === node.id || c.targetId === node.id)
    .map(c => {
      const otherId = c.sourceId === node.id ? c.targetId : c.sourceId;
      return nodes.find(n => n.id === otherId);
    })
    .filter(Boolean) as StarNode[];

  const unconnected = nodes.filter(
    n => n.id !== node.id && !connected.some(c => c.id === n.id),
  );

  return (
    <div
      className="fixed bottom-6 left-1/2 z-30 w-80 rounded-2xl p-4"
      style={{
        transform: 'translateX(-50%)',
        background: 'rgba(6, 12, 32, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${color}30`,
        boxShadow: `0 0 40px ${color}10, 0 16px 40px rgba(0,0,0,0.4)`,
        marginLeft: 120, // offset for left menu
      }}
    >
      {/* Node info */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{NODE_ICON[node.type]}</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs mb-0.5" style={{ color }}>
            {NODE_LABEL[node.type]}
          </div>
          <div className="text-sm font-semibold text-white leading-snug">
            {node.title.replace('\n', ' ')}
          </div>
          {node.description && (
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {node.description}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-xs w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 transition-all"
          style={{ color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.05)' }}
        >
          ✕
        </button>
      </div>

      {/* Connected nodes */}
      {connected.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            つながり ({connected.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {connected.map(n => (
              <span
                key={n.id}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: `${NODE_COLOR[n.type]}18`,
                  border: `1px solid ${NODE_COLOR[n.type]}30`,
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                {NODE_ICON[n.type]} {n.title.replace('\n', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Connect to unconnected */}
      {unconnected.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            つなぐ
          </p>
          <div className="flex flex-wrap gap-1.5">
            {unconnected.slice(0, 6).map(n => (
              <button
                key={n.id}
                onClick={() => onConnect(n.id)}
                className="text-xs px-2 py-0.5 rounded-full transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.45)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${NODE_COLOR[n.type]}18`;
                  e.currentTarget.style.borderColor = `${NODE_COLOR[n.type]}35`;
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                }}
              >
                {NODE_ICON[n.type]} {n.title.replace('\n', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI button */}
      <button
        onClick={onOpenAI}
        className="w-full py-2 rounded-xl text-xs font-medium transition-all"
        style={{
          background: `${color}18`,
          border: `1px solid ${color}35`,
          color: 'rgba(255,255,255,0.65)',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = `${color}28`; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.background = `${color}18`; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
      >
        ✦ AIに問いかける
      </button>
    </div>
  );
}
