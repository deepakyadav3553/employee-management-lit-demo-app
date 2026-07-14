import {LitElement, html, css, PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {Employee} from '../../models/employee';
import '../ui/app-button';
import '../ui/app-pagination';
import '../ui/empty-state';
import type {PageChangeDetail} from '../ui/app-pagination';

const PAGE_SIZE = 5;

const AVATAR_COLORS = [
  '#dbeafe',
  '#ede9fe',
  '#fce7f3',
  '#d1fae5',
  '#fef3c7',
  '#cffafe',
  '#ffe4e6',
  '#e0e7ff',
  '#fae8ff',
  '#ecfccb',
];

@customElement('employee-table')
export class EmployeeTable extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th,
    td {
      text-align: left;
      padding: 14px 12px;
      border-bottom: 1px solid #eef2f7;
      font-size: 14px;
      color: #334155;
    }

    th {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #94a3b8;
      border-bottom: 1px solid #e2e8f0;
    }

    th:last-child,
    td:last-child {
      text-align: right;
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    tbody tr:hover td {
      background: #f8fafc;
    }

    .name-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar {
      flex: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #334155;
      font-size: 13px;
      font-weight: 700;
    }

    .name {
      font-weight: 600;
      color: #1f2933;
    }

    .row-actions {
      display: inline-flex;
      gap: 8px;
    }

    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 18px;
    }

    .summary {
      font-size: 13px;
      color: #94a3b8;
    }

    .dummy-link {
      font: inherit;
      font-size: 13px;
      background: none;
      border: none;
      color: #2563eb;
      cursor: pointer;
      padding: 0;
    }

    .dummy-link:hover {
      text-decoration: underline;
    }

    /* Tablet: let a wide table scroll horizontally rather than overflow */
    @media (max-width: 820px) {
      .table-scroll {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      table {
        min-width: 560px;
      }
    }

    /* Mobile: collapse each row into a stacked card */
    @media (max-width: 560px) {
      .table-scroll {
        overflow-x: visible;
      }

      thead {
        display: none;
      }

      table {
        min-width: 0;
      }

      tbody tr {
        display: block;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 6px 4px;
        margin-bottom: 12px;
      }

      tbody tr:hover td {
        background: none;
      }

      td {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 10px 14px;
        border-bottom: 1px solid #f1f5f9;
        text-align: right;
      }

      td:last-child {
        border-bottom: none;
      }

      td[data-label]::before {
        content: attr(data-label);
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #94a3b8;
        text-align: left;
      }

      td.name-td {
        justify-content: flex-start;
        border-bottom: 1px solid #eef2f7;
      }
    }
  `;

  @property({attribute: false}) employees: Employee[] = [];

  @state() private page = 1;

  override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('employees')) {
      const maxPage = Math.max(1, Math.ceil(this.employees.length / PAGE_SIZE));
      if (this.page > maxPage) this.page = maxPage;
    }
  }

  private emit(type: string, detail?: unknown): void {
    this.dispatchEvent(
      new CustomEvent(type, {detail, bubbles: true, composed: true})
    );
  }

  private avatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash + name.charCodeAt(i)) % AVATAR_COLORS.length;
    }
    return AVATAR_COLORS[hash];
  }

  private initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  override render() {
    const total = this.employees.length;
    if (total === 0) {
      return html`
        <empty-state
          image="/assets/icons/empty-folder.svg"
          heading="No employees found"
          message="Add your first employee to get started."
        >
          <app-button
            variant="primary"
            @click=${() => this.emit('employee-add-request')}
          >
            <img src="/assets/icons/plus-white.svg" alt="" />
            Add Employee
          </app-button>
          <button class="dummy-link" @click=${() => this.emit('add-dummies')}>
            or add 5 dummy records
          </button>
        </empty-state>
      `;
    }

    const totalPages = Math.ceil(total / PAGE_SIZE);
    const page = Math.min(this.page, totalPages);
    const start = (page - 1) * PAGE_SIZE;
    const pageItems = this.employees.slice(start, start + PAGE_SIZE);

    return html`
      <div class="table-scroll">
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
            ${pageItems.map(
              (employee) => html`
              <tr>
                <td class="name-td">
                  <div class="name-cell">
                    <span
                      class="avatar"
                      style="background:${this.avatarColor(employee.name)}"
                      aria-hidden="true"
                      >${this.initials(employee.name)}</span
                    >
                    <span class="name">${employee.name}</span>
                  </div>
                </td>
                <td data-label="Department">${employee.department}</td>
                <td data-label="Designation">${employee.designation}</td>
                <td data-label="Email">${employee.email}</td>
                <td data-label="Actions">
                  <div class="row-actions">
                    <app-button
                      variant="icon-primary"
                      label="Edit"
                      @click=${() => this.emit('employee-edit', employee)}
                    >
                      <img src="/assets/icons/edit.svg" alt="" />
                    </app-button>
                    <app-button
                      variant="icon-danger"
                      label="Delete"
                      @click=${() => this.emit('employee-delete', employee)}
                    >
                      <img src="/assets/icons/trash.svg" alt="" />
                    </app-button>
                  </div>
                </td>
              </tr>
            `
            )}
          </tbody>
        </table>
      </div>

      <div class="footer">
        <span class="summary">
          Showing ${start + 1} to ${start + pageItems.length} of ${total}
          employees
        </span>
        <app-pagination
          .page=${page}
          .totalPages=${totalPages}
          @page-change=${this.handlePageChange}
        ></app-pagination>
      </div>
    `;
  }

  private handlePageChange(event: CustomEvent<PageChangeDetail>): void {
    this.page = event.detail.page;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'employee-table': EmployeeTable;
  }
}
