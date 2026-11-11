import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { api } from './client';
import type { components } from './schema';

export type Me = components['schemas']['Me'];
export type ChallengeSummary = components['schemas']['ChallengeSummary'];
export type ChallengeDetail = components['schemas']['ChallengeDetail'];
export type Instance = components['schemas']['InstanceView'];
export type CheckRun = components['schemas']['CheckRunView'];
export type ApiEvent = components['schemas']['Event'];

/** Error thrown by the hooks, with the api's message. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

function fail(response: Response, error: unknown): never {
  const message =
    error && typeof error === 'object' && 'error' in error && typeof error.error === 'string'
      ? error.error
      : `${response.status} ${response.statusText}`;
  throw new ApiError(response.status, message);
}

const keys = {
  version: ['version'],
  me: ['me'],
  challenges: ['challenges'],
  challenge: (name: string) => ['challenges', name],
  instances: ['instances'],
  check: (instance: string) => ['checks', instance],
};

/** Version of the running api. */
export function useVersion() {
  return useQuery({
    queryKey: keys.version,
    queryFn: async () => {
      const { data, response } = await api.GET('/api/v1/version');
      if (!data) {
        throw new Error(`GET /api/v1/version: ${response.status}`);
      }
      return data;
    },
  });
}

/** The signed-in user, or null when signed out. */
export function useMe() {
  return useQuery({
    queryKey: keys.me,
    queryFn: async (): Promise<Me | null> => {
      const { data, error, response } = await api.GET('/api/v1/me');
      if (response.status === 401) {
        return null;
      }
      return data ?? fail(response, error);
    },
  });
}

export function useLogin() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: { username: string; password: string }) => {
      const { data, error, response } = await api.POST('/api/v1/auth/login', { body });
      return data ?? fail(response, error);
    },
    onSuccess: (me) => {
      client.clear();
      client.setQueryData(keys.me, me);
    },
  });
}

export function useLogout() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.POST('/api/v1/auth/logout');
    },
    onSuccess: () => {
      client.clear();
      client.setQueryData(keys.me, null);
    },
  });
}

export function useChallenges() {
  return useQuery({
    queryKey: keys.challenges,
    queryFn: async () => {
      const { data, error, response } = await api.GET('/api/v1/challenges');
      return data ?? fail(response, error);
    },
  });
}

export function useChallenge(name: string) {
  return useQuery({
    queryKey: keys.challenge(name),
    queryFn: async () => {
      const { data, error, response } = await api.GET('/api/v1/challenges/{name}', {
        params: { path: { name } },
      });
      return data ?? fail(response, error);
    },
  });
}

/** Active instances of the user (at most one by default). */
export function useInstances() {
  return useQuery({
    queryKey: keys.instances,
    queryFn: async () => {
      const { data, error, response } = await api.GET('/api/v1/instances');
      return data ?? fail(response, error);
    },
  });
}

export function useStartInstance() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (challenge: string) => {
      const { data, error, response } = await api.POST('/api/v1/instances', {
        body: { challenge },
      });
      return data ?? fail(response, error);
    },
    onSuccess: (instance) => client.setQueryData<Instance[]>(keys.instances, [instance]),
  });
}

export function useStopInstance() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error, response } = await api.DELETE('/api/v1/instances/{id}', {
        params: { path: { id } },
      });
      if (!response.ok) {
        fail(response, error);
      }
      return id;
    },
    onSuccess: (id) => {
      client.setQueryData<Instance[]>(keys.instances, (list) => list?.filter((i) => i.id !== id));
      client.removeQueries({ queryKey: keys.check(id) });
    },
  });
}

/** Asks the api for a terminal URL (a short-lived token, so one per connection). */
export async function openTerminal(instance: string, machine: string): Promise<string> {
  const { data, error, response } = await api.POST('/api/v1/instances/{id}/terminals', {
    params: { path: { id: instance } },
    body: { machine },
  });
  return (data ?? fail(response, error)).url;
}

export function useLatestCheck(instance: string | undefined) {
  return useQuery({
    queryKey: keys.check(instance ?? ''),
    enabled: !!instance,
    queryFn: async () => {
      const { data, error, response } = await api.GET('/api/v1/instances/{id}/checks', {
        params: { path: { id: instance! } },
      });
      return data === undefined ? fail(response, error) : data;
    },
  });
}

export function useStartCheck() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (instance: string) => {
      const { data, error, response } = await api.POST('/api/v1/instances/{id}/checks', {
        params: { path: { id: instance } },
      });
      return data ?? fail(response, error);
    },
    onSuccess: (check) => client.setQueryData(keys.check(check.instance), check),
  });
}

/**
 * Keeps the cache up to date with the api's server-sent events while the
 * user is signed in, and announces solved tasks.
 */
export function useEvents(enabled: boolean) {
  const client = useQueryClient();
  useEffect(() => {
    if (!enabled || typeof EventSource === 'undefined') {
      return;
    }
    const source = new EventSource('/api/v1/events');
    source.onmessage = (message) => {
      const event = JSON.parse(message.data) as ApiEvent;
      switch (event.type) {
        case 'instance':
          client.setQueryData<Instance[]>(keys.instances, (list) => {
            const others = (list ?? []).filter((i) => i.id !== event.instance.id);
            const ended = event.instance.phase === 'Expired' || event.instance.phase === 'Failed';
            if (ended) {
              notifications.show({
                color: 'red',
                title: `Instance ${event.instance.phase.toLowerCase()}`,
                message: event.instance.message ?? 'Everything in it is lost; your score is kept.',
              });
              return others;
            }
            return [...others, event.instance];
          });
          break;
        case 'instanceDeleted':
          client.setQueryData<Instance[]>(keys.instances, (list) =>
            list?.filter((i) => i.id !== event.id),
          );
          break;
        case 'check':
          client.setQueryData(keys.check(event.check.instance), event.check);
          if (event.check.phase === 'Error') {
            notifications.show({
              color: 'red',
              title: 'Check failed',
              message: event.check.message,
            });
          }
          if (event.check.newlySolved.length > 0) {
            notifications.show({
              color: 'teal',
              title: 'Task solved!',
              message: `${event.check.newlySolved.length} new task(s) solved.`,
            });
          }
          if (event.check.phase === 'Completed') {
            void client.invalidateQueries({ queryKey: keys.challenges });
            void client.invalidateQueries({ queryKey: keys.me });
          }
          break;
      }
    };
    return () => source.close();
  }, [enabled, client]);
}
