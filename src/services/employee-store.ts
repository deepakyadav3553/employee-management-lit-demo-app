import type {Employee, EmployeeInput} from '../types/employee.types';

/**
 * localStorage-backed employee store.
 *
 * A tiny persistence layer that keeps the whole employee list under a single
 * key and exposes plain CRUD functions. It is framework-agnostic and has no
 * dependencies, so any component can import it. All reads/writes are guarded so
 * private-mode or quota errors degrade gracefully instead of throwing.
 */

const STORAGE_KEY = 'ems.employees';

/** Ten dummy records used to seed the store on first run. */
const SEED: Employee[] = [
  {id: 'seed-1', name: 'John Doe', department: 'engineering', designation: 'Developer', email: 'john.doe@example.com', status: 'active'},
  {id: 'seed-2', name: 'Jane Smith', department: 'hr', designation: 'HR Manager', email: 'jane.smith@example.com', status: 'active'},
  {id: 'seed-3', name: 'Mike Johnson', department: 'finance', designation: 'Analyst', email: 'mike.johnson@example.com', status: 'active'},
  {id: 'seed-4', name: 'Emily Davis', department: 'marketing', designation: 'Content Lead', email: 'emily.davis@example.com', status: 'inactive'},
  {id: 'seed-5', name: 'Chris Wilson', department: 'sales', designation: 'Sales Executive', email: 'chris.wilson@example.com', status: 'active'},
  {id: 'seed-6', name: 'Sarah Brown', department: 'engineering', designation: 'QA Engineer', email: 'sarah.brown@example.com', status: 'active'},
  {id: 'seed-7', name: 'David Lee', department: 'finance', designation: 'Accountant', email: 'david.lee@example.com', status: 'inactive'},
  {id: 'seed-8', name: 'Laura Martin', department: 'hr', designation: 'Recruiter', email: 'laura.martin@example.com', status: 'active'},
  {id: 'seed-9', name: 'Tom Clark', department: 'marketing', designation: 'SEO Specialist', email: 'tom.clark@example.com', status: 'active'},
  {id: 'seed-10', name: 'Anna White', department: 'sales', designation: 'Account Manager', email: 'anna.white@example.com', status: 'inactive'},
];

function read(): Employee[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Employee[]) : [];
  } catch {
    return [];
  }
}

function write(list: Employee[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Ignore quota / private-mode write failures.
  }
}

function makeId(): string {
  return `emp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Seed dummy data on first run. Safe to call multiple times. */
export function seedEmployeesIfEmpty(): void {
  try {
    if (localStorage.getItem(STORAGE_KEY) === null) {
      write(SEED);
    }
  } catch {
    // Storage unavailable — nothing to seed.
  }
}

/** Read all employees. */
export function getEmployees(): Employee[] {
  return read();
}

/** Read one employee by id. */
export function getEmployee(id: string): Employee | undefined {
  return read().find((e) => e.id === id);
}

/** Create a new employee and return it (with its generated id). */
export function createEmployee(input: EmployeeInput): Employee {
  const employee: Employee = {...input, id: makeId()};
  const list = read();
  list.push(employee);
  write(list);
  return employee;
}

/** Update an existing employee; returns the updated record, or undefined. */
export function updateEmployee(
  id: string,
  input: EmployeeInput
): Employee | undefined {
  const list = read();
  const index = list.findIndex((e) => e.id === id);
  if (index === -1) return undefined;
  const updated: Employee = {...list[index], ...input, id};
  list[index] = updated;
  write(list);
  return updated;
}

/** Delete an employee by id. */
export function deleteEmployee(id: string): void {
  write(read().filter((e) => e.id !== id));
}
