/**
 * pages/directions.js — t-template-C2 오시는길 페이지
 * directions-mapper 가 슬라이드를 만든 뒤 window.initDirectionsSwipers() 를 호출한다.
 * 지도는 mapper 가 kakao-maps-sdk 로 직접 그린다.
 */
window.initDirectionsSwipers = function () {
  if (typeof Swiper === 'undefined' || !window.TplSwiper) return;

  // 서브 히어로 (원본 '.visual .swiper-container' — fade + autoplay 4s, 버튼 없음)
  window.TplSwiper.init('directionsVisual', '.sub_visual_wide .swiper-container', {
    loop: true,
    spaceBetween: 0,
    effect: 'fade',
    fadeEffect: { crossFade: true },
    autoplay: { delay: 4000, disableOnInteraction: false }
  });
};
