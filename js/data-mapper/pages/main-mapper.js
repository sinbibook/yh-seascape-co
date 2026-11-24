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

  function fillSlide(slide, img) {
    slide.style.backgroundImage = 'url(' + img.url + ')';
    slide.style.backgroundPosition = 'center';
    slide.style.backgroundSize = 'cover';
  }

  // 슬라이드 렌더 공통 (이미지 없으면 placeholder 한 장)
  function renderSlides(selector, images, label) {
    var wrapper = document.querySelector(selector);
    if (!wrapper) return;
    wrapper.innerHTML = '';

    if (!images.length) {
      var empty = document.createElement('div');
      empty.className = 'swiper-slide';
      ImageHelpers.applyBackgroundPlaceholder(empty, label);
      wrapper.appendChild(empty);
      return;
    }

    images.forEach(function (img) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';
      fillSlide(slide, img);
      wrapper.appendChild(slide);
    });
  }

  function MainMapper() {
    BaseDataMapper.call(this);
  }
  MainMapper.prototype = Object.create(BaseDataMapper.prototype);
  MainMapper.prototype.constructor = MainMapper;

  MainMapper.prototype.mapPage = function () {
    this.mapPropertyNames();
    this.mapEyebrow();
    this.mapHero();
    this.mapGallery();
    this.mapAboutBlocks();

    if (typeof window.initMainSwipers === 'function') window.initMainSwipers();
  };

  // eyebrow 는 원본이 'Welcome to Pension' 고정이지만, 다른 페이지(부대시설·예약안내·주변여행지)가
  // 숙소 영문명을 쓰므로 사이트 안에서 문구를 통일한다.
  MainMapper.prototype.mapEyebrow = function () {
    var name = this.getPropertyNameEn() || this.getPropertyName() || '';
    setAllText('[data-main-eyebrow]', name ? 'Welcome to ' + name : 'Welcome to Pension');
  };

  // main 페이지 섹션 (customFields.pages.main.sections[0])
  MainMapper.prototype.getSection = function () {
    var page = this.getPages().main;
    return (page && page.sections && page.sections[0]) || {};
  };

  MainMapper.prototype.mapPropertyNames = function () {
    setAllText('[data-property-name-en]', this.getPropertyNameEn());
    // 히어로 세로 eyebrow 는 원본이 대문자다 (strong 은 원표기라 슬롯을 나눈다)
    setAllText('[data-property-name-en-caps]', (this.getPropertyNameEn() || '').toUpperCase());
    setAllText('[data-property-name]', this.getPropertyName());
    this.applyPropertyCaptions();
  };

  // 갤러리 이미지 pool: about[] → hero → property.images[0].exterior (URL 중복 제거)
  MainMapper.prototype.getGalleryPool = function () {
    var self = this;
    var section = this.getSection();
    var pool = [];

    function push(list) {
      self.getSelectedImages(list || []).forEach(function (img) {
        if (!img || !img.url) return;
        var dup = pool.some(function (p) {
          return p.url === img.url;
        });
        if (!dup) pool.push(img);
      });
    }

    (Array.isArray(section.about) ? section.about : []).forEach(function (block) {
      // category:'img_box' 는 우측·하단 작은 사진 몫이다. 슬라이더에는 넣지 않는다.
      push(self.excludeImgBox((block && block.images) || []));
    });
    push(section.hero && section.hero.images);

    var propImages = this.getProperty().images || [];
    push((propImages[0] && propImages[0].exterior) || []);

    return pool;
  };

  // MAPPER: pages.main.sections[0].hero → 서브 히어로 설명 / 슬라이더 + 본문 타이틀
  // 히어로 strong 은 매핑하지 않는다. 숙소 영문명([data-property-name-en]) 고정이다.
  MainMapper.prototype.mapHero = function () {
    var hero = this.getSection().hero || {};

    // 본문 title_box 의 h3 로 hero.title 을 내린다. 비면 "Hello, {영문명}".
    var nameEn = this.cleanText(this.getPropertyNameEn());
    var aboutTitle = this.firstText(hero.title, nameEn ? 'Hello, ' + nameEn : 'About');
    setAllText('[data-main-about-title]', aboutTitle);

    var desc = this.getSubHeroDescription(hero);
    setAllHtml('[data-main-hero-description]', desc ? this.nl2br(desc) : '');

    var images = this.getSelectedImages(hero.images || []);
    if (!images.length) images = this.getGalleryPool();
    renderSlides('[data-main-hero-slides]', images, '펜션소개 히어로');
  };

  // MAPPER: 갤러리 슬라이더 + 하단 2분할 이미지 + 숙소 소개 문구
  // 슬라이더 이미지는 pool, 문구는 property.description (about[] 본문과 중복되지 않게 분리)
  MainMapper.prototype.mapGallery = function () {
    var pool = this.getGalleryPool();

    var desc = this.getPropertyDescription();
    setAllHtml('[data-main-gallery-description]', desc ? this.nl2br(desc) : '');

    renderSlides('[data-main-gallery-slides]', pool, '펜션 전경');

    // .img_box 는 img01 / img02 2장 고정 레이아웃.
    // 크롤러가 원본 .img_box 2장에 category:'img_box' 마커를 달아 about[0].images 끝에 담는다.
    // pool 은 URL 중복을 지우므로 여기서 뽑으면 슬라이더와 겹치는 컷이 사라진다 → 원본 배열에서 읽는다.
    // 마커가 없는 기존 데이터는 예전처럼 pool 뒤쪽에서 뽑는다.
    var about0 = (this.getSection().about || [])[0];
    var marked = this.getSelectedImages(this.pickImgBox((about0 && about0.images) || []));
    var boxImages =
      marked.length >= 2 ? marked.slice(0, 2) : pool.length > 3 ? pool.slice(-2) : pool.slice(0, 2);

    document.querySelectorAll('[data-main-img-box]').forEach(function (box) {
      ['img01', 'img02'].forEach(function (cls, i) {
        var el = box.querySelector('.' + cls);
        if (!el) return;
        if (boxImages[i] && boxImages[i].url) {
          el.src = boxImages[i].url;
          el.alt = '';
          el.classList.remove('empty-image-placeholder');
        } else {
          ImageHelpers.applyPlaceholder(el, '펜션 전경 ' + (i + 1));
        }
      });
    });
  };

  // MAPPER: pages.main.sections[0].about[] → .sub_txt_box 블록 반복
  // 블록이 여러 개면 순서대로 모두 노출한다. 이미지가 없는 블록은 다른 블록 이미지를 빌려오지 않는다.
  MainMapper.prototype.mapAboutBlocks = function () {
    var self = this;
    var blocks = this.getSection().about;
    blocks = Array.isArray(blocks) ? blocks : [];
    var nameEn = this.cleanText(this.getPropertyNameEn());

    document.querySelectorAll('[data-main-about-blocks]').forEach(function (container) {
      container.innerHTML = '';

      blocks.forEach(function (block, i) {
        // 짝수 번째 블록은 좌우를 뒤집어 지그재그로 배치한다.
        var isReverse = i % 2 === 1;

        var wrap = document.createElement('div');
        wrap.className = 'sub_txt_box inner' + (isReverse ? ' is-reverse' : '');

        var txt = document.createElement('div');
        txt.className = 'txt';

        // 원본은 'Landscape' 하드코딩 자리다. 펜션소개 페이지이므로 About 계열로 채운다.
        var titleFallback = i === 0 ? (nameEn ? nameEn.toUpperCase() + '\nABOUT INFO' : 'ABOUT INFO') : '';
        var title = self.firstText(block.title, titleFallback);

        var strong = document.createElement('strong');
        strong.innerHTML = self.nl2br(title);
        if (!title) strong.style.display = 'none';

        var p = document.createElement('p');
        var desc = self.cleanText(block.description);
        p.innerHTML = desc ? self.nl2br(desc) : '';
        if (!desc) p.style.display = 'none';

        txt.appendChild(strong);
        txt.appendChild(p);

        var imgWrap = document.createElement('div');
        imgWrap.className = 'img';
        var img = document.createElement('img');
        var url = self.getFirstSelectedImage(block.images || []);
        if (url) {
          img.src = url;
          img.alt = '';
        } else {
          ImageHelpers.applyPlaceholder(img, '소개 이미지');
        }
        imgWrap.appendChild(img);

        // .txt / .img 는 inline-block 이라 DOM 순서가 그대로 좌우 순서가 된다
        if (isReverse) {
          wrap.appendChild(imgWrap);
          wrap.appendChild(txt);
        } else {
          wrap.appendChild(txt);
          wrap.appendChild(imgWrap);
        }
        container.appendChild(wrap);
      });
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (window.previewHandler) return;
    var mapper = new MainMapper();
    mapper.initialize();
    global.mainMapperInstance = mapper;
  });

  global.MainMapper = MainMapper;
})(window);
