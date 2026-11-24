/**
 * pages/main.js — t-template-C2 펜션소개 페이지
 * main-mapper 가 슬라이드 마크업을 만든 뒤 window.initMainSwipers() 를 호출한다.
 * 원본 camino custom.js 는 Swiper 3 문법이라 Swiper 8 기준으로 옮겼다.
 */
window.initMainSwipers = function () {
  if (typeof Swiper === 'undefined' || !window.TplSwiper) return;

  // 서브 히어로 (원본 '.visual .swiper-container' — fade + autoplay 4s, 버튼 없음)
  window.TplSwiper.init('mainVisual', '.sub_visual_wide .swiper-container', {
    loop: true,
    spaceBetween: 0,
    effect: 'fade',
    fadeEffect: { crossFade: true },
    autoplay: { delay: 4000, disableOnInteraction: false }
  });

  // 본문 갤러리 슬라이더 (원본 '.sub_img_sld .swiper-container')
  window.TplSwiper.init('mainGallery', '.sub_img_sld .swiper-container', {
    loop: true,
    spaceBetween: 0,
    autoplay: { delay: 4000, disableOnInteraction: false },
    navigation: {
      nextEl: '.sub_img_sld .swiper-button-next',
      prevEl: '.sub_img_sld .swiper-button-prev'
    }
  });
};
