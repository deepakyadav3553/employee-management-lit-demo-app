import {LitElement, html, css, PropertyValues} from 'lit';
import {customElement, state, query} from 'lit/decorators.js';
import '../app-root';
import '../components/ui/app-toast';
import type {AppRoot} from '../app-root';
import type {FieldChangeDetail} from '../components/employee/employee-form';
import type {PageChangeDetail} from '../components/ui/app-pagination';
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

@customElement('app-shell')
export class AppShell extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      color: #1f2933;
      background: #eef1f6;
    }

    .topbar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 32px;
      background: #0f172a;
      color: #f8fafc;
    }

    .brand-mark {
      flex: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(115deg, #3b6fe0 0%, #4f46e5 100%);
      font-size: 15px;
      font-weight: 700;
    }

    .brand-name {
      font-size: 16px;
      font-weight: 700;
      line-height: 1.2;
    }

    .brand-tag {
      font-size: 12px;
      color: rgba(203, 213, 225, 0.7);
    }

    .content {
      flex: 1;
      padding: 40px 20px;
      box-sizing: border-box;
    }

    @media (max-width: 640px) {
      .topbar {
        padding: 14px 20px;
      }

      .content {
        padding: 24px 16px;
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
  @query('app-toast') private toast!: AppToast;
  @query('app-root') private appRoot!: AppRoot;

  override connectedCallback(): void {
    super.connectedCallback();
    this.employees = this.loadEmployees();
  }

  override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('employees')) {
      const maxPage = Math.max(1, Math.ceil(this.employees.length / PAGE_SIZE));
      if (this.page > maxPage) this.page = maxPage;
    }
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
      // localStorage may be unavailable; the app still works in-memory
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
    this.appRoot?.focusFirstField();
  }

  override render() {
    const total = this.employees.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const page = Math.min(this.page, totalPages);
    const start = (page - 1) * PAGE_SIZE;
    const pageItems = this.employees.slice(start, start + PAGE_SIZE);
    const hasErrors = Object.keys(this.errors).length > 0;
    const disableSubmit =
      hasErrors || draftsEqual(this.draft, this.originalDraft);

    return html`
      <header class="topbar">
        <span class="brand-mark">HR</span>
        <div>
          <div class="brand-name">HR Portal</div>
          <div class="brand-tag">Employee Management</div>
        </div>
      </header>
      <main class="content">
        <app-root
          .draft=${this.draft}
          .errors=${this.errors}
          .isEditing=${this.editing !== null}
          .disableSubmit=${disableSubmit}
          .pageItems=${pageItems}
          .total=${total}
          .page=${page}
          .totalPages=${totalPages}
          .rangeStart=${total === 0 ? 0 : start + 1}
          .rangeEnd=${start + pageItems.length}
          .confirmOpen=${this.pendingDelete !== null}
          .confirmHighlight=${this.pendingDelete ? `${this.pendingDelete.name}?` : ''}
          @field-change=${this.handleFieldChange}
          @form-submit=${this.handleFormSubmit}
          @form-clear=${this.handleFormClear}
          @employee-edit=${this.handleEdit}
          @employee-delete=${this.handleDelete}
          @employee-add-request=${this.handleAddRequest}
          @add-dummies=${this.addDummyRecords}
          @page-change=${this.handlePageChange}
          @modal-confirm=${this.confirmDelete}
          @modal-cancel=${this.cancelDelete}
        ></app-root>
      </main>
      <app-toast></app-toast>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-shell': AppShell;
  }
}
