/**
 * pages/index.js — t-template-C2 Index Page Swiper Initialization
 * index-mapper generates slides dynamically, then this initializes swipers
 */
window.initIndexSwipers = function () {
  if (typeof Swiper === 'undefined' || !window.TplSwiper) return;

  // Hero visual swiper
  window.TplSwiper.init('indexVisual', '.main_visual .swiper-container', {
    loop: true,
    spaceBetween: 0,
    autoplay: { delay: 4000, disableOnInteraction: false },
    navigation: {
      nextEl: '.main_visual .swiper-button-next',
      prevEl: '.main_visual .swiper-button-prev'
    }
  });

  // 객실 미리보기 — 카드 4개 이하면 균등 배치, 5개 이상이면 4열 루프 슬라이드
  window.TplSwiper.initCardList('indexRoom', '.main_room .swiper-container');

  // Banner swiper
  window.TplSwiper.init('indexBanner', '.main_sld_bnr .swiper-container', {
    loop: true,
    spaceBetween: 0,
    autoplay: { delay: 5000, disableOnInteraction: false },
    navigation: {
      nextEl: '.main_sld_bnr .swiper-button-next',
      prevEl: '.main_sld_bnr .swiper-button-prev'
    }
  });

  // 부대시설 카드 — 객실 카드와 같은 규격 (4개 이하 균등, 5개 이상 루프 슬라이드)
  // 원본은 객실 카드만 autoplay 를 끄고 SPECIAL 은 4초로 돌린다 (facility.html 과 동일)
  window.TplSwiper.initCardList('indexSpecial', '.special_menu .swiper-container', {
    autoplay: { delay: 4000, disableOnInteraction: false }
  }, 4);
};
