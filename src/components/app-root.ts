import {LitElement, html, css} from 'lit';
import {customElement, state, query} from 'lit/decorators.js';
import './employee-add-form';
import './employee-table';
import './confirm-modal';
import './app-toast';
import type {EmployeeSaveDetail, EmployeeAddForm} from './employee-add-form';
import type {AppToast} from './app-toast';
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
    }

    .card {
      background: #fff;
      border-radius: 18px;
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.12);
      overflow: hidden;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      padding: 28px 32px;
      background: linear-gradient(115deg, #3b6fe0 0%, #4f46e5 100%);
      color: #fff;
    }

    .header h1 {
      font-size: 26px;
      font-weight: 700;
      margin: 0;
    }

    .header p {
      margin: 4px 0 0;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.85);
    }

    .form-section {
      padding: 28px 32px;
      border-bottom: 1px solid #eef2f7;
    }

    .table-section {
      padding: 20px 32px 28px;
    }

    @media (max-width: 640px) {
      .header {
        align-items: stretch;
        padding: 22px 20px;
      }

      .header h1 {
        font-size: 22px;
      }

      .form-section {
        padding: 20px;
      }

      .table-section {
        padding: 16px 20px 22px;
      }
    }
  `;

  @state() private employees: Employee[] = [];
  @state() private editing: Employee | null = null;
  @state() private pendingDelete: Employee | null = null;
  @query('app-toast') private toaster!: AppToast;
  @query('employee-add-form') private addForm!: EmployeeAddForm;

  override connectedCallback(): void {
    super.connectedCallback();
    this.employees = this.load();
  }

  private load(): Employee[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Employee[];
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      return [];
    }
    return [];
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.employees));
    } catch {
      // localStorage may be unavailable; the app still works in-memory
    }
  }

  private handleSave(event: CustomEvent<EmployeeSaveDetail>): void {
    const {id, draft} = event.detail;
    if (id) {
      this.employees = this.employees.map((e) =>
        e.id === id ? {id, ...draft} : e
      );
      this.toaster.show('Employee updated successfully!', 'info');
    } else {
      this.employees = [...this.employees, {id: generateId(), ...draft}];
      this.toaster.show('Employee added successfully!', 'success');
    }
    this.persist();
    this.editing = null;
  }

  private handleEdit(event: CustomEvent<Employee>): void {
    this.editing = event.detail;
  }

  private handleDelete(event: CustomEvent<Employee>): void {
    this.pendingDelete = event.detail;
  }

  private confirmDelete(): void {
    const employee = this.pendingDelete;
    if (!employee) return;
    this.employees = this.employees.filter((e) => e.id !== employee.id);
    this.persist();
    if (this.editing?.id === employee.id) this.editing = null;
    this.pendingDelete = null;
    this.toaster.show('Employee deleted successfully!', 'error');
  }

  private cancelDelete(): void {
    this.pendingDelete = null;
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

  private handleAddClick(): void {
    this.editing = null;
    this.addForm?.focusFirst();
  }

  override render() {
    return html`
      <div class="card">
        <header class="header">
          <div>
            <h1>Employee Management</h1>
            <p>Manage your organization employees</p>
          </div>
        </header>
        <div class="form-section">
          <employee-add-form
            .editing=${this.editing}
            @employee-save=${this.handleSave}
            @form-cancel=${this.handleCancel}
          ></employee-add-form>
        </div>
        <div class="table-section">
          <employee-table
            .employees=${this.employees}
            @employee-edit=${this.handleEdit}
            @employee-delete=${this.handleDelete}
            @employee-add-request=${this.handleAddClick}
            @add-dummies=${this.addDummyRecords}
          ></employee-table>
        </div>
      </div>
      <confirm-modal
        ?open=${this.pendingDelete !== null}
        heading="Delete Employee"
        message="Are you sure you want to delete"
        highlight=${this.pendingDelete ? `${this.pendingDelete.name}?` : ''}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        @modal-confirm=${this.confirmDelete}
        @modal-cancel=${this.cancelDelete}
      ></confirm-modal>
      <app-toast></app-toast>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-root': AppRoot;
  }
}
