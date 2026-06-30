import {LitElement, html, css, nothing} from 'lit';
import {customElement, state} from 'lit/decorators.js';

interface Employee {
  id: string;
  name: string;
  department: string;
  designation: string;
  email: string;
}

/** The editable fields of an employee (everything except the generated id). */
type EmployeeDraft = Omit<Employee, 'id'>;

function emptyDraft(): EmployeeDraft {
  return {name: '', department: '', designation: '', email: ''};
}

const STORAGE_KEY = 'employee-management:employees';

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `emp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

@customElement('employee-table')
export class EmployeeTable extends LitElement {
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

    h2 {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 0.75rem;
    }

    .list-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .list-header h2 {
      margin: 0;
    }

    section {
      margin-bottom: 2rem;
    }

    /* ---- Form ---- */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    label {
      font-size: 0.8rem;
      color: #475569;
    }

    input {
      font: inherit;
      padding: 0.5rem;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
    }

    input:focus {
      outline: 2px solid #93c5fd;
      border-color: #2563eb;
    }

    .error {
      color: #dc2626;
      font-size: 0.75rem;
    }

    .form-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.9rem;
    }

    button {
      font: inherit;
      cursor: pointer;
      border: 1px solid transparent;
      border-radius: 6px;
      padding: 0.45rem 1rem;
    }

    .primary {
      background: #2563eb;
      color: #fff;
    }

    .primary:hover {
      background: #1d4ed8;
    }

    .secondary {
      background: #f1f5f9;
      border-color: #cbd5e1;
      color: #334155;
    }

    .secondary:hover {
      background: #e2e8f0;
    }

    /* ---- Table ---- */
    table {
      width: 100%;
      border-collapse: collapse;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }

    th,
    td {
      text-align: left;
      padding: 0.65rem 0.85rem;
      border-bottom: 1px solid #eef2f7;
      font-size: 0.9rem;
    }

    th {
      background: #f8fafc;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: #64748b;
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    .row-actions {
      display: flex;
      gap: 0.4rem;
    }

    .btn-edit {
      background: #2563eb;
      color: #fff;
      padding: 0.3rem 0.7rem;
      font-size: 0.8rem;
    }

    .btn-edit:hover {
      background: #1d4ed8;
    }

    .btn-delete {
      background: #dc2626;
      color: #fff;
      padding: 0.3rem 0.7rem;
      font-size: 0.8rem;
    }

    .btn-delete:hover {
      background: #b91c1c;
    }

    .empty {
      text-align: center;
      color: #64748b;
      padding: 2rem;
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
    }

    @media (max-width: 640px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  @state() private employees: Employee[] = [];
  @state() private draft: EmployeeDraft = emptyDraft();
  @state() private editingId: string | null = null;
  @state() private errors: Partial<Record<keyof EmployeeDraft, string>> = {};

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

  private handleInput(field: keyof EmployeeDraft, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.draft = {...this.draft, [field]: value};
  }

  private validate(draft: EmployeeDraft): typeof this.errors {
    const errors: typeof this.errors = {};
    if (!draft.name.trim()) errors.name = 'Name is required.';
    if (!draft.department.trim())
      errors.department = 'Department is required.';
    if (!draft.designation.trim())
      errors.designation = 'Designation is required.';
    if (!draft.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) {
      errors.email = 'Enter a valid email.';
    }
    return errors;
  }

  private save(event: Event): void {
    event.preventDefault();
    const trimmed: EmployeeDraft = {
      name: this.draft.name.trim(),
      department: this.draft.department.trim(),
      designation: this.draft.designation.trim(),
      email: this.draft.email.trim(),
    };
    const errors = this.validate(trimmed);
    if (Object.keys(errors).length > 0) {
      this.errors = errors;
      return;
    }

    if (this.editingId) {
      const id = this.editingId;
      this.employees = this.employees.map((e) =>
        e.id === id ? {id, ...trimmed} : e
      );
    } else {
      this.employees = [...this.employees, {id: generateId(), ...trimmed}];
    }
    this.persist();
    this.clear();
  }

  private edit(employee: Employee): void {
    const {id, ...rest} = employee;
    this.editingId = id;
    this.draft = {...rest};
    this.errors = {};
  }

  private deleteEmployee(employee: Employee): void {
    if (!confirm(`Delete ${employee.name}? This cannot be undone.`)) return;
    this.employees = this.employees.filter((e) => e.id !== employee.id);
    this.persist();
    if (this.editingId === employee.id) this.clear();
  }

  private clear(): void {
    this.draft = emptyDraft();
    this.editingId = null;
    this.errors = {};
  }

  /** Append 10 generated dummy employees and persist them to localStorage. */
  private addDummyRecords(): void {
    const dummies: Employee[] = [
      {name: 'Olivia Bennett', department: 'Engineering', designation: 'Developer'},
      {name: 'Liam Carter', department: 'HR', designation: 'Manager'},
      {name: 'Sophia Nguyen', department: 'Finance', designation: 'Analyst'},
      {name: 'Noah Patel', department: 'Marketing', designation: 'Designer'},
      {name: 'Ava Rodriguez', department: 'Sales', designation: 'Coordinator'},
      {name: 'Ethan Walsh', department: 'Operations', designation: 'Specialist'},
      {name: 'Isabella Rossi', department: 'Engineering', designation: 'Tech Lead'},
      {name: 'Mason Clarke', department: 'Finance', designation: 'Accountant'},
      {name: 'Mia Andersen', department: 'Marketing', designation: 'Brand Manager'},
      {name: 'Lucas Fischer', department: 'Sales', designation: 'Account Executive'},
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
      ${this.renderForm()} ${this.renderList()}
    `;
  }

  private renderForm() {
    return html`
      <section>
        <h2>${this.editingId ? 'Edit Employee' : 'Employee Form'}</h2>
        <form @submit=${this.save}>
          <div class="form-grid">
            ${this.renderField('name', 'Name', 'Enter name')}
            ${this.renderField('department', 'Department', 'Enter department')}
            ${this.renderField(
              'designation',
              'Designation',
              'Enter designation'
            )}
            ${this.renderField('email', 'Email', 'Enter email', 'email')}
          </div>
          <div class="form-actions">
            <button type="submit" class="primary">Save</button>
            <button type="button" class="secondary" @click=${this.clear}>
              Clear
            </button>
          </div>
        </form>
      </section>
    `;
  }

  private renderField(
    field: keyof EmployeeDraft,
    label: string,
    placeholder: string,
    type = 'text'
  ) {
    const error = this.errors[field];
    return html`
      <div class="field">
        <label for=${field}>${label}</label>
        <input
          id=${field}
          type=${type}
          placeholder=${placeholder}
          .value=${this.draft[field]}
          @input=${(e: Event) => this.handleInput(field, e)}
        />
        ${error ? html`<span class="error">${error}</span>` : nothing}
      </div>
    `;
  }

  private renderList() {
    return html`
      <section>
        <div class="list-header">
          <h2>Employee List</h2>
          <button class="secondary" @click=${this.addDummyRecords}>
            Add 10 Dummy Records
          </button>
        </div>
        ${this.employees.length === 0
          ? html`<p class="empty">
              No employees yet. Add one using the form above.
            </p>`
          : html`
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.employees.map(
                    (employee) => html`
                      <tr>
                        <td>${employee.name}</td>
                        <td>${employee.department}</td>
                        <td>${employee.designation}</td>
                        <td>${employee.email}</td>
                        <td>
                          <div class="row-actions">
                            <button
                              class="btn-edit"
                              @click=${() => this.edit(employee)}
                            >
                              Edit
                            </button>
                            <button
                              class="btn-delete"
                              @click=${() => this.deleteEmployee(employee)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    `
                  )}
                </tbody>
              </table>
            `}
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'employee-table': EmployeeTable;
  }
}
