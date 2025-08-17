class CustomLoader {
  constructor() {
    // 既存のインスタンスがあれば、新しいインスタンスを作成しない
    if (window.customLoaderInstance) {
      return;
    }

    // グローバルインスタンスとして保存
    window.customLoaderInstance = this;

    // 開始時刻を記録
    this.startTime = Date.now();
    this.isHidden = false; // ローダーが非表示になったかどうかのフラグ

    this.init();
  }

  init() {
    // Pace.jsの読み込み完了を待つ
    if (typeof Pace !== "undefined") {
      this.setupLoader();
    } else {
      // Pace.jsが読み込まれていない場合のフォールバック
      setTimeout(() => this.init(), 100);
    }
  }

  setupLoader() {
    // Pace.jsの要素を取得
    const paceElement = document.querySelector(".pace");
    if (!paceElement) {
      // Pace.jsの要素が見つからない場合は少し待って再試行
      setTimeout(() => this.setupLoader(), 100);
      return;
    }

    // Pace.jsのデフォルトローダーを無効化
    this.disablePaceDefaultLoader(paceElement);

    // index.htmlページかどうかを判定
    const isIndexPage = document.querySelector("#global-container.index-page") !== null;
    if (isIndexPage) {
      paceElement.classList.add("index-page");
    } else {
    }

    // 新しいloadingアニメーション要素を作成
    this.createLoadingAnimation(paceElement);

    // 固定のloading時間制御を開始
    this.startFixedLoadingTimer(isIndexPage);

    // Pace.jsのイベントを監視し、ローダーの表示状態を制御
    Pace.on("start", () => {
      if (!this.isHidden) {
        this.showLoader();
      }
    });

    Pace.on("done", () => {
      // Pace.js完了後もローダーを表示し続ける（固定タイマーで制御）
      if (!this.isHidden) {
        this.preventPaceHide();
      }
    });

    // 初期状態でローダーを表示（Pace.jsが既に開始している場合）
    if (paceElement.classList.contains("pace-running") && !this.isHidden) {
      this.showLoader();
    }

    // ページ読み込み状態を監視
    this.checkPageLoadState();

    // 強制的にローダーを表示（フォールバック）
    setTimeout(() => {
      if (!this.isHidden && (!this.loadingAnimation || this.loadingAnimation.style.display === "none")) {
        this.showLoader();
      }
    }, 500);

    // カスタムローダーの準備完了を示す
    this.markLoaderReady(paceElement, isIndexPage);

    // ページ離脱時のクリーンアップ
    window.addEventListener("beforeunload", () => this.cleanup());
    window.addEventListener("pagehide", () => this.cleanup());
  }

  disablePaceDefaultLoader(paceElement) {
    // Pace.jsのデフォルトローダー要素を非表示にする
    const defaultElements = [".pace-activity", ".pace-progress-inner"];

    defaultElements.forEach((selector) => {
      const elements = paceElement.querySelectorAll(selector);
      elements.forEach((el) => {
        el.style.display = "none";
        el.style.visibility = "hidden";
        el.style.opacity = "0";
      });
    });

    // pace-progressは残す（FC MECテキスト表示のため）
    // ただし、デフォルトのスタイルは上書き
    const style = document.createElement("style");
    style.textContent = `
      .pace .pace-activity,
      .pace .pace-progress-inner {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
      }
      
      .pace .pace-progress {
        display: block !important;
        transform: none !important;
        text-align: center;
        margin-bottom: 30px;
      }
    `;
    document.head.appendChild(style);
  }

  startFixedLoadingTimer(isIndexPage) {
    // index.htmlの場合は固定時間、その他のページはPace.jsの完了を待つ
    if (isIndexPage) {
      // 固定のloading時間を設定（index.htmlのみ）
      const totalLoadingTime = 2000; // index.html: 2秒

      // 既存のタイマーがあればクリア
      if (this.loadingTimer) {
        clearTimeout(this.loadingTimer);
        this.loadingTimer = null;
      }

      // 既存のプログレスログがあればクリア
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }

      // 既存のフォールバックタイマーがあればクリア
      if (this.fallbackTimer) {
        clearTimeout(this.fallbackTimer);
        this.fallbackTimer = null;
      }

      // 一定時間後にローダーを非表示にする
      this.loadingTimer = setTimeout(() => {
        const actualTime = Date.now() - this.startTime;
        this.hideLoader();
      }, totalLoadingTime);

      // フォールバックタイマー（メインタイマーが失敗した場合の保険）
      this.fallbackTimer = setTimeout(() => {
        this.forceHideLoader();
      }, totalLoadingTime + 2000); // メインタイマー + 2秒

      // タイマーの動作確認用ログ

      // 1秒ごとにタイマーの残り時間を表示
      this.startProgressLogging(totalLoadingTime);
    } else {
      // その他のページはPace.jsの完了を待つ

      // 既存のタイマーがあればクリア
      if (this.loadingTimer) {
        clearTimeout(this.loadingTimer);
        this.loadingTimer = null;
      }

      // 既存のプログレスログがあればクリア
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }

      // 既存のフォールバックタイマーがあればクリア
      if (this.fallbackTimer) {
        clearTimeout(this.fallbackTimer);
        this.fallbackTimer = null;
      }

      // Pace.jsの完了を監視
      Pace.on("done", () => {
        this.hideLoader();
      });

      // フォールバックタイマー（Pace.jsが完了しない場合の保険）
      this.fallbackTimer = setTimeout(() => {
        this.forceHideLoader();
      }, 5000); // 5秒後に強制非表示
    }
  }

  startProgressLogging(totalTime) {
    let remainingTime = totalTime;
    this.progressInterval = setInterval(() => {
      remainingTime -= 1000;
      if (remainingTime > 0) {
        const elapsedTime = totalTime - remainingTime;
        const actualElapsed = Date.now() - this.startTime;
      } else {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }
    }, 1000);
  }

  createLoadingAnimation(container) {
    // 既存のカスタムローダーがあれば削除
    const existingLoader = container.querySelector("#custom-loading-animation");
    if (existingLoader) {
      existingLoader.remove();
    }

    // メインのアニメーション要素
    const loadingAnimation = document.createElement("div");
    loadingAnimation.className = "loading-animation";
    loadingAnimation.id = "custom-loading-animation";

    // 外側の円
    const outerCircle = document.createElement("div");
    outerCircle.className = "loading-circle";

    // 内側の円
    const innerCircle = document.createElement("div");
    innerCircle.className = "loading-circle-inner";

    // 中心のドット
    const centerDot = document.createElement("div");
    centerDot.className = "loading-dot";

    // サッカーボールの模様
    const pattern = document.createElement("div");
    pattern.className = "loading-pattern";

    // 要素を組み立て
    loadingAnimation.appendChild(outerCircle);
    loadingAnimation.appendChild(innerCircle);
    loadingAnimation.appendChild(centerDot);
    loadingAnimation.appendChild(pattern);

    // コンテナに追加
    container.appendChild(loadingAnimation);

    // 初期状態では表示
    loadingAnimation.style.display = "block";
    loadingAnimation.style.opacity = "1";
    this.loadingAnimation = loadingAnimation;
  }

  showLoader() {
    // 既に非表示になっている場合は表示しない
    if (this.isHidden) {
      return;
    }

    // Pace.jsの要素を表示状態にする
    const paceElement = document.querySelector(".pace");
    if (paceElement) {
      // pace-doneクラスを削除
      paceElement.classList.remove("pace-done");
      paceElement.classList.add("pace-running");

      paceElement.style.display = "flex";
      paceElement.style.opacity = "1";
      paceElement.style.visibility = "visible";
    }

    // カスタムアニメーションも表示
    if (this.loadingAnimation) {
      this.loadingAnimation.style.display = "block";
      this.loadingAnimation.style.opacity = "1";
    } else {
      // ローダーが存在しない場合は再作成を試行
      if (paceElement) {
        this.createLoadingAnimation(paceElement);
      }
    }
  }

  hideLoader() {
    try {
      if (this.loadingAnimation) {
        const hideTime = Date.now();
        const totalDisplayTime = hideTime - this.startTime;

        // 非表示フラグを設定
        this.isHidden = true;

        // タイマーをクリア
        if (this.loadingTimer) {
          clearTimeout(this.loadingTimer);
          this.loadingTimer = null;
        }

        // フォールバックタイマーもクリア
        if (this.fallbackTimer) {
          clearTimeout(this.fallbackTimer);
          this.fallbackTimer = null;
        }

        // プログレスログをクリア
        if (this.progressInterval) {
          clearInterval(this.progressInterval);
          this.progressInterval = null;
        }

        // Pace.jsの要素を非表示にする
        const paceElement = document.querySelector(".pace");
        if (paceElement) {
          // pace-doneクラスを追加して、Pace.jsの状態を正しく設定
          paceElement.classList.remove("pace-running");
          paceElement.classList.add("pace-done");

          paceElement.style.transition = "opacity 0.5s ease-out";
          paceElement.style.opacity = "0";

          setTimeout(() => {
            if (paceElement) {
              paceElement.style.display = "none";
              paceElement.style.visibility = "hidden";
            }
          }, 500);
        }

        // カスタムアニメーションもフェードアウト
        this.loadingAnimation.style.transition = "opacity 0.5s ease-out";
        this.loadingAnimation.style.opacity = "0";

        setTimeout(() => {
          if (this.loadingAnimation) {
            this.loadingAnimation.style.display = "none";
            this.loadingAnimation.style.opacity = "1";
          }
        }, 500);
      } else {
        this.forceHideLoader();
      }
    } catch (error) {
      console.error("Error in hideLoader:", error);
      this.forceHideLoader();
    }
  }

  forceHideLoader() {
    try {
      // 非表示フラグを設定
      this.isHidden = true;

      // すべてのタイマーをクリア
      if (this.loadingTimer) {
        clearTimeout(this.loadingTimer);
        this.loadingTimer = null;
      }
      if (this.fallbackTimer) {
        clearTimeout(this.fallbackTimer);
        this.fallbackTimer = null;
      }
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }

      // Pace.jsの要素を強制的に非表示
      const paceElement = document.querySelector(".pace");
      if (paceElement) {
        paceElement.style.display = "none";
        paceElement.style.visibility = "hidden";
        paceElement.style.opacity = "0";
        paceElement.classList.remove("pace-running");
        paceElement.classList.add("pace-done");
      }

      // カスタムアニメーションを強制的に非表示
      if (this.loadingAnimation) {
        this.loadingAnimation.style.display = "none";
        this.loadingAnimation.style.opacity = "0";
      }

      // グローバルインスタンスをクリア
      if (window.customLoaderInstance === this) {
        window.customLoaderInstance = null;
      }
    } catch (error) {
      console.error("Error in forceHideLoader:", error);
      // 最後の手段：ページをリロード
    }
  }

  // ページ離脱時のクリーンアップ
  cleanup() {
    this.forceHideLoader();
  }

  checkPageLoadState() {
    // ページの読み込み状態を確認
    if (document.readyState === "loading") {
      // まだ読み込み中
      if (!this.isHidden) {
        this.showLoader();
      }
    } else if (document.readyState === "complete") {
      // 読み込み完了
    }
  }

  markLoaderReady(paceElement, isIndexPage) {
    // カスタムローダーの準備完了を示す
    const delay = isIndexPage ? 400 : 200; // index.htmlの場合は400ms、その他は200ms
    setTimeout(() => {
      if (!this.isHidden) {
        paceElement.classList.add("loader-ready");
      }
    }, delay);
  }

  preventPaceHide() {
    // 既に非表示になっている場合は何もしない
    if (this.isHidden) {
      return;
    }

    // Pace.jsが自動的にローダーを非表示にするのを防ぐ
    const paceElement = document.querySelector(".pace");
    if (paceElement) {
      // pace-doneクラスを削除して、ローダーを表示状態に保つ
      paceElement.classList.remove("pace-done");
      paceElement.classList.add("pace-running");

      // 強制的に表示状態を維持
      paceElement.style.display = "flex";
      paceElement.style.opacity = "1";
      paceElement.style.visibility = "visible";
    }
  }
}

// グローバルインスタンスの管理
let customLoaderInitialized = false;

// Pace.jsの読み込み完了を待ってから初期化
function initializeCustomLoader() {
  if (customLoaderInitialized) {
    return;
  }

  // index.htmlページかどうかを判定
  const isIndexPage = document.querySelector("#global-container.index-page") !== null;

  if (typeof Pace !== "undefined") {
    if (isIndexPage) {
    } else {
    }
    new CustomLoader();
    customLoaderInitialized = true;
  } else {
    setTimeout(initializeCustomLoader, 100);
  }
}

// ページ読み込み開始時に初期化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeCustomLoader);
} else {
  // DOMが既に読み込まれている場合
  initializeCustomLoader();
}

// ページ読み込み完了時にも初期化を試行（ただし重複は防ぐ）
window.addEventListener("load", () => {
  if (!customLoaderInitialized) {
    initializeCustomLoader();
  }
});
