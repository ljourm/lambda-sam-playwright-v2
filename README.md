# Lambda SAM Playwright V2

## 概要

AWS Lambda上でPlaywrightを実行するためのTypeScriptプロジェクト。デプロイはAWS SAMを使用。

前回構築: [ljourm/lambda-sam-playwright](https://github.com/ljourm/lambda-sam-playwright) (DockerImageで作成した内容をこちらでLambdaLayerで作り直し)

## 利用技術

- Node.js
  - Volta
  - TypeScript
  - pnpm
- AWS
  - AWS Lambda
  - AWS SAM
- Playwright
- Docker

## ドキュメント

- [開発環境の構築](./docs/setup.md)
- [デプロイ手順](./docs/deployment.md)

## 環境構成図

![環境構成図](./docs/architecture.svg)
[環境構成図 - 元データ(draw.io)](./docs/architecture.drawio)
