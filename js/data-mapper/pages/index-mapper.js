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

  function IndexMapper() {
    BaseDataMapper.call(this);
  }
  IndexMapper.prototype = Object.create(BaseDataMapper.prototype);
  IndexMapper.prototype.constructor = IndexMapper;

  IndexMapper.prototype.mapPage = function () {
    this.mapPropertyNames();
    this.mapHero();
    this.mapRoomIntro();
    this.mapRoomSlides();
    this.mapBannerSlides();
    this.mapSpecialIntro();
    this.mapSpecialList();
    this.mapMenuSection();
    this.mapWideBanner();

    if (typeof window.initIndexSwipers === 'function') window.initIndexSwipers();
    if (typeof window.initParallax === 'function') window.initParallax();
  };

  IndexMapper.prototype.getSection = function () {
    var page = this.getPages().index;
    return (page && page.sections && page.sections[0]) || {};
  };

  // 숙소명 매핑
  IndexMapper.prototype.mapPropertyNames = function () {
    setAllText('[data-property-name-en]', this.getPropertyNameEn());
    // 히어로 세로 eyebrow 는 원본이 대문자다 (strong 은 원표기라 슬롯을 나눈다)
    setAllText('[data-property-name-en-caps]', (this.getPropertyNameEn() || '').toUpperCase());
    setAllText('[data-property-name]', this.getPropertyName());
    this.applyPropertyCaptions();
  };

  // 히어로 섹션
  IndexMapper.prototype.mapHero = function () {
    var hero = this.getSection().hero || {};
    var images = this.getSelectedImages(hero.images || []);

    var title = this.firstText(hero.title, this.getPropertyNameEn());
    var desc = this.firstText(hero.description, this.getProperty().subtitle);

    setAllText('[data-index-hero-title]', title);
    setAllHtml('[data-index-hero-description]', desc ? this.nl2br(desc) : '');

    var wrapper = document.querySelector('[data-index-hero-slides]');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    if (!images.length) {
      var empty = document.createElement('div');
      empty.className = 'swiper-slide';
      ImageHelpers.applyBackgroundPlaceholder(empty, 'Hero Image');
      wrapper.appendChild(empty);
      return;
    }

    images.forEach(function (img) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';
      if (img.url) {
        slide.style.backgroundImage = 'url(' + img.url + ')';
        slide.style.backgroundPosition = 'center';
        slide.style.backgroundSize = 'cover';
      }
      wrapper.appendChild(slide);
    });
  };

  // Room Preview 제목/설명
  IndexMapper.prototype.mapRoomIntro = function () {
    var essence = this.getSection().essence || {};
    var title = this.firstText(essence.title, "Room's Preview");
    var desc = this.firstText(essence.description, '');
    var nameEn = this.cleanText(this.getPropertyNameEn());
    var eyebrow = nameEn ? 'Welcome, ' + nameEn : 'Welcome';

    setAllText('[data-index-room-title]', title);
    setAllHtml('[data-index-room-description]', desc ? this.nl2br(desc) : '');
    setAllText('[data-index-room-eyebrow]', eyebrow);
  };

  // 객실 카드 슬라이드
  IndexMapper.prototype.mapRoomSlides = function () {
    this.renderRoomSlides('[data-index-room-slides]');
  };

  // 배너 슬라이드 (gallery images)
  IndexMapper.prototype.mapBannerSlides = function () {
    var gallery = this.getSection().gallery || {};
    var images = this.getSelectedImages(gallery.images || []);

    var wrapper = document.querySelector('[data-index-banner-slides]');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    if (!images.length) {
      var empty = document.createElement('div');
      empty.className = 'swiper-slide';
      ImageHelpers.applyBackgroundPlaceholder(empty, 'Banner Image');
      wrapper.appendChild(empty);
      return;
    }

    images.forEach(function (img) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';
      if (img.url) {
        slide.style.backgroundImage = 'url(' + img.url + ')';
        slide.style.backgroundPosition = 'center';
        slide.style.backgroundSize = 'cover';
      }
      wrapper.appendChild(slide);
    });
  };

  // Special 섹션 제목/설명
  IndexMapper.prototype.mapSpecialIntro = function () {
    var nameEn = this.cleanText(this.getPropertyNameEn());
    var title = nameEn ? nameEn.toUpperCase() + '<br />SPECIAL INFO' : 'SPECIAL INFO';
    // 원본은 "CAMINO POOLVILLA 부대시설" 처럼 숙소 영문명을 쓴다 (첫 시설명이 아니다)
    var desc = (nameEn || this.getPropertyName() || '') + ' 부대시설';

    setAllHtml('[data-index-special-title]', title);
    setAllText('[data-index-special-description]', desc);
  };

  // Special 카드 (base 공용 렌더러)
  IndexMapper.prototype.mapSpecialList = function () {
    this.renderSpecialCards('[data-index-special-list]');
  };

  // 직접 메뉴 섹션
  IndexMapper.prototype.mapMenuSection = function () {
    var nameEn = this.cleanText(this.getPropertyNameEn());
    var name = this.getPropertyName();
    var title = nameEn ? nameEn.toUpperCase() + '<br />DIRECT MENU' : name + '<br />DIRECT MENU';
    var desc = name + ' 바로가기메뉴';

    setAllHtml('[data-index-menu-title]', title);
    setAllText('[data-index-menu-description]', desc);

    // 3칸 이미지: 원본 .menu_li 사진을 크롤러가 signature.images 에 담아 보낸다.
    // 부족하면 갤러리(배너) → 객실 이미지 순으로 채운다.
    var self = this;
    var section = this.getSection();
    var pool = this.getSelectedImages((section.signature && section.signature.images) || []);
    if (pool.length < 3) {
      pool = pool.concat(this.getSelectedImages((section.gallery && section.gallery.images) || []));
    }
    if (pool.length < 3) {
      this.getRoomtypes().forEach(function (rt) {
        pool = pool.concat(self.getRoomtypeImages(rt, 'roomtype_interior'));
      });
    }

    document.querySelectorAll('[data-index-menu-images]').forEach(function (ul) {
      ul.querySelectorAll('li').forEach(function (li, i) {
        var el = li.querySelector('.img img');
        if (!el) return;
        var image = pool[i];
        if (image && image.url) {
          el.src = image.url;
          el.alt = self.cleanText(image.description) || '';
        } else {
          ImageHelpers.applyPlaceholder(el, '바로가기 이미지');
        }
      });
    });
  };

  // MAPPER: pages.index.sections[0].closing -> 페이지 맨 아래 와이드 배너 (closing 전용)
  IndexMapper.prototype.mapWideBanner = function () {
    var closing = this.getSection().closing || {};
    var images = this.getSelectedImages(closing.images || []);

    var title = this.firstText(closing.title, 'Healing & Repose');
    var desc = this.firstText(
      closing.description,
      '여유로움과 편안함이 있는 곳, ' + this.getPropertyName()
    );

    var bgEl = document.querySelector('[data-index-wide-bg]');
    if (bgEl) {
      if (images.length) {
        bgEl.classList.remove('empty-image-placeholder');
        bgEl.style.backgroundImage = 'url(' + images[0].url + ')';
        bgEl.style.backgroundPosition = 'center 60%';
        bgEl.style.backgroundSize = 'cover';
      } else {
        ImageHelpers.applyBackgroundPlaceholder(bgEl, '마무리 배너');
      }
    }

    setAllText('[data-index-wide-title]', title);
    setAllHtml('[data-index-wide-description]', desc ? this.nl2br(desc) : '');
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (window.previewHandler) return;
    var mapper = new IndexMapper();
    mapper.initialize();
    global.indexMapperInstance = mapper;
  });

  global.IndexMapper = IndexMapper;
})(window);
