---
layout: ../../../layouts/MarkdownPostLayout.astro
pubDate: 2024-11-10
title: "실무의 한 프로젝트에 적용되어있는 ErrorBoundary 분석"
description: "ErrorBoundary"
tags: ["회고"]
---

## 에러 처리

이전에 if kakao에서 공개한 에러처리 관련 내용을 보고 포스팅으로 기록한 적이 있다.
이번에는 간단하게 현재 실무에 적용되어 있는 에러 처리를 분석해봤다.

> 분석해보려고 한 이유는 10년도 더 지난 API들 + 개발 시간 부족으로 에러에 대한 협의없이 나온 API들이 혼재되어있는데, 어떤 식으로 에러가 처리되고 있는지 궁금해서이다.

최상단 route를 정의해놓은 부분이다.

```tsx title="router.tsx"
<UnknownErrorBoundary>
  <NotFoundErrorBoundary goBackUrl={'/template'}>
    <AuthorizationErrorBoundary>
      <Page />
    </AuthorizationErrorBoundary>
  </NotFoundErrorBoundary>
</UnknownErrorBoundary>
```



## AuthorizationErrorBoundary

AuthorizationErrorBoundary 내부에는 외부 라이브러리를 사용하지 않고, 커스텀으로 만든 ErrorBoundary를 사용하고 있다.

fallback props에는 컴포넌트를 반환하는 콜백함수 혹은 바로 컴포넌트가 들어갈 수 있는데 여기서 error객체의 종류에 따라서 어떤 CustomErrorBounday에서 처리할지가 결정되게 된다.

```tsx title="AuthorizationErrorBoundary.tsx"
const AuthorizationErrorBoundary = ({ children }: Props) => {
  return (
    <ErrorBoundary
      fallback={({ error }) => {
        if (!(getErrorType(error) === CUSTOM_ERROR_TYPE.UNAUTHORIZED)) {
          throw error;
        }

        return <AuthorizationErrorFallback />;
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default AuthorizationErrorBoundary;
```



getErrorType에서 error의 응답 상태코드에 따라서 상수화 시켜놓는다.

```ts title="error.util.ts"
export const ERROR_STATUS: Record<number, CustomErrorType> = {
  401: CUSTOM_ERROR_TYPE.UNAUTHORIZED,
  404: CUSTOM_ERROR_TYPE.NOT_FOUND,
  901: CUSTOM_ERROR_TYPE.UNAUTHORIZED,
  999: CUSTOM_ERROR_TYPE.UNKNOWN,
};

export const getErrorType = (error: Error | AxiosError): CustomErrorType => {
  if (error instanceof AxiosError && error.response) {
    return ERROR_STATUS[error.response.status] || CUSTOM_ERROR_TYPE.UNKNOWN;
  }

  return CUSTOM_ERROR_TYPE.UNKNOWN;
};
```



## ErrorBoundary

ErrorBoundary의 경우 내부에 ErrorBoundaryBase를 한번 더 사용하고 있는데 tanstack-query의 useQueryErrorResetBoundary으로부터 reset을 전달하기 위함이다.

> 쿼리를 reset해주는 이유는 에러가 발생한 쿼리의 경우 기본적으로 캐시에 에러 상태가 저장되는데 이럴 경우 쿼리를 다시 호출해도 자동으로 재시도되지 않고 캐시된 에러 상태가 그대로 반환된다. 따라서, reset을 해줘야하는 경우가 있다.

```tsx title="ErrorBoundary.tsx"
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import type { ErrorBoundaryBaseProps } from './ErrorBoundaryBase';
import ErrorBoundaryBase from './ErrorBoundaryBase';

const ErrorBoundary = ({
  fallback,
  onError,
  children,
}: Omit<ErrorBoundaryBaseProps, 'resetQuery'>) => {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundaryBase fallback={fallback} resetQuery={reset} onError={onError}>
      {children}
    </ErrorBoundaryBase>
  );
};

export default ErrorBoundary;

```



## ErrorBoundaryBase

```tsx title="ErrorBoundaryBase.tsx"
import type { Nullable } from '@ats/interfaces';
import type { ReactElement, ReactNode } from 'react';
import { Component } from 'react';

interface ErrorBoundaryBaseState {
  hasError: boolean;
  error: Nullable<Error>;
}

export interface ErrorBoundaryFallbackParams {
  error: Error;
  resetError: () => void;
  resetErrorWithQuery: () => void;
}

export interface ErrorBoundaryBaseProps {
  fallback:
    | ReactElement
    | ((params: ErrorBoundaryFallbackParams) => ReactElement);
  children: ReactElement | ReactElement[];
  resetQuery?: () => void;
  onError?: (error: ErrorBoundaryFallbackParams) => void;
}

class ErrorBoundaryBase extends Component<
  ErrorBoundaryBaseProps,
  ErrorBoundaryBaseState
> {
  constructor(props: ErrorBoundaryBaseProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryBaseState {
    return { hasError: true, error: error };
  }

  componentDidCatch(error: Error): void {
    this.props.onError?.({
      error: error,
      resetError: this.resetError,
      resetErrorWithQuery: this.resetErrorWithQuery,
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  resetErrorWithQuery = () => {
    this.props.resetQuery?.();
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      const returnElement =
        typeof this.props.fallback === 'function'
          ? this.props.fallback?.({
              error: this.state.error,
              resetError: this.resetError,
              resetErrorWithQuery: this.resetErrorWithQuery,
            })
          : this.props.fallback;

      if (!returnElement) {
        return this.props.children;
      }

      return returnElement;
    }

    return this.props.children;
  }
}
export default ErrorBoundaryBase;

```

1. 에러 발생 시 `getDerivedStateFromError`를 호출한다.

   hasError를 true로 설정하고, error에 에러 객체를 저장하여 상태를 업데이트 시킨다.

2. `componentDidCatch` 메서드가 호출된다.

   onError 콜백함수로 error, resetError, resetErrorWithQuery를 전달한다. 외부에서 onError를 설정하는 경우 이 파라미터들로 각 에러처리, 로깅 등을 수행한다.

   > 프로젝트에서는 onError props를 전달한 적이 없다. 에러 발생 시 권한이 없는 경우 로그인 페이지로 보내거나 없는 경로로 접속 시 이전 페이지로 보내는 등 경로 자체를 바꾸는 식으로만 사용하고 있었다.

3. `render` 메서드가 실행된다.

   fallback이 콜백함수일 경우 error, resetError, resetErrorWithQuery를 콜백함수에서 사용할 수 있다.

   fallback 콜백함수에서 에러별 처리, 에러를 reset, 에러 쿼리를 reset하는 등의 동작을 취할 수 있다.

   > 일부 method 이름은 리액트의 라이프사이클 메서드라서 다른 것으로 변경 시 동작이 되지 않는 것이 있기 때문에 주의해야 한다.



## NotFoundErrorBoundary

```tsx title="NotFoundErrorBoundary.tsx"
interface Props {
  children: ReactElement;
  goBackUrl?: string;
}

const NotFoundErrorBoundary = ({ children, goBackUrl }: Props) => {
  return (
    <ErrorBoundary
      fallback={({ error }) => {
        if (!(getErrorType(error) === CUSTOM_ERROR_TYPE.NOT_FOUND)) {
          throw error;
        }

        return <NotFoundErrorFallback goBackUrl={goBackUrl} />;
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default NotFoundErrorBoundary;

```



## UnknownErrorBoundary

```tsx title="UnknownErrorBoundary.tsx"
interface Props {
  children: ReactElement;
  goBackUrl?: string;
}

const UnknownErrorBoundary = ({ children, goBackUrl }: Props) => {
  return (
    <ErrorBoundary
      fallback={({ error }) => {
        if (!(getErrorType(error) === CUSTOM_ERROR_TYPE.UNKNOWN)) {
          throw error;
        }

        return <UnknownErrorFallback goBackUrl={goBackUrl} />;
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default UnknownErrorBoundary;

```

