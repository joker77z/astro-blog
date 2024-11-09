---
layout: ../../../layouts/MarkdownPostLayout.astro
pubDate: 2024-11-09
title: '[Next.js][App Router] Data Fetching'
description: 'Data Fetching'
tags: ["Next.js"]

---

## Data Fetching

1. Pages Router에서 getServerSideProps나 getStaticProps를 사용해서 서버에서 Fetching해왔던 방식과 다르게 App Router에서는 컴포넌트 자체에서 데이터를 Fetching할 수 있다. 이 때 서버 컴포넌트는 async 키워드를 붙일 수 있다.

	> 클라이언트 컴포넌트는 비동기로 호출할 경우 문제가 생길 여지가 있지만, 서버에서 호출하는 서버 컴포넌트는 비동기여도 아무 문제가 없다.



2. 기존에 Page Router에서는 Root 페이지에서 getServerSideProps나 getStaticProps를 사용해서 데이터를 Fetching하고 Fetching한 데이터를 컴포넌트로 넘겨받아서 사용했는데, App Router에서는 데이터가 필요한 곳에서 요청할 수 있다.



예제는 다음과 같다.

검색을 하는 검색페이지다.

데이터 패칭을 위해 서버컴포넌트에 async 키워드를 붙이고 fetch를 사용하여 데이터를 로드하고 있다.

이 때 사용하고 있는 process.env 부분은 `.env`파일을 만들어서 api 주소를 기입해준 부분이다.

> NEXT_PUBLIC은 서버 컴포넌트 뿐 아니라 클라이언트 컴포넌트에서도 사용할 수 있게끔 prefix를 붙여준 것인데, API 주소의 경우 굳이 서버 컴포넌트에서만 사용하게끔 할 이유가 없기 때문에 붙여줬다.
> (즉, 만약 NEXT_PUBLIC prefix를 붙이지 않으면 서버 컴포넌트에서만 사용 가능하다.)

```tsx
// app > (with-searchbar) > search > page.tsx
export default async function Page({
  searchParams,
}: {
  searchParams: {
    q?: string;
  };
}) {
  const { q } = searchParams;
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/book/search?q=${q}`);
  if (!response.ok) {
    return <div>오류가 발생했습니다.</div>;
  }
  const searchResultBooks: BookData[] = await response.json();

  return (
    <div>
      {searchResultBooks.map((book) => (
        <BookItem key={book.id} {...book} />
      ))}
    </div>
  );
}
```

