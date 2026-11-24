/**
 * pages/room.js — t-template-C2 객실 상세 페이지
 * room-mapper 가 슬라이드를 만든 뒤 window.initRoomSwipers() 를 호출한다.
 */
window.initRoomSwipers = function () {
  if (typeof Swiper === 'undefined' || !window.TplSwiper) return;

  // 서브 히어로 (fade + autoplay 4s, 버튼 없음)
  window.TplSwiper.init('roomVisual', '.sub_visual_wide .swiper-container', {
    loop: true,
    spaceBetween: 0,
    effect: 'fade',
    fadeEffect: { crossFade: true },
    autoplay: { delay: 4000, disableOnInteraction: false }
  });

  // 객실 이미지 슬라이더 (원본 '.sub_img_sld .swiper-container')
  window.TplSwiper.init('roomGallery', '.sub_img_sld .swiper-container', {
    loop: true,
    spaceBetween: 0,
    autoplay: { delay: 4000, disableOnInteraction: false },
    navigation: {
      nextEl: '.sub_img_sld .swiper-button-next',
      prevEl: '.sub_img_sld .swiper-button-prev'
    }
  });

  // 하단 Room Preview — 카드 4개 이하면 균등 배치, 5개 이상이면 4열 루프 슬라이드
  window.TplSwiper.initCardList('roomList', '.main_room .swiper-container');
};
