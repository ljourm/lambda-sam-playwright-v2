// 全画面を取得するため、ViewPortの高さはなんでもいい。固定値とする。
export const VIEWPORT_HEIGHT = 1080;

// スナップショット取得の同時実行数の上限
export const CONCURRENCY_LIMIT = 1;

// Lambda関数の最大ループ回数 (15分で終わらない場合、関数を何度も呼び出す)
export const MAX_LAMBDA_LOOP_COUNT = 5;

// 許可するドメインリスト
export const ALLOW_DOMAINS = [];
