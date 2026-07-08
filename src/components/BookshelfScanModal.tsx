import { useState, useRef } from 'react';
import { NODE_COLOR } from '../types';

interface DetectedBook {
  title: string;
  author?: string;
  checked: boolean;
}

interface Props {
  onClose: () => void;
  onAddBooks: (titles: string[]) => void;
}

async function scanBookshelf(imageBase64: string, mimeType: string): Promise<DetectedBook[]> {
  const res = await fetch('/api/scan-bookshelf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType }),
  });
  if (!res.ok) throw new Error('API error');
  const data = await res.json() as { books: Array<{ title: string; author?: string }> };
  return data.books.map(b => ({ ...b, checked: true }));
}

function toBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] ?? '';
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const color = NODE_COLOR.book;

export default function BookshelfScanModal({ onClose, onAddBooks }: Props) {
  const [preview, setPreview] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [books, setBooks] = useState<DetectedBook[]>([]);
  const [phase, setPhase] = useState<'upload' | 'scanning' | 'result' | 'error'>('upload');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setPhase('upload');
    setBooks([]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) handleFile(f);
  };

  const handleScan = async () => {
    if (!file) return;
    setPhase('scanning');
    try {
      const { base64, mimeType } = await toBase64(file);
      const detected = await scanBookshelf(base64, mimeType);
      setBooks(detected);
      setPhase('result');
    } catch {
      setErrorMsg('スキャンに失敗しました。APIキーを設定してください。');
      setPhase('error');
    }
  };

  const toggleBook = (i: number) => {
    setBooks(prev => prev.map((b, j) => j === i ? { ...b, checked: !b.checked } : b));
  };

  const handleAdd = () => {
    const selected = books.filter(b => b.checked).map(b => b.title);
    if (selected.length > 0) onAddBooks(selected);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md mx-4 rounded-2xl p-6 flex flex-col gap-5"
        style={{
          background: 'rgba(8, 14, 36, 0.96)',
          border: `1px solid ${color}30`,
          boxShadow: `0 0 60px ${color}12, 0 24px 48px rgba(0,0,0,0.5)`,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="text-2xl">📚</span>
          <div className="flex-1">
            <h2 className="text-white font-semibold text-base">本棚をスキャン</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              写真から本のタイトルを自動で読み取ります
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 rounded-lg"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.background = 'transparent'; }}
          >
            ✕
          </button>
        </div>

        {/* Upload zone */}
        {!preview && (
          <div
            className="flex flex-col items-center justify-center gap-3 rounded-xl py-10 cursor-pointer transition-all"
            style={{ border: `2px dashed ${color}40`, background: `${color}08` }}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}80`; e.currentTarget.style.background = `${color}12`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.background = `${color}08`; }}
          >
            <span className="text-3xl">📷</span>
            <div className="text-center">
              <p className="text-sm text-white font-medium">写真をアップロード</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                ドラッグ＆ドロップ、またはクリックして選択
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>
        )}

        {/* Preview */}
        {preview && phase !== 'result' && (
          <div className="relative rounded-xl overflow-hidden" style={{ border: `1px solid ${color}30` }}>
            <img src={preview} alt="本棚" className="w-full max-h-56 object-cover" />
            <button
              onClick={() => { setPreview(''); setFile(null); setPhase('upload'); }}
              className="absolute top-2 right-2 text-xs px-2 py-1 rounded-full"
              style={{ background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              変更
            </button>
          </div>
        )}

        {/* Scanning state */}
        {phase === 'scanning' && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: `${color}40`, borderTopColor: color }} />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>本を読み取り中…</p>
          </div>
        )}

        {/* Error */}
        {phase === 'error' && (
          <div className="rounded-xl px-4 py-3 text-center" style={{ background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)' }}>
            <p className="text-sm" style={{ color: 'rgba(255,120,120,0.9)' }}>{errorMsg}</p>
            <button
              onClick={() => { setPhase('upload'); setPreview(''); setFile(null); }}
              className="text-xs mt-2 px-3 py-1.5 rounded-full transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
            >
              もう一度試す
            </button>
          </div>
        )}

        {/* Results */}
        {phase === 'result' && books.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {books.length}冊を検出しました
              </p>
              <button
                onClick={() => setBooks(prev => prev.map(b => ({ ...b, checked: !prev.every(b2 => b2.checked) })))}
                className="text-xs"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                全選択/解除
              </button>
            </div>
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
              {books.map((book, i) => (
                <label
                  key={i}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: book.checked ? `${color}12` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${book.checked ? color + '35' : 'rgba(255,255,255,0.07)'}`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={book.checked}
                    onChange={() => toggleBook(i)}
                    className="hidden"
                  />
                  <span
                    className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                    style={{
                      background: book.checked ? color : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${book.checked ? color : 'rgba(255,255,255,0.15)'}`,
                    }}
                  >
                    {book.checked && <span className="text-xs text-black font-bold">✓</span>}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{book.title}</p>
                    {book.author && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{book.author}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Scan / Add button */}
        {phase === 'upload' && file && (
          <button
            onClick={handleScan}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
            style={{
              background: `linear-gradient(135deg, ${color}CC, ${color}88)`,
              border: `1px solid ${color}60`,
            }}
          >
            📷 スキャンする
          </button>
        )}

        {phase === 'result' && (
          <button
            onClick={handleAdd}
            disabled={!books.some(b => b.checked)}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
            style={{
              background: books.some(b => b.checked) ? `linear-gradient(135deg, ${color}CC, ${color}88)` : 'rgba(255,255,255,0.06)',
              border: `1px solid ${books.some(b => b.checked) ? color + '60' : 'rgba(255,255,255,0.08)'}`,
              cursor: books.some(b => b.checked) ? 'pointer' : 'not-allowed',
              opacity: books.some(b => b.checked) ? 1 : 0.5,
            }}
          >
            {books.filter(b => b.checked).length}冊を宇宙に追加する →
          </button>
        )}
      </div>
    </div>
  );
}
