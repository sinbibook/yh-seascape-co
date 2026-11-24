/**
 * pages/layout-map.js — t-template-C2 객실 미리보기(목록) 페이지
 * layout-map-mapper 가 슬라이드를 만든 뒤 window.initLayoutMapSwipers() 를 호출한다.
 */
window.initLayoutMapSwipers = function () {
  if (typeof Swiper === 'undefined' || !window.TplSwiper) return;

  // 서브 히어로 (fade + autoplay 4s, 버튼 없음)
  window.TplSwiper.init('layoutMapVisual', '.sub_visual_wide .swiper-container', {
    loop: true,
    spaceBetween: 0,
    effect: 'fade',
    fadeEffect: { crossFade: true },
    autoplay: { delay: 4000, disableOnInteraction: false }
  });

  // 객실 카드 목록 — 카드 4개 이하면 균등 배치, 5개 이상이면 4열 루프 슬라이드
  window.TplSwiper.initCardList('layoutMapRoom', '.main_room .swiper-container');
};
