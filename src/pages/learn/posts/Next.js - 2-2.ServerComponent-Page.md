---
layout: ../../../layouts/MarkdownPostLayout.astro
pubDate: 2024-11-03
title: '[Next.js][App Router] 2. Server Component'
description: 'App Router'
tags: ["Next.js"]

---

## ServerComponent

서버에서 실행되는 서버컴포넌트는 async를 붙일 수 있다.

`http://localhost:3000/search?q=한입`으로 접속했을 경우 props를 console에 찍어보면 IDE 터미널(서버측 로그)에 params 및 searchParams가 Promise 객체인 것을 확인할 수 있다.

```tsx
// src/app/search/page.tsx
type SearchParams = Promise<{ q: string }>;

interface Props {
  searchParams: SearchParams;
}

export default async function Page({ searchParams }: Props) {
  const { q } = await searchParams;

  return <div>검색 페이지 : {q}</div>;
}

```



`http://localhost:3000/book/2` 로 접속했을 경우 화면에 Book Page 2가 나온다.

```tsx
// src/app/book/[id]/page.tsx
interface Props {
  params: Promise<{ id: string }>;
}

export default async function BookPage({ params }: Props) {
  const { id } = await params;
  return (
    <div>
      <h1>Book Page {id}</h1>
    </div>
  );
}

```

만약에 `[...id]`CatchAll Segment로 경로를 만들면 book/1/2 도 대응이 되고 Optional CatchAll Segement로 경로를 만들면 book까지만 들어가도 페이지가 나오게 할 수 있다.