---
layout: ../../../layouts/MarkdownPostLayout.astro
pubDate: 2024-10-26
title: '[Next.js][Pages Router] 4. Layout'
description: 'Layout'
tags: ["Next.js"]

---

## Layout

- GlobalLayout(이름은 자유롭게) 컴포넌트를 만들어서 `_app.tsx`에 추가 할 수 있다.

- `컴포넌트.getLayout` 에 컴포넌트를 할당하여 페이지별 레이아웃을 만들 수 있다.

  ```tsx
  // pages/search/index.tsx
  export default function Page() {
    ...
    return <h1>검색 페이지</h1>;
  }
  
  Page.getLayout = (page: ReactNode) => {
    return <SearchableLayout>{page}</SearchableLayout>;
  }; 
  ```

  ```tsx
  // pages/_app.tsx
  export default function App({ Component, pageProps }: AppProps) {
    return <GlobalLayout>{Component.getLayout(<Component {...pageProps} />)}</GlobalLayout>;
  }
  ```

  장점은 페이지별 레이아웃을 root로 올리면서, 초기 SSR 때 로드한 뒤 불필요한 리렌더링을 줄일 수 있고 인증 여부같은 동적 정보를 넘겨서 사용도 가능하고 레이아웃을 분리함으로서 가독성도 좋아진다.

  아래는 동적 렌더링 예시다.

  ```tsx
  // pages/_app.tsx
  function App({ Component, pageProps }) {
    const getLayout = Component.getLayout ?? ((page) => page);
    const user = useUser(); // 사용자 상태 확인
    
    return getLayout(<Component {...pageProps} />, user); // 사용자 상태를 전달
  }
  ```

  ```tsx
  // pages/Dashboard.tsx
  Dashboard.getLayout = function getLayout(page, user) {
    return user?.isLoggedIn ? (
      <MainLayout>{page}</MainLayout>
    ) : (
      <SimpleLayout>{page}</SimpleLayout>
    );
  };
  ```

  