import { collectionsApi } from './api';

import { Collection, Refresh } from './types';

export function useCollections(): [Collection[] | undefined, Refresh] {
  const { collections } = collectionsApi.useQuery(undefined, {
    selectFromResult: ({ data }) => ({ collections: data })
  });
  const { refetch } = collectionsApi.useQuerySubscription(undefined);

  return [collections, refetch];
}
