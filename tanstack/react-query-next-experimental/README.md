# tanstack/react-query-next-experimental

@tanstack/react-query-next-experimental is an experimental package that provides an integration for using Suspense on the Server with TanStack Query in Next.js applications, particularly within the App Router.
Its primary purpose is to enable server-side data fetching and streaming of results to the client, allowing for a more seamless and performant user experience.
Key functionalities include:
Server-Side Data Fetching:
It allows you to fetch data on the server within your client components by using useSuspenseQuery or useQuery with suspense: true.
Streaming with Suspense Boundaries:

## Results are streamed from the server to the client as Suspense Boundaries resolve, which can improve perceived loading times.
Integration with Next.js App Router:

## tanstack/react-query-next-experimental is specifically designed to work with the Next.js App Router, facilitating server-side rendering and hydration of data.
In essence, it enhances the capabilities of TanStack Query within Next.js by leveraging server-side rendering and Suspense to optimize data fetching and delivery.

### This package will allow you to fetch data on the server (in a Client Component) by just calling useSuspenseQuery in your component. Results will then be streamed from the server to the client as SuspenseBoundaries resolve. If you call useSuspenseQuery without wrapping it in a <Suspense> boundary, the HTML response won't start until the fetch resolves. This can be when you want depending on the situation, but keep in mind that this will hurt your TTFB.

To achieve this, wrap your app in the ReactQueryStreamedHydration component:

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


For more information, see the next-streaming-example folder.
