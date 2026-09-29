import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import {widgetCardStyles} from '../styles/widget-card.styles';

/**
 * Reports widget — placeholder card.
 * Owns the "Reports" section of the dashboard. Empty for now.
 */
@customElement('reports-widget')
export class ReportsWidget extends LitElement {
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
        <h2 class="title">Reports</h2>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reports-widget': ReportsWidget;
  }
}
