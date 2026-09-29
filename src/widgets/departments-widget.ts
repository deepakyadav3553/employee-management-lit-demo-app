import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';

/**
 * Departments widget — placeholder card.
 * Owns the "Departments" section of the dashboard. Empty for now.
 */
@customElement('departments-widget')
export class DepartmentsWidget extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: 'Segoe UI', system-ui, sans-serif;
      color: #1f2933;
    }

    .card {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 260px;
      height: 100%;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
      padding: 24px;
      box-sizing: border-box;
    }

    .title {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
    }
  `;

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
