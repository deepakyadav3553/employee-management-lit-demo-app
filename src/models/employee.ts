export interface Employee {
  id: string;
  name: string;
  department: string;
  designation: string;
  email: string;
}

export type EmployeeDraft = Omit<Employee, 'id'>;

export type EmployeeDraftErrors = Partial<Record<keyof EmployeeDraft, string>>;

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

export function draftsEqual(a: EmployeeDraft, b: EmployeeDraft): boolean {
  return (
    a.name === b.name &&
    a.department === b.department &&
    a.designation === b.designation &&
    a.email === b.email
  );
}

export function validateEmployeeDraft(draft: EmployeeDraft): EmployeeDraftErrors {
  const errors: EmployeeDraftErrors = {};
  if (!draft.name.trim()) errors.name = 'Name is required.';
  if (!draft.department.trim()) errors.department = 'Department is required.';
  if (!draft.designation.trim())
    errors.designation = 'Designation is required.';
  if (!draft.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) {
    errors.email = 'Enter a valid email.';
  }
  return errors;
}
