import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('app-shell')
export class AppShell extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      color: #1f2933;
      background: #eef1f6;
    }

    h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
    }
  `;

  override render() {
    return html`<h1>App Shell</h1>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-shell': AppShell;
  }
}
