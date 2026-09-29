/** A single navigation entry shared by the top bar and the sidebar. */
export interface NavItem {
  id: string;
  label: string;
}

/** Payload emitted when a nav entry is selected. */
export interface NavSelectDetail {
  id: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  {id: 'home', label: 'Home'},
  {id: 'employees', label: 'Employees'},
  {id: 'departments', label: 'Departments'},
  {id: 'reports', label: 'Reports'},
];
