---
layout: ../../../layouts/MarkdownPostLayout.astro
pubDate: 2023-05-18
title: '회사에서 chrome extension 제작기'
description: 'chrome extension으로 업무 효율성을 올려보자.'
tags: ["dev"]
---

## 문제 상황

### 첫 번째 문제
개발 후 검증기간이 되면 개발자, 기획자, QA는 각자 다른 도메인에 접속해서 검증을 시도한다.
이 때 사용되는 도메인들은 수십개가 된다.

개발 기간동안 접속하지 않은 도메인들의 계정들은 비밀번호 변경 모달이 뜨게 된다.
1명이 비밀번호를 변경하면, 다른 구성원은 해당 계정의 비밀번호를 알아내기 위해 수소문을 해야 했다. 나는 이런 불필요한 비용을 줄이고 싶었다.

[//]: # (해결에 적극적이었던 백엔드 동료와 협업하여 DV, ST, QA 환경에서 자동으로 비밀번호 연장을 해주는 API를 구축하고 연동해서 해결했다. )

### 두 번째 문제
개발을 할 때나 검증을 할 때 공지사항 같은 불필요한 화면의 요소들이 계속 뜨면서 내가 원하는 목적지로 도달하는데 클릭해야 되는 횟수를 늘리고 있었다. 이를 또 해결한다면 모든 동료들의 시간을 절약할 수 있게 된다.

### 세 번째 문제
마이다스는 역량검사(역검)이라는 서비스를 운영중에 있다. 개발 과정에서 해당 데이터가 필요하다면, 2시간 넘는 시간 동안 직접 테스트를 해서 소중한 1개의 데이터를 얻어내는 과정을 거쳐야만 했다.

## 기능 요구사항

위 문제점들을 토대로 구현해야 하는 기능을 정리해봤다.

- [공통] PR 도메인에서는 Chrome Extension이 동작하지 않아야 한다.
- [공통] 간단하지만, 항상 유지되었으면 하는 기능들을 토글로 만들어서 ON으로 설정 시 앞으로 브라우저를 킬 때 항상 ON으로 상태유지가 되어야 한다. 또한, 브라우저 특정 탭에서 특정 기능을 ON으로 설정했을 때 다른 탭에서도 동작해야 한다.
- 비밀번호 연장 기능 : 비밀번호 변경 요청 모달이 뜰 경우, 자동으로 비밀번호 연장 API를 쏜다.
- 모달 OFF 기능 : 로그인 모달, 공지 모달 등 검증에 불필요한 요소들을 제거한다.
- 데이터 추가 기능 : 버튼으로 제공하여, 특정 공고 안에서 선택한 지원자들 혹은 전체 지원자들에 대해 역량검사 데이터를 추가할 수 있게 한다.

## 기본적인 세팅 : manifest.json

가장 먼저 해야할 것은 manifest.json 설정이다. chrome extension의 설정파일이라고 보면 된다. 크롬 익스텐션의 API들을 사용할 버전, 이름, 버전, 설명, html페이지, 권한, 특정 url에서 실행할 js파일 등을 설정할 수 있다.

**초기에 작성한 manifest.json 파일의 형태**

```json
// manifest.json

{
  "manifest_version": 3,
  "name": "Jobflex Extension", // extension 이름
  "version": "1.0", // extension 버전
  "description": "개발 및 검증 시 반복되는 비밀번호 연장모달, 로그인기록 모달, 공지 모달 등을 on, off할 수 있습니다.", // extension 간략 설명
  "action": {
    "default_popup": "popup.html" // extension 아이콘 클릭 시 열리는 페이지
  },
  "permissions": ["storage", "tabs"], // chrome에서 제공하고있는 메서드를 실행하기 위해 필요한 권한
  "background": {
    "service_worker": "js/background.js" // 이번에 사용하지는 않았지만, 확장 프로그램이 설치되면 항상 실행되고 있다. 웹페이지와 상호작용할 수 없고, 콘텐츠 스크립트와 통신해서 메시지 전달, 데이터 저장, API 호출 등을 한다.
  },
  "icons": { // 브라우저가 알아서 크기를 조정한다.
    "16": "icons/jobflex.png",
    "32": "icons/jobflex.png",
    "48": "icons/jobflex.png",
    "128": "icons/jobflex.png"
  },
  "content_scripts": [ // 웹 페이지와 상호작용할 javascript를 정의한다.
    {
      "matches": [ // js파일이 동작할 수 있는 url을 지정할 수 있다.
        "<http://demo01-cms-recruiter-co-kr.kr-dv-midasitwebsol.com:3000/cus/selectProduct>",
        "<https://demo01-cms-recruiter-co-kr.kr-dv-midasitwebsol.com/cus/selectProduct>",
				...,
      ],
      "js": ["js/selectProduct.js"],
      "run_at": "document_start" // 가장 먼저 실행되게 하거나 가장 늦게 실행되게 할 수 있다.
    },
    {
      "matches": [
        "<http://demo01-cms-recruiter-co-kr.kr-dv-midasitwebsol.com:3000/mrs2/manager/dashboard>",
        "<https://demo01-cms-recruiter-co-kr.kr-dv-midasitwebsol.com/mrs2/manager/dashboard>",
        ...
      ],
      "js": ["js/dashboard.js"],
      "run_at": "document_start"
    }
  ]
}
```

초기에 작성한 코드의 경우를 보면 content_scripts 부분에서 특정 js파일을 특정 url에서 실행시키기 위해 파일마다 url들을 지정해주고 있는 모습이다. 이렇게 한 이유는 2가지 였다.

- Chrome Extension을 사내에서 공식적으로 사용할 수 있도록 안전 장치를 마련했다.
- 기입된 주소 외에서는 js파일을 로드하지 않음으로서 성능에 영향을 끼치지 않을 수 있다.

위 방법은 안전했지만, 수십명의 동료가 요청할 때마다 도메인을 추가해줘야 했다. 

그래서, manifest.json파일에서 정규식으로 필터링하는 방법과 와일드카드를 사용하여 모든 url에서 접근 가능하게 한 후 실행될 js파일(content script파일) 내에서 특정 url에서만 실행 가능하게 만드는 방법을 생각했다.

우선 manifest.json 파일에서 matches에 정규식 같은 문법이 사용 가능한지를 확인했다.
결론부터 말하면, 자유로운 정규식은 안되더라도 url 일부에 와일드카드를 이용할 수 있었다. 

공식문서에 따르면 url 중 도메인에 와일드 카드를 넣으려면 바로 앞은 `/`여야 하고 바로 뒤는 `.`이어야 한다. 따라서, st 도메인이나 qa도메인을 지정할 때 `https://st-*.midasweb.net` 이런 식으로 사용이 불가능하고, `https://*.midasweb.net` 이런 식으로 사용해야 했다. 결국 내가 원하는 도메인들에서만 실행 가능하게 할 수 없었다.

두번째 시도로, manifest.json파일에서는 모든 url을 열어주고 실행될 js파일(content script파일)에 접근할 수 있도록 열어주고 content script파일에서 제어를 시도했다.

1. manifest.json 파일에서는 모든 url을 열어줬다.

```json
// manifest.json

{
  ...
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["js/pages/selectProduct.js"],
      "run_at": "document_start"
    },
    {
      "matches": ["<all_urls>"],
      "js": ["js/pages/dashboard.js"],
      "run_at": "document_start"
    },
    {
      "matches": ["<all_urls>"],
      "js": ["js/pages/accGrid.js"],
      "css": ["css/common.css"],
      "run_at": "document_start"
    }
  ]
}
```

2. content script파일 내부에서 처리한다. 만약, 설정해놓은 도메인 중에서 현재 도메인이 포함되어있지 않다면 return false처리해서 해당 content script파일이 실행되지 않도록 했다.

```js
// js/pages/selectProduct.js
(async () => {
  const src = chrome.runtime.getURL("js/helper/common.js");
  const commonScript = await import(src);

  commonScript.matchUrlToRun("/cus/selectProduct")
    ? console.log("%c [Jobflex Extension] 제품선택 페이지 정상 진입", "color: white; background: #00C17C; padding: 10px;")
    : "";

  if (!commonScript.matchUrlToRun("/cus/selectProduct")) {
    return false;
  }

  ...
}();
```

이 때 모듈화한 js/helper/common.js 파일에서 matchUrlToRun 함수를 읽어온 것을 알 수 있다. 모든 content script파일에서 사용할 공통 모듈 js파일을 만든 것이다. 내부적으로는 아래와 같다.

```js
function matchUrlToRun(path) {
  const domainList = [
    "http://demo01-cms-recruiter-co-kr.kr-dv-midasitwebsol.com:3000",
    ...
  ];

  const includePathDomain = domainList.map((domain) => domain + path);
  let currentUrl = window.location.href;

  // 맨 뒤에 #이 붙는 경우가 있음.
  if (currentUrl.slice(-1) === "#") {
    currentUrl = currentUrl.slice(0, currentUrl.indexOf("#"));
  }

  if (includePathDomain.includes(currentUrl)) {
    return true;
  } else {
    return false;
  }
}

export { matchUrlToRun }; // default export은 되지 않는다. named export만 된다.
```

공통 모듈을 사용하기 위해서 manifest.json 파일에 `web_accessible_resources`를 추가하면 된다.

```js
// manifest.json

...
"web_accessible_resources": [
    {
      "matches": ["<all_urls>"],
      "resources": ["js/helper/common.js"]
    }
  ],
  ...
```

> 2편에서 계속된다.