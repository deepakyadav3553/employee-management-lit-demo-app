import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {Employee} from '../types';

@customElement('employee-table')
export class EmployeeTable extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: 'Segoe UI', system-ui, sans-serif;
      color: #1f2933;
    }

    h2 {
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
    }

    .list-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    button {
      font: inherit;
      cursor: pointer;
      border: 1px solid transparent;
      border-radius: 6px;
      padding: 0.45rem 1rem;
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

    .btn-edit,
    .btn-delete {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      border-radius: 4px;
      padding: 0.25rem;
      line-height: 0;
    }

    .btn-edit:hover,
    .btn-delete:hover {
      background: #f1f5f9;
    }

    .row-actions img {
      width: 1rem;
      height: 1rem;
      display: block;
    }

    .empty {
      text-align: center;
      color: #64748b;
      padding: 2rem;
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
    }
  `;

  /** Employees to display; owned and supplied by the parent. */
  @property({attribute: false}) employees: Employee[] = [];

  private emit(type: string, detail?: unknown): void {
    this.dispatchEvent(
      new CustomEvent(type, {detail, bubbles: true, composed: true})
    );
  }

  override render() {
    return html`
      <div class="list-header">
        <h2>Employee List</h2>
        <button class="secondary" @click=${() => this.emit('add-dummies')}>
          Add 5 Dummy Records
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
                            title="Edit"
                            aria-label="Edit"
                            @click=${() => this.emit('employee-edit', employee)}
                          >
                            <img src="/assets/icons/edit.svg" alt="Edit" />
                          </button>
                          <button
                            class="btn-delete"
                            title="Delete"
                            aria-label="Delete"
                            @click=${() =>
                              this.emit('employee-delete', employee)}
                          >
                            <img src="/assets/icons/trash.svg" alt="Delete" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  `
                )}
              </tbody>
            </table>
          `}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'employee-table': EmployeeTable;
  }
}
