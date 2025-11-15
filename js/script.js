document.addEventListener("DOMContentLoaded", () => {
  // 네비게이션
  const menus = document.querySelectorAll(".navbar > a");
  //   console.log(document.querySelectorAll("section"));
  //   console.log(menus);

  menus[0].classList.add("active");
  menus.forEach((menu, index) => {
    menu.addEventListener("click", (e) => {
      e.preventDefault();

      menus.forEach((m) => m.classList.remove("active"));
      menu.classList.add("active");

      layoutSlider.slideTo(index, 300);
    });
  });

  // 전체 레이아웃용
  const layoutSlider = new Swiper(".layout-slider", {
    mousewheel: true,
    direction: "vertical",
    behavior: "smooth",
    speed: 300,
    on: {
      slideChangeTransitionEnd: function () {
        menus.forEach((menu) => {
          menu.classList.remove("active");
        });

        let indexToActivate = this.activeIndex;

        if (indexToActivate >= menus.length) {
          indexToActivate = menus.length - 1;
        }

        if (menus[indexToActivate]) {
          menus[indexToActivate].classList.add("active");
        }
      },
    },
  });

  // ===================================================================
  // ① 기본 슬라이더 초기화
  // ===================================================================

  // Web 섹션 슬라이더
  new Swiper(".web-carousel", {
    autoplay: true,
    loop: true,
    slidesPerView: 1.5,
    centeredSlides: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".carousel-nav .next-btn",
      prevEl: ".carousel-nav .prev-btn",
    },
    scrollbar: {
      el: ".swiper-scrollbar",
    },
  });

  // Design 섹션 슬라이더
  new Swiper(".bottom-slider", {
    slidesPerView: 4,
    slidesPerGroup: 1,
    spaceBetween: 20,
    centeredSlides: false,
    loop: true,
    slideToClickedSlide: true,
    navigation: {
      nextEl: ".carousel-nav1 .swiper-button-next",
      prevEl: ".carousel-nav1 .swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination1",
      clickable: true,
    },
    breakpoints: {
      1400: { slidesPerView: 4, slidesPerGroup: 1, spaceBetween: 20 },
      1200: { slidesPerView: 4, slidesPerGroup: 1, spaceBetween: 20 },
      1024: { slidesPerView: 3, slidesPerGroup: 1, spaceBetween: 15 },
      768: { slidesPerView: 2, slidesPerGroup: 1, spaceBetween: 10 },
      320: { slidesPerView: 1, slidesPerGroup: 1, spaceBetween: 8 },
    },
  });

  // ===================================================================
  // ② 반짝이 효과 함수
  // ===================================================================
  function createSparkles(callback) {
    const sparkleCount = 150;
    let completedSparkles = 0;

    for (let i = 0; i < sparkleCount; i++) {
      const sparkle = document.createElement("div");
      sparkle.className = "sparkle";

      const startX = Math.random() * window.innerWidth;
      const startY = Math.random() * (window.innerHeight / 3);

      sparkle.style.left = `${startX}px`;
      sparkle.style.top = `${startY}px`;

      const duration = 0 + Math.random() * 0.4;
      const delay = Math.random() * 0.3;

      sparkle.style.animation = `fall ${duration}s linear forwards`;
      sparkle.style.animationDelay = `${delay}s`;

      document.body.appendChild(sparkle);

      sparkle.addEventListener("animationend", () => {
        sparkle.remove();
        completedSparkles++;
        if (completedSparkles === sparkleCount) {
          setTimeout(() => {
            if (callback) callback();
          }, 20);
        }
      });
    }
  }

  // ===================================================================
  // ③ 레이어 팝업 공통 로직
  // ===================================================================

  // 열려있는 레이어의 닫기 함수를 저장하는 변수
  let activeCloseHandler = null;

  /**
   * 레이어 팝업을 설정하고 이벤트를 바인딩하는 공통 함수
   * @param {object} options - 레이어 설정 객체
   */
  function setupLayer(options) {
    const {
      triggerSlidesSelector,
      layerSelector,
      layerSwiperSelector,
      layerSwiperOptions,
      onBeforeOpen,
    } = options;

    const triggerSlides = document.querySelectorAll(triggerSlidesSelector);
    const largeLayer = document.querySelector(layerSelector);
    if (!triggerSlides.length || !largeLayer) return;

    const closeBtn = largeLayer.querySelector(".close-btn");
    const layerPagination = largeLayer.querySelector(".swiper-pagination");
    let layerSwiper = null;

    // 페이지네이션 위치를 고정하는 함수
    const fixPaginationPosition = () => {
      if (!layerPagination) return;
      Object.assign(layerPagination.style, {
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        top: "calc(50% + 420px + 18px)",
        bottom: "auto",
        width: "auto",
        height: "auto",
        visibility: "visible",
        opacity: "1",
      });
    };

    // 레이어 Swiper를 초기화하는 함수
    const initLayerSwiper = () => {
      if (layerSwiper) return;
      layerSwiper = new Swiper(layerSwiperSelector, layerSwiperOptions);

      if (layerPagination) {
        const observer = new MutationObserver(fixPaginationPosition);
        observer.observe(layerPagination, {
          attributes: true,
          attributeFilter: ["style"],
        });
      }
    };

    // 레이어를 여는 함수
    const openLayer = (index) => {
      initLayerSwiper();
      if (layerPagination) fixPaginationPosition();

      requestAnimationFrame(() => {
        largeLayer.classList.add("show");
        largeLayer.setAttribute("aria-hidden", "false");
        if (layerPagination) {
          layerPagination.style.visibility = "visible";
          layerPagination.style.opacity = "1";
        }
        layerSwiper.slideToLoop(index, 0);
        activeCloseHandler = closeLayer;
      });
    };

    // 레이어를 닫는 함수
    const closeLayer = () => {
      largeLayer.classList.remove("show");
      largeLayer.setAttribute("aria-hidden", "true");
      if (layerPagination) {
        layerPagination.style.opacity = "0";
        layerPagination.style.visibility = "hidden";
      }
      activeCloseHandler = null;
    };

    // 트리거 슬라이드에 클릭 이벤트 추가
    triggerSlides.forEach((slide) => {
      const clickableElement = slide.querySelector("img") || slide;
      clickableElement.addEventListener("click", () => {
        const realIndex = parseInt(slide.dataset.swiperSlideIndex, 10);
        if (onBeforeOpen) {
          onBeforeOpen(() => openLayer(realIndex));
        } else {
          openLayer(realIndex);
        }
      });
    });

    // 닫기 버튼에 클릭 이벤트 추가
    if (closeBtn) {
      closeBtn.addEventListener("click", closeLayer);
    }
  }

  // ===================================================================
  // ④ 각 섹션별 레이어 설정 및 실행
  // ===================================================================

  // Web 섹션 레이어 설정
  setupLayer({
    triggerSlidesSelector: ".web-carousel .swiper-slide",
    layerSelector: ".web-large-layer",
    layerSwiperSelector: ".web-layer-swiper",
    layerSwiperOptions: {
      loop: true,
      slidesPerView: 1,
      centeredSlides: true,
      navigation: {
        nextEl: ".swiper-button-next-web-layer",
        prevEl: ".swiper-button-prev-web-layer",
      },
      pagination: {
        el: ".swiper-pagination-web-layer",
        clickable: true,
      },
    },
  });

  // Design 섹션 레이어 설정
  setupLayer({
    triggerSlidesSelector: ".bottom-slider .swiper-slide",
    layerSelector: ".design-large-layer",
    layerSwiperSelector: ".layer-swiper",
    layerSwiperOptions: {
      loop: true,
      slidesPerView: 1,
      centeredSlides: true,
      navigation: {
        nextEl: ".swiper-button-next-layer",
        prevEl: ".swiper-button-prev-layer",
      },
      pagination: {
        el: ".swiper-pagination-layer",
        clickable: true,
      },
    },
    onBeforeOpen: createSparkles, // 열기 전에 반짝이 효과 실행
  });

  // ===================================================================
  // ⑤ ESC 키로 레이어 닫기
  // ===================================================================
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && activeCloseHandler) {
      activeCloseHandler();
    }
  });

  // ===================================================================
  // ⑥ 스크롤에 따른 헤더 타이틀 변경
  // ===================================================================
  const titleElement = document.querySelector(".title");
  const sectionsWithId = document.querySelectorAll("section[id]");

  const observerOptions = {
    root: null, // Use the viewport as the root
    rootMargin: "0px",
    threshold: 0.5, // Trigger when 50% of the section is visible
  };

  const titleObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.id;
        // Capitalize the first letter for better display, e.g., 'aura' -> 'Aura'
        if (titleElement && sectionId) {
          titleElement.textContent =
            sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
        }
      }
    });
  }, observerOptions);

  sectionsWithId.forEach((section) => {
    titleObserver.observe(section);
  });
});
