/**
 * pages/facility.js — t-template-C2 부대시설 상세 페이지
 * facility-mapper 가 슬라이드를 만든 뒤 window.initFacilitySwipers() 를 호출한다.
 */
window.initFacilitySwipers = function () {
  if (typeof Swiper === 'undefined' || !window.TplSwiper) return;

  // 서브 히어로 (fade + autoplay 4s, 버튼 없음)
  window.TplSwiper.init('specialVisual', '.sub_visual_wide .swiper-container', {
    loop: true,
    spaceBetween: 0,
    effect: 'fade',
    fadeEffect: { crossFade: true },
    autoplay: { delay: 4000, disableOnInteraction: false }
  });

  // 본문 시설 이미지 슬라이더 (원본 '.sub_img_sld .swiper-container')
  window.TplSwiper.init('specialGallery', '.sub_img_sld .swiper-container', {
    loop: true,
    spaceBetween: 0,
    autoplay: { delay: 4000, disableOnInteraction: false },
    navigation: {
      nextEl: '.sub_img_sld .swiper-button-next',
      prevEl: '.sub_img_sld .swiper-button-prev'
    }
  });

  // 하단 SPECIAL 카드 — 원본은 autoplay 4s
  window.TplSwiper.initCardList('specialList', '.special_menu .swiper-container', {
    autoplay: { delay: 4000, disableOnInteraction: false }
  }, 4);
};
