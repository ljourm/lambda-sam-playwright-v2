# デプロイ手順

## 事前準備

ローカル上にAWSのプロファイル設定が揃っていること

## 手順

### 環境変数の整備

```sh
# STG環境のパラメータを編集
cp .env.sample .env.stg
# -> .env.stgを修正

# PRD環境のパラメータを編集
cp .env.sample .env.prd
# -> .env.prdを修正
```

### ビルド

```sh
pnpm build
```

### デプロイ

```sh
PROFILE_NAME=your-profile-name

# STG環境にデプロイ
sam deploy --profile ${PROFILE_NAME} --config-env stg --parameter-overrides $(cat .env.stg)

# PRD環境にデプロイ
sam deploy --profile ${PROFILE_NAME} --config-env prd --parameter-overrides $(cat .env.prd)
```

## デプロイ後の動作確認

OutputにAPIのURLが出力されるので、それを使用する。

※ 以下では `ixnsjwskxk` を使用するが、そこは毎回変更される。

### health

```sh
curl https://ixnsjwskxk.execute-api.ap-northeast-1.amazonaws.com/Prod/api/healthcheck
```

### snapshot

```sh
curl -X POST https://ixnsjwskxk.execute-api.ap-northeast-1.amazonaws.com/Prod/api/v1/snapshot -d "{\"baseUrl\":\"https://example.com/\",\"targets\":[{\"path\":\"/\",\"width\":1200},{\"path\":\"/\",\"width\":480},{\"path\":\"/articles/\",\"width\":1200},{\"path\":\"/articles/\",\"width\":480}]}"
```
