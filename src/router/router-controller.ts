import type {ReactiveController, ReactiveControllerHost} from 'lit';
import {
  RouteId,
  DEFAULT_ROUTE,
  parseRouteFromHash,
  buildHash,
} from './routes';

/**
 * A hash-based router as a Lit Reactive Controller. It keeps `current` in sync
 * with the URL hash, subscribing to `hashchange` only while the host is
 * connected, and asks the host to re-render whenever the route changes.
 *
 * Usage:
 *   private router = new RouterController(this);
 *   ...this.router.current...        // read the active route
 *   this.router.go('employees');     // navigate
 */
export class RouterController implements ReactiveController {
  private readonly host: ReactiveControllerHost;

  /** The currently active route. */
  current: RouteId = DEFAULT_ROUTE;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
    this.current = parseRouteFromHash(window.location.hash);
  }

  hostConnected(): void {
    window.addEventListener('hashchange', this.handleHashChange);
    // Reflect any hash that changed before we connected.
    this.syncFromHash();
  }

  hostDisconnected(): void {
    window.removeEventListener('hashchange', this.handleHashChange);
  }

  /** Navigate to a route id. Updating the hash triggers the state sync. */
  go(id: string): void {
    const hash = buildHash(id);
    if (window.location.hash === hash) {
      this.syncFromHash();
    } else {
      window.location.hash = hash;
    }
  }

  private handleHashChange = (): void => {
    this.syncFromHash();
  };

  private syncFromHash(): void {
    const next = parseRouteFromHash(window.location.hash);
    if (next !== this.current) {
      this.current = next;
      this.host.requestUpdate();
    }
  }
}
