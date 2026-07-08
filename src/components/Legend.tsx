import { NODE_COLOR } from '../types';

export default function Legend() {
  return (
    <div
      className="fixed bottom-6 right-6 z-20 flex flex-col gap-2 px-4 py-3 rounded-2xl"
      style={{
        background: 'rgba(4, 10, 28, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {(
        [
          { icon: '📚', label: '本',   color: NODE_COLOR.book },
          { icon: '🌱', label: '経験', color: NODE_COLOR.experience },
          { icon: '✨', label: '問い', color: NODE_COLOR.question },
        ] as const
      ).map(({ icon, label, color }) => (
        <div key={label} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: color, boxShadow: `0 0 6px ${color}80` }}
          />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {icon} {label}
          </span>
        </div>
      ))}
    </div>
  );
}
