---

layout: ../../../layouts/MarkdownPostLayout.astro
pubDate: 2024-10-15
title: 'Next.js - Pages Router #3 Style'
description: 'App Router'
tags: ["Next.js"]

---

## CSS

일반적으로 CSS파일을 import하려는 경우 _app.tsx 파일에서만 import할 수 있다.

다른 페이지에서 css파일을 import할 경우에 로드 중에 클래스명이 겹치거나 하는 오류를 원천차단하기 위해서다.



## CSS Module

CSS Module의 경우에는 클래스명을 자동으로 변환시켜서 겹치는 일을 없도록 해준다.

따라서 다른 페이지에서도 import가 가능해진다. 

style.h1 이런 식으로 클래스명을 사용한다.

```jsx
import style from "./index.module.css";

export default function Home() {
  return (
    <>
      <h1 className={style.h1}>인덱스</h1>
    </>
  );
}

```



