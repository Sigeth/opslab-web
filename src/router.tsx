import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';

import { AppLayout } from './components/AppLayout';
import { CatalogPage } from './pages/CatalogPage';
import { ChallengePage } from './pages/ChallengePage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Every page is a child of the root route, so it renders inside AppLayout.
const rootRoute = createRootRoute({ component: AppLayout, notFoundComponent: NotFoundPage });

const catalogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: CatalogPage,
});
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});
const challengeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/challenges/$name',
  component: ChallengePage,
});

export const routeTree = rootRoute.addChildren([catalogRoute, loginRoute, challengeRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
