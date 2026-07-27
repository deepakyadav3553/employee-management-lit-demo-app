import {LitElement, html, css} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import './components/employee/employee-form';
import './components/employee/employee-table';
import './components/ui/confirm-modal';
import type {EmployeeForm} from './components/employee/employee-form';
import {Employee, EmployeeDraft, EmployeeDraftErrors, emptyDraft} from './models/employee';

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

  @property({attribute: false}) draft: EmployeeDraft = emptyDraft();
  @property({attribute: false}) errors: EmployeeDraftErrors = {};
  @property({attribute: false}) isEditing = false;
  @property({attribute: false}) disableSubmit = false;

  @property({attribute: false}) pageItems: Employee[] = [];
  @property({type: Number}) total = 0;
  @property({type: Number}) page = 1;
  @property({type: Number}) totalPages = 1;
  @property({type: Number}) rangeStart = 0;
  @property({type: Number}) rangeEnd = 0;

  @property({type: Boolean}) confirmOpen = false;
  @property() confirmHighlight = '';

  @query('employee-form') private employeeForm!: EmployeeForm;

  focusFirstField(): void {
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
            .draft=${this.draft}
            .errors=${this.errors}
            .isEditing=${this.isEditing}
            .disableSubmit=${this.disableSubmit}
          ></employee-form>
        </div>
        <div class="table-section">
          <employee-table
            .pageItems=${this.pageItems}
            .total=${this.total}
            .page=${this.page}
            .totalPages=${this.totalPages}
            .rangeStart=${this.rangeStart}
            .rangeEnd=${this.rangeEnd}
          ></employee-table>
        </div>
      </div>
      <confirm-modal
        ?open=${this.confirmOpen}
        heading="Delete Employee"
        message="Are you sure you want to delete"
        highlight=${this.confirmHighlight}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      ></confirm-modal>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-root': AppRoot;
  }
}
