import {LitElement, html, css, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';

export type ButtonVariant = 'primary' | 'secondary' | 'icon';
export type ButtonType = 'button' | 'submit' | 'reset';

@customElement('app-button')
export class AppButton extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
    }

    button {
      font: inherit;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;
      border-radius: 6px;
      padding: 0.5rem 1.35rem;
      transition: background 0.15s;
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.6;
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

    .icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: none;
      border-radius: 4px;
      padding: 0.25rem;
      line-height: 0;
    }

    .icon:hover:not(:disabled) {
      background: #f1f5f9;
    }

    ::slotted(img) {
      width: 1rem;
      height: 1rem;
      display: block;
    }
  `; 
  @property() variant: ButtonVariant = 'primary';
  @property() type: ButtonType = 'button';

  @property({type: Boolean}) disabled = false;

  @property() label = '';

  private handleClick(): void {
    if (this.disabled) return;
    const form = this.closest('form');
    if (!form) return;
    if (this.type === 'submit') {
      form.requestSubmit();
    } else if (this.type === 'reset') {
      form.reset();
    }
  }

  override render() {
    return html`
      <button
        class=${this.variant}
        ?disabled=${this.disabled}
        title=${this.variant === 'icon' && this.label ? this.label : nothing}
        aria-label=${this.variant === 'icon' && this.label ? this.label : nothing}
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
