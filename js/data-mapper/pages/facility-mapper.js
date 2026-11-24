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
      slide.style.backgroundImage = 'url(' + img.url + ')';
      slide.style.backgroundPosition = 'center';
      slide.style.backgroundSize = 'cover';
      wrapper.appendChild(slide);
    });
  }

  function FacilityMapper() {
    BaseDataMapper.call(this);
  }
  FacilityMapper.prototype = Object.create(BaseDataMapper.prototype);
  FacilityMapper.prototype.constructor = FacilityMapper;

  FacilityMapper.prototype.mapPage = function () {
    var facility = this.getCurrentFacility();

    this.mapPropertyNames();
    this.mapNames(facility);
    this.mapNav(facility);
    this.mapImages(facility);
    this.mapDescription(facility);
    this.mapListIntro();
    this.renderSpecialCards('[data-special-list]');

    if (typeof window.initFacilitySwipers === 'function') window.initFacilitySwipers();
  };

  // ?id= 가 없거나 못 찾으면 첫 번째 시설을 보여준다.
  FacilityMapper.prototype.getCurrentFacility = function () {
    var facilities = this.getProperty().facilities || [];
    if (!facilities.length) return null;

    var id = new URLSearchParams(window.location.search).get('id');
    if (id) {
      for (var i = 0; i < facilities.length; i++) {
        if (String(facilities[i].id) === String(id)) return facilities[i];
      }
    }
    return facilities[0];
  };

  FacilityMapper.prototype.mapPropertyNames = function () {
    setAllText('[data-property-name-en]', this.getPropertyNameEn());
    // 히어로 세로 eyebrow 는 원본이 대문자다 (strong 은 원표기라 슬롯을 나눈다)
    setAllText('[data-property-name-en-caps]', (this.getPropertyNameEn() || '').toUpperCase());
    setAllText('[data-property-name]', this.getPropertyName());
    this.applyPropertyCaptions();
  };

  // MAPPER: facilities[current] → 히어로 시설명 / 본문 타이틀 / .special_txt_box 제목
  FacilityMapper.prototype.mapNames = function (f) {
    var name = this.cleanText(f && f.name);
    var nameEn = this.cleanText(f && f.nameEn);

    // 히어로 strong 은 원본대로 한글 시설명이다 (다른 서브페이지는 숙소 영문명 고정)
    setAllText('[data-special-name]', name);

    // 본문 .title_box 의 h3 는 시설명 자리다. 영문명이 있으면 영문, 없으면 한글 시설명.
    setAllText('[data-special-name-en]', nameEn || name);
    // eyebrow 는 원본이 "Welcome to Camino Poolvilla" 로 숙소 '영문명'을 쓴다.
    setAllText('[data-special-eyebrow]', 'Welcome to ' + (this.getPropertyNameEn() || this.getPropertyName() || ''));

    // .special_txt_box strong 은 "영문명<span>한글명</span>" 구조다 (70px / 15px).
    // 폰트 크기가 크게 달라 첫 텍스트를 span 으로 감싸면 안 되므로 innerHTML 로 조립한다.
    // nameEn 이 없으면 큰 글씨 자리를 SPECIAL 로 채우고 아래에 한글 시설명을 둔다.
    var heading =
      (nameEn ? this.escapeHtml(nameEn) : 'SPECIAL') +
      '<span>' + this.escapeHtml(name) + '</span>';
    setAllHtml('[data-special-heading]', heading);
  };

  FacilityMapper.prototype.escapeHtml = function (value) {
    var div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
  };

  // MAPPER: property.facilities[] → 히어로 시설 탭 (현재 시설 .on)
  FacilityMapper.prototype.mapNav = function (current) {
    var self = this;
    var facilities = this.getProperty().facilities || [];

    document.querySelectorAll('[data-special-nav]').forEach(function (ul) {
      ul.innerHTML = '';
      facilities.forEach(function (f) {
        var name = self.cleanText(f.name);
        if (!name) return;
        var li = document.createElement('li');
        if (current && String(f.id) === String(current.id)) li.className = 'on';
        var a = document.createElement('a');
        a.href = './facility.html?id=' + f.id;
        a.textContent = name;
        li.appendChild(a);
        ul.appendChild(li);
      });
    });
  };

  // MAPPER: facilities[current].images[isSelected] → 히어로 / 본문 슬라이더
  // 원본은 두 슬라이더가 같은 이미지를 쓴다.
  FacilityMapper.prototype.mapImages = function (f) {
    var images = this.getSelectedImages((f && f.images) || []);
    renderSlides('[data-special-hero-slides]', images, '부대시설 이미지');
    renderSlides('[data-special-gallery-slides]', images, '부대시설 이미지');
  };

  // MAPPER: facilities[current].description → usageGuide
  // description 이 비어 있는 응답이 흔해 usageGuide 로 폴백한다.
  FacilityMapper.prototype.mapDescription = function (f) {
    // description(소개문)과 usageGuide(이용안내)를 한 줄 띄워 **둘 다** 보여준다.
    // 예전에는 폴백이라 description 이 있으면 usageGuide 가 통째로 묻혔다 —
    // 이용 요금·시간·제약이 화면에서 사라졌다. 둘 다 비면 슬롯을 숨긴다.
    // (t-template-H · I · J 와 같은 방식)
    var body = this.cleanText(f && f.description);
    var guide = this.cleanText(f && f.usageGuide);
    var desc = body + (body && guide ? '\n\n' : '') + guide;
    setAllHtml('[data-special-description]', desc ? this.nl2br(desc) : '');
    // 둘 다 비면 슬롯을 숨긴다 — 빈 줄만 남기 때문이다.
    document.querySelectorAll('[data-special-description]').forEach(function (el) {
      el.style.display = desc ? '' : 'none';
    });
  };

  // 하단 SPECIAL 목록 제목 (index 와 같은 규칙)
  FacilityMapper.prototype.mapListIntro = function () {
    var nameEn = this.cleanText(this.getPropertyNameEn());
    var title = nameEn ? this.escapeHtml(nameEn).toUpperCase() + '<br />SPECIAL INFO' : 'SPECIAL INFO';
    setAllHtml('[data-special-list-title]', title);
    setAllText('[data-special-list-description]', (this.getPropertyNameEn() || this.getPropertyName() || '') + ' 부대시설');
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (window.previewHandler) return;
    var mapper = new FacilityMapper();
    mapper.initialize();
    global.specialMapperInstance = mapper;
  });

  global.FacilityMapper = FacilityMapper;
})(window);
