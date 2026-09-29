import {LitElement, html, css, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import type {InputChangeDetail} from './app-input';

/** A single option for <app-select>. */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Reusable, presentational dropdown with a label.
 *
 * Dumb component: it owns no data and has no dependencies. The value comes in
 * via `value` (controlled by the parent), options via `options`, and changes
 * are emitted as an `input-change` event (same shape as <app-input>, so a
 * shared form handler can treat them identically).
 *
 * @fires input-change - CustomEvent<InputChangeDetail> when the selection changes.
 * @csspart select - The inner <select> element.
 * @csspart label - The <label> element.
 */
@customElement('app-select')
export class AppSelect extends LitElement {
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

    label {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text);
    }

    .required {
      margin-left: 2px;
      color: var(--color-danger);
    }

    .control {
      position: relative;
      display: flex;
    }

    select {
      box-sizing: border-box;
      width: 100%;
      padding: 9px 34px 9px 12px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      font: inherit;
      font-family: var(--font-sans);
      font-size: 14px;
      color: var(--color-text);
      cursor: pointer;
      appearance: none;
      transition: border-color 0.15s ease;
    }

    select:focus {
      outline: none;
      border-color: var(--color-primary);
    }

    select:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    /* Placeholder option (empty value) reads as muted. */
    select.placeholder {
      color: var(--color-text-subtle);
    }

    /* Chevron. */
    .chevron {
      position: absolute;
      top: 50%;
      right: 12px;
      width: 8px;
      height: 8px;
      border-right: 2px solid var(--color-text-muted);
      border-bottom: 2px solid var(--color-text-muted);
      transform: translateY(-70%) rotate(45deg);
      pointer-events: none;
    }
  `;

  /** Current value (controlled by the parent). */
  @property() value = '';

  /** Field label shown above the control. */
  @property() label = '';

  /** Placeholder shown when no value is selected. */
  @property() placeholder = 'Select...';

  /** Field name, echoed back in the change event. */
  @property() name = '';

  /** Marks the field required (shows a red asterisk). */
  @property({type: Boolean}) required = false;

  /** Disables interaction. */
  @property({type: Boolean, reflect: true}) disabled = false;

  /** Selectable options. */
  @property({attribute: false}) options: SelectOption[] = [];

  private handleChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.value = value;
    this.dispatchEvent(
      new CustomEvent<InputChangeDetail>('input-change', {
        detail: {name: this.name, value},
        bubbles: true,
        composed: true,
      })
    );
  }

  override render() {
    return html`
      <div class="field">
        ${this.label
          ? html`<label part="label">
              ${this.label}${this.required
                ? html`<span class="required" aria-hidden="true">*</span>`
                : nothing}
            </label>`
          : nothing}
        <div class="control">
          <select
            part="select"
            class=${this.value ? '' : 'placeholder'}
            .value=${this.value}
            ?disabled=${this.disabled}
            aria-label=${this.label}
            @change=${this.handleChange}
          >
            <option value="" disabled ?selected=${!this.value}>
              ${this.placeholder}
            </option>
            ${this.options.map(
              (o) => html`<option value=${o.value}>${o.label}</option>`
            )}
          </select>
          <span class="chevron"></span>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-select': AppSelect;
  }
}
