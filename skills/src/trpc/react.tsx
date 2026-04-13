'use client'

import { type QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchStreamLink, loggerLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { useState } from 'react'
import SuperJson from 'superjson'

import type { AppRouter } from '@/server/api/root'
import { createQueryClient } from './query-client'

const CLIENT_QUERY_CLIENT_SINGLETON: QueryClient | undefined = undefined

let clientQueryClientSingleton: QueryClient | undefined = CLIENT_QUERY_CLIENT_SINGLETON

const getQueryClient = (): QueryClient => {
  if (typeof window !== 'undefined') {
    clientQueryClientSingleton ??= createQueryClient()
    return clientQueryClientSingleton
  }
  return createQueryClient()
}

export const api = createTRPCReact<AppRouter>()

export type RouterInputs = inferRouterInputs<AppRouter>

export type RouterOutputs = inferRouterOutputs<AppRouter>

const isDevelopment = process.env.NODE_ENV === 'development'

const createLoggerLink = () =>
  loggerLink({
    enabled: (operation) =>
      isDevelopment && operation.direction === 'down' && operation.result instanceof Error,
  })

const createHeaders = (): Headers => {
  const headers = new Headers()
  headers.set('x-trpc-source', 'nextjs-react')
  return headers
}

const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  const DEFAULT_PORT = 3000
  return `http://localhost:${process.env.PORT ?? DEFAULT_PORT}`
}

const createTrpcClient = () =>
  api.createClient({
    links: [
      createLoggerLink(),
      httpBatchStreamLink({
        headers: createHeaders,
        transformer: SuperJson,
        url: `${getApiBaseUrl()}/api/trpc`,
      }),
    ],
  })

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient()
  const [trpcClient] = useState(createTrpcClient)

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </api.Provider>
    </QueryClientProvider>
  )
}
