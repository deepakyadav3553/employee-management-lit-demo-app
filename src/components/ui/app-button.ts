import {LitElement, html, css, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'icon-primary'
  | 'icon-danger';

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

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .primary {
      background: #2563eb;
      color: #fff;
    }

    .primary:hover:not(:disabled) {
      background: #1d4ed8;
    }

    .secondary {
      background: #f1f5f9;
      border-color: #d1d5db;
      color: #334155;
    }

    .secondary:hover:not(:disabled) {
      background: #e2e8f0;
    }

    .danger {
      background: #dc2626;
      color: #fff;
    }

    .danger:hover:not(:disabled) {
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

    .icon-primary:hover:not(:disabled) {
      background: #dbeafe;
    }

    .icon-danger {
      border-color: #fecaca;
      background: #fef2f2;
    }

    .icon-danger:hover:not(:disabled) {
      background: #fee2e2;
    }

    ::slotted(img) {
      width: 16px;
      height: 16px;
      display: block;
    }
  `;

  @property() variant: ButtonVariant = 'primary';
  @property() label = '';
  @property({type: Boolean, reflect: true}) disabled = false;

  override render() {
    const iconLabel =
      this.variant.startsWith('icon') && this.label ? this.label : nothing;
    return html`
      <button
        type="button"
        class=${this.variant}
        title=${iconLabel}
        aria-label=${iconLabel}
        ?disabled=${this.disabled}
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
