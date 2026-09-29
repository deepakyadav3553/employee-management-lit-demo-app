import {LitElement, html, css, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';

/** Payload emitted by <app-toggle> when the state changes. */
export interface ToggleChangeDetail {
  /** The `name` of the toggle (useful for shared handlers). */
  name: string;
  /** Whether the toggle is now on. */
  checked: boolean;
}

/**
 * Reusable, presentational on/off switch with a label.
 *
 * Dumb component: it owns no data and has no dependencies. The state comes in
 * via `checked` (controlled by the parent) and changes are emitted as a
 * `toggle-change` event. `onLabel` / `offLabel` describe each state (e.g.
 * "Active" / "Inactive").
 *
 * @fires toggle-change - CustomEvent<ToggleChangeDetail> when toggled.
 * @csspart switch - The switch button element.
 */
@customElement('app-toggle')
export class AppToggle extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--font-sans);
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
    }

    .label {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text);
    }

    /*
     * The control row can be told to occupy a fixed height (e.g. to match the
     * height of sibling text inputs in a form grid) via --app-toggle-control-height.
     * It defaults to the switch's natural height.
     */
    .row {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      min-height: var(--app-toggle-control-height, auto);
    }

    .switch {
      position: relative;
      flex: none;
      width: 44px;
      height: 24px;
      padding: 0;
      border: none;
      border-radius: 999px;
      background: var(--color-border);
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .switch[aria-checked='true'] {
      background: var(--color-primary);
    }

    .switch:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

    .switch:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    .knob {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #ffffff;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
      transition: transform 0.15s ease;
    }

    .switch[aria-checked='true'] .knob {
      transform: translateX(20px);
    }

    .state {
      font-size: 14px;
      color: var(--color-text-muted);
    }
  `;

  /** Whether the toggle is on (controlled by the parent). */
  @property({type: Boolean}) checked = false;

  /** Field label shown above the switch. */
  @property() label = '';

  /** Toggle name, echoed back in the change event. */
  @property() name = '';

  /** Text shown next to the switch when on. */
  @property() onLabel = 'On';

  /** Text shown next to the switch when off. */
  @property() offLabel = 'Off';

  /** Disables interaction. */
  @property({type: Boolean, reflect: true}) disabled = false;

  private handleClick(): void {
    if (this.disabled) return;
    const checked = !this.checked;
    this.checked = checked;
    this.dispatchEvent(
      new CustomEvent<ToggleChangeDetail>('toggle-change', {
        detail: {name: this.name, checked},
        bubbles: true,
        composed: true,
      })
    );
  }

  override render() {
    return html`
      <div class="field">
        ${this.label ? html`<span class="label">${this.label}</span>` : nothing}
        <span class="row">
          <button
            part="switch"
            class="switch"
            type="button"
            role="switch"
            aria-checked=${this.checked ? 'true' : 'false'}
            aria-label=${this.label || this.name}
            ?disabled=${this.disabled}
            @click=${this.handleClick}
          >
            <span class="knob"></span>
          </button>
          <span class="state">
            ${this.checked ? this.onLabel : this.offLabel}
          </span>
        </span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-toggle': AppToggle;
  }
}
