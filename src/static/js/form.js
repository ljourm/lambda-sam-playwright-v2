// @ts-check

const API_PATH = "/api/v1/snapshot";

/**
 * @param {{ baseUrl: string, targets: { path: string, width: number, fullPage?: boolean, beforeEvaluate?: string }[] }} requestBody
 */
const sendSnapshotRequest = async (requestBody) => {
  const res = await fetch(API_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });
  if (!res.ok) {
    throw new Error("API response not ok");
  }
  alert("送信しました");
};

const fetchCompanyPaths = async () => {
  alert("未実装");
};

/**
 * @param {SubmitEvent} e
 */
const handleFormSubmit = async (e) => {
  try {
    e.preventDefault();

    const form = document.getElementById("snapshot-form");
    const subdomainEl = document.getElementById("baseurl-input");
    const domainEl = document.getElementById("baseurl-domain");
    const pathListEl = document.getElementById("path-list");
    const companyCodeEl = document.getElementById("company-code");

    if (!form || !subdomainEl || !domainEl || !pathListEl || !companyCodeEl) {
      // ここが実行される場合、HTMLとJSの不整合が考えられる。
      throw new Error("要素の取得に失敗しました。");
    }

    const subdomain = (subdomainEl instanceof HTMLInputElement ? subdomainEl.value : "").trim();
    const domain = domainEl instanceof HTMLSelectElement ? domainEl.value : "";
    let baseUrl = "https://";
    if (subdomain) {
      baseUrl += `${subdomain}.${domain}`;
    } else {
      baseUrl += domain;
    }

    const widthEls = form.querySelectorAll('input[type="checkbox"][name="width"]:checked');
    const widths = Array.from(widthEls)
      .map((el) => (el instanceof HTMLInputElement ? Number(el.value) : null))
      .filter((v) => v !== null);

    const pathRaw = pathListEl instanceof HTMLTextAreaElement ? pathListEl.value : "";
    const paths = pathRaw
      .split(/\r?\n/)
      .map((p) => p.trim())
      .filter((p) => p);

    const targets = [];
    for (const path of paths) {
      for (const width of widths) {
        targets.push({ path, width });
      }
    }

    const requestBody = {
      baseUrl,
      targets,
    };

    await sendSnapshotRequest(requestBody);
  } catch (err) {
    console.error(err);
    alert("何らかのエラーが発生しました。");
  }
};

window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("snapshot-form");

  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  }

  const fetchPathListButton = document.getElementById("fetch-path-list");
  if (fetchPathListButton) {
    fetchPathListButton.addEventListener("click", fetchCompanyPaths);
  }
});
