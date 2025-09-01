---
id: suspense
title: Suspense
---

React Query can also be used with React's Suspense for Data Fetching APIs. For this, we have dedicated hooks:

- [useSuspenseQuery](../../reference/useSuspenseQuery.md)
- [useSuspenseInfiniteQuery](../../reference/useSuspenseInfiniteQuery.md)
- [useSuspenseQueries](../../reference/useSuspenseQueries.md)
- Additionally, you can use the `useQuery().promise` and `React.use()` (Experimental)

When using suspense mode, `status` states and `error` objects are not needed and are then replaced by usage of the `React.Suspense` component (including the use of the `fallback` prop and React error boundaries for catching errors). Please read the [Resetting Error Boundaries](#resetting-error-boundaries) and look at the [Suspense Example](../../examples/suspense) for more information on how to set up suspense mode.

If you want mutations to propagate errors to the nearest error boundary (similar to queries), you can set the `throwOnError` option to `true` as well.

Enabling suspense mode for a query:

```tsx
import { useSuspenseQuery } from '@tanstack/react-query'

const { data } = useSuspenseQuery({ queryKey, queryFn })
```

This works nicely in TypeScript, because `data` is guaranteed to be defined (as errors and loading states are handled by Suspense- and ErrorBoundaries).

On the flip side, you therefore can't conditionally enable / disable the Query. This generally shouldn't be necessary for dependent Queries because with suspense, all your Queries inside one component are fetched in serial.

`placeholderData` also doesn't exist for this Query. To prevent the UI from being replaced by a fallback during an update, wrap your updates that change the QueryKey into [startTransition](https://react.dev/reference/react/Suspense#preventing-unwanted-fallbacks).

### throwOnError default

Not all errors are thrown to the nearest Error Boundary per default - we're only throwing errors if there is no other data to show. That means if a Query ever successfully got data in the cache, the component will render, even if data is `stale`. Thus, the default for `throwOnError` is:

```
throwOnError: (error, query) => typeof query.state.data === 'undefined'
```

Since you can't change `throwOnError` (because it would allow for `data` to become potentially `undefined`), you have to throw errors manually if you want all errors to be handled by Error Boundaries:

```tsx
import { useSuspenseQuery } from '@tanstack/react-query'

const { data, error, isFetching } = useSuspenseQuery({ queryKey, queryFn })

if (error && !isFetching) {
  throw error
}

// continue rendering data
```

## Resetting Error Boundaries

Whether you are using **suspense** or **throwOnError** in your queries, you will need a way to let queries know that you want to try again when re-rendering after some error occurred.

Query errors can be reset with the `QueryErrorResetBoundary` component or with the `useQueryErrorResetBoundary` hook.

When using the component it will reset any query errors within the boundaries of the component:

```tsx
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

const App = () => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
      <ErrorBoundary
        onReset={reset}
        fallbackRender={({ resetErrorBoundary }) => (
          <div>
            There was an error!
            <Button onClick={() => resetErrorBoundary()}>Try again</Button>
          </div>
        )}
      >
        <Page />
      </ErrorBoundary>
    )}
  </QueryErrorResetBoundary>
)
```

When using the hook it will reset any query errors within the closest `QueryErrorResetBoundary`. If there is no boundary defined it will reset them globally:

```tsx
import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

const App = () => {
  const { reset } = useQueryErrorResetBoundary()
  return (
    <ErrorBoundary
      onReset={reset}
      fallbackRender={({ resetErrorBoundary }) => (
        <div>
          There was an error!
          <Button onClick={() => resetErrorBoundary()}>Try again</Button>
        </div>
      )}
    >
      <Page />
    </ErrorBoundary>
  )
}
```

## Fetch-on-render vs Render-as-you-fetch

Out of the box, React Query in `suspense` mode works really well as a **Fetch-on-render** solution with no additional configuration. This means that when your components attempt to mount, they will trigger query fetching and suspend, but only once you have imported them and mounted them. If you want to take it to the next level and implement a **Render-as-you-fetch** model, we recommend implementing [Prefetching](../prefetching.md) on routing callbacks and/or user interactions events to start loading queries before they are mounted and hopefully even before you start importing or mounting their parent components.

## Suspense on the Server with streaming

If you are using `NextJs`, you can use our **experimental** integration for Suspense on the Server: `@tanstack/react-query-next-experimental`. This package will allow you to fetch data on the server (in a client component) by just calling `useSuspenseQuery` in your component. Results will then be streamed from the server to the client as SuspenseBoundaries resolve.

To achieve this, wrap your app in the `ReactQueryStreamedHydration` component:

```tsx
// app/providers.tsx
'use client'

import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import * as React from 'react'
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export function Providers(props: { children: React.ReactNode }) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryStreamedHydration>
        {props.children}
      </ReactQueryStreamedHydration>
    </QueryClientProvider>
  )
}
```

For more information, check out the [NextJs Suspense Streaming Example](../../examples/nextjs-suspense-streaming) and the [Advanced Rendering & Hydration](../advanced-ssr.md) guide.



---
id: QueryErrorResetBoundary
title: QueryErrorResetBoundary
---

When using **suspense** or **throwOnError** in your queries, you need a way to let queries know that you want to try again when re-rendering after some error occurred. With the `QueryErrorResetBoundary` component you can reset any query errors within the boundaries of the component.

```tsx
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

const App = () => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
      <ErrorBoundary
        onReset={reset}
        fallbackRender={({ resetErrorBoundary }) => (
          <div>
            There was an error!
            <Button onClick={() => resetErrorBoundary()}>Try again</Button>
          </div>
        )}
      >
        <Page />
      </ErrorBoundary>
    )}
  </QueryErrorResetBoundary>
)
```



---
id: useQueryErrorResetBoundary
title: useQueryErrorResetBoundary
---

This hook will reset any query errors within the closest `QueryErrorResetBoundary`. If there is no boundary defined it will reset them globally:

```tsx
import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

const App = () => {
  const { reset } = useQueryErrorResetBoundary()
  return (
    <ErrorBoundary
      onReset={reset}
      fallbackRender={({ resetErrorBoundary }) => (
        <div>
          There was an error!
          <Button onClick={() => resetErrorBoundary()}>Try again</Button>
        </div>
      )}
    >
      <Page />
    </ErrorBoundary>
  )
}
```

## Using `useQuery().promise` and `React.use()` (Experimental)

> To enable this feature, you need to set the `experimental_prefetchInRender` option to `true` when creating your `QueryClient`

**Example code:**

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      experimental_prefetchInRender: true,
    },
  },
})
```

**Usage:**

```tsx
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchTodos, type Todo } from './api'

function TodoList({ query }: { query: UseQueryResult<Todo[]> }) {
  const data = React.use(query.promise)

  return (
    <ul>
      {data.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}

export function App() {
  const query = useQuery({ queryKey: ['todos'], queryFn: fetchTodos })

  return (
    <>
      <h1>Todos</h1>
      <React.Suspense fallback={<div>Loading...</div>}>
        <TodoList query={query} />
      </React.Suspense>
    </>
  )
}
```

For a more complete example, see [suspense example on GitHub](https://github.com/TanStack/query/tree/main/examples/react/suspense).

For a Next.js streaming example, see under:

// Src/app/api/wait/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const wait = Number(searchParams.get('wait'))

  await new Promise((resolve) => setTimeout(resolve, wait))

  return NextResponse.json(`waited ${wait}ms`)
}

// srx/app/laoyout.tsx

import { Providers } from './providers'

export const metadata = {
  title: 'Next.js',
  description: 'Generated by Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}



// srx/app/providers.tsx
'use client'

import {
  QueryClient,
  QueryClientProvider,
  isServer,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import * as React from 'react'
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) {
    return makeQueryClient()
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export function Providers(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryStreamedHydration>
        {props.children}
      </ReactQueryStreamedHydration>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

//src/app/page.tsx

```tsx
'use client'
import { isServer, useSuspenseQuery } from '@tanstack/react-query'
import { Suspense } from 'react'

export const runtime = 'edge' // 'nodejs' (default) | 'edge'

function getBaseURL() {
  if (!isServer) {
    return ''
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'http://localhost:3000'
}
const baseUrl = getBaseURL()
function useWaitQuery(props: { wait: number }) {
  const query = useSuspenseQuery({
    queryKey: ['wait', props.wait],
    queryFn: async () => {
      const path = `/api/wait?wait=${props.wait}`
      const url = baseUrl + path

      const res: string = await (
        await fetch(url, {
          cache: 'no-store',
        })
      ).json()
      return res
    },
  })

  return [query.data as string, query] as const
}

function MyComponent(props: { wait: number }) {
  const [data] = useWaitQuery(props)

  return <div>result: {data}</div>
}

export default function MyPage() {
  return (
    <>
      <Suspense fallback={<div>waiting 100....</div>}>
        <MyComponent wait={100} />
      </Suspense>
      <Suspense fallback={<div>waiting 200....</div>}>
        <MyComponent wait={200} />
      </Suspense>
      <Suspense fallback={<div>waiting 300....</div>}>
        <MyComponent wait={300} />
      </Suspense>
      <Suspense fallback={<div>waiting 400....</div>}>
        <MyComponent wait={400} />
      </Suspense>
      <Suspense fallback={<div>waiting 500....</div>}>
        <MyComponent wait={500} />
      </Suspense>
      <Suspense fallback={<div>waiting 600....</div>}>
        <MyComponent wait={600} />
      </Suspense>
      <Suspense fallback={<div>waiting 700....</div>}>
        <MyComponent wait={700} />
      </Suspense>

      <fieldset>
        <legend>
          combined <code>Suspense</code>-container
        </legend>
        <Suspense
          fallback={
            <>
              <div>waiting 800....</div>
              <div>waiting 900....</div>
              <div>waiting 1000....</div>
            </>
          }
        >
          <MyComponent wait={800} />
          <MyComponent wait={900} />
          <MyComponent wait={1000} />
        </Suspense>
      </fieldset>
    </>
  )
}
```

