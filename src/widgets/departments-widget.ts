import {LitElement, html, css, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {widgetCardStyles} from '../styles/widget-card.styles';
import {buildHash} from '../router/routes';

/**
 * Departments widget — placeholder card.
 * Owns the "Departments" section of the dashboard. Body is still a placeholder.
 */
@customElement('departments-widget')
export class DepartmentsWidget extends LitElement {
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

  private handleViewAll(): void {
    window.location.hash = buildHash('departments');
  }

  override render() {
    return html`
      <div class="card">
        <div class="header">
          <h2 class="title">Departments</h2>
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
        <div class="body">Department list goes here</div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'departments-widget': DepartmentsWidget;
  }
}
