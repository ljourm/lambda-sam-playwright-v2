// @ts-check

window.addEventListener("DOMContentLoaded", () => {
  const API_PATH = "/api/v1/snapshot";

  // 二重送信防止用フラグ
  let submitting = false;

  // 要素の取得
  const form = document.getElementById("snapshot-form");
  const subdomainInput = document.getElementById("baseurl-input");
  const domainSelector = document.getElementById("baseurl-domain");
  const companyCodeInput = document.getElementById("company-code");
  const pathListTextarea = document.getElementById("path-list");
  const noteTextarea = document.getElementById("note");
  const buttons = document.querySelectorAll("button");
  const fetchPathListButton = document.getElementById("fetch-path-list");

  if (
    !form ||
    !subdomainInput ||
    !(subdomainInput instanceof HTMLInputElement) ||
    !domainSelector ||
    !(domainSelector instanceof HTMLSelectElement) ||
    !companyCodeInput ||
    !(companyCodeInput instanceof HTMLInputElement) ||
    !pathListTextarea ||
    !(pathListTextarea instanceof HTMLTextAreaElement) ||
    !noteTextarea ||
    !(noteTextarea instanceof HTMLTextAreaElement) ||
    buttons.length === 0 ||
    !fetchPathListButton
  ) {
    // ここが実行される場合、HTMLとJSの不整合が考えられる。
    throw new Error("要素の取得に失敗しました。");
  }

  // API通信開始処理
  const startSubmitting = () => {
    submitting = true;

    buttons.forEach((button) => {
      button.classList.add("is-loading");
      button.disabled = true;
    });
  };

  // API通信終了処理
  const endSubmitting = () => {
    buttons.forEach((button) => {
      button.classList.remove("is-loading");
      button.disabled = false;
    });
    submitting = false;
  };

  /**
   * スナップショット撮影を実行するAPIを呼び出す
   * @param {{ baseUrl: string, basicAuth?: { username: string, password: string }, targets: { path: string, width: number, fullPage?: boolean, beforeEvaluate?: string }[], note?: string }} requestBody
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

  /**
   * スナップショット撮影を実行する
   * @param {SubmitEvent} e
   */
  const handleFormSubmit = async (e) => {
    try {
      e.preventDefault();

      if (submitting) {
        return;
      }

      startSubmitting();

      const subdomain = subdomainInput.value.trim();
      const domain = domainSelector.value;
      let baseUrl = "https://";
      if (subdomain) {
        baseUrl += `${subdomain}.${domain}`;
      } else {
        baseUrl += domain;
      }

      const widthCheckboxes = form.querySelectorAll('input[type="checkbox"][name="width"]:checked');
      const widths = Array.from(widthCheckboxes)
        .map((el) => (el instanceof HTMLInputElement ? Number(el.value) : null))
        .filter((v) => v !== null);

      const paths = pathListTextarea.value
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
        note: noteTextarea.value.trim(),
      };

      await sendSnapshotRequest(requestBody);
    } catch (err) {
      console.error(err);
      alert("何らかのエラーが発生しました。");
    } finally {
      endSubmitting();
    }
  };

  /**
   * 会社コードからパス一覧を取得する
   * @param {PointerEvent} e
   */
  const fetchCompanyPaths = async (e) => {
    try {
      e.preventDefault();

      if (submitting) {
        return;
      }

      startSubmitting();

      alert("未実装");
    } catch (err) {
      console.error(err);
      alert("何らかのエラーが発生しました。");
    } finally {
      endSubmitting();
    }
  };

  // イベントを設定する
  form.addEventListener("submit", handleFormSubmit);
  fetchPathListButton.addEventListener("click", fetchCompanyPaths);
});
