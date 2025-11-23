// @ts-check

const IS_LOCAL = window.location.hostname === "";

const INDEX_JSON_PATH = "/snapshots/index.json";

const mockIndexJson = [
  {
    timestamp: "2025-11-23-14-28-24",
    baseUrl: "https://example.com",
    s3InfoFileKey: "snapshots/example.com/2025-11-23-14-28-24/info.json",
  },
  {
    timestamp: "2025-11-23-14-35-55",
    baseUrl: "https://example.com",
    s3InfoFileKey: "snapshots/example.com/2025-11-23-14-35-55/info.json",
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
};

/**
 * @returns {Promise<{timestamp: string, baseUrl: string, s3InfoFileKey: string}[]>}
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
 * @returns {Promise<{timestamp: string, baseUrl: string, targets: {path: string, width: number, keys: string[]}[]}>}
 */
const getDetailJson = async (s3InfoFileKey) => {
  if (IS_LOCAL) {
    return mockInfoJson;
  }

  const response = await fetch(`/${s3InfoFileKey}`);
  return await response.json();
};

window.addEventListener("DOMContentLoaded", async () => {
  const indexBodyEl = document.getElementById("result-index-body");
  const detailInfoEl = document.getElementById("result-detail-info");
  const detailBodyEl = document.getElementById("result-detail-body");

  const details = await getIndexJson();

  if (indexBodyEl instanceof HTMLElement) {
    indexBodyEl.innerHTML = details
      .reverse() // 最新順に表示
      .map(
        (detail) =>
          `<tr><td><a href="#" data-s3-info-file-key="${detail.s3InfoFileKey}">${detail.timestamp}</a></td><td>${detail.baseUrl}</td></tr>`,
      )
      .join("");

    indexBodyEl.querySelectorAll("a").forEach((aEl) => {
      aEl.addEventListener("click", async (event) => {
        event.preventDefault();
        const s3InfoFileKey = aEl.getAttribute("data-s3-info-file-key");
        if (!s3InfoFileKey) {
          return;
        }

        const infoData = await getDetailJson(s3InfoFileKey);

        if (detailInfoEl instanceof HTMLElement && detailBodyEl instanceof HTMLElement) {
          detailInfoEl.innerHTML = `
            <p>タイムスタンプ: ${infoData.timestamp}</p>
            <p>ベースURL: ${infoData.baseUrl}</p>
            <p><a href="#" id="bulk-download">画像を一括ダウンロード</a></p>
          `;

          const bulkDownloadEl = document.getElementById("bulk-download");
          if (bulkDownloadEl instanceof HTMLElement) {
            bulkDownloadEl.addEventListener("click", (e) => {
              e.preventDefault();
              const downloadLinks = document.querySelectorAll("a[download]");
              downloadLinks.forEach((link) => {
                if (link instanceof HTMLElement) {
                  link.click();
                }
              });
            });
          }

          detailBodyEl.innerHTML = infoData.targets
            .map((target) => {
              const keyLinks = target.keys
                .map(
                  (key) =>
                    `${key.split("/").pop()} ( <a href="/${key}" target="_blank">ブラウザで表示</a> | <a href="/${key}" download>ダウンロード</a> )`,
                )
                .join("<br/>");

              return `<tr>
                  <td>${target.path}</td>
                  <td>${target.width}</td>
                  <td>${keyLinks}</td>
                </tr>
              `;
            })
            .join("");
        }
      });
    });
  }
});
