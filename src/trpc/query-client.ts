import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query';
import SuperJson from 'superjson';

const THIRTY_SECONDS_IN_MS = 30_000; // 30 seconds in milliseconds

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: THIRTY_SECONDS_IN_MS,
      },
      dehydrate: {
        serializeData: SuperJson.serialize,
        shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
      hydrate: {
        deserializeData: SuperJson.deserialize,
      },
    },
  });
