import type { StarNode, Connection } from '../types';

export const DEMO_NODES: StarNode[] = [
  {
    id: 'book-1',
    type: 'book',
    title: 'LIFE SHIFT',
    description: 'リンダ・グラットン著。100年時代の人生戦略を描く。',
    x: 0, y: 0, vx: 0, vy: 0, hi: 0, hiTarget: 0, phase: 0, ripple: 0,
  },
  {
    id: 'book-2',
    type: 'book',
    title: 'サピエンス全史',
    description: 'ユヴァル・ノア・ハラリ著。人類の歴史と未来を俯瞰する。',
    x: 0, y: 0, vx: 0, vy: 0, hi: 0, hiTarget: 0, phase: 1.2, ripple: 0,
  },
  {
    id: 'book-3',
    type: 'book',
    title: '武器になる哲学',
    description: '山口周著。ビジネスに役立つ哲学の知恵。',
    x: 0, y: 0, vx: 0, vy: 0, hi: 0, hiTarget: 0, phase: 2.4, ripple: 0,
  },
  {
    id: 'exp-1',
    type: 'experience',
    title: '転職した',
    description: 'Web3領域へのキャリアシフト。',
    date: '2023-04',
    x: 0, y: 0, vx: 0, vy: 0, hi: 0, hiTarget: 0, phase: 0.5, ripple: 0,
  },
  {
    id: 'exp-2',
    type: 'experience',
    title: 'AI大学講師として\nプロダクトを作った',
    description: 'Claude APIを使ったプロダクト開発を大学で教えた。',
    date: '2024-09',
    x: 0, y: 0, vx: 0, vy: 0, hi: 0, hiTarget: 0, phase: 1.8, ripple: 0,
  },
  {
    id: 'exp-3',
    type: 'experience',
    title: 'SNSをやめた',
    description: '情報の質を高めるため、主要SNSから離脱。',
    date: '2024-01',
    x: 0, y: 0, vx: 0, vy: 0, hi: 0, hiTarget: 0, phase: 3.0, ripple: 0,
  },
  {
    id: 'q-1',
    type: 'question',
    title: '自由とは？',
    description: '制約なき状態か、自分を律する力か。',
    x: 0, y: 0, vx: 0, vy: 0, hi: 0, hiTarget: 0, phase: 0.3, ripple: 0,
  },
  {
    id: 'q-2',
    type: 'question',
    title: 'なぜ学ぶ？',
    description: '知識は武器か、問いへの旅か。',
    x: 0, y: 0, vx: 0, vy: 0, hi: 0, hiTarget: 0, phase: 2.1, ripple: 0,
  },
  {
    id: 'q-3',
    type: 'question',
    title: '幸せとは？',
    description: '状態か、方向性か、それとも問い続けることか。',
    x: 0, y: 0, vx: 0, vy: 0, hi: 0, hiTarget: 0, phase: 1.5, ripple: 0,
  },
];

export const DEMO_CONNECTIONS: Connection[] = [
  { id: 'c-1',  sourceId: 'book-1', targetId: 'exp-1',  label: 'キャリア変革' },
  { id: 'c-2',  sourceId: 'book-1', targetId: 'q-3',   label: '長い人生' },
  { id: 'c-3',  sourceId: 'book-2', targetId: 'q-1',   label: '文明と自由' },
  { id: 'c-4',  sourceId: 'book-2', targetId: 'q-2',   label: '知の意味' },
  { id: 'c-5',  sourceId: 'book-3', targetId: 'q-2',   label: '哲学と学び' },
  { id: 'c-6',  sourceId: 'exp-1',  targetId: 'q-1',   label: '選択の自由' },
  { id: 'c-7',  sourceId: 'exp-2',  targetId: 'book-3', label: '哲学×実践' },
  { id: 'c-8',  sourceId: 'exp-2',  targetId: 'q-2',   label: 'AIと学び' },
  { id: 'c-9',  sourceId: 'exp-3',  targetId: 'q-1',   label: '情報と自由' },
  { id: 'c-10', sourceId: 'exp-3',  targetId: 'book-2', label: '現代文明' },
  { id: 'c-11', sourceId: 'q-3',   targetId: 'exp-2',  label: '喜びの源泉' },
];
