import {LitElement, html, css, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import './app-icon';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonType = 'button' | 'submit' | 'reset';

/**
 * Reusable, presentational button.
 *
 * Dumb component: no business logic. Configure via `variant` / `type` /
 * `disabled`, put the label in the default slot, and listen for the native
 * `click` event (it is composed, so it crosses the shadow boundary).
 *
 * Icons: set `icon` for a leading Font Awesome icon. With no slotted text the
 * button renders as a compact, square icon-only button (give it `label` for
 * accessibility). `iconEnd` places the icon after the label instead.
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

    /* Icon-only: compact, square, no gap from the empty label slot. */
    :host([icon-only]) button {
      width: auto;
      padding: 8px;
      aspect-ratio: 1;
      gap: 0;
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

    /* ghost — colour is themeable via --app-button-color (handy for icon
       buttons that need to be tinted, e.g. an "edit" or "delete" action). */
    .ghost {
      background: transparent;
      color: var(--app-button-color, var(--color-text-muted));
    }

    .ghost:hover:not(:disabled) {
      background: var(--color-surface-hover);
      color: var(--app-button-color, var(--color-text));
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

  /** Leading Font Awesome icon name (see <app-icon>). */
  @property() icon = '';

  /** Render the icon after the label instead of before it. */
  @property({type: Boolean, attribute: 'icon-end'}) iconEnd = false;

  /**
   * Compact, square icon-only button. Reflected so CSS can target it. Set it
   * (and `label`) when the button has an icon but no visible text.
   */
  @property({type: Boolean, reflect: true, attribute: 'icon-only'})
  iconOnly = false;

  /** Accessible label, used for icon-only buttons. */
  @property() label = '';

  override render() {
    const iconEl = this.icon
      ? html`<app-icon .name=${this.icon}></app-icon>`
      : nothing;
    return html`
      <button
        part="button"
        class=${this.variant}
        type=${this.type}
        ?disabled=${this.disabled}
        aria-label=${this.label || nothing}
      >
        ${this.iconEnd ? nothing : iconEl}
        <slot></slot>
        ${this.iconEnd ? iconEl : nothing}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-button': AppButton;
  }
}
