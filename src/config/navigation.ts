import type {NavItem} from '../types/navigation.types';

/** Application navigation entries, rendered by the top bar and sidebar. */
export const NAV_ITEMS: readonly NavItem[] = [
  {id: 'home', label: 'Home'},
  {id: 'employees', label: 'Employees'},
  {id: 'departments', label: 'Departments'},
  {id: 'reports', label: 'Reports'},
];
