import {Employee, EmployeeDraft} from '../models/employee';

const BASE_URL = 'http://localhost:8081';

function normalize(raw: unknown): Employee {
  const record = raw as Record<string, unknown>;
  return {
    id: String(record.id ?? ''),
    name: String(record.name ?? ''),
    department: String(record.department ?? ''),
    designation: String(record.designation ?? ''),
    email: String(record.email ?? ''),
  };
}

/**
 * Fetches the saved employee records from the backend and normalizes them
 * to the shape used across the UI (string ids, no missing fields).
 */
export async function fetchEmployees(): Promise<Employee[]> {
  const response = await fetch(`${BASE_URL}/employees`);
  if (!response.ok) {
    throw new Error(`Failed to load employees (${response.status})`);
  }
  const data = (await response.json()) as unknown;
  if (!Array.isArray(data)) return [];
  return data.map(normalize);
}

/** Creates a new employee record and returns the saved entity. */
export async function createEmployee(draft: EmployeeDraft): Promise<Employee> {
  const response = await fetch(`${BASE_URL}/employees`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(draft),
  });
  if (!response.ok) {
    throw new Error(`Failed to create employee (${response.status})`);
  }
  return normalize(await response.json());
}

/** Updates an existing employee record and returns the saved entity. */
export async function updateEmployee(
  id: string,
  draft: EmployeeDraft
): Promise<Employee> {
  const response = await fetch(`${BASE_URL}/employees/${id}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(draft),
  });
  if (!response.ok) {
    throw new Error(`Failed to update employee (${response.status})`);
  }
  return normalize(await response.json());
}

/** Deletes an employee record by id. */
export async function deleteEmployee(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/employees/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete employee (${response.status})`);
  }
}
