import {LitElement, html, css} from 'lit';
import {customElement, state, query} from 'lit/decorators.js';
import './components/employee/employee-form';
import './components/employee/employee-table';
import './components/ui/confirm-modal';
import './components/ui/app-toast';
import type {
  EmployeeSaveDetail,
  EmployeeForm,
} from './components/employee/employee-form';
import type {AppToast} from './components/ui/app-toast';
import {Employee} from './models/employee';
import {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from './services/employee-api';

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
  @query('app-toast') private toast!: AppToast;
  @query('employee-form') private employeeForm!: EmployeeForm;

  override connectedCallback(): void {
    super.connectedCallback();
    void this.loadFromApi();
  }

  private async loadFromApi(): Promise<void> {
    try {
      this.employees = await fetchEmployees();
    } catch (error) {
      console.error('Failed to load employees from API', error);
      this.toast?.show('Could not load employees from server.', 'error');
    }
  }

  private async handleSave(
    event: CustomEvent<EmployeeSaveDetail>
  ): Promise<void> {
    const {id, draft} = event.detail;
    try {
      if (id) {
        const saved = await updateEmployee(id, draft);
        this.employees = this.employees.map((e) =>
          e.id === id ? saved : e
        );
        this.toast.show('Employee updated successfully!', 'info');
      } else {
        const saved = await createEmployee(draft);
        this.employees = [...this.employees, saved];
        this.toast.show('Employee added successfully!', 'success');
      }
      this.editing = null;
    } catch (error) {
      console.error('Failed to save employee', error);
      this.toast.show('Could not save employee to server.', 'error');
    }
  }

  private handleEdit(event: CustomEvent<Employee>): void {
    this.editing = event.detail;
  }

  private handleDelete(event: CustomEvent<Employee>): void {
    this.pendingDelete = event.detail;
  }

  private async confirmDelete(): Promise<void> {
    const employee = this.pendingDelete;
    if (!employee) return;
    this.pendingDelete = null;
    try {
      await deleteEmployee(employee.id);
      this.employees = this.employees.filter((e) => e.id !== employee.id);
      if (this.editing?.id === employee.id) this.editing = null;
      this.toast.show('Employee deleted successfully!', 'error');
    } catch (error) {
      console.error('Failed to delete employee', error);
      this.toast.show('Could not delete employee on server.', 'error');
    }
  }

  private cancelDelete(): void {
    this.pendingDelete = null;
  }

  private handleFormCancel(): void {
    this.editing = null;
  }

  private handleAddRequest(): void {
    this.editing = null;
    this.employeeForm?.focusFirstField();
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
          <employee-form
            .editing=${this.editing}
            @employee-save=${this.handleSave}
            @form-cancel=${this.handleFormCancel}
          ></employee-form>
        </div>
        <div class="table-section">
          <employee-table
            .employees=${this.employees}
            @employee-edit=${this.handleEdit}
            @employee-delete=${this.handleDelete}
            @employee-add-request=${this.handleAddRequest}
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
