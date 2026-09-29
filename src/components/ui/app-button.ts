import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonType = 'button' | 'submit' | 'reset';

/**
 * Reusable, presentational button.
 *
 * Dumb component: no business logic. Configure via `variant` / `type` /
 * `disabled`, put the label in the default slot, and listen for the native
 * `click` event (it is composed, so it crosses the shadow boundary).
 *
 * @slot - Button label / content.
 * @csspart button - The inner <button> element, for advanced overrides.
 */
@customElement('app-button')
export class AppButton extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
    }

    :host([full]) {
      display: block;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 10px 18px;
      border: 1px solid transparent;
      border-radius: var(--radius-md);
      font: inherit;
      font-family: var(--font-sans);
      font-size: 14px;
      font-weight: 600;
      line-height: 1;
      cursor: pointer;
      transition: background 0.15s ease, border-color 0.15s ease,
        color 0.15s ease;
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    /* primary */
    .primary {
      background: var(--color-primary);
      color: var(--color-primary-contrast);
    }

    .primary:hover:not(:disabled) {
      background: var(--color-primary-hover);
    }

    /* secondary */
    .secondary {
      background: var(--color-primary-soft);
      color: var(--color-primary);
    }

    .secondary:hover:not(:disabled) {
      background: var(--color-primary-soft-hover);
    }

    /* ghost */
    .ghost {
      background: transparent;
      color: var(--color-text-muted);
    }

    .ghost:hover:not(:disabled) {
      background: var(--color-surface-hover);
      color: var(--color-text);
    }
  `;

  /** Visual style of the button. */
  @property() variant: ButtonVariant = 'primary';

  /** Native button type (use `submit` inside a form). */
  @property() type: ButtonType = 'button';

  /** Disables interaction. */
  @property({type: Boolean, reflect: true}) disabled = false;

  /** Stretches the button to fill its container. */
  @property({type: Boolean, reflect: true}) full = false;

  override render() {
    return html`
      <button
        part="button"
        class=${this.variant}
        type=${this.type}
        ?disabled=${this.disabled}
      >
        <slot></slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-button': AppButton;
  }
}
