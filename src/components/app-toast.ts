import { LitElement, html, css, svg } from 'lit';
import { customElement, state } from 'lit/decorators.js';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@customElement('app-toast')
export class AppToast extends LitElement {
  static override styles = css`
    .stack {
      position: fixed;
      top: 16px;
      right: 16px;
      width: calc(100% - 32px);
      max-width: 320px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 1100;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border: 1px solid;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
      animation: slide-down 0.18s ease-out;
    }

    .toast.success {
      background: #f0fdf4;
      border-color: #bbf7d0;
      color: #15803d;
    }

    .toast.error {
      background: #fef2f2;
      border-color: #fecaca;
      color: #b91c1c;
    }

    .toast.info {
      background: #eff6ff;
      border-color: #bfdbfe;
      color: #1d4ed8;
    }

    .icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .message {
      flex: 1;
    }

    .close {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      color: inherit;
      opacity: 0.7;
      padding: 2px;
      border-radius: 4px;
    }

    .close:hover {
      opacity: 1;
    }

    @keyframes slide-down {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  @state() private toasts: Toast[] = [];
  private nextId = 0;
  private duration = 3000;

  show(message: string, type: ToastType = 'success'): void {
    const id = this.nextId++;
    this.toasts = [...this.toasts, { id, message, type }];
    setTimeout(() => this.dismiss(id), this.duration);
  }

  private dismiss(id: number): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
  }

  private icon(type: ToastType) {
    const paths = {
      success: svg`<circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />`,
      error: svg`<circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />`,
      info: svg`<circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />`
    };
    return svg`
      <svg
        class="icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        ${paths[type]}
      </svg>
    `;
  }

  override render() {
    return html`
      <div class="stack">
        ${this.toasts.map(
          toast => html`
            <div class="toast ${toast.type}" role="status">
              ${this.icon(toast.type)}
              <span class="message">${toast.message}</span>
              <button class="close" aria-label="Dismiss" @click=${() => this.dismiss(toast.id)}>
                &times;
              </button>
            </div>
          `
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-toast': AppToast;
  }
}
