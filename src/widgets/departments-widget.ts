import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import {widgetCardStyles} from '../styles/widget-card.styles';

/**
 * Departments widget — placeholder card.
 * Owns the "Departments" section of the dashboard. Empty for now.
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
      }

      .card {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .title {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
      }
    `,
  ];

  override render() {
    return html`
      <div class="card">
        <h2 class="title">Departments</h2>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'departments-widget': DepartmentsWidget;
  }
}
