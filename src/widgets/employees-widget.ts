import {LitElement, html, css, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {widgetCardStyles} from '../styles/widget-card.styles';
import {buildHash} from '../router/routes';
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
  static override styles = [
    widgetCardStyles,
    css`
      :host {
        display: block;
        font-family: var(--font-sans);
        color: var(--color-text);
        height: 100%;
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

      .actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .actions app-search {
        flex: 1;
      }

      .body {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-text-subtle);
        font-size: 14px;
      }
    `,
  ];

  /** Show the "View all" link (only on the dashboard home view). */
  @property({type: Boolean, attribute: 'view-all'}) viewAll = false;

  @state() private query = '';

  private handleSearch(event: CustomEvent<SearchChangeDetail>): void {
    this.query = event.detail.value;
  }

  private handleAdd(): void {
    // Placeholder: wire to add-employee flow later.
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
            ? html`<button
                type="button"
                class="view-all"
                @click=${this.handleViewAll}
              >
                View all →
              </button>`
            : nothing}
        </div>
        <div class="actions">
          <app-search
            .value=${this.query}
            placeholder="Search employees..."
            label="Search employees"
            @search-change=${this.handleSearch}
          ></app-search>
          <app-button variant="primary" @click=${this.handleAdd}>
            Add
          </app-button>
        </div>
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
