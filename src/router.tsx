import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';

import { AppLayout } from './components/AppLayout';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';

// Every page is a child of the root route, so it renders inside AppLayout.
const rootRoute = createRootRoute({ component: AppLayout, notFoundComponent: NotFoundPage });

const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage });

export const routeTree = rootRoute.addChildren([homeRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
