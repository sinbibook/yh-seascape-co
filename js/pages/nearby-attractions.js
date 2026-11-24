/**
 * nearby-attractions.js — t-template-C2 주변여행지 페이지
 * mapper 가 슬라이드를 만든 뒤 window.initNearbySwipers() 를 호출한다.
 */
window.initNearbySwipers = function () {
  if (typeof Swiper === 'undefined' || !window.TplSwiper) return;

  // 서브 히어로 (fade + autoplay 4s, 버튼 없음)
  window.TplSwiper.init('nearbyVisual', '.sub_visual_wide .swiper-container', {
    loop: true,
    spaceBetween: 0,
    effect: 'fade',
    fadeEffect: { crossFade: true },
    autoplay: { delay: 4000, disableOnInteraction: false }
  });
};
