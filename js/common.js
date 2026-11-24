/* ============================================================
   common.js — 전 페이지 공통 스크립트
   - 헤더 스크롤 상태 / PC LNB hover / 모바일 aside / scroll_down
   - 헤더는 header-footer-loader.js 가 fetch 로 주입하므로
     window.loaderReady 이후에 바인딩한다.
   - 동적으로 갈아끼워지는 요소(매퍼가 생성)를 위해 이벤트 위임을 쓴다.
   ============================================================ */
$(function () {
  (window.loaderReady || Promise.resolve()).then(function () {
    // ── 헤더 스크롤 상태 ────────────────────────────────
    function updateHeaderState() {
      if ($(window).scrollTop() > 0) {
        $('#header').addClass('on');
      } else {
        $('#header').removeClass('on');
      }
    }
    $(window).on('scroll', updateHeaderState);
    updateHeaderState();

    // ── PC 상단 LNB hover ──────────────────────────────
    // .hd_lnb_bg 높이를 서브메뉴 실제 높이에 맞춘다.
    // 객실/시설 메뉴는 매퍼가 동적 생성하므로 hover 시점에 매번 계산한다.
    function openLnb() {
      // 서브메뉴가 뷰포트 아래로 넘치지 않도록 상한을 잡는다.
      // (헤더 높이 + 서브메뉴 top 여백 + 하단 여유)
      var headerH = $('#header').outerHeight() || 0;
      var cap = Math.max(160, $(window).height() - headerH - 80);

      var contentH = 0;
      $('.depth_box').each(function () {
        var $box = $(this);
        // 측정 전에 상한을 풀어 실제 내용 높이를 잰다
        $box.css('max-height', '');
        var natural = this.scrollHeight;
        if (contentH < natural) contentH = natural;

        // 객실/시설이 많아 상한을 넘으면 그 박스만 스크롤시킨다
        if (natural > cap) {
          $box.addClass('is-scroll').css('max-height', cap + 'px');
        } else {
          $box.removeClass('is-scroll').css('max-height', '');
        }
      });

      $('.depth_box, .hd_lnb_bg').addClass('on');
      $('.hd_lnb_bg').css({ height: Math.min(contentH, cap) + 60 });
    }

    function closeLnb() {
      $('.depth_box, .hd_lnb_bg').removeClass('on');
      // max-height 인라인 값을 지워 CSS 의 닫힘 트랜지션(max-height:0)이 살아나게 한다
      $('.depth_box').css('max-height', '');
      $('.hd_lnb_bg').css({ height: 0 });
    }

    // 창 크기가 바뀌면 상한을 다시 계산한다 (열려 있을 때만)
    $(window).on('resize', function () {
      if ($('.depth_box.on').length) openLnb();
    });

    $(document).on('mouseenter', '#hd_lnb, .hd_lnb_bg', openLnb);
    $(document).on('mouseleave', '#hd_lnb, .hd_lnb_bg', closeLnb);

    // ── 모바일 aside 토글 ──────────────────────────────
    function openAside() {
      $('.aside, .aside_bg').addClass('on');
      $('html, body').css({ height: '100%', overflow: 'hidden' });
    }

    function closeAside() {
      $('.aside, .aside_bg').removeClass('on');
      $('html, body').css({ height: 'inherit', overflow: 'inherit' });
    }

    $(document).on('click', '.btn_menu', function () {
      if ($('.aside').hasClass('on')) closeAside();
      else openAside();
    });
    $(document).on('click', '.btn_close, .aside_bg', function (e) {
      e.preventDefault();
      closeAside();
    });

    // ── aside 아코디언 ─────────────────────────────────
    $(document).on('click', '.aside .depth1', function () {
      $('.depth_list').not($(this).next()).slideUp();
      $(this).next().slideToggle();
    });

    // ── 비주얼 scroll_down ─────────────────────────────
    function swing() {
      $('.scroll_down').animate({ bottom: '15px' }, 900).animate({ bottom: '30px' }, 900, swing);
    }
    if ($('.scroll_down').length) swing();

    $(document).on('click', '.scroll_down', function (e) {
      e.preventDefault();
      var visualH = $('.visual').height() || 0;
      var headerH = $('.header').height() || 0;
      $('html, body').animate({ scrollTop: visualH - headerH }, 600);
    });

    // ⚠️ #container 에 상단 패딩을 주지 말 것.
    //    A 는 헤더가 히어로(.main_visual / .sub_visual*) 위에 겹치는 디자인이라
    //    원본 사이트도 #container 패딩을 주지 않는다.
    //    폭 1024px 미만에서 padding-top 을 넣으면 히어로가 헤더만큼 밀려
    //    상단에 흰 띠가 생긴다 (백오피스 미리보기처럼 좁은 iframe 에서 발생).
  });
});

/* ============================================================
   Swiper 공용 헬퍼
   매퍼가 슬라이드를 동적 생성한 뒤 호출되므로, 같은 컨테이너에
   이미 인스턴스가 있으면 destroy 후 재생성한다.
   ============================================================ */
window.TplSwiper = (function () {
  var instances = {};

  function init(key, selector, options) {
    var el = document.querySelector(selector);
    if (!el) return null;
    // 슬라이드가 하나도 없으면 초기화하지 않는다 (매핑 전/데이터 없음)
    var slideCount = el.querySelectorAll('.swiper-slide').length;
    if (!slideCount) return null;

    if (instances[key]) {
      try {
        instances[key].destroy(true, true);
      } catch (e) {
        /* 이미 파괴된 인스턴스 무시 */
      }
      delete instances[key];
    }

    var opts = options || {};

    // loop 는 슬라이드가 화면에 보이는 수보다 많아야 정상 동작한다.
    // 부족한 상태로 켜면 Swiper 가 레이아웃을 못 잡거나 예외를 던진다.
    var perView = Number(opts.slidesPerView) || 1;
    if (opts.loop && slideCount <= perView) {
      var relaxed = {};
      Object.keys(opts).forEach(function (k) {
        relaxed[k] = opts[k];
      });
      relaxed.loop = false;
      opts = relaxed;
    }

    // 한 슬라이더가 실패해도 같은 페이지의 나머지 초기화까지 멈추면 안 된다.
    try {
      instances[key] = new Swiper(selector, opts);
    } catch (e) {
      console.error('[TplSwiper] init failed:', key, selector, e);
      return null;
    }
    return instances[key];
  }

  // 카드 목록(객실 Room's Preview / 부대시설 SPECIAL) 공용 초기화.
  // index / layout-map / room / special 이 모두 같은 규격을 쓴다.
  //
  // 데스크톱 열 수는 원본 기준으로 영역마다 다르다 — ROOMS 3열 / SPECIAL 4열.
  // (camino·julietta 원본 측정: .room_list spv 3 고정, .special_menu spv 4 고정)
  // columns 로 넘기고, 기본값은 ROOMS 기준 3 이다.
  // 카드가 columns 이하면 슬라이드하지 않고 개수만큼 균등 배치한다.
  //
  // extra 로 페이지별 추가 옵션(autoplay 등)을 덧씌울 수 있다.
  function initCardList(key, selector, extra, columns) {
    var el = document.querySelector(selector);
    if (!el) return null;

    var count = el.querySelectorAll('.swiper-slide').length;
    if (!count) return null;

    var cols = Number(columns) || 3;
    var isSlider = count > cols;
    var max = isSlider ? cols : count;

    var opts = {
      loop: isSlider,
      slidesPerView: max,
      spaceBetween: 30,
      grabCursor: true,
      breakpoints: {
        280: { slidesPerView: 1, spaceBetween: 10 },
        640: { slidesPerView: Math.min(2, max), spaceBetween: 10 },
        768: { slidesPerView: Math.min(2, max), spaceBetween: 20 },
        980: { slidesPerView: max, spaceBetween: 20 },
        1451: { slidesPerView: max, spaceBetween: 30 }
      }
    };
    if (extra) {
      Object.keys(extra).forEach(function (k) {
        opts[k] = extra[k];
      });
    }

    return init(key, selector, opts);
  }

  return { init: init, initCardList: initCardList, instances: instances };
})();

/* ============================================================
   parallax 재적용
   .parallax-window 는 매퍼가 data-image-src 를 주입한 뒤에야
   배경을 알 수 있으므로, 매핑 완료 후 이 함수를 호출한다.
   ============================================================ */
window.initParallax = function () {
  var hasParallax = !!$.fn.parallax;

  $('.parallax-window').each(function () {
    var $el = $(this);
    var src = $el.attr('data-image-src');
    if (!src) return;

    // parallax.js 가 없을 때만 CSS 폴백을 건다.
    // .parallax-mirror 는 z-index:-100 이라, 요소 자신에 background-image 가 있으면
    // 미러가 가려져 패럴랙스가 죽고 cover 크롭만 남는다. 둘을 함께 쓰면 안 된다.
    if (!hasParallax) {
      $el.css({
        'background-image': 'url(' + src + ')',
        'background-size': 'cover',
        'background-position': 'center',
        'background-attachment': 'fixed'
      });
      return;
    }

    // 이미 초기화된 요소는 이미지 소스만 갈아끼운다 (preview 재렌더 대비)
    if ($el.data('tpl-parallax-init')) {
      var mirror = $el.data('tpl-parallax-mirror');
      if (mirror) mirror.find('img.parallax-slider').attr('src', src);
      return;
    }

    $el.parallax({ imageSrc: src });
    $el.data('tpl-parallax-init', true);
    // parallax.js 가 body 끝에 붙인 미러를 기억해 둔다
    $el.data('tpl-parallax-mirror', $('.parallax-mirror').last());
  });
};
