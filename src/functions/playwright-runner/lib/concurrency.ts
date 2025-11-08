const CONCURRENCY_LIMIT = 4; // 同時実行数の上限

export const processConcurrent = async <T>(
  task: (item: T) => Promise<void>,
  items: T[],
  doContinue: () => boolean,
) => {
  const executing = new Map<number, Promise<void>>();
  let index = 0;

  // 実行時にexecutingに登録し、実行完了時に削除するメソッド
  const startTask = (idx: number) => {
    const item = items[idx];
    const p = task(item).finally(() => executing.delete(idx));

    executing.set(idx, p);
  };

  // 最初にCONCURRENCY_LIMIT個のタスクを開始
  while (index < Math.min(CONCURRENCY_LIMIT, items.length)) {
    startTask(index++);
  }

  // タスク完了を待ちながら次を開始
  while (executing.size > 0) {
    await Promise.race(executing.values());

    // 次のタスクを開始
    if (index < items.length && doContinue()) {
      startTask(index++);
    }
  }

  // 未処理のアイテムを返す
  return {
    remaining: items.slice(index),
  };
};
