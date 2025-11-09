# 開発環境の構築

## 概要

本リポジトリの開発環境を構築する手順を記載します。

## 推奨環境

- MacOS
- VSCode

## 使用ツールの導入

| ツール | 導入方法 | 備考 |
| -- | -- | -- |
| [Volta](https://volta.sh/)| [公式を参照](https://docs.volta.sh/guide/getting-started)||
| [Node](https://nodejs.org/ja)| `volta install node@22.21.0`||
| [pnpm](https://pnpm.io/ja/)| `volta install pnpm`||
| [esbuild](https://esbuild.github.io/)| `pnpm install -g esbuild`| sam buildのためにグローバルインストールが必要 |
| [AWS SAM CLI](https://docs.aws.amazon.com/ja_jp/serverless-application-model/latest/developerguide/what-is-sam.html) | [公式を参照](https://docs.aws.amazon.com/ja_jp/serverless-application-model/latest/developerguide/install-sam-cli.html) ||
| [Docker](https://www.docker.com/ja-jp/) | [Docker Desktopを参照](https://www.docker.com/ja-jp/products/docker-desktop/) ||

## セットアップ手順

1. 使用ツールを全て導入する
2. 依存パッケージをインストールする
   ```sh
   pnpm install
   ```
3. ローカル用のenvファイルの作成
   ```sh
   # STG環境のパラメータを編集
   cp .env.sample .env.local
   # -> .env.localを修正
   ```

## ビルド

### フォントの準備

```sh
mkdir -p src/layers/font/fonts
curl -L -o src/layers/font/fonts/NotoSansJP.ttf "https://github.com/google/fonts/raw/main/ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf"
```

### SAMプロジェクトのビルド

```sh
sam build
```

## ローカルテスト

### 単体関数のローカル実行

```sh
sam local invoke ApiHealthcheckFunction --parameter-overrides $(cat .env.local)
sam local invoke ApiV1SnapshotFunction --parameter-overrides $(cat .env.local) --event events/api-v1-snapshot/base.json
sam local invoke PlaywrightRunnerFunction --parameter-overrides $(cat .env.local) --event events/playwright-runner/base.json
```

### API Gatewayエミュレーション

```sh
sam local start-api --parameter-overrides $(cat .env.local)
```

```sh
curl http://127.0.0.1:3000/api/healthcheck
```

### Playwright Runnerのローカルテスト

Docker外で簡易的にテストすることを目的に、テストランナーを用意している。

#### 事前準備

```sh
# Playwrightや必要なライブラリをインストール
npx playwright install --with-deps
```

#### 実行

```sh
pnpm tsx ./src/functions/playwright-runner/test-runner.ts
# -> output-snapshotsにスナップショット画像が出力される
```
