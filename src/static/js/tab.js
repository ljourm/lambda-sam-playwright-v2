// @ts-check

window.addEventListener("DOMContentLoaded", () => {
  /**
   * タブを切り替える
   * @param {string} sectionName
   */
  const showSection = (sectionName) => {
    const sections = document.querySelectorAll('[id^="section-"]');
    const tabs = document.querySelectorAll('[id^="menu-"]');

    // 一旦、全てを非表示・非アクティブにする
    sections.forEach((section) => {
      if (section instanceof HTMLElement) section.style.display = "none";
    });
    tabs.forEach((tab) => {
      tab.classList.remove("is-active");
    });

    // 指定されたセクションを表示・アクティブにする
    const targetSection = document.getElementById(`section-${sectionName}`);
    if (targetSection instanceof HTMLElement) targetSection.style.display = "";
    const targetTab = document.getElementById(`menu-${sectionName}`);
    if (targetTab) targetTab?.classList.add("is-active");
  };

  const setupTabEvents = () => {
    document.querySelectorAll('[id^="menu-"]').forEach((li) => {
      li.addEventListener("click", (e) => {
        e.preventDefault();
        if (li.id && li.id.startsWith("menu-")) {
          const sectionName = li.id.replace("menu-", "");
          showSection(sectionName);
        }
      });
    });
  };

  setupTabEvents();
  showSection("create");
});
