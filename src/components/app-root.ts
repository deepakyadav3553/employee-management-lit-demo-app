import {LitElement, html, css} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import './employee-add-form';
import './employee-table';
import type {EmployeeSaveDetail} from './employee-add-form';
import {Employee} from '../types';

const STORAGE_KEY = 'employee-management:employees';

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `emp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

@customElement('app-root')
export class AppRoot extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: 'Segoe UI', system-ui, sans-serif;
      color: #1f2933;
      max-width: 900px;
      margin: 0 auto;
      padding: 1.5rem;
    }

    h1 {
      font-size: 1.6rem;
      margin: 0 0 1.5rem;
    }

    .form-section {
      padding-bottom: 1.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }
  `;

  @state() private employees: Employee[] = [];
  @state() private editing: Employee | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this.employees = this.load();
  }

  /** Read employees from localStorage; starts empty when none are stored. */
  private load(): Employee[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Employee[];
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore storage/parse errors and start with an empty list.
    }
    return [];
  }

  /** Persist the current employees to localStorage. */
  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.employees));
    } catch {
      // Storage may be unavailable; keep working with in-memory state.
    }
  }

  private handleSave(event: CustomEvent<EmployeeSaveDetail>): void {
    const {id, draft} = event.detail;
    if (id) {
      this.employees = this.employees.map((e) =>
        e.id === id ? {id, ...draft} : e
      );
    } else {
      this.employees = [...this.employees, {id: generateId(), ...draft}];
    }
    this.persist();
    this.editing = null;
  }

  private handleEdit(event: CustomEvent<Employee>): void {
    this.editing = event.detail;
  }

  private handleDelete(event: CustomEvent<Employee>): void {
    const employee = event.detail;
    if (!confirm(`Delete ${employee.name}? This cannot be undone.`)) return;
    this.employees = this.employees.filter((e) => e.id !== employee.id);
    this.persist();
    if (this.editing?.id === employee.id) this.editing = null;
  }

  private handleCancel(): void {
    this.editing = null;
  }

  private addDummyRecords(): void {
    const dummies: Employee[] = [
      {name: 'Olivia Bennett', department: 'Engineering', designation: 'Developer'},
      {name: 'Liam Carter', department: 'HR', designation: 'Manager'},
      {name: 'Sophia Nguyen', department: 'Finance', designation: 'Analyst'},
      {name: 'Noah Patel', department: 'Marketing', designation: 'Designer'},
      {name: 'Ava Rodriguez', department: 'Sales', designation: 'Coordinator'},
    ].map(({name, department, designation}) => ({
      id: generateId(),
      name,
      department,
      designation,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    }));
    this.employees = [...this.employees, ...dummies];
    this.persist();
  }

  override render() {
    return html`
      <h1>Employee Management</h1>
      <div class="form-section">
        <employee-add-form
          .editing=${this.editing}
          @employee-save=${this.handleSave}
          @form-cancel=${this.handleCancel}
        ></employee-add-form>
      </div>
      <div>
        <employee-table
          .employees=${this.employees}
          @employee-edit=${this.handleEdit}
          @employee-delete=${this.handleDelete}
          @add-dummies=${this.addDummyRecords}
        ></employee-table>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-root': AppRoot;
  }
}
