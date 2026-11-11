import { useQuery } from '@tanstack/react-query';

import { api } from './client';

/** Version of the running api. */
export function useVersion() {
  return useQuery({
    queryKey: ['version'],
    queryFn: async () => {
      const { data, response } = await api.GET('/api/v1/version');
      if (!data) {
        throw new Error(`GET /api/v1/version: ${response.status}`);
      }
      return data;
    },
  });
}
