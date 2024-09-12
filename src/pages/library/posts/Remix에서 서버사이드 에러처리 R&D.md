---
layout: ../../../layouts/MarkdownPostLayout.astro
pubDate: 2024-09-12
title: "Remix에서 서버사이드 에러처리 R&D"
description: "Remix에서 에러처리는 어떻게 해야 될까?"
tags: ["error"]
---

### Remix의 ErrorBoundary

Remix의 ErrorBoundary는 공식문서에서도 확인할 수 있듯이, 서버 측에서도 동작합니다.

따라서 ErrorBoundary내부에 console.log를 찍어봤을 때 서버측 로그를 보면 최초 로그는 console.log가 찍히지 않고, 두번째부터는 console.log가 찍혀있는 것을 확인할 수 있습니다.

### 명시적으로 에러 띄우기

서버사이드에서 동작하는 `loader`에서 `throw json` 혹은 `throw new Response` 를 통해 에러 메세지와 status를 명시적으로 전달할 수 있습니다.

```jsx
if (!recruitNoticeSn) {
  throw json({ errorMessage: "정상적인 접근이 아닙니다." }, { status: 400 });
}
```

```tsx
export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    // 여기서 감지한다.
    return <ErrorPage>{error.data.errorMessage}</ErrorPage>;
  } else if (error instanceof Error) {
    return <ErrorPage>{error.message}</ErrorPage>;
  } else {
    return <ErrorPage>알 수 없는 에러 발생</ErrorPage>;
  }
}
```

### API 에러 띄우기

만약에 `throw Error`나 `throw Json`같이 `throw` 키워드를 사용하지 않고, 에러를 띄웠을 경우를 실험해봤습니다.

```jsx
export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<
  TypedResponse<{
    data: GetMyPageListRs;
  }>
> => {
  const url = new URL(request.url);
  const recruitNoticeSn = url.searchParams.get('recruitNoticeSn');

  if (!recruitNoticeSn) {
    throw json({ errorMessage: '정상적인 접근이 아닙니다.' }, { status: 400 });
  }

  const cookie = request.headers.get('Cookie');

  const { data } = await getMyPageList(recruitNoticeSn, {
    headers: {
      Cookie: cookie ?? '',
    },
  });
  return json({ data });
};

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    console.log('1 error');
    return <ErrorPage>{error.data.errorMessage}</ErrorPage>;
  } else if (error instanceof Error) {
    console.log('2 error');
    return <ErrorPage>{error.response.data}</ErrorPage>;
  } else {
    return <ErrorPage>알 수 없는 에러 발생</ErrorPage>;
  }
}
```

위 코드를 보면 getMyPageList API에서 에러가 발생했을 경우 명시적으로 에러를 던지고 있지 않은 것을 볼 수 있습니다.

에러를 던지지 않았지만 ErrorBoundary의 `error instaceOf Error`에 서버 측에서 걸려서 ErrorPage가 정상적으로 나오는 것을 확인할 수 있습니다.

하지만, 서버에 이어 클라이언트 측에서 한번 더 ErrorBoundary를 돌 때는 error객체를 정상적으로 전달받지 못해서 TypeError로 response가 undefined라는 에러가 뜨는 것을 볼 수 있습니다.

> **의문점 : 서버 쪽에서는 어떻게 ErrorBoundary에 error객체가 전달되었던걸까?**
> 이거는 vite의 공식문서에서 서버사이드 렌더링 페이지를 보면 힌트를 얻을 수 있습니다.
> try catch문으로 감싸져 있는 것을 볼 수 있는데 에러 발생 시 catch에서 에러 객체를 next 메서드를 사용해 전달합니다. 그래서, Node.js 환경인 서버사이드에서 ErrorBoundary를 이용해 에러를 감지할 수 있던 것으로 추측됩니다.

> **의문점 : loader에서 throw new Error같이 에러를 던졌을 때 클라이언트 측에서는 어떻게 error객체를 전달받아서 ErrorBoundary에서 처리하는 것일까?**
> → Remix는 서버 측에서 실행된 응답을 클라이언트로 전달합니다. HTTP 상태 코드, 에러 메세지가 포함될 수 있습니다. 그래서 클라이언트 측에서도 ErrorBoundary가 동작합니다.

## 정리 : Best Practice

- loader에서 명시적으로 에러 메세지를 ErrorBounday로 전달하여 `isRouteErrorResponse`에서 감지할 수 있게 하려면 `throw json` 혹은 `throw Response`를 사용해서 에러 메세지를 명확히 전달합니다.
- loader에서 api 호출 시 에러가 발생했을 때 서버사이드, 클라이언트 상에서 동일한 에러처리를 하고 싶다면 `throw new Error` 키워드로 에러를 전달하여 처리합니다.

결국에 다음과 같은 코드가 나옵니다.

```jsx
export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<
  TypedResponse<{
    data: GetMyPageListRs;
  }>
> => {
  const url = new URL(request.url);
  const recruitNoticeSn = url.searchParams.get('recruitNoticeSn');

  if (!recruitNoticeSn) {
    throw new Response('정상적인 접근이 아닙니다.', { status: 400 });
  }

  const cookie = request.headers.get('Cookie');

  try {
    const { data } = await getMyPageList(recruitNoticeSn, {
      headers: {
        Cookie: cookie ?? '',
      },
    });
    return json({ data });
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error?.response?.data);
    }
    throw error;
  }
};

export default function V1ApplicantMyPage() {
  return (
    <>
      <Header />
      <Body />
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return <ErrorPage>{error.data}</ErrorPage>;
  } else if (error instanceof Error) {
    return <ErrorPage>{error.message}</ErrorPage>;
  } else {
    return <ErrorPage>알 수 없는 에러 발생</ErrorPage>;
  }
}

```
