export interface Employee {
  id: string;
  name: string;
  department: string;
  designation: string;
  email: string;
}

export type EmployeeDraft = Omit<Employee, 'id'>;

export function emptyDraft(): EmployeeDraft {
  return {name: '', department: '', designation: '', email: ''};
}

export const DEPARTMENTS = [
  'Engineering',
  'HR',
  'Finance',
  'Marketing',
  'Sales',
  'Operations',
];
