---
layout: ../../../layouts/MarkdownPostLayout.astro
pubDate: 2024-11-02
title: '[Next.js][Pages Router] 9. SEO'
description: 'App Router'
tags: ["Next.js"]
---



## SEO 설정하기

아주 기본적인 검색엔진 최적화를 진행해보자.

next/head에서 Head 컴포넌트를 import해서 사용한다.

이 때, next/Document에 있는 Head컴포넌트는 _document.tsx 파일에서 사용해야 하는 컴포넌트니 주의하자.

```tsx
export default function Home({ allBooks, recoBooks }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <Head>
        <title>한입북스 - 검색결과</title>
        <meta property="og:image" content="/thumbnail.png" /> {/* NOTE: 이미지 경로는 public 디렉토리 기준 */}
        <meta property="og:title" content="한입북스 - 검색결과" />
        <meta property="og:description" content="한입 북스에 등록된 도서들을 만나보세요." />
      </Head>
      <div className={styles.container}>
        ...
      </div>
    </>
  );
}
```



만약, SSG에 fallback 옵션을 사용중인 페이지라면 아래처럼 fallback상태일 때 Head를 별도로 추가해줘야 한다.

```tsx
export default function BookDetailPage({ book }: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  if (router.isFallback)
    return (
      <>
        <Head>
          <title>한입북스 - 검색결과</title>
          <meta property="og:image" content="/thumbnail.png" /> {/* NOTE: 이미지 경로는 public 디렉토리 기준 */}
          <meta property="og:title" content="한입북스 - 검색결과" />
          <meta property="og:description" content="한입 북스에 등록된 도서들을 만나보세요." />
        </Head>
        <div>로딩 중...</div>
      </>
    );
  if (!book) return "문제가 발생했습니다.";

  const { title, subTitle, description, author, publisher, coverImgUrl } = book;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta property="og:image" content={coverImgUrl} /> {/* NOTE: 이미지 경로는 public 디렉토리 기준 */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
      </Head>
      <div className={style["top-container"]}>
       ...
      </div>
    </>
  );
}
```

