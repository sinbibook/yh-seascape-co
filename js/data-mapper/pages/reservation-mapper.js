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

  function ReservationMapper() {
    BaseDataMapper.call(this);
  }
  ReservationMapper.prototype = Object.create(BaseDataMapper.prototype);
  ReservationMapper.prototype.constructor = ReservationMapper;

  ReservationMapper.prototype.mapPage = function () {
    this.mapPropertyNames();
    this.mapEyebrow();
    this.mapHero();
    this.mapInfo();
    this.mapRefund();
    this.mapImages();

    if (typeof window.initReservationSwipers === 'function') window.initReservationSwipers();
  };

  ReservationMapper.prototype.getSection = function () {
    var page = this.getPages().reservation;
    return (page && page.sections && page.sections[0]) || {};
  };

  ReservationMapper.prototype.mapPropertyNames = function () {
    setAllText('[data-property-name-en]', this.getPropertyNameEn());
    // 히어로 세로 eyebrow 는 원본이 대문자다 (strong 은 원표기라 슬롯을 나눈다)
    setAllText('[data-property-name-en-caps]', (this.getPropertyNameEn() || '').toUpperCase());
    setAllText('[data-property-name]', this.getPropertyName());
    this.applyPropertyCaptions();
  };

  ReservationMapper.prototype.mapEyebrow = function () {
    var name = this.getPropertyNameEn() || this.getPropertyName() || '';
    setAllText('[data-reservation-eyebrow]', 'Welcome to ' + name);
  };

  // 이미지 pool: hero → about → property.images[0].exterior (URL 중복 제거)
  ReservationMapper.prototype.getImagePool = function () {
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

    push((section.hero || {}).images);
    push((section.about || {}).images);
    var propImages = this.getProperty().images || [];
    push((propImages[0] && propImages[0].exterior) || []);

    return pool;
  };

  // MAPPER: reservation.hero.images[isSelected] → 히어로 슬라이더
  ReservationMapper.prototype.mapHero = function () {
    var hero = this.getSection().hero || {};
    var images = this.getSelectedImages(hero.images || []);
    if (!images.length) images = this.getImagePool();

    var wrapper = document.querySelector('[data-reservation-hero-slides]');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    if (!images.length) {
      var empty = document.createElement('div');
      empty.className = 'swiper-slide';
      ImageHelpers.applyBackgroundPlaceholder(empty, '이용안내 히어로');
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

  // MAPPER: Basic info → reservation.about.description → property.usageGuide
  ReservationMapper.prototype.mapInfo = function () {
    var about = this.getSection().about || {};
    var text = this.firstText(
      about.description,
      this.getProperty().usageGuide,
      this.getProperty().reservationGuide
    );
    setAllHtml('[data-reservation-info]', text ? this.nl2br(text) : '');
  };

  // MAPPER: Refund info → property.refundPolicies[] + refundSettings.customerRefundNotice
  // 원본 문구 형식: "* 이용일 10일이전 취소시 전액 환불" / "* 이용일 당일 취소시 환불 불가"
  ReservationMapper.prototype.mapRefund = function () {
    var property = this.getProperty();
    var policies = property.refundPolicies || [];

    var lines = policies
      .slice()
      .sort(function (a, b) {
        return Number(b.refundProcessingDays) - Number(a.refundProcessingDays);
      })
      .map(function (p) {
        var days = Number(p.refundProcessingDays);
        var rate = Number(p.refundRate);
        if (days > 0) {
          return rate >= 100
            ? '* 이용일 ' + days + '일이전 취소시 전액 환불'
            : '* 이용일 ' + days + '일전 취소시 ' + rate + '% 환불';
        }
        return rate > 0
          ? '* 이용일 당일 취소시 ' + rate + '% 환불'
          : '* 이용일 당일 취소시 환불 불가';
      });

    var notice = this.cleanText((property.refundSettings || {}).customerRefundNotice);
    if (notice) lines.push('', notice);

    var text = lines.join('\n');
    setAllHtml('[data-reservation-refund]', text ? this.nl2br(text) : '');
  };

  // MAPPER: dd 좌측 이미지 2장
  // about.images 가 그 자리다 — [0] Basic info, [1] Refund Info (크롤러가 원본 순서대로 담는다).
  // 없으면 예전처럼 pool 앞/뒤에서 한 장씩 뽑는다. 히어로 1장뿐인 사이트는 두 칸이 같은 컷이 된다.
  ReservationMapper.prototype.mapImages = function () {
    var self = this;
    var pool = this.getImagePool();
    var about = this.getSection().about || {};
    var picked = this.getSelectedImages(about.images || []);

    var infoImg = picked[0] || pool[0];
    var refundImg =
      picked[1] || picked[0] || (pool.length > 1 ? pool[pool.length - 1] : pool[0]);

    [
      { sel: '[data-reservation-info-image]', img: infoImg, label: '이용안내 이미지' },
      { sel: '[data-reservation-refund-image]', img: refundImg, label: '환불안내 이미지' }
    ].forEach(function (row) {
      document.querySelectorAll(row.sel).forEach(function (el) {
        self.setBackground(el, row.img && row.img.url, row.label);
      });
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (window.previewHandler) return;
    var mapper = new ReservationMapper();
    mapper.initialize();
    global.reservationMapperInstance = mapper;
  });

  global.ReservationMapper = ReservationMapper;
})(window);
