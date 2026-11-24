(function (global) {
  'use strict';

  function setAllText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
  }

  function NearbyAttractionsMapper() {
    BaseDataMapper.call(this);
  }
  NearbyAttractionsMapper.prototype = Object.create(BaseDataMapper.prototype);
  NearbyAttractionsMapper.prototype.constructor = NearbyAttractionsMapper;

  NearbyAttractionsMapper.prototype.mapPage = function () {
    // sections[0].enabled === false 면 헤더 TRAVEL 메뉴도 숨겨진다.
    // 직접 URL 로 들어온 경우를 위해 404 로 보낸다.
    if (this.isDisabled()) {
      window.location.replace('./404.html');
      return;
    }

    this.mapPropertyNames();
    this.mapEyebrow();
    this.mapHero();
    this.mapList();

    if (typeof window.initNearbySwipers === 'function') window.initNearbySwipers();
  };

  NearbyAttractionsMapper.prototype.getSection = function () {
    var page = this.getPages().nearbyAttractions;
    return (page && page.sections && page.sections[0]) || {};
  };

  NearbyAttractionsMapper.prototype.isDisabled = function () {
    return this.getSection().enabled === false;
  };

  NearbyAttractionsMapper.prototype.mapPropertyNames = function () {
    setAllText('[data-property-name-en]', this.getPropertyNameEn());
    // 히어로 세로 eyebrow 는 원본이 대문자다 (strong 은 원표기라 슬롯을 나눈다)
    setAllText('[data-property-name-en-caps]', (this.getPropertyNameEn() || '').toUpperCase());
    setAllText('[data-property-name]', this.getPropertyName());
    this.applyPropertyCaptions();
  };

  NearbyAttractionsMapper.prototype.mapEyebrow = function () {
    var name = this.getPropertyNameEn() || this.getPropertyName() || '';
    setAllText('[data-nearby-eyebrow]', 'Welcome to ' + name);
  };

  // MAPPER: nearbyAttractions.hero.images[isSelected] → 히어로 슬라이더
  NearbyAttractionsMapper.prototype.mapHero = function () {
    var hero = this.getSection().hero || {};
    var images = this.getSelectedImages(hero.images || []);

    var wrapper = document.querySelector('[data-nearby-hero-slides]');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    if (!images.length) {
      var empty = document.createElement('div');
      empty.className = 'swiper-slide';
      ImageHelpers.applyBackgroundPlaceholder(empty, '주변여행지 히어로');
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

  // MAPPER: nearbyAttractions.about[] → .travel_li li 반복
  // li > .title_box2(h4 + p) + .box(.img + .txt(strong + p))
  NearbyAttractionsMapper.prototype.mapList = function () {
    var self = this;
    var blocks = this.getSection().about;
    blocks = Array.isArray(blocks) ? blocks : [];
    var caption = (this.getPropertyNameEn() || this.getPropertyName() || '') + ' , Travel Info';

    document.querySelectorAll('[data-nearby-list]').forEach(function (ul) {
      ul.innerHTML = '';

      // 데이터가 없으면 빈 박스만 남아 페이지가 비어 보인다.
      // 매핑 위치를 알 수 있도록 placeholder 한 벌을 만든다.
      if (!blocks.length) {
        var li = document.createElement('li');
        var head = document.createElement('div');
        head.className = 'title_box2';
        var h4 = document.createElement('h4');
        h4.textContent = 'Travel';
        var cap = document.createElement('p');
        cap.textContent = caption;
        head.appendChild(h4);
        head.appendChild(cap);

        var box = document.createElement('div');
        box.className = 'box';
        var img = document.createElement('div');
        img.className = 'img';
        ImageHelpers.applyBackgroundPlaceholder(img, '주변여행지 이미지');
        box.appendChild(img);

        li.appendChild(head);
        li.appendChild(box);
        ul.appendChild(li);
        return;
      }

      blocks.forEach(function (block) {
        var li = document.createElement('li');

        var head = document.createElement('div');
        head.className = 'title_box2';
        var h4 = document.createElement('h4');
        h4.textContent = 'Travel';
        var cap = document.createElement('p');
        cap.textContent = caption;
        head.appendChild(h4);
        head.appendChild(cap);

        var box = document.createElement('div');
        box.className = 'box';

        var img = document.createElement('div');
        img.className = 'img';
        var url = self.getFirstSelectedImage(block.images || []);
        self.setBackground(img, url, '주변여행지 이미지');

        var txt = document.createElement('div');
        txt.className = 'txt';

        var strong = document.createElement('strong');
        strong.textContent = self.cleanText(block.title);

        var p = document.createElement('p');
        var desc = self.cleanText(block.description);
        p.innerHTML = desc ? self.nl2br(desc) : '';

        // 원본은 설명 끝에 <em> 으로 거리/위치 정보를 붙인다.
        // (예: "펜션에서 약 3.9km, 차량 약 7분 거리")
        // 크롤러가 이미지 설명에 넣어주는 경우에만 노출한다.
        var images = self.getSelectedImages(block.images || []);
        var note = self.cleanText(images[0] && images[0].description);
        if (note) {
          var em = document.createElement('em');
          em.textContent = note;
          p.appendChild(em);
        }
        if (!desc && !note) p.style.display = 'none';

        txt.appendChild(strong);
        txt.appendChild(p);
        box.appendChild(img);
        box.appendChild(txt);
        li.appendChild(head);
        li.appendChild(box);
        ul.appendChild(li);
      });
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (window.previewHandler) return;
    var mapper = new NearbyAttractionsMapper();
    mapper.initialize();
    global.nearbyAttractionsMapperInstance = mapper;
  });

  global.NearbyAttractionsMapper = NearbyAttractionsMapper;
})(window);
