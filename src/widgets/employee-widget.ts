import {LitElement, html, css, nothing, PropertyValues} from 'lit';
import {customElement, state, query} from 'lit/decorators.js';
import '../components/employee/employee-form';
import '../components/employee/employee-table';
import '../components/ui/confirm-modal';
import '../components/ui/app-toast';
import '../components/ui/app-search';
import type {EmployeeForm, FieldChangeDetail} from '../components/employee/employee-form';
import type {PageChangeDetail} from '../components/ui/app-pagination';
import type {SearchChangeDetail} from '../components/ui/app-search';
import type {AppToast} from '../components/ui/app-toast';
import {
  Employee,
  EmployeeDraft,
  EmployeeDraftErrors,
  draftsEqual,
  emptyDraft,
  validateEmployeeDraft,
} from '../models/employee';

const STORAGE_KEY = 'employee-management:employees';
const PAGE_SIZE = 5;

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `emp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

@customElement('employee-widget')
export class EmployeeWidget extends LitElement {
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

    .table-toolbar {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 16px;
    }

    .table-toolbar app-search {
      width: 100%;
      max-width: 320px;
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

      .table-toolbar app-search {
        max-width: none;
      }
    }
  `;

  @state() employees: Employee[] = [];
  @state() private editing: Employee | null = null;
  @state() private pendingDelete: Employee | null = null;
  @state() private draft: EmployeeDraft = emptyDraft();
  @state() private originalDraft: EmployeeDraft = emptyDraft();
  @state() private errors: EmployeeDraftErrors = {};
  @state() private page = 1;
  @state() private query = '';
  @query('app-toast') private toast!: AppToast;
  @query('employee-form') private employeeForm!: EmployeeForm;

  override connectedCallback(): void {
    super.connectedCallback();
    this.employees = this.loadEmployees();
  }

  override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('employees')) {
      const maxPage = Math.max(
        1,
        Math.ceil(this.visibleEmployees.length / PAGE_SIZE)
      );
      if (this.page > maxPage) this.page = maxPage;
    }
  }

  private get visibleEmployees(): Employee[] {
    const query = this.query.trim().toLowerCase();
    if (!query) return this.employees;
    return this.employees.filter((employee) =>
      Object.entries(employee)
        .filter(([field]) => field !== 'id')
        .some(([, value]) => String(value).toLowerCase().includes(query))
    );
  }

  private loadEmployees(): Employee[] {
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

  private persistEmployees(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.employees));
    } catch {
      return;
    }
  }

  private resetForm(): void {
    this.editing = null;
    this.draft = emptyDraft();
    this.originalDraft = emptyDraft();
    this.errors = {};
  }

  private handleFieldChange(event: CustomEvent<FieldChangeDetail>): void {
    const {field, value} = event.detail;
    this.draft = {...this.draft, [field]: value};
    if (this.errors[field]) {
      const {[field]: _removed, ...rest} = this.errors;
      this.errors = rest;
    }
  }

  private handleFormSubmit(): void {
    const trimmed: EmployeeDraft = {
      name: this.draft.name.trim(),
      department: this.draft.department.trim(),
      designation: this.draft.designation.trim(),
      email: this.draft.email.trim(),
    };
    const errors = validateEmployeeDraft(trimmed);
    if (Object.keys(errors).length > 0) {
      this.errors = errors;
      return;
    }

    const id = this.editing?.id ?? null;
    if (id) {
      this.employees = this.employees.map((e) =>
        e.id === id ? {id, ...trimmed} : e
      );
      this.toast.show('Employee updated successfully!', 'info');
    } else {
      this.employees = [...this.employees, {id: generateId(), ...trimmed}];
      this.toast.show('Employee added successfully!', 'success');
    }
    this.persistEmployees();
    this.resetForm();
  }

  private handleFormClear(): void {
    this.resetForm();
  }

  private handleEdit(event: CustomEvent<Employee>): void {
    const employee = event.detail;
    const {id: _id, ...rest} = employee;
    this.editing = employee;
    this.draft = {...rest};
    this.originalDraft = {...rest};
    this.errors = {};
  }

  private handleDelete(event: CustomEvent<Employee>): void {
    this.pendingDelete = event.detail;
  }

  private confirmDelete(): void {
    const employee = this.pendingDelete;
    if (!employee) return;
    this.employees = this.employees.filter((e) => e.id !== employee.id);
    this.persistEmployees();
    if (this.editing?.id === employee.id) this.resetForm();
    this.pendingDelete = null;
    this.toast.show('Employee deleted successfully!', 'error');
  }

  private cancelDelete(): void {
    this.pendingDelete = null;
  }

  private handlePageChange(event: CustomEvent<PageChangeDetail>): void {
    this.page = event.detail.page;
  }

  private handleSearchChange(event: CustomEvent<SearchChangeDetail>): void {
    this.query = event.detail.value;
    this.page = 1;
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
    this.persistEmployees();
  }

  private handleAddRequest(): void {
    this.resetForm();
    this.employeeForm?.focusFirstField();
  }

  override render() {
    const visible = this.visibleEmployees;
    const total = visible.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const page = Math.min(this.page, totalPages);
    const start = (page - 1) * PAGE_SIZE;
    const pageItems = visible.slice(start, start + PAGE_SIZE);
    const hasErrors = Object.keys(this.errors).length > 0;
    const disableSubmit =
      hasErrors || draftsEqual(this.draft, this.originalDraft);

    return html`
      <div
        class="card"
        @field-change=${this.handleFieldChange}
        @form-submit=${this.handleFormSubmit}
        @form-clear=${this.handleFormClear}
        @employee-edit=${this.handleEdit}
        @employee-delete=${this.handleDelete}
        @employee-add-request=${this.handleAddRequest}
        @add-dummies=${this.addDummyRecords}
        @page-change=${this.handlePageChange}
      >
        <header class="header">
          <div>
            <h1>Employee Management</h1>
            <p>Manage your organization employees</p>
          </div>
        </header>
        <div class="form-section">
          <employee-form
            .draft=${this.draft}
            .errors=${this.errors}
            .isEditing=${this.editing !== null}
            .disableSubmit=${disableSubmit}
          ></employee-form>
        </div>
        <div class="table-section">
          ${this.employees.length > 0
            ? html`
                <div class="table-toolbar">
                  <app-search
                    .value=${this.query}
                    placeholder="Search employees"
                    label="Search employees"
                    @search-change=${this.handleSearchChange}
                  ></app-search>
                </div>
              `
            : nothing}
          <employee-table
            .pageItems=${pageItems}
            .total=${total}
            .page=${page}
            .pageSize=${PAGE_SIZE}
            ?filtered=${this.query.trim() !== ''}
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
    'employee-widget': EmployeeWidget;
  }
}
