

```
layout: ../../../layouts/MarkdownPostLayout.astro
pubDate: 2024-11-09
title: '[Next.js][App Router] Route Segment Option'
description: 'Route Segment Option'
tags: ["Next.js"]
```



## Route Segmenet Option

저번 포스팅에서 Full Route를 적용하기 위해 캐싱되지 않는 API들은 캐싱처리 해주거나 Params를 받아오는 페이지는 미리 사용하는 params들을 정의해줌으로서 static한 페이지를 만들어줄 수 있었다. 하지만, 이 과정이 번거롭게 느껴질 수 있다. 페이지별로도 Static  또는 Dynamic한 페이지를 적용해줄 수 있다.

디테일하게 들어가면 Option 종류가 다양하다. revalidate를 페이지별로 설정해주거나 할 수 있는데 가장 많이 사용하는 dynamic에 대해 알아보자. dynamic을 통해 해당 페이지를 강제로 static 또는 dynamic페이지로 설정해줄 수 있다.

```tsx
// app/(with-searchbar)/page.tsx
export const dynamic
```



- 기본값은 "auto"
- force-dynamic : 페이지를 강제로 Dynamic 페이지로 설정
- force-static : 페이지를 강제로 Static 페이지로 설정
- error : 페이지를 강제로 Static 페이지로 설정 (설정하면 안되는 이유가 있는 경우에 빌드 오류를 발생시킨다. 예를 들면 동적함수를 사용하는 경우!)



## 강제로 Dynamic, Static하게 바꾸게 되면 어떻게 될까?

내부적으로 API를 요청하는 부분은 force-cache가 적용되는 식으로 전환된다.

동적함수를 사용하는 것은 빈 값이 들어오게 된다. 예를 들어 쿼리스트링을 받아오는 컴포넌트가 있다면 그저 빈 값이 들어오게 되어, 부작용을 발생시킨다.

```tsx
export const dynamic = "force-static";

interface SearchParams {
  q?: string | number | boolean;
}

interface Props {
  searchParams: Promise<SearchParams>;
}

export default async function Page({ searchParams }: Props) {
  const { q } = await searchParams;
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/book/search?q=${q}`, {
    cache: "force-cache",
  });
```



## 이런 강제로 전환하는 방법 권유될까?

실제로 권유되지는 않는다. 강제로 변환하면서 부작용을 일으킬 수 있기 때문에 되도록 사용하지 않는 것이 좋다. 꼭 필요한 경우에만 사용하자. (static/Dynamic에 따른 차이를 확인하는 테스트 용도로는 좋아보인다)