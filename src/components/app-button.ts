import {LitElement, html, css, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'icon-primary'
  | 'icon-danger';
export type ButtonType = 'button' | 'submit';

@customElement('app-button')
export class AppButton extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
    }

    button {
      font: inherit;
      font-weight: 500;
      width: 100%;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      border: 1px solid transparent;
      border-radius: 6px;
      padding: 8px 22px;
      transition: background 0.15s;
    }

    .primary {
      background: #2563eb;
      color: #fff;
    }

    .primary:hover {
      background: #1d4ed8;
    }

    .secondary {
      background: #f1f5f9;
      border-color: #d1d5db;
      color: #334155;
    }

    .secondary:hover {
      background: #e2e8f0;
    }

    .danger {
      background: #dc2626;
      color: #fff;
    }

    .danger:hover {
      background: #b91c1c;
    }

    .icon-primary,
    .icon-danger {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: none;
      border-radius: 8px;
      padding: 7px;
      line-height: 0;
    }

    .icon-primary {
      border-color: #bfdbfe;
      background: #eff6ff;
    }

    .icon-primary:hover {
      background: #dbeafe;
    }

    .icon-danger {
      border-color: #fecaca;
      background: #fef2f2;
    }

    .icon-danger:hover {
      background: #fee2e2;
    }

    ::slotted(img) {
      width: 16px;
      height: 16px;
      display: block;
    }
  `;

  @property() variant: ButtonVariant = 'primary';
  @property() type: ButtonType = 'button';
  @property() label = '';

  private handleClick(): void {
    if (this.type !== 'submit') return;
    this.closest('form')?.requestSubmit();
  }

  override render() {
    const iconLabel =
      this.variant.startsWith('icon') && this.label ? this.label : nothing;
    return html`
      <button
        class=${this.variant}
        title=${iconLabel}
        aria-label=${iconLabel}
        @click=${this.handleClick}
      >
        <slot>${this.label}</slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-button': AppButton;
  }
}
