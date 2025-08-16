class Main {
  #observers = [];

  constructor() {
    this.header = document.querySelector(".header");
    this.sides = document.querySelectorAll(".side");

    // .swiper要素が存在する場合のみHeroSliderを初期化
    const swiperElement = document.querySelector(".swiper");
    if (swiperElement) {
      this.hero = new HeroSlider(".swiper");
    }

    this.#init();
  }

  #init() {
    new MobileMenu();
    Pace.on("done", this.#scrollInit.bind(this));
    // HeroSliderが存在する場合のみ開始
    if (this.hero) {
      this.hero.start();
    }
  }

  destroy() {
    this.#observers.forEach((so) => so.destroy());
  }

  #scrollInit() {
    this.#observers.push(
      new ScrollObserver("#main-content", this.#sideAnimation.bind(this), { once: false, rootMargin: "-300px 0px" }),
      new ScrollObserver(".nav-trigger", this.#navAnimation.bind(this), { once: false }),
      new ScrollObserver(".swiper", this.#toggleSlideAnimation.bind(this), { once: false }),
      new ScrollObserver(".cover-slide", this.#inviewAnimation),
      new ScrollObserver(".appear", this.#inviewAnimation),
      new ScrollObserver(".tween-animate-title", this.#textAnimation)
    );
    console.log(this.#observers);
  }

  #toggleSlideAnimation(el, inview) {
    if (this.hero) {
      if (inview) {
        this.hero.start();
      } else {
        this.hero.stop();
      }
    }
  }

  #textAnimation(el, inview) {
    if (inview) {
      const ta = new TweenTextAnimation(el);
      ta.animate();
    }
  }

  #navAnimation(el, inview) {
    if (inview) {
      this.header.classList.remove("triggered");
    } else {
      this.header.classList.add("triggered");
    }
  }

  #sideAnimation(el, inview) {
    if (inview) {
      this.sides.forEach((side) => side.classList.add("inview"));
    } else {
      this.sides.forEach((side) => side.classList.remove("inview"));
    }
  }

  #inviewAnimation(el, inview) {
    if (inview) {
      el.classList.add("inview");
    } else {
      el.classList.remove("inview");
    }
  }

  // PhotoSwipeの初期化
  #initPhotoSwipe() {
    if (typeof PhotoSwipeLightbox !== "undefined") {
      const lightbox = new PhotoSwipeLightbox({
        gallery: ".index-gallery",
        children: "a[data-pswp-width]",
        pswpModule: PhotoSwipe,
      });
      lightbox.init();
      console.log("PhotoSwipeが正常に初期化されました");
    } else {
      console.error("PhotoSwipeが読み込まれていません");
    }
  }
}

const main = new Main();
