import { useState, useCallback, useRef } from 'react';
import type { StarNode, Connection, StarType } from './types';
import CosmosCanvas from './components/CosmosCanvas';
import LeftMenu from './components/LeftMenu';
import AddNodeModal from './components/AddNodeModal';
import BookshelfScanModal from './components/BookshelfScanModal';
import Legend from './components/Legend';
import AIPanel from './components/AIPanel';
import NodeDetail from './components/NodeDetail';

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function makeNode(type: StarType, title: string, description: string): StarNode {
  return {
    id: `${type}-${makeId()}`,
    type,
    title,
    description: description || undefined,
    x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
    y: window.innerHeight / 2 + (Math.random() - 0.5) * 200,
    vx: 0,
    vy: 0,
    hi: 1,
    hiTarget: 1,
    phase: Math.random() * Math.PI * 2,
    ripple: 0.01,
  };
}

export default function App() {
  const [nodes, setNodes] = useState<StarNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addType, setAddType] = useState<StarType | null>(null);
  const [showScan, setShowScan] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const demoLoaded = useRef(false);

  const selectedNode = nodes.find(n => n.id === selectedId) ?? null;

  const handleAdd = useCallback((type: StarType) => {
    setAddType(type);
  }, []);

  const handleAddBooks = useCallback((titles: string[]) => {
    const newNodes = titles.map(title => makeNode('book', title, ''));
    setNodes(prev => [...prev, ...newNodes]);
  }, []);

  const handleSubmit = useCallback((title: string, description: string) => {
    if (!addType) return;
    const node = makeNode(addType, title, description);
    setNodes(prev => [...prev, node]);
    setSelectedId(node.id);
    setShowAI(true);
    setAddType(null);
  }, [addType]);

  const handleDemo = useCallback(async () => {
    if (demoLoaded.current) return;
    demoLoaded.current = true;
    const { DEMO_NODES, DEMO_CONNECTIONS } = await import('./data/demo');
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const seeded = DEMO_NODES.map((n, i) => {
      const angle = (i / DEMO_NODES.length) * Math.PI * 2;
      return {
        ...n,
        x: cx + Math.cos(angle) * (160 + Math.random() * 60),
        y: cy + Math.sin(angle) * (120 + Math.random() * 60) - 30,
      };
    });
    setNodes(seeded);
    setConnections(DEMO_CONNECTIONS);
  }, []);

  const handleSelectNode = useCallback((id: string | null) => {
    setSelectedId(id);
    if (!id) setShowAI(false);
  }, []);

  const handleConnect = useCallback((targetId: string) => {
    if (!selectedId) return;
    const exists = connections.some(
      c => (c.sourceId === selectedId && c.targetId === targetId) ||
           (c.sourceId === targetId && c.targetId === selectedId),
    );
    if (!exists) {
      setConnections(prev => [...prev, { id: makeId(), sourceId: selectedId, targetId }]);
    }
  }, [selectedId, connections]);

  const handleAddSuggestion = useCallback((type: StarNode['type'], title: string) => {
    const node = makeNode(type, title, '');
    setNodes(prev => [...prev, node]);
    if (selectedId) {
      setConnections(prev => [...prev, { id: makeId(), sourceId: selectedId, targetId: node.id }]);
    }
  }, [selectedId]);

  const handleUpdateNodes = useCallback((updated: StarNode[]) => {
    setNodes(updated);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#000a1a' }}>
      <CosmosCanvas
        nodes={nodes}
        connections={connections}
        selectedId={selectedId}
        onSelectNode={handleSelectNode}
        onUpdateNodes={handleUpdateNodes}
      />

      <LeftMenu
        nodes={nodes}
        onAdd={handleAdd}
        onScanBookshelf={() => setShowScan(true)}
        onDemo={handleDemo}
        onSelectNode={id => { setSelectedId(id); setShowAI(false); }}
      />

      <Legend />

      {selectedNode && !showAI && (
        <NodeDetail
          node={selectedNode}
          nodes={nodes}
          connections={connections}
          onClose={() => { setSelectedId(null); }}
          onConnect={handleConnect}
          onOpenAI={() => setShowAI(true)}
        />
      )}

      {showAI && selectedNode && (
        <AIPanel
          node={selectedNode}
          onClose={() => setShowAI(false)}
          onAddSuggestion={handleAddSuggestion}
        />
      )}

      {addType && (
        <AddNodeModal
          type={addType}
          onClose={() => setAddType(null)}
          onSubmit={handleSubmit}
        />
      )}

      {showScan && (
        <BookshelfScanModal
          onClose={() => setShowScan(false)}
          onAddBooks={handleAddBooks}
        />
      )}

      {nodes.length === 0 && (
        <div
          className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none z-10"
          style={{ paddingLeft: 240 }}
        >
          <p className="text-3xl mb-3 opacity-20">✦</p>
          <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.18)' }}>
            左メニューから本・経験・問いを追加してください
          </p>
          <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.1)' }}>
            または「デモで試す」でサンプル宇宙を体験
          </p>
        </div>
      )}
    </div>
  );
}
