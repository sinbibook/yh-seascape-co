(function (global) {
  'use strict';

  var YBS_BASE_URL = 'https://www.yapen.co.kr/external?ypIdx=';

  // 상담하기 — 뒤에 property.tripPropertyId 가 붙는다
  var CONSULT_BASE_URL = 'https://www.bookingplay.co.kr/api/cti_eicn/kakao_happy_talk?tid=';

  // 파트너 타입 — 원천은 백오피스 DB `public.contract_info.partner_type` 이고
  // BFF 가 코드 문자열을 그대로 내려준다. **분기는 템플릿이 한다**(PC/모바일은 템플릿만 안다).
  //
  //   distributor_a  총판A     PC 상담하기 / 모바일 상담하기 + 예약하기
  //   distributor_b  총판B     PC 없음     / 모바일 예약하기
  //   sales_agency   판매대행  PC 없음     / 모바일 예약하기
  //
  // ⚠️ 예약하기는 **파트너 타입과 무관**하다 — 세 타입 모두 모바일에서만 뜬다.
  //    그건 기존 `.ft_btn_reserve.for_m` 의 미디어쿼리가 이미 하고 있어 손대지 않는다.
  //    타입으로 갈리는 것은 상담하기 하나뿐이다.
  var CONSULT_PARTNER_TYPES = ['distributor_a'];

  // ⚠️ base-mapper 에 `cleanText` 가 없는 템플릿이 있어 의존하지 않는다.
  function consultText(v) {
    return v === undefined || v === null ? '' : String(v).trim();
  }



  // 백오피스가 전달한 실시간 달력 링크가 http(s) URL일 때만 푸터에 노출한다.
  function mapFooterCalendar(data) {
    var homepageFields = data && data.homepage && data.homepage.customFields;
    var fields = homepageFields || (data && data.customFields) || {};
    var raw = fields.footer && fields.footer.calendarUrl;
    var value = typeof raw === 'string' ? raw.trim() : '';
    var valid = false;
    if (/^https?:\/\//i.test(value)) {
      try {
        var parsed = new URL(value);
        valid = (parsed.protocol === 'http:' || parsed.protocol === 'https:') && !!parsed.hostname;
      } catch (error) {
        valid = false;
      }
    }
    document.querySelectorAll('[data-calendar-wrap]').forEach(function (el) {
      el.style.display = valid ? '' : 'none';
    });
    document.querySelectorAll('[data-calendar-link]').forEach(function (el) {
      if (valid) el.setAttribute('href', value);
      else el.removeAttribute('href');
    });
  }

  function HeaderFooterMapper() {
    BaseDataMapper.call(this);
  }
  HeaderFooterMapper.prototype = Object.create(BaseDataMapper.prototype);
  HeaderFooterMapper.prototype.constructor = HeaderFooterMapper;

  HeaderFooterMapper.prototype.mapPage = function () {
    this.mapPropertyNames();
    this.mapFavicon();
    this.mapBookingLinks();
    this.mapYbs();
    this.mapConsult();
    this.mapSocialLinks();
    this.mapRoomMenu();
    this.mapSpecialMenu();
    this.mapPageToggles();
    this.mapFooter();
    mapFooterCalendar(this.data);
    // SEO: homepage.seo → title + description/keywords + 네이버/구글 사이트 인증 (전 페이지 공통)
    this.updateMetaTags();
  };

  // 페이지 enabled 여부 (sections[0].enabled === false 이면 비활성)
  HeaderFooterMapper.prototype.isPageEnabled = function (pageKey) {
    var page = this.getPages()[pageKey];
    var section = page && page.sections && page.sections[0];
    return !(section && section.enabled === false);
  };

  // MAPPER: homepage.images[0].logo / property name → header logo
  HeaderFooterMapper.prototype.mapPropertyNames = function () {
    var nameEn = this.getPropertyNameEn();
    var name = this.getPropertyName();
    var logoUrl = this.getLogo();

    document.querySelectorAll('[data-property-name-en]').forEach(function (el) {
      // 로고 슬롯 텍스트는 아래에서 값·표시 여부를 함께 정한다
      if (el.classList.contains('logo_text')) return;
      el.textContent = nameEn;
    });
    document.querySelectorAll('[data-property-name]').forEach(function (el) {
      if (el.classList.contains('logo_sub')) return;
      el.textContent = name;
    });
    document.querySelectorAll('[data-logo-image]').forEach(function (img) {
      var text = img.parentNode && img.parentNode.querySelector('.logo_text');
      var sub = img.parentNode && img.parentNode.querySelector('.logo_sub');
      // K·J·PET 템플릿과 같은 규약: 영문(.logo_text) 위 + 한글(.logo_sub) 아래.
      // 영문이 없으면 한글이 .logo_text 로 올라가고, 부제는 영문과 같거나 비면 숨긴다.
      var showText = function (visible) {
        if (text) text.style.display = visible ? '' : 'none';
        if (sub) {
          var dup = !name || name === (nameEn || '');
          sub.style.display = visible && !dup ? '' : 'none';
        }
      };
      if (logoUrl) {
        img.src = logoUrl;
        img.alt = name || nameEn || 'logo';
        img.style.display = '';
        showText(false);
      } else if (name || nameEn) {
        // 템플릿에는 고정 로고 파일을 두지 않는다.
        // 로고 이미지가 없으면 img 를 숨기고 영문 + 한글 숙소명을 함께 보여 준다.
        img.style.display = 'none';
        img.removeAttribute('src');
        if (text) text.textContent = nameEn || name;
        if (sub) sub.textContent = name;
        showText(true);
      } else {
        // 로고도 숙소명도 없는 경우(데이터 미입력)에는 영역이 사라지지 않도록
        // 매핑 위치 안내용 placeholder 를 세운다.
        ImageHelpers.applyPlaceholder(img, '로고');
        img.style.display = '';
        showText(false);
      }
    });
  };

  // MAPPER: favicon ← homepage.images[0].logo[isSelected].url
  // 로고 이미지는 헤더에 쓰지 않고 파비콘 용도로만 사용한다.
  HeaderFooterMapper.prototype.mapFavicon = function () {
    var logoUrl = this.getLogo();
    if (!logoUrl) return;
    var link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = logoUrl;
  };

  // MAPPER: property.realtimeBookingId → [data-booking-link] (href 직접 주입)
  HeaderFooterMapper.prototype.mapBookingLinks = function () {
    var bookingUrl = this.getBookingUrl();
    document.querySelectorAll('[data-booking-link]').forEach(function (el) {
      if (bookingUrl && bookingUrl !== '#!') {
        el.href = bookingUrl;
        el.setAttribute('target', '_blank');
      }
    });
  };

  // MAPPER: property.ybsId → [data-ybs-button] (없으면 숨김)
  HeaderFooterMapper.prototype.mapYbs = function () {
    var ybsId = this.getProperty().ybsId;
    document.querySelectorAll('[data-ybs-button]').forEach(function (el) {
      var host = el.closest('[data-ybs-wrap]') || el.closest('.privacy') || el;
      if (!ybsId) {
        host.style.display = 'none';
        return;
      }
      host.style.display = '';
      var target = el.tagName === 'A' ? el : el.querySelector('a');
      if (target) {
        target.href = YBS_BASE_URL + ybsId;
        target.setAttribute('target', '_blank');
      }
    });
  };

  // 상담 URL 에 쓸 tripPropertyId. 없거나 형식이 아니면 빈 문자열.
  HeaderFooterMapper.prototype.getConsultId = function () {
    var raw = consultText(this.getProperty().tripPropertyId);
    // ⚠️ URL 쿼리에 그대로 붙는 값이라 토큰 형태만 통과시킨다. 플레이스홀더
    //    문자열(`숙소 ID` 같은 한글·공백)이 들어와도 링크가 깨지지 않는다.
    return /^[A-Za-z0-9_-]+$/.test(raw) ? raw : '';
  };

  // 상담하기 노출 대상인가 — 파트너 타입 + tripPropertyId 둘 다 있어야 한다.
  HeaderFooterMapper.prototype.isConsultVisible = function () {
    var partnerType = consultText(this.getProperty().partnerType);
    return Boolean(this.getConsultId()) && CONSULT_PARTNER_TYPES.indexOf(partnerType) !== -1;
  };

  // MAPPER: property.tripPropertyId + partnerType → [data-consult-button] (우측 하단 상담하기)
  //
  // 총판A 만 노출하고, `tripPropertyId` 가 비면 타입과 무관하게 숨긴다.
  // 값이 없으면 `[data-consult-wrap]` 째 숨긴다 — 버튼만 숨기면 빈 박스가 남는다.
  HeaderFooterMapper.prototype.mapConsult = function () {
    var tripPropertyId = this.getConsultId();
    var visible = this.isConsultVisible();

    // 상담하기가 빠지면 예약하기 아래가 비어 버린다.
    // CSS 가 위치를 되돌릴 수 있도록 상태를 루트에 찍는다.
    document.documentElement.setAttribute('data-consult', visible ? 'on' : 'off');

    document.querySelectorAll('[data-consult-button]').forEach(function (el) {
      var host = el.closest('[data-consult-wrap]') || el;
      if (!visible) {
        host.style.display = 'none';
        return;
      }
      host.style.display = '';
      var target = el.tagName === 'A' ? el : el.querySelector('a');
      if (target) {
        target.href = CONSULT_BASE_URL + tripPropertyId;
        target.setAttribute('target', '_blank');
      }
    });
  };

  // 소셜 링크 플랫폼 — [data-homepage-socialLinks-{platform}] 와 1:1.
  // 헤더 네이버 버튼은 blog 칸을 쓴다(어드민에서 네이버 플레이스 주소를 blog 에 입력).
  var SOCIAL_PLATFORMS = ['facebook', 'instagram', 'blog', 'youtube'];

  // MAPPER: homepage.socialLinks.{platform} → [data-homepage-socialLinks-{platform}] (href, 없으면 숨김)
  //
  // 마크업 기본 상태가 숨김이라(깜빡임 방지) 값이 있을 때만 노출한다. 값이 null·빈 문자열·공백·키 없음이면 숨긴다.
  // 링크를 감싼 래퍼([data-social-wrap] — 헤더 .hd_right 의 .hd_sns_btn, aside 의 .aside_sns)는
  // 보이는 링크가 하나도 없으면 래퍼째 숨겨 빈 칸·여백이 남지 않게 한다.
  // 마크업이 없는 플랫폼(facebook / youtube)은 매칭 요소가 0개라 아무 일도 하지 않는다.
  // 버튼이 하나라도 보이면 루트에 data-social="on" 을 찍는다 — 1024~1100px 메뉴 여백 보정 CSS 의 기준
  // (:has 대신 — 일부 브라우저에서 스타일 미반영).
  HeaderFooterMapper.prototype.mapSocialLinks = function () {
    var socialLinks = this.getHomepage().socialLinks || {};
    var anyOn = false;
    SOCIAL_PLATFORMS.forEach(function (platform) {
      var url = consultText(socialLinks[platform]);
      document.querySelectorAll('[data-homepage-socialLinks-' + platform + ']').forEach(function (el) {
        if (!url) {
          el.style.display = 'none';
          el.setAttribute('href', '#!');
          el.removeAttribute('target');
          el.removeAttribute('rel');
          return;
        }
        el.setAttribute('href', url);
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener');
        el.style.display = '';
        anyOn = true;
      });
    });
    document.querySelectorAll('[data-social-wrap]').forEach(function (wrap) {
      var shown = Array.prototype.some.call(wrap.querySelectorAll('a'), function (a) {
        return a.style.display !== 'none';
      });
      wrap.style.display = shown ? '' : 'none';
    });
    document.documentElement.setAttribute('data-social', anyOn ? 'on' : 'off');
  };

  // MAPPER: roomtypes[].name → [data-rooms-submenu] (미리보기 li 뒤에 동적 생성, PC + 모바일 aside)
  HeaderFooterMapper.prototype.mapRoomMenu = function () {
    var self = this;
    var roomItems = this.getRoomMenuItems();
    document.querySelectorAll('[data-rooms-submenu]').forEach(function (container) {
      // 이전 생성분 제거 (preview 재렌더 대비)
      container.querySelectorAll('[data-generated="room"]').forEach(function (li) {
        li.remove();
      });
      roomItems.forEach(function (item) {
        var name = self.getRoomMenuLabel(item);
        // 그래도 이름이 없으면 빈 메뉴 항목(여백)이 되므로 건너뜀
        if (!String(name).trim()) return;
        var li = document.createElement('li');
        li.setAttribute('data-generated', 'room');
        var a = document.createElement('a');
        a.href = self.getRoomMenuLink(item);
        a.textContent = name;
        li.appendChild(a);
        container.appendChild(li);
      });
    });
  };

  // MAPPER: property.facilities[].name → [data-special-submenu] (컨테이너 비우고 동적 생성)
  HeaderFooterMapper.prototype.mapSpecialMenu = function () {
    var facilities = this.getProperty().facilities || [];
    document.querySelectorAll('[data-special-submenu]').forEach(function (container) {
      container.innerHTML = '';
      facilities.forEach(function (f) {
        if (!f.name || !f.name.trim()) return;
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = './facility.html?id=' + f.id;
        a.textContent = f.name;
        li.appendChild(a);
        container.appendChild(li);
      });
    });
  };

  // MAPPER: pages.layoutMap / nearbyAttractions enabled → 메뉴 표시/숨김
  //
  // 미리보기가 꺼지면 "미리보기" li 를 숨기고, 대메뉴 ROOMS([data-rooms-link])는
  // 첫 번째 객실 상세로 보낸다 — 그대로 두면 layout-map.html 이 404 로 튕긴다.
  // 판정은 layout-map.html 의 404 기준과 같은 isLayoutMapEnabled() 를 쓴다.
  HeaderFooterMapper.prototype.mapPageToggles = function () {
    var layoutMapEnabled = this.isLayoutMapEnabled();
    document.querySelectorAll('[data-menu-id="layout-map"]').forEach(function (el) {
      var li = el.closest('li') || el;
      li.style.display = layoutMapEnabled ? '' : 'none';
    });

    var roomsLink = this.getRoomsEntryLink();
    if (roomsLink) {
      document.querySelectorAll('[data-rooms-link]').forEach(function (el) {
        el.setAttribute('href', roomsLink);
      });
    }

    var nearbyEnabled = this.isPageEnabled('nearbyAttractions');
    document.querySelectorAll('[data-travel-menu]').forEach(function (el) {
      el.style.display = nearbyEnabled ? '' : 'none';
    });
  };

  // 전화번호 링크(<a data-footer-phone-link>)를 번호 개수만큼 복제해 " | " 로 구분 노출.
  // 모바일 aside 의 .aside_ico03 처럼 <span data-footer-phone> 이 없는 링크는 href 만 갱신한다.
  HeaderFooterMapper.prototype.renderFooterPhones = function (phones) {
    if (!phones.length) return;
    var tel0 = 'tel:' + String(phones[0]).replace(/[^0-9+]/g, '');

    document.querySelectorAll('[data-footer-phone-link]').forEach(function (link) {
      // 번호 텍스트 슬롯이 없는 링크(아이콘 버튼 등)는 첫 번째 번호로 href 만 연결
      if (!link.querySelector('[data-footer-phone]')) {
        link.setAttribute('href', tel0);
        return;
      }

      var parent = link.parentNode;
      if (!parent) return;

      // 멱등: 이전 렌더로 만든 복제 링크/구분자를 정리하고 원본 링크 하나만 남긴다
      parent.querySelectorAll('[data-footer-phone-link]').forEach(function (el, i) {
        if (i > 0) parent.removeChild(el);
      });
      parent.querySelectorAll('[data-footer-phone-sep]').forEach(function (el) {
        parent.removeChild(el);
      });

      phones.forEach(function (phone, idx) {
        var el = idx === 0 ? link : link.cloneNode(true);
        var span = el.querySelector('[data-footer-phone]');
        if (span) span.textContent = phone;
        el.setAttribute('href', 'tel:' + String(phone).replace(/[^0-9+]/g, ''));

        if (idx > 0) {
          var sep = document.createElement('span');
          sep.setAttribute('data-footer-phone-sep', '');
          sep.textContent = ' | ';
          parent.appendChild(sep);
          parent.appendChild(el);
        }
      });
    });
  };

  // MAPPER: property.contactPhone / property.businessInfo → footer 라인별 텍스트
  // 전화번호 소스는 businessInfo.businessPhone(사업자 번호)이 아니라
  // property.contactPhone(노출용 번호 배열)이다.
  // MAPPER: property.tripProviderName → [data-copyright]
  // 공급사명이 있으면 data-copyright 의 템플릿 문자열에서 {provider} 를 치환한다.
  // 값이 없으면(백오피스 미입력 → "") HTML 의 기존 트립일레븐 문구를 그대로 둔다.
  HeaderFooterMapper.prototype.mapCopyright = function () {
    var provider = String(this.getProperty().tripProviderName || '').trim();
    if (!provider) return;
    document.querySelectorAll('[data-copyright]').forEach(function (el) {
      var tpl = el.getAttribute('data-copyright') || '';
      el.textContent = tpl.replace(/\{provider\}/g, provider);
    });
  };

  // MAPPER: customFields.footer.ruralStayMark → [data-footer-rural-stay-mark] (푸터 맨 위, 전화번호 위)
  // 농어촌민박사업자 이미지가 있을 때만 노출하고, 없으면 숨겨 기존 푸터와 같다.
  // 프리뷰는 같은 페이지에서 다시 매핑하므로 매번 표시 상태를 되돌린다.
  HeaderFooterMapper.prototype.mapFooterRuralStayMark = function () {
    var footer = this.getCustomFields().footer || {};
    var footerMarks = footer;
    var marks = Array.isArray(footerMarks.ruralStayMarks)
      ? footerMarks.ruralStayMarks.slice(0, 2)
      : [footerMarks.ruralStayMark];
    var markUrl = marks.some(function (mark) { return mark && mark.url; });

    document.querySelectorAll('[data-footer-rural-stay-mark-wrap]').forEach(function (wrap) {
      wrap.style.display = markUrl ? '' : 'none';
    });
    document.querySelectorAll('[data-footer-rural-stay-mark-wrap]').forEach(function (wrap) {
      var images = wrap.querySelectorAll('[data-footer-rural-stay-mark]');
      var count = marks.filter(function (mark) { return mark && mark.url; }).length;
      images.forEach(function (img, index) {
        var mark = marks[index];
        var url = mark && mark.url ? String(mark.url) : '';
        img.style.display = url ? 'inline-block' : 'none';
        img.style.maxWidth = count > 1 ? 'calc((100% - 12px) / 2)' : '';
        img.style.marginLeft = index && url && marks[0] && marks[0].url ? '12px' : '';
        if (!url) {
          img.removeAttribute('src');
          return;
        }
        img.src = url;
        img.alt = (mark.description && String(mark.description).trim()) || '농어촌민박사업자';
      });
    });
  };

  HeaderFooterMapper.prototype.mapFooter = function () {
    this.mapCopyright();
    this.mapFooterRuralStayMark();
    var prop = this.getProperty();
    var biz = prop.businessInfo || {};
    var phones = this.toPhoneList(prop.contactPhone);

    var fields = {
      '[data-footer-address]': biz.businessAddress,
      '[data-footer-business-name]': biz.businessName,
      '[data-footer-representative]': biz.representativeName,
      '[data-footer-business-number]': biz.businessNumber
    };
    Object.keys(fields).forEach(function (selector) {
      var value = fields[selector];
      if (value === undefined || value === null || value === '') return;
      document.querySelectorAll(selector).forEach(function (el) {
        el.textContent = value;
      });
    });

    this.renderFooterPhones(phones);
  };

  document.addEventListener('headerFooterLoaded', function () {
    var mapper = new HeaderFooterMapper();
    mapper.initialize();
    global.headerFooterMapperInstance = mapper;
  });

  global.HeaderFooterMapper = HeaderFooterMapper;
})(window);
