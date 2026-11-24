# Data Mapping 정의서 — t-template-C2

`standard-template-data.json` 기준 HTML의 `data-*` 속성 매핑 정의.

원본 디자인: [camino.co.kr](https://camino.co.kr/index.html) (동일 계열: julietta.co.kr)

## 진행 현황

| 구분   | 파일                                                                                       | 상태               |
| ------ | ------------------------------------------------------------------------------------------ | ------------------ |
| 공통   | `common/header.html` + `header-footer-mapper.js`                                           | 완료               |
| 공통   | `common/footer.html`                                                                       | 완료               |
| 공통   | `styles/style.css` (camino 원본 이식, 서브페이지 스타일 포함)                              | 완료               |
| 공통   | `styles/popup.css` (A/B/D2 공통본)                                                         | 완료               |
| 페이지 | `index.html` + `index-mapper.js` + `pages/index.js`                                        | 완료               |
| 페이지 | `main.html` + `main-mapper.js` + `pages/main.js`                                           | 완료               |
| 페이지 | `layout-map.html` + `layout-map-mapper.js` + `pages/layout-map.js`                         | 완료               |
| 페이지 | `room.html` + `room-mapper.js` + `pages/room.js`                                           | 완료               |
| 페이지 | `facility.html` + `facility-mapper.js` + `pages/facility.js`                               | 완료               |
| 페이지 | `reservation.html` + `reservation-mapper.js` + `pages/reservation.js`                      | 완료               |
| 페이지 | `nearby-attractions.html` + `nearby-attractions-mapper.js` + `pages/nearby-attractions.js` | 완료               |
| 페이지 | `directions.html` + `directions-mapper.js` + `pages/directions.js`                         | 완료               |
| 페이지 | `404.html`                                                                                 | 공통본 그대로 사용 |

미작업 페이지는 HTML / mapper / `pages/*.js` 모두 t-template-B(collineps) 파일이 복사만 된 상태다. camino 구조로 재작성해야 한다.

---

## 작업 순서

1. `main.html` — 원본 `about.html` + `view.html`
2. `layout-map.html` — 원본 `room.html` 목록
3. `room.html` — 원본 `room.html?room_id=`
4. `facility.html` — 원본 `special1~4.html`
5. `reservation.html` — 원본 `reservation.html`
6. `directions.html` — 원본 `traffic.html`
7. `nearby-attractions.html` — 원본 `travel.html`

각 페이지 작업 단위는 아래 3개를 한 세트로 처리한다.

- HTML: camino 원본 마크업 + `data-*` 속성
- mapper: `js/data-mapper/pages/{page}-mapper.js`
- 스크립트: `js/pages/{page}.js` (Swiper 등 초기화, 원본 selector 기준)

페이지 하나가 끝날 때마다 이 문서의 해당 섹션을 채운다.

---

## 구현 원칙

- 파일명과 JS 구조는 우리 템플릿 구조를 따른다. 원본 `about.html`, `view.html`, `travel.html`, `traffic.html`, `special1~4.html` 파일명은 쓰지 않는다.
- 페이지 링크는 GitHub Pages 하위 경로 배포를 위해 상대경로(`./xxx.html`)만 쓴다.
- 이미지·아이콘 등 템플릿 고정 에셋은 `images/`에 둔다. 원본 사이트 도메인 직접 참조 금지.
- 로고 이미지는 고정 저장하지 않는다. `homepage.images[0].logo[isSelected]`를 동적으로 렌더하고, 없으면 숙소명 텍스트로 fallback 한다.
- 각 페이지 mapper는 `js/preview-handler.js`의 `mapperConfig`에 등록한다.
- 초기화 주체는 `preview-handler.js`다. 페이지 mapper의 `DOMContentLoaded` 초기화는 `if (window.previewHandler) return;`로 빠진다.
- 렌더 게이트는 각 HTML `<head>`의 `html.tpl-loading body{opacity:0}` + `window.__tplReveal`로 처리한다.
- 객실 목록의 단일 소스는 `homepage.customFields.roomtypes`다. `rooms[]`는 같은 `id`의 상세값 조회에만 쓴다.
- **index의 모든 영역을 매핑하지 않는다.** 원본의 장식용 하드코딩 텍스트는 그대로 둔다.
- 값이 비어 있으면(`''` 또는 공백 한 칸) `firstText()`가 `trim()` 후 판단해 다음 폴백으로 넘어간다.
- Swiper 초기화는 `TplSwiper.init()`을 거친다. 슬라이드가 `slidesPerView`보다 적으면 `loop`를 자동으로 끄고, `new Swiper()`가 실패해도 같은 페이지의 다른 슬라이더 초기화를 막지 않는다.

---

## 서브페이지 히어로 라벨

히어로 `strong` 은 **페이지별 고정 라벨**이다 (camino · julietta · 달뜨는바다 3곳 동일).
세로 eyebrow `span` 만 숙소 영문명이고, 원본은 **대문자**다 → `data-property-name-en-caps`.

| 원본 → 템플릿 | `strong` |
| --- | --- |
| `about.html` → (main 으로 병합) | `prologue` |
| `view.html` → `main.html` | 숙소 영문명 (`data-property-name-en`) |
| `room.html` 목록 → `layout-map.html` | `Room Preview` |
| `room.html?room_id=` → `room.html` | 객실명 (`data-room-name`) |
| `traffic.html` → `directions.html` | `Location` |
| `travel.html` → `nearby-attractions.html` | `Travel` |
| `reservation.html` | `RESERVATION` |
| `special*.html` → `facility.html` | 시설명 (`data-special-name`) |

히어로 `p` 는 전 페이지·전 사이트 같은 고정 문구다
(`This place provides the best time for those who are staying`) → `getSubHeroDescription()`.
`index.html` 히어로 문구만 숙소마다 달라 `hero.description` 을 쓴다.

---

## 원본 페이지 → 템플릿 파일명

| 원본 (camino)        | 템플릿                    |
| -------------------- | ------------------------- |
| `index.html`         | `index.html`              |
| `about.html`         | `main.html`               |
| `view.html`          | `main.html` 본문으로 병합 |
| `room.html` 목록     | `layout-map.html`         |
| `room.html?room_id=` | `room.html?room_id=`      |
| `special1~4.html`    | `facility.html?id=`       |
| `reservation.html`   | `reservation.html`        |
| `travel.html`        | `nearby-attractions.html` |
| `traffic.html`       | `directions.html`         |

---

## 레이아웃 규약

메인 히어로는 스크롤 시 아래 콘텐츠가 덮는 parallax 효과를 쓴다.

```css
#wrap {
  overflow-x: clip;
} /* 조상 overflow:hidden 은 sticky 를 무효화 */
.visual {
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 1;
}
#content {
  position: relative;
  z-index: 2;
  background: #fff;
}
.footer_wrap {
  position: relative;
  z-index: 3;
  background: #fff;
}
```

`fixed`가 아니라 `sticky`를 쓰는 이유: `fixed`는 뷰포트 기준이라 footer 아래 남는 화면 영역에 히어로가 그대로 비친다. `sticky`는 부모(`#container`) 범위를 벗어나면 따라오지 않는다.

---

## 테마 색상/폰트

소스는 `styles/theme.css`의 `:root` 변수다. 백오피스에서 `theme.color` / `theme.font`가 내려오면 이 변수만 덮어쓴다.

토큰 값은 **폰트/색상 하나씩만** 둔다. 폴백 체인을 토큰에 넣으면 백오피스 교체 시 값이 지저분해지기 때문이다. 세 폰트 모두 로드가 보장되어 있어 폴백 없이 안전하다.

| CSS 변수            | 값                | 용도                                                                                                     | 적용 |
| ------------------- | ----------------- | -------------------------------------------------------------------------------------------------------- | ---- |
| `--color-primary`   | `#f5f5f5`         | 배경 (`.main_room`, 섹션 구분선, 지도 로딩 배경)                                                         | 7곳  |
| `--color-secondary` | `#30353e`         | 포인트 (예약 버튼, 대제목, aside 배경, 표 상단선)                                                        | 13곳 |
| `--font-en-main`    | `Georgia`         | 영문 전용 — 대제목(`.title_box h3`, `.main_txt strong`) + eyebrow·버튼(`.title_box p`, `DETAIL VIEW` 등) | 17곳 |
| `--font-ko-main`    | `'SUITE-Regular'` | 한글이 들어가는 자리 — 히어로 제목/설명, 객실명, `예약하기`, special 시설명                              | 5곳  |
| `--font-ko-sub`     | `'Noto Sans KR'`  | 한글 본문 — `reset.css` `@font-face`                                                                     | 2곳  |

총 **44곳**이 5개 토큰으로 묶여 있다.

### 색상 원칙

프로젝트는 **모노톤**이다. 남은 하드코딩 색 12종(73건)은 전부 채도 0%이며, 예외인 `#6a747d`(채도 8%, 3건)는 미사용 클래스 `.sub_title` 계열에만 있다.

| 조합                          | 명암비  | 등급 |
| ----------------------------- | ------- | ---- |
| 포인트색 on 흰 배경           | 12.32:1 | AAA  |
| 포인트색 on `--color-primary` | 11.30:1 | AAA  |
| 흰 글자 on 포인트색           | 12.32:1 | AAA  |

`#fff`, `#333`, `#666`, `#ddd`, `#444` 같은 중립 UI 색상은 원본 고정값으로 남긴다. 브랜드가 바뀌어도 유지되는 값이라 토큰화하지 않는다.

B(collineps)에서 넘어온 주황 `#f89725`(표 상단선)는 `--color-secondary`로 교체했다. 이로써 유채색이 0이 되었다.

### 폰트 처리 메모

- 원본의 따옴표 오타(`'Georgia,'Times New Roman'…'`, 3곳)는 토큰으로 치환되며 함께 해소됐다.
- `Maven Pro`(7곳)는 제거하고 **자리별 내용에 따라 나눠 배정**했다. 영문만 담는 5곳(`.title_box p`, 히어로 세로 eyebrow, `DETAIL VIEW`, `.txt_transform`, `Reservation Information`)은 `--font-en-main`, 한글이 들어가는 2곳(히어로 설명, `예약하기`)은 `--font-ko-main`이다.

### 토큰 배정 기준

폰트는 **선택자가 아니라 그 자리에 실제로 들어가는 값**을 보고 정한다. 같은 `.title_box` 안에서도 `p`는 `Welcome, {영문명}`이라 `--font-en-main`, special 의 `h3`는 한글 시설명이라 `--font-ko-main`이다.

- `Dancing Script`(장식), `Arial`(헤더 메뉴)은 원본 고유 서체라 하드코딩으로 남긴다.
- `Noto Serif KR`(3곳), `Questrial`/`Comfortaa`/`Cinzel`(각 1곳)은 로드 경로가 없어 폴백으로 렌더된다. 뒤 셋은 미사용 클래스 소속이다.
- `Kaushan Script`는 `@import` 되어 있으나 사용처가 없다.

---

## common/header.html

| data-* 속성                         | 요소                 | JSON 경로                                                                      |
| ----------------------------------- | -------------------- | ------------------------------------------------------------------------------ |
| `data-logo-image`                   | 헤더 로고 `<img>`    | `homepage.images[0].logo[isSelected].url`                                      |
| `data-property-name`                | 로고 텍스트 fallback | `customFields.property.name → property.name`                                   |
| `data-rooms-submenu`                | ROOMS 하위 메뉴      | `homepage.customFields.roomtypes[]`                                            |
| `data-special-submenu`              | SPECIAL 하위 메뉴    | `property.facilities[]`                                                        |
| `data-ybs-button` / `data-ybs-wrap` | 야놀자 YBS 버튼      | `property.ybsId → https://www.yapen.co.kr/external?ypIdx={ybsId}`, 없으면 숨김 |
| `data-booking-link`                 | 예약 버튼 / 예약하기 | `property.realtimeBookingId`                                                   |
| `data-travel-menu`                  | TRAVEL 메뉴          | `nearbyAttractions.sections[0].enabled === false`면 숨김                       |
| `data-menu-id="layout-map"`         | ROOMS 미리보기 메뉴  | `layoutMap.sections[0].enabled === false`면 숨김                               |
| `data-rooms-link`                   | 대메뉴 ROOMS 링크    | `layoutMap.sections[0].enabled` — 켜짐 → `layout-map.html` / 꺼짐 → 첫 객실 상세 |
| `data-homepage-socialLinks-blog`      | 네이버 버튼 (헤더 / aside)    | `homepage.socialLinks.blog` → href, 값 없으면 숨김 (기본 숨김)      |
| `data-homepage-socialLinks-instagram` | 인스타그램 버튼 (헤더 / aside) | `homepage.socialLinks.instagram` → href, 값 없으면 숨김 (기본 숨김) |

### 소셜 링크 (네이버 · 인스타그램)

`HeaderFooterMapper.mapSocialLinks()` (`mapPage()` 에서 호출):

```
homepage.socialLinks = { facebook, instagram, blog, youtube }  (값 없으면 null)
[data-homepage-socialLinks-{platform}] 에 href(+target=_blank rel=noopener) 주입 + 노출
값이 null / 빈 문자열 / 공백 / 키 없음이면 숨김. 마크업 기본 상태가 숨김이라 매핑 전 깜빡임이 없다.
래퍼([data-social-wrap])는 보이는 링크가 하나도 없으면 래퍼째 숨긴다.
버튼이 하나라도 보이면 <html data-social="on">, 아니면 "off" — 레이아웃 보정 CSS 기준 (:has 미사용)
네이버 버튼은 어드민 blog 칸의 값(네이버 플레이스 주소)을 쓴다. facebook / youtube 는 마크업이 없다.
프리뷰 section_update(section: 'socialLinks') → homepage.socialLinks 로 반영 후 소셜 버튼만 다시 매핑
```

위치·크기:

- 480px 이상: 헤더 `.hd_right` 맨 앞 `.hd_sns_btn` (원본 camino 계열 CSS 에 남아 있던 SNS 자리) — 네이버 → 인스타그램, 아이콘 높이 24px, 버튼 사이 15px, YBS 와 15px.
- 479px 이하: 로고(120~200px)와 겹쳐 헤더 줄에서는 숨기고 aside `.aside_box` 맨 아래(TRAVEL 다음) `.aside_sns` 에 30px 로 둔다.
- 1024~1100px 이고 `data-social="on"` 이면 메뉴 `.depth1_a` 좌우 여백을 `.88em → .6em` 으로 줄인다 (긴 로고 + TRAVEL 일 때 메뉴 끝과 네이버가 겹치는 것 방지).

### 로고 영역 최소 높이

로고 이미지가 없으면 `img`를 숨기고 숙소명 텍스트만 남으므로 헤더가 눌린다. 두 경우의 헤더 높이를 같게 맞추기 위해 로고 영역에 최소 높이를 둔다.

```css
.header .logo {
  min-height: 40px;
}
.header .logo a {
  display: inline-flex;
  align-items: center;
  min-height: inherit;
}
```

반응형 구간(`1023px` 이하 30px, `640px` 이하 42px)은 `height`와 `min-height`를 함께 지정한다. `min-height`가 `height`를 이기기 때문에 한쪽만 두면 모바일에서 의도한 높이가 나오지 않는다.

### 폰트 로딩 경로

폰트 공급은 **`theme.css`의 `@import` 한 줄로 일원화**한다.

| 폰트                     | 공급                                |
| ------------------------ | ----------------------------------- |
| `Noto Sans KR` (6웨이트) | `theme.css` — Google Fonts CSS API  |
| `Dancing Script`         | `theme.css` — 같은 import           |
| `SUITE-Regular`          | `reset.css` `@font-face` — jsdelivr |

`reset.css`가 `fonts.gstatic.com/ea/notosanskr/v2/`를 직접 참조하던 `@font-face` 6벌은 제거했다. 그 경로는 현재 **404**이고 gstatic은 CORS 헤더를 주지 않아, 페이지마다 콘솔에 18건의 오류가 쌓였다. Google Fonts CSS API는 CORS를 허용하고 브라우저에 맞는 포맷을 협상해 준다.

`reset.css`에 있던 `@import` 6줄(`Maven Pro` 4중복, `Kaushan Script`, `Dancing Script`)도 제거했다. 앞의 둘은 사용처가 없고 마지막은 `theme.css`와 중복이었다.

### 대메뉴 하위 서브메뉴 너비

원본은 `.depth_box { min-width: 390px }` 고정이지만, C2는 하위 항목이 1~2개인 메뉴(TRAVEL 1개, ABOUT/RESERVE 2개)가 있어 그 폭이 과하게 넓어 보인다.

```css
.depth_box {
  width: max-content;
  min-width: 100%;
  max-width: 360px;
}
.depth_box li a {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

내용 너비에 맞추되 상위 메뉴보다 좁아지지 않게 하고, 객실명이 길면 `max-width`에서 멈추고 `…`로 자른다.

로고 처리:

로고는 3단계로 폴백한다.

| 조건                                       | 표시                                                |
| ------------------------------------------ | --------------------------------------------------- |
| `homepage.images[0].logo[isSelected]` 있음 | 로고 `img`                                          |
| 로고 없고 숙소명 있음                      | `.logo_text` 에 숙소명 (`property.name` → `nameEn`) |
| 둘 다 없음                                 | 매핑 위치 안내 placeholder                          |

템플릿에는 고정 로고 파일을 두지 않는다. 숙소별 로고가 없을 때 `images/common/logo.png` 같은 기본 이미지를 대신 보여주지 않는다.

`.header .logo`는 원래 이미지 전용이라 `color:#fff`와 `font-size:0`을 갖고 있다. 텍스트 폴백에 그 값이 상속되면 **흰 배경에 글꼴 크기 0인 흰 글자**가 되어 아무것도 보이지 않으므로, `.logo_text`에 별도 스타일을 준다.

```css
.header .logo .logo_text {
  font-size: 20px;
  color: var(--color-secondary);
  font-family: var(--font-ko-main);
  white-space: nowrap;
}
.header .logo a {
  min-width: 120px;
} /* 세 경우 모두 영역이 무너지지 않게 */
```

favicon도 같은 로고 URL을 쓴다.

---

## common/footer.html

| data-* 속성                         | 요소             | JSON 경로                                             |
| ----------------------------------- | ---------------- | ----------------------------------------------------- |
| `data-footer-phone`                 | 전화번호 텍스트  | `property.contactPhone[]` 또는 `property.phone[]`     |
| `data-footer-phone-link`            | 전화번호 링크    | 위와 동일                                             |
| `data-footer-address`               | 주소             | `property.businessInfo.businessAddress`               |
| `data-footer-representative`        | 대표자           | `property.businessInfo.representativeName`            |
| `data-footer-business-name`         | 업체명           | `property.businessInfo.businessName`                  |
| `data-footer-business-number`       | 사업자번호       | `property.businessInfo.businessNumber`                |
| `data-ybs-button` / `data-ybs-wrap` | 야놀자 YBS       | `property.ybsId`                                      |
| `data-booking-link`                 | 모바일 예약 버튼 | `property.realtimeBookingId`                          |
| `.copy`                             | 카피라이트       | `property.tripProviderName` → 없으면 정적 문구 |

원본 푸터의 개인정보처리방침 링크(`design.trip11.net`)는 제거했다.

---

## index.html

소스 섹션: `homepage.customFields.pages.index.sections[0]`

| data-* 속성                      | 요소                    | JSON 경로                              | 폴백                                  |
| -------------------------------- | ----------------------- | -------------------------------------- | ------------------------------------- |
| `data-index-hero-title`          | 히어로 제목             | `hero.title`                           | `property.nameEn`                     |
| `data-index-hero-description`    | 히어로 설명             | `hero.description`                     | `property.subtitle`                   |
| `data-index-hero-slides`         | 히어로 슬라이더         | `hero.images[isSelected]`              | placeholder                           |
| `data-index-room-eyebrow`        | Room eyebrow            | (생성) `Welcome, {nameEn}`             | `Welcome`                             |
| `data-index-room-title`          | Room Preview 제목       | `essence.title`                        | `Room's Preview`                      |
| `data-index-room-description`    | Room Preview 설명       | `essence.description`                  | 숨김                                  |
| `data-index-room-slides`         | 객실 카드               | `customFields.roomtypes[]`             | —                                     |
| `data-index-banner-slides`       | 중간 배너 슬라이더      | `gallery.images[isSelected]`           | placeholder                           |
| `data-index-special-title`       | SPECIAL 제목            | (생성) `{nameEn}<br>SPECIAL INFO`      | `SPECIAL INFO`                        |
| `data-index-special-description` | SPECIAL 설명            | `facilities[0].name + " 부대시설"`     | `부대시설`                            |
| `data-index-special-list`        | SPECIAL 카드            | `property.facilities[]`                | —                                     |
| `data-index-menu-title`          | DIRECT MENU 제목        | (생성) `{nameEn}<br>DIRECT MENU`       | 숙소명 기반                           |
| `data-index-menu-description`    | DIRECT MENU 설명        | (생성) `{name} 바로가기메뉴`           | —                                     |
| `data-index-menu-images`         | DIRECT MENU 3칸 이미지  | `signature.images[isSelected]` 3장      | 갤러리 → `roomtype_interior`          |
| `data-index-wide-bg`             | 마무리 와이드 배너 배경 | `closing.images[isSelected][0]`        | placeholder                           |
| `data-index-wide-title`          | 마무리 배너 제목        | `closing.title`                        | `Healing & Repose`                    |
| `data-index-wide-description`    | 마무리 배너 설명        | `closing.description`                  | `여유로움과 편안함이 있는 곳, {name}` |
| `#popup-container`               | 팝업                    | `homepage.customFields.popup.popups[]` | —                                     |

### 섹션 배정 규칙

`pages.index.sections[0]`의 5개 블록 중 4개만 쓴다.

| 블록        | 배정                                                            |
| ----------- | --------------------------------------------------------------- |
| `hero`      | 상단 히어로 (제목 / 설명 / 슬라이더)                            |
| `essence`   | Room Preview 제목 / 설명                                        |
| `gallery`   | 중간 배너 슬라이더 이미지                                       |
| `closing`   | **페이지 맨 아래 와이드 배너 전용** (제목 / 설명 / 배경 이미지) |
| `signature` | **DIRECT MENU 3칸 이미지 전용** — 화면에 제목/설명 영역은 없다  |

`closing`을 좌/우 카피와 와이드 배너에 이중으로 쓰면 같은 문구가 두 곳에 나오므로, 와이드 배너 전용으로 고정한다.

### DIRECT MENU 3칸 이미지

원본 `.menu_li > li .img img` 는 객실·외경·부대시설에서 고른 **사이트별 실제 사진**이다
(camino `room/31744/11` · `view/1` · `view/3`). 크롤러가 이 3장을 `index.signature.images`
에 담고 템플릿이 순서대로 채운다. `signature` 는 이 템플릿에서 다른 용도가 없어 재사용한다.

### 매핑하지 않는 영역 (원본 하드코딩 유지)

- `.main_txt_l` 카피 — `with tasteful interiors / a wonderful day`
- `.main_txt_r` 카피 — `This place provides / the best time for those who are staying`
- `.main_menu` 3개 링크와 라벨 — 이용안내 / 펜션소개 / 오시는길 고정
  (원본 2번째 칸은 `외경보기 / Landscape` 지만, `view.html` 이 `main.html` 로 병합되므로 `펜션소개 / About` 으로 바꾼다)

### 카드 목록 열 수

`TplSwiper.initCardList(key, selector, extra, columns)` 가 공용으로 초기화한다.
데스크톱 열 수는 원본 기준으로 영역마다 다르다 — **ROOMS 3열 / SPECIAL 4열**
(camino·julietta 원본 측정: `.room_list` spv 3 고정, `.special_menu` spv 4 고정).
`columns` 기본값은 3 이고, SPECIAL 호출부만 4 를 넘긴다.
카드가 `columns` 이하면 슬라이드하지 않고 개수만큼 균등 배치한다.

### 객실 카드 구조

`BaseDataMapper.renderRoomSlides()`가 생성한다. index / layout-map / room 하단이 모두 같은 마크업을 쓴다.

초기화도 `TplSwiper.initCardList(key, selector, extra)` 하나를 공유한다. **객실 카드와 부대시설 카드가 같은 헬퍼를 쓴다.** 카드 개수에 따라 배치가 달라진다.

| 카드 수  | 배치              |
| -------- | ----------------- |
| 1개      | 100% 한 칸        |
| 2개      | 1/2씩             |
| 3개      | 1/3씩             |
| 4개      | 1/4씩 (기본 4열)  |
| 5개 이상 | 4열 루프 슬라이드 |

4개 이하는 `loop`를 끄고 개수만큼만 배치한다. 좁은 화면에서는 브레이크포인트(1 → 2 → 3 → n)를 따르되 카드 수를 넘지 않는다. `extra`로 페이지별 추가 옵션(예: special 의 autoplay)을 덧씌운다.

시설 카드 마크업은 `BaseDataMapper.renderSpecialCards()`가 생성한다. index 하단과 special 하단이 이를 공유한다.

```
roomtypes[i]
  .swiper-slide > .box
    a.link            → ./room.html?room_id={id}
    .img              → roomtypes[i] 대표 이미지 (background-image)
    .txt > strong     → roomtypes[i].name
    .txt > a.btn_more → ./room.html?room_id={id}, "DETAIL VIEW"
```

### SPECIAL 카드 구조

```
property.facilities[i]
  .swiper-slide > .box
    a.link        → ./facility.html?id={id}
    .img          → facility.images[isSelected][0]
    .txt > strong → facility.nameEn → name
    .txt > p      → facility.name
```

### 슬라이더 autoplay 규칙

원본 `custom.js`는 5개 슬라이더 중 **객실 카드만 autoplay 를 주석 처리**해 두었다. 객실은 사용자가 각 카드를 보고 고르는 영역이라 자동 전환이 방해가 되기 때문이다. 나머지는 훑어보는 성격이라 자동으로 돈다.

| 영역                                           | autoplay                             |
| ---------------------------------------------- | ------------------------------------ |
| 히어로 비주얼                                  | 4초                                  |
| 중간 배너                                      | 5초                                  |
| SPECIAL 카드 (index / special 공통)            | 4초                                  |
| 서브 갤러리 (main / room / special)            | 4초                                  |
| **객실 카드 (index / layout-map / room 하단)** | **없음 — 수동 드래그(`grabCursor`)** |

### Swiper (`js/pages/index.js`)

| 키             | selector                                                   |
| -------------- | ---------------------------------------------------------- |
| `indexVisual`  | `.main_visual .swiper-container` (autoplay 4s, prev/next)  |
| `indexRoom`    | `.main_room .swiper-container` (4열, 반응형)               |
| `indexBanner`  | `.main_sld_bnr .swiper-container` (autoplay 5s, prev/next) |
| `indexSpecial` | `.main_special .swiper-container` (4열, 반응형)            |

---

## main.html

메뉴명은 `펜션소개`(ABOUT)로 유지하고, 본문 구조는 원본 `view.html`(외부풍경)을 따른다.
원본의 `Landscape` 하드코딩 타이틀은 페이지 성격에 맞춰 `About` 계열로 바꾼다.

소스 섹션: `homepage.customFields.pages.main.sections[0]`

| data-* 속성                     | 요소                                                   | JSON 경로                                                                               | 폴백                        |
| ------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------- | --------------------------- |
| `data-property-name-en`         | 히어로 `strong` / 장식 카피 하단 (eyebrow 는 `-caps`) | `getPropertyNameEn()` = `customFields.property.propertyUnameEn` → … → `property.nameEn` | `property.name`             |
| `data-main-about-title`         | 본문 `.title_box > h3`                                 | `hero.title`                                                                            | `Hello, {영문명}`           |
| `data-main-hero-description`    | 히어로 `p`                                             | `hero.description`                                                                      | `property.subtitle`         |
| `data-main-hero-slides`         | `.sub_visual_wide` 슬라이더                            | `hero.images[isSelected]`                                                               | 갤러리 pool → placeholder   |
| `data-main-gallery-slides`      | `.sub_img_sld` 슬라이더                                | 갤러리 pool                                                                             | placeholder                 |
| `data-main-gallery-description` | `.sld_txt > p`                                         | `getPropertyDescription()` = `customFields.property.description` → `property.description` | `property.subtitle`         |
| `data-main-img-box`             | `.img_box`의 `.img01` / `.img02`                       | `about[0].images` 중 `description:'img_box'` **2장** (없으면 갤러리 pool 뒤에서 2장)       | placeholder                 |
| `data-main-about-blocks`        | `.sub_txt_box` 반복 컨테이너                           | `about[]` 전체                                                                          | 블록 없으면 미노출          |
| `data-booking-link`             | `.btn_reserve` 예약하기                                | `property.realtimeBookingId`                                                            | (header-footer-mapper 담당) |

### 갤러리 이미지 pool

`.sub_img_sld` 슬라이더와 `.img_box` 2분할 이미지가 공유하는 pool이다. URL 중복은 제거한다.

```
about[].images[isSelected] 평탄화
  → hero.images[isSelected]
  → property.images[0].exterior
```

히어로 슬라이더는 `hero.images`가 1순위이고, 비어 있을 때만 이 pool로 폴백한다.

### about[] 반복 블록

각 `about[i]`마다 `.sub_txt_box.inner` 하나를 순서대로 생성한다. 블록 수를 1개로 제한하지 않는다.

```
.sub_txt_box.inner
  .txt
    strong : about[i].title   → 첫 블록만 폴백 "{NAMEEN}\nABOUT INFO", 비면 숨김
    p      : about[i].description → 비면 숨김
  .img > img : about[i].images[isSelected][0] → 없으면 placeholder
```

이미지가 없는 블록에 다른 블록이나 외경 이미지를 빌려오지 않는다. 해당 블록만 placeholder로 둔다.

블록이 여러 개면 짝수 번째(`i % 2 === 1`)에 `.is-reverse`를 붙여 좌우를 뒤집는다. `.txt`/`.img`가 `inline-block`이라 mapper가 DOM 순서를 바꾸면 그대로 좌우가 바뀐다. CSS는 여백과 정렬만 대칭 처리한다.

| 구간        | 반전 블록                                              |
| ----------- | ------------------------------------------------------ |
| 기본        | 이미지 좌 · 텍스트 우, 본문 우측 정렬, 우측 여백 100px |
| 1023px 이하 | 여백 4%, 우측 정렬 유지                                |
| 860px 이하  | 좌우 여백 대칭(30px), 본문 좌측 정렬로 복귀            |

`.sub_txt_box.is-reverse`는 클래스 2개라 미디어쿼리의 `.sub_txt_box`보다 우선한다.

`.img_box` 이미지는 `about[0].images` 중 `description: 'img_box'` 마커가 달린 2장이다. 크롤러가 원본 `.img_box` 2장에 마커를 달아 배열 끝에 담는다.

마커를 쓰는 이유: 원본이 슬라이더와 `.img_box` 에 같은 컷을 쓰는 경우가 있어 URL 로는 구분할 수 없다. pool 은 URL 중복을 제거하므로 pool 에서 뽑으면 그 컷이 사라져 원본과 다른 사진이 나온다.

마커가 달린 이미지는 갤러리 pool(슬라이더)에서 제외한다. 마커가 없으면(규약 이전 데이터) 예전처럼 pool 뒤에서 2장을 뽑는다.

### 매핑하지 않는 영역 (원본 하드코딩 유지)

- ~~`.title_box > p` — `Welcome to Pension`~~ → 숙소 영문명으로 통일 (`Welcome to {영문명}`). 사이트 안에서 페이지마다 문구가 갈리지 않게 한다
- 히어로 `strong` — 숙소 영문명 고정. `hero.title`은 히어로가 아니라 본문 `h3`로 내린다.
- `.sld_txt > span` — `This place provides the best time for those who are staying`
- `.main_txt_l` 카피 — `with tasteful interiors / a wonderful day`
- `.sub_cate_wrap` 탭 — 펜션소개(`main.html`, `.on`) / 오시는길(`directions.html`)

원본 탭은 인사말 / 외부풍경 / 오시는길 3개지만, C2는 인사말과 외부풍경을 `main.html` 하나로 합치므로 2개다.

### Swiper (`js/pages/main.js`)

원본 `custom.js`는 Swiper 3 문법이라 Swiper 8 기준으로 옮겼다.

| 키            | selector                             | 옵션                               |
| ------------- | ------------------------------------ | ---------------------------------- |
| `mainVisual`  | `.sub_visual_wide .swiper-container` | loop, fade, autoplay 4s, 버튼 없음 |
| `mainGallery` | `.sub_img_sld .swiper-container`     | loop, autoplay 4s, prev/next       |

### CSS 템플릿 보정 (원본에 없던 규칙)

원본은 고정 문구를 전제로 짜여 있어, 길이가 임의인 백오피스 텍스트가 들어오면 레이아웃이 깨진다. 아래 3가지를 보정했고 각각 `styles/style.css`에 주석을 남겼다.

| 대상                      | 보정                                                                         | 이유                                                                                                                                                                                                                                                                                                               |
| ------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.sld_txt`                | `left:78%` + `right:0`, `word-break:keep-all`, `z-index:5`                   | 원본은 `right:0`만 있어 긴 문장이 왼쪽으로 늘어나 슬라이더(75%)를 침범한다. 시작점을 슬라이더 바깥에 고정한다. z-index 는 `.img_box`(1)/`.img01`(2)/`.img02`(3)보다 높여 예약 버튼이 가려지지 않게 한다 (`.img_box`가 `margin-top:-260px`로 올라오고, 화면이 좁을수록 `.sld_box` 높이 65vh가 줄어 겹침이 심해진다) |
| `.sub_txt_box.is-reverse` | 여백/정렬 대칭                                                               | 지그재그 배치용                                                                                                                                                                                                                                                                                                    |
| 1023px 이하 `.sld_txt`    | `display:block` + `position:static`, `.sub_img_sld`/`.sld_box` `height:auto` | 원본은 좁은 화면에서 `.sld_txt`를 통째로 숨겨 예약 동선이 사라진다. 슬라이더 아래로 흐르게 하고 버튼에 테두리를 준다 (`.img_box`는 원본대로 계속 숨김)                                                                                                                                                             |

---

## layout-map.html

`ROOMS`의 미리보기 페이지다. 원본 `room.html` 목록 화면을 따른다. 객실 목록과 배치도를 함께 보여준다.

소스 섹션: `homepage.customFields.pages.layoutMap.sections[0]`

| data-* 속성                        | 요소                                  | JSON 경로                             | 폴백                           |
| ---------------------------------- | ------------------------------------- | ------------------------------------- | ------------------------------ |
| `data-property-name-en`            | 히어로 `strong` (eyebrow 는 `-caps` 슬롯)  | `getPropertyNameEn()`                 | `property.name`                |
| `data-layout-map-hero-description` | 히어로 `p`                            | `hero.description`                    | `property.subtitle`            |
| `data-layout-map-hero-slides`      | 히어로 슬라이더                       | `hero.images[isSelected]`             | 객실 이미지 pool → placeholder |
| `data-layout-map-eyebrow`          | `.title_box > p`                      | (생성) `Welcome, {영문명}`            | `Welcome`                      |
| `data-room-list-nav`               | `.sub_cate_wrap ul`                   | `roomtypes[]` (미리보기 li 뒤에 생성) | —                              |
| `data-room-list-slides`            | `.room_list` 객실 카드                | `roomtypes[]` 공용 카드               | —                              |
| `data-layout-map-images`           | `.wide_img`                           | `about.images[isSelected]` 전체       | placeholder (영역은 항상 유지) |

### 객실 이미지 pool (히어로 폴백)

```
roomtypes[].roomtype_thumbnail → roomtype_exterior → roomtype_interior
```

URL 중복은 제거한다. `layoutMap.sections`가 빈 배열로 내려오는 응답이 흔해서 히어로 폴백이 반드시 필요하다.

### enabled 체크

`layoutMap.sections[0].enabled === false` 일 때만 `404.html` 로 보낸다. 섹션이 없으면(빈 배열) 위 폴백으로 페이지를 그린다.
헤더 `미리보기` li 도 같은 기준으로 숨긴다.

**대메뉴 `ROOMS`(`[data-rooms-link]`)는 이 값에 따라 이동처가 갈린다.** — `getRoomsEntryLink()`

| `layoutMap`                 | ROOMS 클릭 시                                     |
| --------------------------- | ------------------------------------------------- |
| 켜짐 (섹션 없음 포함)       | `layout-map.html`                                 |
| 꺼짐 (`enabled === false`)  | 첫 번째 객실 상세 (헤더 객실 메뉴 첫 항목과 같음) |

꺼진 상태에서 그대로 두면 `layout-map.html` 이 404 로 튕긴다. 판정은 이 페이지의 404 기준과 같은
`isLayoutMapEnabled()` 를 쓴다. `room.html` 의 객실 탭 첫 칸 `미리보기` 도 꺼져 있으면 숨긴다.
객실이 하나도 없으면 원래 href 를 둔다.

### 배치도

배치도는 도면이라 `background cover`로 자르지 않고 `<img>`로 원본 비율을 유지한다. 선택 이미지가 여러 장이면 `sortOrder` 순서대로 모두 노출한다.

**이미지가 없어도 영역을 숨기지 않는다.** layout-map은 배치도를 보여주는 것이 본 목적인 페이지이므로, 데이터가 없으면 placeholder로 자리를 유지한다. `room.html`의 평면도는 부가 정보라 없으면 영역째 숨기는 것과 반대다.

| 페이지            | 영역                    | 이미지 없을 때              |
| ----------------- | ----------------------- | --------------------------- |
| `layout-map.html` | 배치도 (페이지 본 목적) | **placeholder — 자리 유지** |
| `room.html`       | 평면도 (부가 정보)      | 영역째 숨김                 |

배치도/평면도 모두 **제목 없이 이미지만** 노출하며, 폭은 컨테이너에 맞춘다.

```css
.wide_img {
  text-align: center;
}
.wide_img img {
  width: 100%;
  max-width: 100%;
  height: auto;
}
```

원본에는 `.wide_img img` 규칙이 없어 이미지 원본 크기로 렌더된다. 백오피스 이미지는 크기가 제각각이고 placeholder SVG 는 800x600 고정이라, 폭을 잡아주지 않으면 왼쪽으로 치우쳐 보인다. 도면이므로 `cover` 로 자르지 않고 `height:auto` 로 비율을 유지한다. (원본 room 상세에는 `객실 평면도` 제목이 있으나 두 페이지 규칙을 맞추기 위해 뺐다)

### 매핑하지 않는 영역

- `.title_box > h3` — `Room's Preview`
- `.sub_cate_wrap` 첫 li — `미리보기` (현재 페이지이므로 `.on`)

### Swiper (`js/pages/layout-map.js`)

| 키                | selector                             | 옵션                    |
| ----------------- | ------------------------------------ | ----------------------- |
| `layoutMapVisual` | `.sub_visual_wide .swiper-container` | loop, fade, autoplay 4s |
| `layoutMapRoom`   | `.main_room .swiper-container`       | 4열 반응형              |

---

## room.html

`?room_id=`가 없으면 첫 번째 객실을 보여준다. 백오피스 preview의 `?id=`도 함께 지원한다.

객실별 커스텀 값은 `customFields.pages.room[]` 배열에서 같은 `id`의 `sections[0]`을 찾아 쓴다.

| data-* 속성                     | 요소                                                                           | JSON 경로                                                                    | 폴백                                               |
| ------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | -------------------------------------------------- |
| `data-room-name`                | 타이틀 / 표 / 소개 문구                                                        | `getRoomtypeName()` = `roomtypes[current].name` → `rooms[j].name`            | —                                                  |
| `data-room-hero-description`    | 히어로 `p`                                                                     | `room[id].hero.description`                                                  | `property.subtitle`                                |
| `data-room-hero-slides`         | 히어로 슬라이더                                                                | `roomtypes[current]` `roomtype_interior` (노출 + sortOrder, 백오피스 첨부 순서)        | `room[id].hero.images` → thumbnail + exterior |
| `data-room-gallery-slides`      | `.sub_img_sld` 슬라이더                                                        | `roomtypes[current]` `roomtype_interior` (노출 + sortOrder, 백오피스 첨부 순서)        | `room[id].gallery.images` → `roomtype_thumbnail`   |
| `data-room-gallery-description` | `.sld_txt > p`                                                                 | `room[id].gallery.description`                                               | `당신만을 위한 특별한 휴식 공간 / {숙소명}입니다.` |
| `data-room-img-box`             | `.img_box`의 `.img01` / `.img02`                                               | `gallery.images` 중 `description:'img_box'` **2장** (없으면 갤러리 뒤에서 2장)  | placeholder                                        |
| `data-room-base-occupancy`      | 표 기준 인원                                                                   | `rooms[j].baseOccupancy`                                                     | `-`                                                |
| `data-room-max-occupancy`       | 표 최대 인원                                                                   | `rooms[j].maxOccupancy`                                                      | `-`                                                |
| `data-room-structure`           | 표 유형                                                                        | `formatRoomStructure(rooms[j])` (예: `독채/ 침대룸 화장실 거실 온돌룸 주방`) | `-`                                                |
| `data-room-size-pyeong`         | 표 평형                                                                        | `toPyeong(rooms[j].size)`                                                    | `-`                                                |
| `data-room-amenities`           | 표 아래 집기품목                                                               | `rooms[j].amenities.join(', ')`                                              | 비면 `ul` 숨김                                     |
| `data-room-wide-section`        | 하단 와이드 객실 사진 영역                                                     | 이미지 없으면 미노출                                                         | —                                                  |
| `data-room-wide-image`          | 와이드 객실 사진                                                               | `roomtypes[current]` `roomtype_exterior[0]`                                  | —                                                  |
| `data-room-floorplan-section`   | 객실 평면도 영역 전체                                                          | 평면도 없으면 미노출                                                         | —                                                  |
| `data-room-floorplan-image`     | 평면도 `<img>`                                                                 | `getRoomFloorplanImage()`                                                    | —                                                  |
| `data-room-list-nav`            | `.sub_cate_wrap ul`                                                            | `roomtypes[]`, 현재 객실 `.on`                                               | —                                                  |
| `data-room-list-slides`         | 하단 Room Preview                                                              | `roomtypes[]` 공용 카드                                                      | —                                                  |
| `data-room-preview-eyebrow`     | 하단 `.title_box > p`                                                          | (생성) `Welcome, {영문명}`                                                   | `Welcome`                                          |
| `data-booking-link`             | `.btn_reserve` 3곳 (`.sld_txt` / `.table_box .btn_wrap` / `.sub_txt_box .txt`) | `property.realtimeBookingId`                                                 | (header-footer-mapper 담당)                        |

### .sub_txt_box 구조

원본은 `strong`(숙소 영문명 + 객실명) 바로 다음에 `btn_reserve`가 온다. 별도 본문 `<p>`가 없다.

```
.sub_txt_box.inner > .txt
  strong : {영문 숙소명} <span class="ff_noto_serif">{객실명}</span>
  a.btn_reserve : 예약하기
```

`rooms[].roomInfo` / `rooms[].description`을 여기에 넣지 않는다. 스펙 나열이라 이 자리에 맞지 않고, 원본에도 대응 영역이 없다.

### 객실 정보 표

표 `유형` 칸은 원본처럼 구조까지 함께 넣는다. 표 아래 `.table_text`에는 집기품목만 둔다.

`rooms[].description`은 `"독채형+복층형, 거실1+... / 욕실용품,남녀공용,TV,..."` 같은 스펙 나열이라 `.sld_txt`의 감성 문구 자리에 쓰지 않는다. 원본 문구를 숙소명만 치환해 폴백으로 두고, 크롤링 문구가 백오피스로 들어오면 `gallery.description`이 1순위로 잡힌다.

### 객실 평면도

원본 `room.html?room_id=`에도 하단 Room Preview 바로 위에 평면도 영역이 있다. 위치와 마크업(`.wide_img.inner > img`)을 따르되, 원본에 있던 `객실 평면도` 제목은 두지 않는다. layout-map의 배치도와 동일하게 **이미지만 노출**해 두 페이지의 규칙을 맞춘다.

평면도는 일반 이미지 URL만 보고 판단하지 않는다. 크롤러가 원본 객실 상세의 평면도 영역에서 이미지를 찾았을 때만 아래 형태로 저장해야 노출한다.

| 지원 데이터 형태                                               | 비고            |
| -------------------------------------------------------------- | --------------- |
| `roomtypes[current].floorplanImages[]`                         | 권장            |
| `roomtypes[current].floorplans[]`                              | 호환            |
| `roomtypes[current].floorplan.images[]`                        | 호환            |
| `roomtypes[current].images[].category = "roomtype_floorplan"`  | 카테고리형      |
| `category = "floorplan"` / `"room_floorplan"` / `"floor_plan"` | 카테고리형 호환 |

해당 데이터가 없으면 `data-room-floorplan-section`을 `display:none` 처리해 영역째 숨긴다. `roomtype_interior`, `roomtype_thumbnail`, `roomtype_exterior`를 평면도 폴백으로 쓰지 않는다.

### 매핑하지 않는 영역 (원본 하드코딩 유지)

- 상단 `.title_box > p` — `Room's Preview`
- `.sld_txt > span` — `This place provides the best time for those who are staying`
- `.main_txt_l` — `Room Preview`
- `.title_box2` — `Room Price` / `Reservation Information`
- 하단 `.title_box > h3` — `Room's Preview`

원본은 `.table_box`를 `for_pc` / `for_m` 두 벌로 두지만, 템플릿은 한 벌만 두고 반응형 CSS에 맡긴다.

### Swiper (`js/pages/room.js`)

| 키            | selector                             | 옵션                         |
| ------------- | ------------------------------------ | ---------------------------- |
| `roomVisual`  | `.sub_visual_wide .swiper-container` | loop, fade, autoplay 4s      |
| `roomGallery` | `.sub_img_sld .swiper-container`     | loop, autoplay 4s, prev/next |
| `roomList`    | `.main_room .swiper-container`       | 4열 반응형                   |

---

### 하단 와이드 사진 / 평면도

원본 객실상세는 `.wide_img` 가 **두 번** 나오고 용도가 다르다.

```
room_preview_box → wide_img(객실 사진) → title_box("객실 평면도") → wide_img(평면도)
```

크롤러가 바로 앞 `.title_box` 가 `객실 평면도` 인지로 구분해 담는다.

| 원본 | 카테고리 |
| --- | --- |
| 와이드 객실 사진 | `roomtype_exterior` |
| 평면도 | `roomtype_floorplan` |

평면도가 없는 사이트도 있다 (julietta · 달뜨는바다) → 그때는 평면도 영역만 숨긴다.
⚠️ `roomtype_floorplan` 은 DB `image_category` enum 에 아직 없다 (백엔드 추가 요청 중).

---

## facility.html

원본 `special1~4.html`을 `facility.html?id={facilityId}` 한 벌로 합친다. `?id=`가 없거나 못 찾으면 첫 번째 시설을 보여준다.

소스: `property.facilities[]` (`customFields.pages.facility`는 빈 배열로 오는 경우가 많아 쓰지 않는다)

| data-* 속성                     | 요소                                 | JSON 경로                                 | 폴백                                              |
| ------------------------------- | ------------------------------------ | ----------------------------------------- | ------------------------------------------------- |
| `data-property-name-en`         | 히어로 세로 eyebrow / 장식 카피 하단 | `getPropertyNameEn()`                     | `property.name`                                   |
| `data-special-name`             | 히어로 `strong`                      | `facilities[current].name`                | —                                                 |
| `data-special-nav`              | `.sub_cate_wrap ul`                  | `facilities[]`, 현재 시설 `.on`           | —                                                 |
| `data-special-hero-slides`      | 히어로 슬라이더                      | `facilities[current].images[isSelected]`  | placeholder                                       |
| `data-special-eyebrow`          | `.title_box > p`                     | (생성) `Welcome to {숙소 영문명}`         | 한글 숙소명                                       |
| `data-special-name-en`          | `.title_box > h3`                    | `facilities[current].nameEn`              | 한글 시설명                                       |
| `data-special-gallery-slides`   | `.sub_img_sld` 슬라이더              | 히어로와 같은 이미지                      | placeholder                                       |
| `data-special-heading`          | `.special_txt_box > strong`          | `{영문 시설명}<span>{한글 시설명}</span>` | 영문명 없으면 `SPECIAL<span>{한글 시설명}</span>` |
| `data-special-description`      | `.special_txt_box .txt_box`          | `facilities[current].description`         | `usageGuide`                                      |
| `data-special-list-title`       | 하단 목록 제목                       | (생성) `{NAMEEN}<br>SPECIAL INFO`         | `SPECIAL INFO`                                    |
| `data-special-list-description` | 하단 목록 설명                       | (생성) `{숙소 영문명} 부대시설`           | 한글 숙소명                                       |
| `data-special-list`             | 하단 SPECIAL 카드                    | `facilities[]` 공용 카드                  | —                                                 |

### 다른 서브페이지와 다른 점

- **히어로 `strong`이 시설명이다.** main / directions / layout-map / room 은 숙소 영문명 고정이지만, 원본 special 은 히어로에 한글 시설명을 넣는다.
- `.sub_img_sld` 안에 `.sld_txt`와 `.img_box`가 **없다**. 슬라이더와 좌우 버튼만 있고, 시설명·설명은 별도 `.special_txt_box`가 담당한다.
- 히어로와 본문 슬라이더가 **같은 이미지**를 쓴다.
- `.main_txt_l`의 `strong`은 원본에서 `&nbsp;`(빈 값)다.

### 영문명이 없을 때

`facilities[].nameEn`은 비어 오는 경우가 대부분이다. 같은 한글명이 여러 번 반복되지 않도록 이렇게 처리한다.

| 위치                                    | nameEn 있음     | nameEn 없음     |
| --------------------------------------- | --------------- | --------------- |
| 히어로 `strong`                         | 한글 시설명     | 한글 시설명     |
| `.title_box > h3`                       | 영문 시설명     | 한글 시설명     |
| `.special_txt_box > strong` (70px)      | 영문 시설명     | **`SPECIAL`**   |
| `.special_txt_box > strong span` (15px) | 한글 시설명     | 한글 시설명     |
| 하단 카드 `strong` / `p`                | 영문명 / 한글명 | 한글명 / (숨김) |

`.special_txt_box`의 큰 글씨 자리는 영문명이 없다고 비워두면 디자인이 무너지므로 `SPECIAL`로 채우고, 실제 시설명은 그 아래 작은 글씨로 둔다.

`.title_box > p`의 `Welcome to ...`와 하단 목록 문구는 원본이 **숙소 영문명**을 쓴다 (`Welcome to Camino Poolvilla`, `CAMINO POOLVILLA 부대시설`). 한글 숙소명은 영문명이 없을 때의 폴백이다.

`.special_txt_box > strong`은 `strong`과 `strong span`의 폰트 크기가 크게 달라(70px vs 15px), 첫 텍스트를 `span`으로 감싸면 안 된다. mapper가 `innerHTML`로 조립하되 값은 이스케이프한다.

### Swiper (`js/pages/facility.js`)

| 키               | selector                             | 옵션                         |
| ---------------- | ------------------------------------ | ---------------------------- |
| `specialVisual`  | `.sub_visual_wide .swiper-container` | loop, fade, autoplay 4s      |
| `specialGallery` | `.sub_img_sld .swiper-container`     | loop, autoplay 4s, prev/next |
| `specialList`    | `.special_menu .swiper-container`    | 공용 카드 규격 + autoplay 4s |

---

## reservation.html

원본 `reservation.html` 구조를 따른다. 히어로 `strong`은 `RESERVATION` 하드코딩이고, 본문 `.title_box`에는 `h3` 없이 `p`만 있다.

소스 섹션: `homepage.customFields.pages.reservation.sections[0]`

| data-* 속성                     | 요소                         | JSON 경로                         | 폴백                                       |
| ------------------------------- | ---------------------------- | --------------------------------- | ------------------------------------------ |
| `data-reservation-hero-slides`  | 히어로 슬라이더              | `hero.images[isSelected]`         | 이미지 pool → placeholder                  |
| `data-reservation-eyebrow`      | `.title_box > p`             | (생성) `Welcome to {숙소 영문명}` | 한글 숙소명                                |
| `data-reservation-info`         | `Basic info` 의 `dd > .txt`  | `about.description`               | `property.usageGuide` → `reservationGuide` |
| `data-reservation-refund`       | `Refund Info` 의 `dd > .txt` | `property.refundPolicies[]` 조립  | + `refundSettings.customerRefundNotice`    |
| `data-reservation-info-image`   | `Basic info` 의 `dd > .img`  | `about.images[0]`                 | 이미지 pool `[0]` → placeholder            |
| `data-reservation-refund-image` | `Refund Info` 의 `dd > .img` | `about.images[1]`                 | 이미지 pool 마지막 → placeholder           |
| `data-booking-link`             | 히어로 탭 `예약하기`         | `property.realtimeBookingId`      | (header-footer-mapper 담당)                |

### dl 을 두 벌로 나눈다

원본은 `<dl class="inner">`를 **두 개** 두고, CSS의 `dl + dl { margin-top:130px }`가 두 안내 블록 사이 여백을 만든다. 한 `dl` 안에 `dt/dd`를 두 쌍 넣으면 이 규칙이 발동하지 않아 `Basic info`와 `Refund Info`가 붙어버린다.

```
dl.inner > dt.title_box2(Basic info) + dd
dl.inner > dt.title_box2(Refund Info) + dd
```

여백은 반응형으로 130px → 100px(1450px 이하) → 50px(좁은 화면)로 줄어든다.

### 환불 규정 문구 조립

`refundPolicies[]`를 `refundProcessingDays` 내림차순으로 정렬해 원본 문구 형식으로 만든다.

```
days > 0, rate >= 100  →  * 이용일 {days}일이전 취소시 전액 환불
days > 0, rate <  100  →  * 이용일 {days}일전 취소시 {rate}% 환불
days = 0, rate >  0    →  * 이용일 당일 취소시 {rate}% 환불
days = 0, rate =  0    →  * 이용일 당일 취소시 환불 불가
```

`refundSettings.customerRefundNotice`가 있으면 빈 줄 뒤에 덧붙인다.

### 이미지 pool

```
hero.images → about.images → property.images[0].exterior
```

URL 중복은 제거한다. `dd`의 좌측 이미지 2장은 같은 컷이 반복되지 않도록 pool의 앞/뒤에서 한 장씩 뽑는다.

### 매핑하지 않는 영역 (원본 하드코딩 유지)

- 히어로 `strong` — `RESERVATION` (다른 서브페이지와 달리 숙소명이 아니다)
- `dt.title_box2` — `Basic info` / `Refund Info` + `Reservation Information`
- 히어로 탭 — `예약하기`(외부 링크) / `이용안내`(`.on`)

---

## nearby-attractions.html

원본 `travel.html` 구조를 따른다. `sections[0].enabled === false`면 헤더 TRAVEL 메뉴가 숨겨지고, 직접 URL로 들어온 경우 `404.html`로 보낸다.

소스 섹션: `homepage.customFields.pages.nearbyAttractions.sections[0]`

| data-* 속성               | 요소                       | JSON 경로                         | 폴백                |
| ------------------------- | -------------------------- | --------------------------------- | ------------------- |
| `data-nearby-hero-slides` | 히어로 슬라이더            | `hero.images[isSelected]`         | placeholder         |
| `data-nearby-eyebrow`     | `.title_box > p`           | (생성) `Welcome to {숙소 영문명}` | 한글 숙소명         |
| `data-nearby-list`        | `.travel_li` 반복 컨테이너 | `about[]` 전체                    | 블록 없으면 빈 목록 |

### about[] 반복 블록

각 `about[i]`마다 `li` 하나를 생성한다.

```
li
  .title_box2
    h4 : "Travel" 하드코딩 (CSS counter 로 #01, #02 … 자동 번호)
    p  : "{숙소 영문명} , Travel Info" 하드코딩 조합
  .box
    .img : about[i].images[isSelected][0] → 없으면 placeholder
    .txt
      strong : about[i].title
      p      : about[i].description
      p > em : about[i].images[isSelected][0].description (거리/위치 정보, 있을 때만)
```

원본은 설명 끝에 `<em>`으로 `펜션에서 약 3.9km, 차량 약 7분 거리` 같은 거리 정보를 붙인다. 크롤러가 이미지 설명에 넣어주는 경우에만 노출한다.

`about[]`이 비어 있으면 `.travel_li`가 빈 박스로만 남아 페이지가 비어 보이므로, 매핑 위치를 알 수 있도록 placeholder 한 벌을 만든다.

### 매핑하지 않는 영역 (원본 하드코딩 유지)

- 히어로 `strong` — `Travel`
- `.title_box > h3` — `Travel Info`
- 히어로 탭 — `주변여행지`(`.on`)

---

## directions.html

원본 `traffic.html` 구조를 따른다. 메뉴명은 `오시는길`이다.

소스 섹션: `homepage.customFields.pages.directions.sections[0]`

| data-* 속성                        | 요소                                  | JSON 경로                                  | 폴백                              |
| ---------------------------------- | ------------------------------------- | ------------------------------------------ | --------------------------------- |
| `data-property-name-en`            | 히어로 `strong` (eyebrow 는 `-caps` 슬롯)  | `getPropertyNameEn()`                      | `property.name`                   |
| `data-directions-hero-description` | 히어로 `p`                            | `hero.description`                         | `property.subtitle`               |
| `data-directions-hero-slides`      | `.sub_visual_wide` 슬라이더           | `hero.images[isSelected]`                  | placeholder                       |
| `data-directions-body-title`       | 본문 `.title_box > h3`                | `hero.title`                               | `Traffic Info`                    |
| `data-property-address`            | `.info_box > strong > span`           | `property.address`                         | 비면 숨김                         |
| `data-directions-notice-title`     | `.info_box dl > dt > span`            | `notice.title`                             | `자가용 이용시`                   |
| `data-directions-notice`           | `.info_box dl > dd`                   | `notice.description`                       | `property.address` 기반 기본 문구 |
| `#kakao-map`                       | 지도                                  | `property.latitude` / `property.longitude` | 좌표 없으면 자리만 유지           |

`notice`가 배열로 내려오는 응답도 있어, 배열이면 설명을 모아 합쳐서 노출한다.

### 지도

원본은 Daum roughmap 임베드(고정 key)라 숙소별 좌표를 반영할 수 없다. 템플릿은 `js/kakao-maps-sdk.js`로 교체해 `property.latitude/longitude`에 마커를 찍는다.

- SDK 로드는 최대 2초(100ms × 20회) 재시도한다.
- 백오피스 preview는 데이터가 바뀔 때마다 `mapPage()`를 다시 부르므로, 지도 인스턴스가 이미 있으면 새로 만들지 않고 중심/마커만 옮긴다.
- `scrollwheel`, `draggable`은 끈다.
- CSS는 원본 `.root_daum_roughmap` 배치를 `#kakao-map`에 그대로 준다. 지도 영역은 `.map_box .map`의 `padding-bottom:35.715%`로 종횡비를 유지한다.

### 매핑하지 않는 영역 (원본 하드코딩 유지)

- ~~`.title_box > p` — `Welcome to Pension`~~ → 숙소 영문명으로 통일 (`Welcome to {영문명}`). 사이트 안에서 페이지마다 문구가 갈리지 않게 한다
- `.info_box > strong` 영문 라벨 — `Address`
- `.info_box dl > dt` 영문 라벨 — `Direction` (원본은 `By car`)
- `.sub_cate_wrap` 탭 — 펜션소개 / 오시는길(`.on`)

### Swiper (`js/pages/directions.js`)

| 키                 | selector                             | 옵션                               |
| ------------------ | ------------------------------------ | ---------------------------------- |
| `directionsVisual` | `.sub_visual_wide .swiper-container` | loop, fade, autoplay 4s, 버튼 없음 |

---

## 객실 그룹 규칙 (`groupName`)

`roomtypes[].groupName`이 **하나라도 있으면** 그룹 모드로
동작한다. 없으면 객실 하나가 항목 하나다. 규칙은 `base-mapper.js` 한 곳에 있다.

**그룹으로 접히는 곳은 헤더 ROOMS 메뉴와 객실 상세 탭뿐이다.**
Room Preview(미리보기) 카드는 그룹과 무관하게 **항상 전체 객실**을 깔고,
카드마다 자기 객실 상세로 연결한다 — 원본이 그렇다.

| 함수                     | 역할                                                                      |
| ------------------------ | ------------------------------------------------------------------------- |
| `hasRoomGroups()`        | `groupName` 이 하나라도 있는지                                            |
| `getRoomMenuItems()`     | 그룹 단위 항목 배열 — `{ label, groupName, roomtype(대표), roomtypes[] }` |
| `getRoomMenuLabel()`     | 메뉴에 쓸 이름 — **그룹명** (없으면 객실명)                               |
| `getRoomMenuLink()`      | **그룹의 첫 객실** 상세로 연결                                            |
| `isRoomMenuItemActive()` | 그룹 안 **어느 객실 id 로 들어와도** 그 항목을 활성으로 본다              |
| `renderRoomSlides()`     | 미리보기 카드 — **그룹을 쓰지 않고 `roomtypes[]` 전체**를 깐다            |

### 화면 흐름

```
헤더 ROOMS 메뉴        →  그룹명        (스파동 | 프리미엄동)
        ↓ 그룹명 클릭
그룹의 첫 번째 객실 상세 →  탭에 그 그룹의 모든 객실
                          (미리보기 | 에버골드 | 퍼블하제 | 유메)

Room Preview(미리보기)  →  전체 객실 (그룹과 무관), 카드마다 자기 객실 상세로 연결
```

### ⚠️ 객실 상세 탭은 그룹을 펼친다

헤더 ROOMS 메뉴는 그룹명 하나로 접히므로, **상세 페이지 탭까지 접으면 그룹의 첫 객실
외에는 헤더로 도달할 방법이 없다.** 그래서 탭은 현재 객실이 속한 그룹을 찾아
**그 그룹의 객실만** 렌더한다.

| 상황                             | 탭                                                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| 그룹 밖 (미리보기 / 미그룹 객실) | `미리보기 \| 스파동 \| 프리미엄동 \| …`                                            |
| 그룹 안 (멤버 2실 이상)          | `미리보기 \| 에버골드 \| 퍼블하제 \| 유메`                                         |
| 멤버 1실 그룹                    | 펼치지 않음 — 항목이 하나뿐이라 탭이 비다시피 하고 그룹명 = 객실명이라 의미가 없다 |
| `groupName` 없음                 | 기존과 동일 (객실 하나가 항목 하나)                                                |

**다른 그룹은 이 줄에 섞지 않는다.** 그룹명과 객실명이 나란히 놓이면 부모/자식이
형제처럼 보인다. 다른 그룹으로는 헤더 ROOMS 메뉴나 미리보기를 거쳐 이동한다.
(미리보기에서는 어느 객실이든 바로 갈 수 있다.)

탭을 다시 그릴 때 **첫 li(`미리보기`)는 남기고** `data-generated="room"` 이 붙은
이전 생성분만 지운다. 통째로 비우면 미리보기로 돌아갈 길이 없어진다.

---

## 카피라이트 (`data-copyright`)

푸터 카피라이트는 `property.tripProviderName`(Trip11 공급자명)으로 렌더한다.

`common/footer.html` 의 카피라이트 요소에 템플릿 문자열을 두고,
`header-footer-mapper.js` 의 `mapCopyright()` 가 `{provider}` 를 치환한다.

```html
<a href="http://trip11.kr/" data-copyright="COPYRIGHT©{provider}. ALL RIGHTS RESERVED.">
  COPYRIGHT©(주)트립일레븐. ALL RIGHTS RESERVED.
</a>
```

| `property.tripProviderName` | 결과                                  |
| --------------------------- | ------------------------------------- |
| `"신비서"`                  | `COPYRIGHT©신비서. ALL RIGHTS RESERVED.` |
| `""` / 미입력               | HTML 에 적힌 기존 문구 그대로          |

- 문구 형식(대소문자, `ⓒ` 접두, `(주)` 표기)은 템플릿마다 달라서 **형식은 `data-copyright` 속성값이 갖고
  매퍼는 이름만 바꾼다**.
- 값이 없을 때(백오피스 미입력 → `""`) 는 건드리지 않으므로 기존 트립일레븐 문구가 그대로 남는다.
- `trip11.kr` 링크는 변경하지 않는다.
