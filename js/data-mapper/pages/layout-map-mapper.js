(function (global) {
  'use strict';

  function setAllText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
  }

  function setAllHtml(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.innerHTML = value;
    });
  }

  function LayoutMapMapper() {
    BaseDataMapper.call(this);
  }
  LayoutMapMapper.prototype = Object.create(BaseDataMapper.prototype);
  LayoutMapMapper.prototype.constructor = LayoutMapMapper;

  LayoutMapMapper.prototype.mapPage = function () {
    if (this.isDisabled()) {
      window.location.replace('./404.html');
      return;
    }

    this.mapPropertyNames();
    this.mapHero();
    this.mapEyebrow();
    this.renderRoomNav('[data-room-list-nav]', null);
    this.renderRoomSlides('[data-room-list-slides]');
    this.mapLayoutImages();

    if (typeof window.initLayoutMapSwipers === 'function') window.initLayoutMapSwipers();
  };

  // layoutMap 페이지 섹션 (customFields.pages.layoutMap.sections[0])
  LayoutMapMapper.prototype.getSection = function () {
    var page = this.getPages().layoutMap;
    return (page && page.sections && page.sections[0]) || {};
  };

  // sections[0].enabled === false 면 헤더 메뉴도 숨겨진다.
  // 직접 URL 로 들어온 경우와 프리뷰를 위해 404 로 보낸다.
  // 헤더 "미리보기" li 숨김과 대메뉴 ROOMS 이동처(첫 객실 상세)도
  // header-footer-mapper 가 같은 기준(isLayoutMapEnabled)으로 정한다.
  LayoutMapMapper.prototype.isDisabled = function () {
    return !this.isLayoutMapEnabled();
  };

  LayoutMapMapper.prototype.mapPropertyNames = function () {
    setAllText('[data-property-name-en]', this.getPropertyNameEn());
    // 히어로 세로 eyebrow 는 원본이 대문자다 (strong 은 원표기라 슬롯을 나눈다)
    setAllText('[data-property-name-en-caps]', (this.getPropertyNameEn() || '').toUpperCase());
    setAllText('[data-property-name]', this.getPropertyName());
    this.applyPropertyCaptions();
  };

  // 객실 이미지 pool. 히어로 폴백으로 쓴다.
  // roomtypes[] 의 thumbnail → exterior → interior 순으로 모은다.
  LayoutMapMapper.prototype.getRoomImagePool = function () {
    var self = this;
    var pool = [];

    function push(list) {
      list.forEach(function (img) {
        if (!img || !img.url) return;
        var dup = pool.some(function (p) {
          return p.url === img.url;
        });
        if (!dup) pool.push(img);
      });
    }

    ['roomtype_thumbnail', 'roomtype_exterior', 'roomtype_interior'].forEach(function (cat) {
      self.getRoomtypes().forEach(function (rt) {
        push(self.getRoomtypeImages(rt, cat));
      });
    });

    return pool;
  };

  // MAPPER: layoutMap.hero → 서브 히어로 설명 / 슬라이더
  // 히어로 strong 은 매핑하지 않는다. 숙소 영문명 고정이다.
  LayoutMapMapper.prototype.mapHero = function () {
    var hero = this.getSection().hero || {};

    var desc = this.getSubHeroDescription(hero);
    setAllHtml('[data-layout-map-hero-description]', desc ? this.nl2br(desc) : '');

    var images = this.getSelectedImages(hero.images || []);
    if (!images.length) images = this.getRoomImagePool();

    var wrapper = document.querySelector('[data-layout-map-hero-slides]');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    if (!images.length) {
      var empty = document.createElement('div');
      empty.className = 'swiper-slide';
      ImageHelpers.applyBackgroundPlaceholder(empty, '객실 미리보기 히어로');
      wrapper.appendChild(empty);
      return;
    }

    images.forEach(function (img) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';
      slide.style.backgroundImage = 'url(' + img.url + ')';
      slide.style.backgroundPosition = 'center';
      slide.style.backgroundSize = 'cover';
      wrapper.appendChild(slide);
    });
  };

  LayoutMapMapper.prototype.mapEyebrow = function () {
    var nameEn = this.cleanText(this.getPropertyNameEn());
    setAllText('[data-layout-map-eyebrow]', nameEn ? 'Welcome, ' + nameEn : 'Welcome');
  };

  // MAPPER: layoutMap.about.images[isSelected] → [data-layout-map-images]
  // 배치도는 도면이라 background cover 로 자르지 않고 <img> 로 원본 비율을 유지한다.
  // 선택 이미지가 여러 장이면 sortOrder 순서대로 모두 노출한다.
  //
  // 이 페이지는 배치도를 보여주는 것이 본 목적이므로, 이미지가 없어도 영역을 숨기지 않고
  // placeholder 로 자리를 유지한다.
  // (room.html 의 평면도는 부가 정보라 없으면 영역째 숨기는 것과 다르다)
  LayoutMapMapper.prototype.mapLayoutImages = function () {
    var about = this.getSection().about || {};
    var images = this.getSelectedImages(about.images || []);

    document.querySelectorAll('[data-layout-map-images]').forEach(function (box) {
      box.innerHTML = '';

      if (!images.length) {
        var empty = document.createElement('img');
        ImageHelpers.applyPlaceholder(empty, '객실 배치도');
        box.appendChild(empty);
        return;
      }

      images.forEach(function (img) {
        var el = document.createElement('img');
        el.src = img.url;
        el.alt = '객실 배치도';
        box.appendChild(el);
      });
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (window.previewHandler) return;
    var mapper = new LayoutMapMapper();
    mapper.initialize();
    global.layoutMapMapperInstance = mapper;
  });

  global.LayoutMapMapper = LayoutMapMapper;
})(window);
