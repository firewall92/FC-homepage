// スムーズスクロール機能
document.addEventListener("DOMContentLoaded", function () {
  // ヘッダーナビゲーションのリンクを取得
  const navLinks = document.querySelectorAll('.header__nav a[href^="#"]');

  // 各リンクにクリックイベントを追加
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      // ターゲットのIDを取得
      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        // ヘッダーの高さを考慮してスクロール位置を調整
        const headerHeight = document.querySelector(".header").offsetHeight;

        // 各セクションのmain-titleの位置にスクロール
        let targetPosition;

        if (targetId === "#about") {
          // Aboutセクションのmain-titleの位置にスクロール
          const titleElement = targetElement.querySelector(".main-title");
          if (titleElement) {
            targetPosition = titleElement.offsetTop - headerHeight;
          } else {
            targetPosition = targetElement.offsetTop - headerHeight;
          }
        } else if (targetId === "#gallery") {
          // Galleryセクションのmain-titleの位置にスクロール
          const titleElement = targetElement.querySelector(".main-title");
          if (titleElement) {
            targetPosition = titleElement.offsetTop - headerHeight;
          } else {
            targetPosition = targetElement.offsetTop - headerHeight;
          }
        } else if (targetId === "#topics") {
          // TOPICSセクションのmain-titleの位置にスクロール
          const titleElement = targetElement.querySelector(".main-title");
          if (titleElement) {
            targetPosition = titleElement.offsetTop - headerHeight;
          } else {
            targetPosition = targetElement.offsetTop - headerHeight;
          }
        } else {
          // デフォルトの位置
          targetPosition = targetElement.offsetTop - headerHeight;
        }

        // スムーズスクロール
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });
});
