// 全画面を取得するため、ViewPortの高さはなんでもいい。フルHDの縦サイズを固定値とする。
export const VIEWPORT_HEIGHT = 1080;

// Chromiumのスナップショットには16,384pxの高さ制限がある。それにより小さい数値を設定しておく。
export const MAX_SNAPSHOT_HEIGHT = 10000;

// スナップショット取得の同時実行数の上限
export const CONCURRENCY_LIMIT = 4;

// Lambda関数の最大ループ回数 (15分で終わらない場合、関数を何度も呼び出す)
export const MAX_LAMBDA_LOOP_COUNT = 5;
