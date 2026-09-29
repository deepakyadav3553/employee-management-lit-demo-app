import {LitElement, html, css} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import '../components/ui/app-button';
import '../components/ui/app-search';
import type {SearchChangeDetail} from '../components/ui/app-search';

/**
 * Employees widget — owns the "Employees" section of the dashboard.
 * Demonstrates reuse of the shared dumb UI primitives (app-button, app-search).
 * Body is still a placeholder.
 */
@customElement('employees-widget')
export class EmployeesWidget extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: 'Segoe UI', system-ui, sans-serif;
      color: #1f2933;
      height: 100%;
    }

    .card {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-height: 260px;
      height: 100%;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
      padding: 24px;
      box-sizing: border-box;
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

    .body {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      font-size: 14px;
    }
  `;

  @state() private query = '';

  private handleSearch(event: CustomEvent<SearchChangeDetail>): void {
    this.query = event.detail.value;
  }

  private handleAdd(): void {
    // Placeholder: wire to add-employee flow later.
  }

  override render() {
    return html`
      <div class="card">
        <div class="header">
          <h2 class="title">Employees</h2>
          <app-button variant="primary" @click=${this.handleAdd}>
            Add
          </app-button>
        </div>
        <app-search
          .value=${this.query}
          placeholder="Search employees..."
          label="Search employees"
          @search-change=${this.handleSearch}
        ></app-search>
        <div class="body">Employee list goes here</div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'employees-widget': EmployeesWidget;
  }
}
