import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { detail, me, mockApi, readyInstance, summary, version } from '../test/api';
import { renderApp } from '../test/render';

// xterm needs a real browser (canvas).
vi.mock('../components/TerminalPanel', () => ({
  TerminalPanel: ({ machine }: { machine: string }) => <div>terminal on {machine}</div>,
}));

afterEach(() => vi.restoreAllMocks());

describe('signed out', () => {
  it('sends to the login page, then to the catalog', async () => {
    let signedIn = false;
    const requests = mockApi({
      'GET /api/v1/version': [200, version],
      'GET /api/v1/me': () => (signedIn ? [200, me] : [401, { error: 'sign in first' }]),
      'POST /api/v1/auth/login': () => {
        signedIn = true;
        return [200, me];
      },
      'GET /api/v1/challenges': [200, [summary]],
    });
    renderApp('/');
    expect(await screen.findByRole('heading', { name: 'Sign in to opslab' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Username/), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'pw' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Leaky home directory')).toBeInTheDocument();
    const login = requests.find((r) => r.url.endsWith('/api/v1/auth/login'))!;
    expect(await login.json()).toEqual({ username: 'admin', password: 'pw' });
  });

  it('explains a wrong password', async () => {
    mockApi({
      'GET /api/v1/me': [401, { error: 'sign in first' }],
      'POST /api/v1/auth/login': [401, { error: 'sign in first' }],
    });
    renderApp('/login');
    fireEvent.change(await screen.findByLabelText(/Username/), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'nope' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Wrong username or password.')).toBeInTheDocument();
  });
});

describe('catalog', () => {
  it('lists challenges with progress and the score', async () => {
    mockApi({
      'GET /api/v1/version': [200, version],
      'GET /api/v1/me': [200, me],
      'GET /api/v1/challenges': [
        200,
        [
          summary,
          {
            ...summary,
            name: 'x',
            title: 'Not here',
            runnable: false,
            unrunnableReason: 'needs KVM',
          },
        ],
      ],
    });
    renderApp('/');
    expect(await screen.findByText('Leaky home directory')).toBeInTheDocument();
    expect(screen.getAllByText('1/3 tasks')).toHaveLength(2);
    expect(screen.getByText('15 pts')).toBeInTheDocument();
    expect(screen.getByText('Not runnable here: needs KVM')).toBeInTheDocument();
    expect(screen.getByText('opslab 0.1.0')).toBeInTheDocument();
  });
});

describe('challenge page', () => {
  it('starts an instance', async () => {
    const requests = mockApi({
      'GET /api/v1/me': [200, me],
      'GET /api/v1/challenges/leaky-home': [200, detail],
      'GET /api/v1/instances': [200, []],
      'POST /api/v1/instances': [
        201,
        { ...readyInstance, phase: 'Provisioning', message: 'box: starting' },
      ],
    });
    renderApp('/challenges/leaky-home');
    expect(await screen.findByRole('heading', { name: 'Leaky home' })).toBeInTheDocument();
    expect(screen.getByText('Protect the SSH key')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(await screen.findByText('Provisioning')).toBeInTheDocument();
    expect(screen.getByText('box: starting')).toBeInTheDocument();
    const start = requests.find((r) => r.method === 'POST')!;
    expect(await start.json()).toEqual({ challenge: 'leaky-home' });
  });

  it('opens terminals and checks a ready instance', async () => {
    const requests = mockApi({
      'GET /api/v1/me': [200, me],
      'GET /api/v1/challenges/leaky-home': [200, detail],
      'GET /api/v1/instances': [200, [readyInstance]],
      'GET /api/v1/instances/leaky-home-1234/checks': [
        200,
        {
          id: 'c1',
          instance: readyInstance.id,
          phase: 'Completed',
          message: null,
          newlySolved: [],
          results: [
            { task: 'ssh-key', passed: true, message: 'mode 0600' },
            { task: 'env-file', passed: false, message: '.env has mode 0644, expected 0600' },
          ],
        },
      ],
      'POST /api/v1/instances/leaky-home-1234/checks': [
        202,
        {
          id: 'c2',
          instance: readyInstance.id,
          phase: 'Pending',
          message: null,
          newlySolved: [],
          results: [],
        },
      ],
    });
    renderApp('/challenges/leaky-home');
    expect(await screen.findByText('terminal on box')).toBeInTheDocument();
    expect(await screen.findByText('.env has mode 0644, expected 0600')).toBeInTheDocument();
    expect(screen.getByText('1/2 tasks pass')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Check my work' }));
    await waitFor(() => expect(requests.some((r) => r.method === 'POST')).toBe(true));
  });

  it('asks before stopping', async () => {
    const requests = mockApi({
      'GET /api/v1/me': [200, me],
      'GET /api/v1/challenges/leaky-home': [200, detail],
      'GET /api/v1/instances': [200, [readyInstance]],
      'GET /api/v1/instances/leaky-home-1234/checks': [200, null],
      'DELETE /api/v1/instances/leaky-home-1234': [204, null],
    });
    renderApp('/challenges/leaky-home');
    fireEvent.click(await screen.findByRole('button', { name: 'Stop' }));
    expect(await screen.findByText(/Everything in the environment is deleted/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Stop and delete' }));
    expect(await screen.findByRole('button', { name: 'Start' })).toBeInTheDocument();
    expect(requests.some((r) => r.method === 'DELETE')).toBe(true);
  });
});

describe('routing', () => {
  it('renders unknown paths inside the layout', async () => {
    mockApi({ 'GET /api/v1/me': [200, me], 'GET /api/v1/version': [200, version] });
    renderApp('/does-not-exist');
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Challenges' })).toBeInTheDocument();
  });
});
