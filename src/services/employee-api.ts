import { Employee, EmployeeDraft } from '../models/employee';

const BASE_URL = 'http://localhost:8081';
const EMPLOYEES = '/employees';
const employeePath = (id: string): string => `${EMPLOYEES}/${id}`;

interface EmployeeApiRecord {
  id: number;
  name: string;
  department: string;
  designation: string;
  email: string;
}

export class ApiError extends Error {
  constructor(readonly status: number, action: string) {
    super(`Failed to ${action} (${status})`);
    this.name = 'ApiError';
  }
}

function toEmployee(record: EmployeeApiRecord): Employee {
  return {
    id: String(record.id),
    name: record.name,
    department: record.department,
    designation: record.designation,
    email: record.email
  };
}

async function send(path: string, action: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
    ...init
  });

  if (!response.ok) {
    throw new ApiError(response.status, action);
  }

  return response;
}

async function requestJson<T>(path: string, action: string, init?: RequestInit): Promise<T> {
  const response = await send(path, action, init);
  return response.json() as Promise<T>;
}

export async function fetchEmployees(): Promise<Employee[]> {
  const data = await requestJson<EmployeeApiRecord[]>(EMPLOYEES, 'load employees');
  return data.map(toEmployee);
}

export async function createEmployee(draft: EmployeeDraft): Promise<Employee> {
  const data = await requestJson<EmployeeApiRecord>(EMPLOYEES, 'create employee', {
    method: 'POST',
    body: JSON.stringify(draft)
  });
  return toEmployee(data);
}

export async function updateEmployee(id: string, draft: EmployeeDraft): Promise<Employee> {
  const data = await requestJson<EmployeeApiRecord>(employeePath(id), 'update employee', {
    method: 'PUT',
    body: JSON.stringify(draft)
  });
  return toEmployee(data);
}

export async function deleteEmployee(id: string): Promise<void> {
  await send(employeePath(id), 'delete employee', { method: 'DELETE' });
}
