import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../widgets/employee-widget';

@customElement('app-shell')
export class AppShell extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      color: #1f2933;
      background: #eef1f6;
    }

    .topbar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 32px;
      background: #0f172a;
      color: #f8fafc;
    }

    .brand-mark {
      flex: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(115deg, #3b6fe0 0%, #4f46e5 100%);
      font-size: 15px;
      font-weight: 700;
    }

    .brand-name {
      font-size: 16px;
      font-weight: 700;
      line-height: 1.2;
    }

    .brand-tag {
      font-size: 12px;
      color: rgba(203, 213, 225, 0.7);
    }

    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding: 40px 20px;
      box-sizing: border-box;
    }

    @media (max-width: 640px) {
      .topbar {
        padding: 14px 20px;
      }

      .content {
        padding: 24px 16px;
      }
    }
  `;

  override render() {
    return html`
      <header class="topbar">
        <span class="brand-mark">HR</span>
        <div>
          <div class="brand-name">HR Portal</div>
          <div class="brand-tag">Employee Management</div>
        </div>
      </header>
      <main class="content">
        <employee-widget></employee-widget>
      </main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-shell': AppShell;
  }
}
