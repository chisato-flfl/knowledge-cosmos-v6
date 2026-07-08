# Knowledge Cosmos v6

> 自分の知識に問いかける宇宙

本・経験・問いを宇宙に配置し、それらのつながりを可視化するナレッジグラフです。  
答えを出すサービスではなく、思考を深めるサービスです。

## 星の種類

| アイコン | 種類 | 色 | 例 |
|---------|------|----|----|
| 📚 | 本（Knowledge） | 紫 | LIFE SHIFT、サピエンス全史 |
| 🌱 | 経験（Experience） | エメラルドグリーン | 転職した、SNSをやめた |
| ✨ | 問い（Question） | ゴールド | 自由とは？、なぜ学ぶ？ |

## v6 変更点

### 新機能
- **3種類の星**: 本・経験・問い をそれぞれ異なる色で宇宙に配置
- **左メニュー刷新**: 📚/🌱/✨ の追加ボタン + ⭐ デモ
- **NodeDetail**: 星をクリックすると詳細パネル表示 + 他の星との接続
- **AIパネル**: 経験・問いを追加するとAIが関連する本・経験・問いを提案
- **凡例（Legend）**: 画面右下に種類と色の対応を常時表示
- **つながり（接続）**: 本↔経験↔問い の全方向にリンク可能

### 技術スタック
- React 19 + TypeScript
- Tailwind CSS v3
- Vite
- Vercel（フロントエンド + サーバーレス関数）
- Claude API（Haiku）

## ローカル起動

```bash
git clone https://github.com/<your-username>/knowledge-cosmos.git
cd knowledge-cosmos
npm install
cp .env.example .env.local
# .env.local に ANTHROPIC_API_KEY を設定
npm run dev
```

## AI機能のセットアップ

AI機能（関連提案・次の問い生成）を使うには Anthropic API キーが必要です。

1. [Anthropic Console](https://console.anthropic.com) でAPIキーを取得
2. `.env.local` に設定:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
3. Vercel にデプロイする場合は Vercel の環境変数に設定

> APIキーなしでも、デモデータと手動接続機能は使えます。

## Vercel デプロイ

```bash
npx vercel --prod
```

環境変数 `ANTHROPIC_API_KEY` を Vercel Dashboard で設定してください。

## 設計思想

Knowledge Cosmos は「答えを見つけるツール」ではありません。  
本・経験・問いが循環しながら人生を可視化し、思考を深めるための空間です。

AIも同じ哲学で設計されています。AIは「答え」を返さず、常に「問い」を返します。

---

*宇宙感・静けさ・哲学・余白を大切に。*
