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

  function RoomMapper() {
    BaseDataMapper.call(this);
  }
  RoomMapper.prototype = Object.create(BaseDataMapper.prototype);
  RoomMapper.prototype.constructor = RoomMapper;

  RoomMapper.prototype.mapPage = function () {
    var rt = this.getCurrentRoomtype();

    this.mapPropertyNames();
    this.mapName(rt);
    this.mapHero(rt);
    this.mapGallery(rt);
    this.mapTable(rt);
    this.mapWideImage(rt);
    this.mapFloorplan(rt);

    this.renderRoomNav('[data-room-list-nav]', rt && rt.id);
    this.renderRoomSlides('[data-room-list-slides]');
    this.mapPreviewEyebrow();

    if (typeof window.initRoomSwipers === 'function') window.initRoomSwipers();
  };

  // ?room_id= 가 우선. 백오피스 preview 의 ?id= 도 함께 지원한다.
  // 없거나 못 찾으면 첫 번째 객실을 보여준다.
  RoomMapper.prototype.getCurrentRoomtype = function () {
    var roomtypes = this.getRoomtypes();
    if (!roomtypes.length) return null;

    var params = new URLSearchParams(window.location.search);
    var id = params.get('room_id') || params.get('id');
    if (id) {
      for (var i = 0; i < roomtypes.length; i++) {
        if (String(roomtypes[i].id) === String(id)) return roomtypes[i];
      }
    }
    return roomtypes[0];
  };

  // customFields.pages.room 은 객실별 배열이다. 해당 id 의 sections[0] 을 찾는다.
  RoomMapper.prototype.getRoomSection = function (id) {
    var pages = this.getPages().room;
    if (!Array.isArray(pages) || !id) return {};
    for (var i = 0; i < pages.length; i++) {
      if (String(pages[i].id) === String(id)) {
        return (pages[i].sections && pages[i].sections[0]) || {};
      }
    }
    return {};
  };

  RoomMapper.prototype.mapPropertyNames = function () {
    setAllText('[data-property-name-en]', this.getPropertyNameEn());
    // 히어로 세로 eyebrow 는 원본이 대문자다 (strong 은 원표기라 슬롯을 나눈다)
    setAllText('[data-property-name-en-caps]', (this.getPropertyNameEn() || '').toUpperCase());
    setAllText('[data-property-name]', this.getPropertyName());
    this.applyPropertyCaptions();
  };

  // MAPPER: roomtypes[current].name → rooms[j].name
  RoomMapper.prototype.mapName = function (rt) {
    setAllText('[data-room-name]', this.getRoomtypeName(rt));
  };

  // MAPPER: 서브 히어로. 백오피스 객실 내부이미지(roomtype_interior)를 노출 + 순서대로 쓴다.
  //
  // 원본 히어로는 객실 사진 전체를 순서대로 돌리므로 내부이미지와 같은 구성이다.
  // pages.room[].hero.images 는 크롤 당시 원본 컷이라 직원이 사진을 바꾸거나 순서를
  // 바꿔도 따라오지 않는다 (2026-11-24 달뜨는바다) — 내부이미지가 없을 때만 쓴다.
  // 그것도 없으면 대표 이미지(thumbnail) + exterior 로 채운다.
  RoomMapper.prototype.mapHero = function (rt) {
    var section = this.getRoomSection(rt && rt.id);
    var hero = section.hero || {};

    var desc = this.getSubHeroDescription(hero);
    setAllHtml('[data-room-hero-description]', desc ? this.nl2br(desc) : '');

    var images = rt ? this.getRoomtypeImages(rt, 'roomtype_interior') : [];
    if (!images.length) images = this.getSelectedImages(hero.images || []);
    if (!images.length && rt) {
      images = this.getRoomtypeImages(rt, 'roomtype_thumbnail').concat(
        this.getRoomtypeImages(rt, 'roomtype_exterior')
      );
    }
    renderSlides('[data-room-hero-slides]', images, '객실 히어로');
  };

  // MAPPER: roomtypes[current].roomtype_interior → 본문 슬라이더 + 하단 2분할 이미지
  RoomMapper.prototype.mapGallery = function (rt) {
    var section = this.getRoomSection(rt && rt.id);
    var gallery = section.gallery || {};

    // 슬라이더는 백오피스 객실 내부이미지(roomtype_interior)를 노출 + 순서대로 쓴다.
    // pages.room[].gallery.images 는 크롤 당시 원본 컷이라 직원이 객실 사진을
    // 바꾸거나 순서를 바꿔도 따라오지 않는다 (2026-11-24 달뜨는바다 "첨부 순서 미연동").
    // 그래서 내부이미지가 하나도 없을 때만 gallery.images 로 폴백한다.
    // (히어로 mapHero 도 같은 이유로 내부이미지가 우선이다.)
    // category:'img_box' 는 우측·하단 작은 사진 몫이라 슬라이더에서 뺀다.
    var rawGallery = gallery.images || [];
    var images = rt ? this.getRoomtypeImages(rt, 'roomtype_interior') : [];
    if (!images.length) images = this.getSelectedImages(this.excludeImgBox(rawGallery));
    if (!images.length && rt) images = this.getRoomtypeImages(rt, 'roomtype_thumbnail');

    // rooms[].description 은 "독채형+복층형, 거실1+... / 욕실용품,남녀공용,TV,..." 같은
    // 스펙 나열이라 이 감성 문구 자리에 맞지 않는다. 폴백으로 쓰지 않는다.
    // 크롤링 문구가 백오피스로 들어오면 gallery.description 이 1순위로 잡힌다.
    var desc = this.firstText(
      gallery.description,
      '당신만을 위한 특별한 휴식 공간\n' + this.getPropertyName() + '입니다.'
    );
    setAllHtml('[data-room-gallery-description]', desc ? this.nl2br(desc) : '');

    renderSlides('[data-room-gallery-slides]', images, '객실 이미지');

    // 원본 .img_box 2장은 크롤러가 category:'img_box' 마커로 담는다.
    // 마커가 없는 기존 데이터는 예전처럼 갤러리 뒤에서 2장을 뽑는다.
    var marked = this.getSelectedImages(this.pickImgBox(rawGallery));
    var boxImages =
      marked.length >= 2
        ? marked.slice(0, 2)
        : images.length > 3
        ? images.slice(-2)
        : images.slice(0, 2);
    document.querySelectorAll('[data-room-img-box]').forEach(function (box) {
      ['img01', 'img02'].forEach(function (cls, i) {
        var el = box.querySelector('.' + cls);
        if (!el) return;
        if (boxImages[i] && boxImages[i].url) {
          el.src = boxImages[i].url;
          el.alt = '';
          el.classList.remove('empty-image-placeholder');
        } else {
          ImageHelpers.applyPlaceholder(el, '객실 이미지 ' + (i + 1));
        }
      });
    });
  };

  // MAPPER: rooms[j] → 객실 정보 테이블
  // 표 '유형' 칸은 원본처럼 구조까지 함께 넣는다 (예: "독채/ 침대룸 화장실 거실 온돌룸 주방").
  // 표 아래 .table_text 에는 집기품목만 노출한다.
  RoomMapper.prototype.mapTable = function (rt) {
    var room = rt ? this.findRoomById(rt.id) : null;

    setAllText('[data-room-base-occupancy]', room && room.baseOccupancy ? room.baseOccupancy : '-');
    setAllText('[data-room-max-occupancy]', room && room.maxOccupancy ? room.maxOccupancy : '-');
    setAllText('[data-room-structure]', this.formatRoomStructure(room) || '-');
    setAllText('[data-room-size-pyeong]', (room && this.toPyeong(room.size)) || '-');

    var amenities = (room && room.amenities) || [];
    var text = amenities
      .filter(function (a) {
        return a && String(a).trim();
      })
      .join(', ');
    setAllText('[data-room-amenities]', text);
    document.querySelectorAll('[data-room-amenities-wrap]').forEach(function (el) {
      el.style.display = text ? '' : 'none';
    });
  };

  // MAPPER: 객실 평면도. 크롤러가 평면도 영역에서 찾은 이미지만 노출한다.
  // 일반 객실 사진(interior/thumbnail/exterior)을 평면도로 대체하지 않는다.
  // 평면도가 없으면 제목까지 포함해 영역 전체를 숨긴다.
  // MAPPER: roomtypes[current] roomtype_exterior[0] → [data-room-wide-image]
  // 원본 객실상세의 평면도 "앞"에 오는 와이드 객실 사진이다. 없으면 영역째 숨긴다.
  RoomMapper.prototype.mapWideImage = function (roomtype) {
    var section = document.querySelector('[data-room-wide-section]');
    if (!section) return;
    var images = roomtype ? this.getRoomtypeImages(roomtype, 'roomtype_exterior') : [];
    var image = images[0];
    if (!image || !image.url) {
      section.style.display = 'none';
      return;
    }
    section.style.display = '';
    var self = this;
    section.querySelectorAll('[data-room-wide-image]').forEach(function (el) {
      el.src = image.url;
      el.alt = self.cleanText(image.description) || '객실 이미지';
    });
  };

  RoomMapper.prototype.mapFloorplan = function (rt) {
    var image = rt ? this.getRoomFloorplanImage(rt) : null;
    var url = image && image.url;

    document.querySelectorAll('[data-room-floorplan-image]').forEach(function (el) {
      if (url) {
        el.src = url;
        el.alt = '객실평면도';
      }
    });
    document.querySelectorAll('[data-room-floorplan-section]').forEach(function (el) {
      el.style.display = url ? '' : 'none';
    });
  };

  RoomMapper.prototype.mapPreviewEyebrow = function () {
    var nameEn = this.cleanText(this.getPropertyNameEn());
    setAllText('[data-room-preview-eyebrow]', nameEn ? 'Welcome, ' + nameEn : 'Welcome');
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (window.previewHandler) return;
    var mapper = new RoomMapper();
    mapper.initialize();
    global.roomMapperInstance = mapper;
  });

  global.RoomMapper = RoomMapper;
})(window);
