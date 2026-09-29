/**
 * Route definitions. Route ids intentionally match the navigation item ids in
 * config/navigation.ts, so a nav click maps straight to a route.
 */
export type RouteId = 'home' | 'employees' | 'departments' | 'reports';

/** Route used on first load and as the fallback for unknown URLs. */
export const DEFAULT_ROUTE: RouteId = 'home';

const KNOWN_ROUTES: readonly RouteId[] = [
  'home',
  'employees',
  'departments',
  'reports',
];

/** Parse a location hash (e.g. "#/employees") into a known route id. */
export function parseRouteFromHash(hash: string): RouteId {
  const id = hash.replace(/^#\/?/, '');
  return (KNOWN_ROUTES as readonly string[]).includes(id)
    ? (id as RouteId)
    : DEFAULT_ROUTE;
}

/** Build the location hash for a route id (e.g. "employees" -> "#/employees"). */
export function buildHash(id: string): string {
  return `#/${id}`;
}
