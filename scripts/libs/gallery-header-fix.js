// ギャラリーページのヘッダー重複修正
document.addEventListener("DOMContentLoaded", function () {
  // ヘッダーの高さを取得
  const header = document.querySelector(".header");
  if (header) {
    const headerHeight = header.offsetHeight;

    // ヒーローセクションのマージンを動的に設定
    const heroSection = document.querySelector(".gallery-hero");
    if (heroSection) {
      heroSection.style.marginTop = headerHeight + "px";
    }
  }
});
