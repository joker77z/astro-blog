---
layout: ../../../layouts/MarkdownPostLayout.astro
pubDate: 2024-09-11
title: "에러처리 R&D : Sentry와 선언형 에러처리"
description: "에러처리는 어떻게 해야 될까?"
tags: ["error"]
---

> 에러 처리에 대해 다양한 인사이트를 얻고자 찾던 도중 2022.12월에 [카카오페이 프론트엔드의 선언적에러처리 발표](https://if.kakao.com/2022/session/84)를 보고 정리한 내용입니다.  
> 주의 : 전체적인 흐름을 참고하기 위함이며, 구체적인 코드는 다를 수 있기 때문에 코드를 사용할 때는 크로스체크가 필요합니다.

## 에러 처리

에러의 종류는 크게 다음과 같이 볼 수 있습니다.

- 데이터 영역 에러 (API 에러)
- 화면 영역 에러 (렌더링 중 발생하는 오류, 잘못된 사용자 입력)
- 외부요인에 의한 에러 (네트워크, 브라우저 호환성)
- 런타임에 의한 에러 (JS런타임 오류 - null, undefined 참조, 타입, 구문, 에러 처리되지 않은 promise에러[파일 읽기, webSocket 등], 메모리 부족, 성능 저하)

## Sentry

Sentry를 활용해서 에러를 모니터링 할 수 있습니다.

- `Sentry.captureException(error)` : 에러 데이터 전송
- `Sentry.captureMessage(’에러 메세지’)` : 에러 메세지 string으로 전달

### Context

Scopes, Add Context, Issue Grouping, Level, Customized Tags 기능을 활용하여 에러 파악을 더 잘할 수 있습니다.

Sentry는 Scope라는 개념을 사용하는데, 여기서 Scope개념은 여러 정보를 모아서 한번에 전송하여 디버깅할 때 추적을 더 쉽게 도와줄 수 있습니다.

예를 들면 아래 코드와 같이 사용자 정보와 Type의 경우에는 `configureScope`를 이용해 전역 Scope에 추가할 수 있습니다.

```jsx
Sentry.configureScope((scope) => {
  scope.setUser({
    accoundId: 2022,
    email: "test@naver.com",
  });
  scope.setTag({
    webviewType: "WEB",
  });
});
```

withScore의 경우에는 지역 Scope라고 볼 수 있습니다.

```jsx
Sentry.withScore((scope) => {
  // setTag(키, 값)
  scope.setTag("type", "api");
  scope.setLevel(Sentry.Severity.Error);

  Sentry.captureException(new Error("API Internal Server Error"));
});
```

> `setContext`를 이용해서 api요청 혹은 응답에 사용되는 데이터들을 Sentry로 전달할 수도 있습니다. 하지만, 이 경우에는 검색으로 찾을 수는 없습니다.

에러 트래킹을 위해서는 검색이 중요하기 때문에 Tag를 사용하면 됩니다. 검색뿐만 아니라 알람 설정에서도 활용할 수 있습니다.

### fingerprint

모든 벤트는 fingerprint를 가지고 있고, 동일한 이벤트는 하나의 이슈로 그룹화됩니다.

하나의 API에서 서로 다른 상태값을 가지게 되어도 알고리즘에 의해 그룹화됩니다. 이럴 때 재설정이 필요합니다.

```jsx
Sentry.withScore((scope) => {
  scope.setTag("type", "api");
  scope.setLevel(Sentry.Severity.Error);

  scope.setFingerprint([method, status, url]);

  Sentry.captureException(new Error("API Internal Server Error"));
});
```

### 알람 조건 설정하기

- When
  - 처음 보는 이슈가 생길 경우
  - 해결된 이슈가 다시 발생할 경우
- If
  - 이벤트 Level이 조건에 맞을 경우
  - Tag가 조건에 맞을 경우
  - N번 중복 발생할 경우
- Then
  - slack
  - jira

### 유의미한 데이터 수집하기

API에러의 경우 데이터 수집에 무분별하게 쌓일 수 있습니다. 따라서 다음과 같은 조건으로 데이터를 쌓습니다.

- chunk load나 network 에러는 사용자의 환경에 따라 발생할 수 있으므로 제외하도록 했습니다. (사용자 경험 개선을 위해 timeout에러는 수집합니다.)
- 트래픽이 많은 서비스의 경우 모든 API에러 데이터를 수집하는 것은 도움이 되지 않습니다. 단, 500에러 등 분석하고자 하는 API의 http status를 구분해서 수집합니다.
- 에러 데이터 뿐만 아니라 디버깅, 분석에 필요한 추가적인 정보는 수집합니다. 이 경우 tag나 level을 이용해서 분석하는데 도움을 받을 수 있습니다.

### 서버와의 로그 분석 정합성 높이기

api 요청 시 custom header를 추가해서 특정 id값을 사용해서 백엔드와 동일한 id값으로 에러 발생 시 정합성을 높여서 확인할 수 있습니다. tag기능을 함께 활용하여 custom header에 사용한 id를 사용한다면 장애 상황 발생 시 데이터 로그를 빠르게 추적해 볼 수 있습니다.

### 개선 후 좋아진 점

- 브라우저 버전 문제, 빌드 설정 같은 문제로 예상하지 못한 에러를 발견하여 사용자 경험을 개선했습니다. (사용자 웹뷰 브라우저 버전을 확인하고, polyfill을 추가)
- 장애 탐지 시간, 원인 파악, 해결까지 시간이 줄었습니다.
- CS 인입 시 사용자 환경에서 재현하지 않아도 에러 원인을 파악하고 이전보다 정확하게 안내할 수 있게 되었습니다.
- 개발자 경험이 좋아졌습니다. (재현에 많은 시간없이 해결 가능)

## 에러 처리 개선

하나의 api에러 발생 시에도 에러 페이지로 전환하는 경우가 많습니다.

기존에는 다음과 같았습니다.

- api에러, 런타임 에러 발생 시 - 일반적인 에러 화면
- 네트워크 에러 - 연결상태가 좋지 않다는 에러 화면
- 강제 업데이트 페이지
- 서비스 점검 페이지

axios interceptor를 사용했습니다.

```jsx
axios.interceptors.response.use(_, onResponseRejected);

function onResponseRejected(error: Error) {
  return new Promise((_, reject) => {
    if(isNetworkError(error)) {
	    setTimeout(() => handleNetworkError(error, reject), 200);
	    return;
    }
    if(isAxiosTimeoutError(error)) {
	    return handleTimeoutError(error, reject);
    }

    const errCode = error.reponse?.data?.errorCode;
    const status = error.response?.status;

    if(errorCode) {
	    switch (errorCode) {
		    case ERROR_CODE_계정이상:
			    return handleKitckOutError(error);
		    /* .. */
	    }
    }
  })
}
```

예외 케이스가 늘어날수록 interceptor 코드가 늘어났고, 전역에서 처리하는 흐름이 맞는지 의문이 생겼습니다.

axios.interceptor를 사용하면 명령형으로 에러 처리를 하게 되고, 에러 화면을 보여주려면 reject callback에서 history.push로 에러 페이지로 보내거나 해당 api를 호출하는 코드 쪽에서 일일이 에러 발생 여부를 판단하고, 에러를 표시해야 했습니다.

axios interceptor로 처리하게 되면 에러 페이지 표시는 어렵지 않지만, 화면 일부만 표시하고 싶다면 interceptor에서 예외처리하고 호출부에서 대응해야 합니다.

그래서 React의 ErrorBoundary를 살펴보기 시작했습니다.

### React ErrorBoundary

React의 ErrorBoundary는 이벤트 핸들러내부에서는 에러를 포착하지 않습니다. 때문에 api를 호출했을 때 오류가 발생하더라도 에러로 전달하지 않습니다. 따라서 useErrorBoundary를 이용해 ErrorBoundary에서 에러를 캐치할 수 있도록 해야 합니다.

> Tanstack-Query에서 찾아본 결과, 현재는 throwOnError를 통해서 캐치할 수 있다고 합니다. 다만, 캐시가 남아있을 경우 캐시를 그대로 표시하기 때문에 모든 에러를 감지하고 싶다면 아래 코드와 같이 error를 throw해야 한다고 공식문서에서 설명합니다.

```jsx
const { data, error, isFetching } = useSuspenseQuery({ queryKey, queryFn });

if (error & !isFetching) {
  throw error;
}

// continue rendering data
```

### 선언적 에러 처리 적용하기

네트워크 지연처리는 axios interceptor에서 그대로 하고, 나머지는 ErrorBoundary로 위임했습니다.

ErrorBoundary도 2개로 분리했는데, Fontend에서 발생하는 Error와 api에서 발생하는 Error를 처리하기 위해 관심사를 분리했습니다.

```jsx
export const Layout = () => {
	return (
		<RootErrorBoundary> <-- Frontend 에서 발생하는 에러 처리
			<ApiErrorBoundary> <-- api에서 발생하는 에러 처리
				<Outlet />
			</ApiErrorBoundary>
		</RootErrorBoundary>
	)
}
```

```jsx
export const ApiErrorBoundary = ({children}) => {
	const reset = ... // tanstack-query의 query reset hook
	const { key } = useLocation();

	return (
		<ErrorBoundary
			fallback={ApiFallbackComponent}
			onReset={reset}
			key={key}
		>
			{children}
		</ErrorBoundary>
	)
}
```

```jsx
function ApiFallbackComponent = ({error, resetErrorBoundary}) => {
  // sentry같은 에러 모니터링 서비스에 데이터 전송 가능
	useEffect(() => {
		captureApiError(props.error);
	}, []);

	if(!isAxiosError(error)) {
		throw error; // axios error가 아닐 경우 상위로 throw 합니다.
	}

	// 500에러나 기타 일반 Api Error
	return (
		<CommonErrorHandler
			resetErrorBoundary={resetErrorBoundary}
		 />
	)
}
```

### 부분 컴포넌트 에러 적용하기

```jsx
const List = () => {
  return (
    <Container>
      {/* ... */}
      <LocalApiErrorBoundary>
        <ProductList />
      </LocalApiErrorBoundary>
      {/* ... */}
    </Container>
  );
};
```

```jsx
const FallbackComponent = (props) => {
  // 공통 에러 처리가 필요한 에러들은 상위로 위임
  if (isApiRequiredError(props.error)) {
    throw props.error;
  } else {
    return <RetryErrorFallback {...props} />;
  }
};

const LocalApiErrorBoundary = ({ children }) => {
  return <ErrorBoundary fallback={FallbackComponent}>{children}</ErrorBoundary>;
};
```

> 애플리케이션 흐름에 중대한 영향을 끼치는 에러, 중대한 비즈니스 로직 에러(결제), 인증 및 권한 문제 등 이런 에러들은 루트 레벨에서 처리되어야 하는 에러이기 때문에 올려보내서 전체 애플리케이션에 대해 상태를 초기화하거나 하는 등을 처리할 수 있습니다.

### 개선 후 좋은 점

- 기존 명령형으로 error처리를 하려고 하는 경우 tanstack-query를 사용한다면 각 컴포넌트에서 error발생 시 그에 맞는 UI를 각자 처리해줘야 합니다.

하지만, ErrorBoundary를 써서 선언형으로 관리하면 에러 처리에 대한 관심사를 분리하고 에러 발생에 대해 신경쓰지 않아도 됩니다. 또한 UI 일부에서 발생하는 에러를 전역이 아니라 지역적으로 처리할 수 있습니다.
