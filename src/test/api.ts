import { vi } from 'vitest';

type Handler = (request: Request) => [number, unknown] | Promise<[number, unknown]>;

/**
 * Replaces fetch with fake api routes, keyed by "METHOD /path". Unknown
 * routes answer 404. Returns the requests received.
 */
export function mockApi(routes: Record<string, Handler | [number, unknown]>) {
  const requests: Request[] = [];
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const request = input instanceof Request ? input : new Request(String(input));
    requests.push(request);
    const key = `${request.method} ${new URL(request.url).pathname}`;
    const route = routes[key];
    const [status, body] =
      typeof route === 'function' ? await route(request) : (route ?? [404, { error: 'not found' }]);
    return new Response(status === 204 ? null : JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  });
  return requests;
}

export const me = { id: 'u1', username: 'admin', displayName: 'admin', role: 'admin', score: 15 };
export const version = { name: 'opslab', version: '0.1.0' };

export const summary = {
  name: 'leaky-home',
  version: '0.1.0',
  title: 'Leaky home directory',
  summary: 'Lock down secrets left readable by everyone.',
  category: 'linux-hardening',
  difficulty: 'easy',
  estimatedMinutes: 15,
  tags: [],
  points: 30,
  solvedPoints: 10,
  tasks: 3,
  solvedTasks: 1,
  runnable: true,
  unrunnableReason: null,
};

export const detail = {
  ...summary,
  instructions: '# Leaky home\n\nFix the **permissions**.',
  taskList: [
    { id: 'ssh-key', title: 'Protect the SSH key', points: 10, solved: true },
    { id: 'env-file', title: 'Hide the .env file', points: 20, solved: false },
  ],
  terminals: [{ machine: 'box', label: 'box' }],
};

export const readyInstance = {
  id: 'leaky-home-1234',
  challenge: 'leaky-home',
  phase: 'Ready',
  message: null,
  expiresAt: '2099-01-01T00:00:00Z',
  terminals: [{ machine: 'box', label: 'box' }],
};
