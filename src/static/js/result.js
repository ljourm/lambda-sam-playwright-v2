// @ts-check

window.addEventListener("DOMContentLoaded", async () => {
  const IS_LOCAL = window.location.hostname === "";
  const INDEX_JSON_PATH = "/snapshots/index.json";

  const mockIndexJson = [
    {
      timestamp: "2025-11-23-14-28-24",
      baseUrl: "https://example.com",
      s3InfoFileKey: "snapshots/example.com/2025-11-23-14-28-24/info.json",
      note: "モック使用中",
    },
  ];
  const mockInfoJson = {
    timestamp: "2025-11-23-14-35-55",
    baseUrl: "https://example.com",
    targets: [
      {
        path: "/",
        width: 1200,
        keys: ["snapshots/example.com/2025-11-23-14-35-55/index-1200.png"],
      },
    ],
    note: "モック使用中",
  };

  /**
   * @returns {Promise<{timestamp: string, baseUrl: string, s3InfoFileKey: string, note?: string}[]>}
   */
  const getIndexJson = async () => {
    if (IS_LOCAL) {
      return mockIndexJson;
    }

    const response = await fetch(INDEX_JSON_PATH);
    return await response.json();
  };

  /**
   * @param {string} s3InfoFileKey
   * @returns {Promise<{timestamp: string, baseUrl: string, targets: {path: string, width: number, keys: string[]}[], note?: string}>}
   */
  const getDetailJson = async (s3InfoFileKey) => {
    if (IS_LOCAL) {
      return mockInfoJson;
    }

    const response = await fetch(`/${s3InfoFileKey}`);
    return await response.json();
  };

  const indexBody = document.getElementById("result-index-body");
  const detailInfo = document.getElementById("result-detail-info");
  const detailBody = document.getElementById("result-detail-body");

  if (
    !indexBody ||
    !(indexBody instanceof HTMLElement) ||
    !detailInfo ||
    !(detailInfo instanceof HTMLElement) ||
    !detailBody ||
    !(detailBody instanceof HTMLElement)
  ) {
    // ここが実行される場合、HTMLとJSの不整合が考えられる。
    throw new Error("要素の取得に失敗しました。");
  }

  const details = await getIndexJson();

  // 結果一覧のHTML生成
  indexBody.innerHTML = details
    .reverse() // 最新順に表示
    .map(
      (detail) =>
        `<tr><td><a href="#" data-s3-info-file-key="${detail.s3InfoFileKey}">${detail.timestamp}</a></td><td>${detail.baseUrl}</td><td>${detail.note ?? ""}</td></tr>`,
    )
    .join("");

  // 各リンクにクリックイベントを設定
  indexBody.querySelectorAll("a").forEach((aEl) => {
    aEl.addEventListener("click", async (event) => {
      event.preventDefault();

      const s3InfoFileKey = aEl.getAttribute("data-s3-info-file-key");
      if (!s3InfoFileKey) {
        // 型エラー対策。ここが実行されることはありえない。
        return;
      }

      const infoData = await getDetailJson(s3InfoFileKey);

      detailInfo.innerHTML = `
            <p>タイムスタンプ: ${infoData.timestamp}</p>
            <p>ベースURL: ${infoData.baseUrl}</p>
            <p>備考: ${infoData.note ?? ""}</p>
            <p><a href="#" id="bulk-download">画像を一括ダウンロード</a></p>
          `;

      const bulkDownloadEl = document.getElementById("bulk-download");
      if (bulkDownloadEl instanceof HTMLElement) {
        bulkDownloadEl.addEventListener("click", (e) => {
          e.preventDefault();

          // ダウンロードリンクを全てクリックすることで一括ダウンロードを実現
          const downloadLinks = document.querySelectorAll("a[download]");
          downloadLinks.forEach((link) => {
            if (link instanceof HTMLElement) {
              link.click();
            }
          });
        });
      }

      detailBody.innerHTML = infoData.targets
        .map((target) => {
          const url = `${infoData.baseUrl}${target.path}`;
          const keyLinks = target.keys
            .map((key) => {
              const fileName = key.split("/").pop();
              return `${fileName} ( <a href="/${key}">ブラウザで表示</a> | <a href="/${key}" download>ダウンロード</a> )`;
            })
            .join("<br/>");

          return `<tr><td><a href="${url}">${target.path}</a></td><td>${target.width}</td><td>${keyLinks}</td></tr>`;
        })
        .join("");
    });
  });
});
