import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {Employee} from '../types';
import './app-button';

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

    .empty {
      text-align: center;
      color: #64748b;
      padding: 2rem;
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
    }
  `;

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
        <app-button
          variant="secondary"
          label="Add 5 Dummy Records"
          @click=${() => this.emit('add-dummies')}
        ></app-button>
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
                          <app-button
                            variant="icon"
                            label="Edit"
                            @click=${() => this.emit('employee-edit', employee)}
                          >
                            <img src="/assets/icons/edit.svg" alt="" />
                          </app-button>
                          <app-button
                            variant="icon"
                            label="Delete"
                            @click=${() =>
                              this.emit('employee-delete', employee)}
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
          `}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'employee-table': EmployeeTable;
  }
}
