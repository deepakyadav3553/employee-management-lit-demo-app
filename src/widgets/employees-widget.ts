import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { widgetCardStyles } from '../styles/widget-card.styles';
import { buildHash } from '../router/routes';
import '../components/ui/app-button';
import '../components/ui/app-input';
import '../components/ui/app-select';
import '../components/ui/app-toggle';
import '../components/ui/app-table';
import '../components/ui/app-pagination';
import type { InputChangeDetail } from '../components/ui/app-input';
import type { SelectOption } from '../components/ui/app-select';
import type { ToggleChangeDetail } from '../components/ui/app-toggle';
import type { TableColumn } from '../components/ui/app-table';
import type { PageChangeDetail } from '../components/ui/app-pagination';
import type { Employee, EmployeeInput } from '../types/employee.types';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  addDummyEmployees
} from '../services/employee-store';

/** An empty draft used to reset the form. */
const EMPTY_DRAFT: EmployeeInput = {
  name: '',
  department: '',
  designation: '',
  email: '',
  status: 'active'
};

/** Departments available in the dropdown. */
const DEPARTMENTS: SelectOption[] = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'hr', label: 'HR' },
  { value: 'finance', label: 'Finance' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' }
];

/** Map a department value back to its display label. */
function departmentLabel(value: string): string {
  return DEPARTMENTS.find(d => d.value === value)?.label ?? value;
}

/** Small inline-styled badge for the status cell (table is style-isolated). */
function statusBadge(status: Employee['status']) {
  const active = status === 'active';
  const style = `
    display:inline-block;
    padding:3px 10px;
    border-radius:999px;
    font-size:12px;
    font-weight:600;
    color:${active ? '#166534' : '#991b1b'};
    background:${active ? '#dcfce7' : '#fee2e2'};
  `;
  return html`<span style=${style}>${active ? 'Active' : 'Inactive'}</span>`;
}

/**
 * Employees widget — owns the "Employees" section of the dashboard.
 * Presents an "Employee Form" built from the reusable <app-input> primitive.
 */
@customElement('employees-widget')
export class EmployeesWidget extends LitElement {
  static override styles = [
    widgetCardStyles,
    css`
      :host {
        display: block;
        font-family: var(--font-sans);
        color: var(--color-text);
        height: 100%;
        /* Let the fields respond to the CARD's width, not the viewport, so the
           same widget lays out differently on the narrow dashboard vs. the
           full-width Employees page. */
        container-type: inline-size;
      }

      .card {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .title {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
      }

      .view-all {
        border: none;
        background: none;
        padding: 0;
        cursor: pointer;
        font: inherit;
        font-size: 14px;
        font-weight: 600;
        color: var(--color-primary);
      }

      .view-all:hover {
        text-decoration: underline;
      }

      /* ---------- Employee form ---------- */
      .form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 20px;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
      }

      .form-title {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
      }

      /*
       * Field grid, sized to the CARD width (container queries):
       *  - narrow card (dashboard, mobile): 1 column
       *  - medium card (dashboard widget):  2 columns
       *  - wide card (full Employees page): every field + status on one row
       */
      .fields {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 18px 20px;
        align-items: start;
      }

      @container (min-width: 480px) {
        .fields {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @container (min-width: 900px) {
        .fields {
          grid-template-columns: repeat(5, minmax(0, 1fr));
        }
      }

      /* Match the toggle's control height to the text inputs so it aligns
         when it shares a row with them. */
      .fields app-toggle {
        --app-toggle-control-height: 38px;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding-top: 4px;
        border-top: 1px solid var(--color-border-subtle);
      }

      /* Toolbar above the table holds the "Add employee" action. */
      .toolbar {
        display: flex;
        justify-content: flex-end;
      }

      /* Scroll region for the table; min-height:0 lets it shrink inside the
         fixed-height card so the table (not the card) scrolls. */
      .table-scroll {
        flex: 1;
        min-height: 0;
      }

      .table-scroll app-table {
        display: block;
        height: 100%;
      }

      /* Empty state with a shortcut to populate dummy data. */
      .empty {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 14px;
        color: var(--color-text-subtle);
        font-size: 14px;
        text-align: center;
      }
    `
  ];

  /** Show the "View all" link (only on the dashboard home view). */
  @property({ type: Boolean, attribute: 'view-all' }) viewAll = false;

  @state() private draft: EmployeeInput = { ...EMPTY_DRAFT };
  @state() private employees: Employee[] = [];
  /** Id of the record being edited, or null when adding a new one. */
  @state() private editingId: string | null = null;
  /** Whether the add/edit form is expanded. */
  @state() private showForm = false;
  /** Current table page (1-based). */
  @state() private page = 1;

  private readonly pageSize = 10;

  /** The slice of employees visible on the current page. */
  private get pagedEmployees(): Employee[] {
    const start = (this.page - 1) * this.pageSize;
    return this.employees.slice(start, start + this.pageSize);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.refresh();
  }

  /** Reload the list from the localStorage-backed store, clamping the page. */
  private refresh(): void {
    this.employees = getEmployees();
    const totalPages = Math.max(1, Math.ceil(this.employees.length / this.pageSize));
    if (this.page > totalPages) this.page = totalPages;
  }

  /** Table columns, including an actions column wired to this instance. */
  private get columns(): TableColumn[] {
    return [
      { key: 'name', label: 'Name' },
      {
        key: 'department',
        label: 'Department',
        render: row => departmentLabel((row as unknown as Employee).department)
      },
      { key: 'designation', label: 'Designation' },
      { key: 'email', label: 'Email' },
      {
        key: 'status',
        label: 'Status',
        align: 'center',
        render: row => statusBadge((row as unknown as Employee).status)
      },
      {
        key: 'actions',
        label: 'Actions',
        align: 'right',
        width: '120px',
        render: row => this.renderActions(row as unknown as Employee)
      }
    ];
  }

  private renderActions(employee: Employee) {
    return html`
      <span style="display:inline-flex;gap:8px;justify-content:flex-end;">
        <app-button
          variant="ghost"
          icon="edit"
          icon-only
          label="Edit"
          style="--app-button-color: var(--color-primary);"
          @click=${() => this.handleEdit(employee)}
        ></app-button>
        <app-button
          variant="ghost"
          icon="trash"
          icon-only
          label="Delete"
          style="--app-button-color: var(--color-danger);"
          @click=${() => this.handleDelete(employee.id)}
        ></app-button>
      </span>
    `;
  }

  private handleFieldChange(event: CustomEvent<InputChangeDetail>): void {
    const { name, value } = event.detail;
    this.draft = { ...this.draft, [name as keyof EmployeeInput]: value };
  }

  private handleStatusChange(event: CustomEvent<ToggleChangeDetail>): void {
    this.draft = {
      ...this.draft,
      status: event.detail.checked ? 'active' : 'inactive'
    };
  }

  private handleSave(): void {
    if (this.editingId) {
      updateEmployee(this.editingId, this.draft);
    } else {
      createEmployee(this.draft);
      // New record is prepended, so jump to the first page to show it.
      this.page = 1;
    }
    this.resetForm();
    this.refresh();
  }

  private handlePageChange(event: CustomEvent<PageChangeDetail>): void {
    this.page = event.detail.page;
  }

  private handleEdit(employee: Employee): void {
    const { id, ...input } = employee;
    this.editingId = id;
    this.draft = { ...input };
    this.showForm = true;
  }

  private handleDelete(id: string): void {
    deleteEmployee(id);
    if (this.editingId === id) this.resetForm();
    this.refresh();
  }

  private handleClear(): void {
    this.resetForm();
  }

  /** Toggle the add form open/closed (always as a fresh, empty draft). */
  private toggleForm(): void {
    if (this.showForm) {
      this.resetForm();
    } else {
      this.draft = { ...EMPTY_DRAFT };
      this.editingId = null;
      this.showForm = true;
    }
  }

  private handleAddDummy(): void {
    addDummyEmployees(20);
    this.refresh();
  }

  private resetForm(): void {
    this.draft = { ...EMPTY_DRAFT };
    this.editingId = null;
    this.showForm = false;
  }

  private handleViewAll(): void {
    window.location.hash = buildHash('employees');
  }

  override render() {
    return html`
      <div class="card">
        <div class="header">
          <h2 class="title">Employees</h2>
          ${this.viewAll
            ? html`<button type="button" class="view-all" @click=${this.handleViewAll}>
                View all →
              </button>`
            : nothing}
        </div>

        <div class="toolbar">
          <app-button
            variant="primary"
            icon=${this.showForm ? 'xmark' : 'plus'}
            @click=${this.toggleForm}
          >
            ${this.showForm ? 'Close' : 'Add Employee'}
          </app-button>
        </div>

        ${this.showForm ? this.renderForm() : nothing}

        ${this.employees.length === 0
          ? html`<div class="empty">
              <span>No employees yet</span>
              <app-button variant="secondary" @click=${this.handleAddDummy}>
                Add 20 dummy records
              </app-button>
            </div>`
          : html`
              <div class="table-scroll">
                <app-table
                  .columns=${this.columns}
                  .rows=${this.pagedEmployees}
                ></app-table>
              </div>
              <app-pagination
                .count=${this.employees.length}
                .pageSize=${this.pageSize}
                .page=${this.page}
                @page-change=${this.handlePageChange}
              ></app-pagination>
            `}
      </div>
    `;
  }

  private renderForm() {
    return html`
      <div class="form" @input-change=${this.handleFieldChange}>
        <h3 class="form-title">
          ${this.editingId ? 'Edit Employee' : 'Employee Form'}
        </h3>
          <div class="fields">
            <app-input
              name="name"
              label="Name"
              placeholder="Enter name"
              required
              .value=${this.draft.name}
            ></app-input>
            <app-select
              name="department"
              label="Department"
              placeholder="Select department"
              required
              .options=${DEPARTMENTS}
              .value=${this.draft.department}
            ></app-select>
            <app-input
              name="designation"
              label="Designation"
              placeholder="Enter designation"
              .value=${this.draft.designation}
            ></app-input>
            <app-input
              name="email"
              label="Email"
              type="email"
              placeholder="Enter email"
              required
              .value=${this.draft.email}
            ></app-input>
            <app-toggle
              name="status"
              label="Status"
              onLabel="Active"
              offLabel="Inactive"
              .checked=${this.draft.status === 'active'}
              @toggle-change=${this.handleStatusChange}
            ></app-toggle>
          </div>
        <div class="form-actions">
          <app-button variant="secondary" @click=${this.handleClear}>
            ${this.editingId ? 'Cancel' : 'Clear'}
          </app-button>
          <app-button variant="primary" @click=${this.handleSave}>
            ${this.editingId ? 'Update' : 'Save'}
          </app-button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'employees-widget': EmployeesWidget;
  }
}
