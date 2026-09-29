/** A single employee record as stored and displayed. */
export interface Employee {
  id: string;
  name: string;
  department: string;
  designation: string;
  email: string;
  status: 'active' | 'inactive';
}

/** The editable fields of an employee (everything except the generated id). */
export type EmployeeInput = Omit<Employee, 'id'>;
