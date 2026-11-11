import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderApp } from '../test/render';

function mockFetch(status: number, body: unknown) {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

describe('HomePage', () => {
  afterEach(() => vi.restoreAllMocks());

  it('shows the api version', async () => {
    mockFetch(200, { name: 'opslab', version: '0.1.0' });
    renderApp('/');
    expect(await screen.findByText('opslab 0.1.0')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Welcome to opslab' })).toBeInTheDocument();
  });

  it('explains when the api is unreachable', async () => {
    mockFetch(503, {});
    renderApp('/');
    expect(await screen.findByText('The api is not reachable')).toBeInTheDocument();
  });
});

describe('routing', () => {
  it('renders unknown paths inside the layout', async () => {
    mockFetch(200, { name: 'opslab', version: '0.1.0' });
    renderApp('/does-not-exist');
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
  });
});
