import {LitElement, html, css, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';

/** Payload emitted by <app-input> when the value changes. */
export interface InputChangeDetail {
  /** The `name` of the field that changed (useful for shared handlers). */
  name: string;
  /** The current value. */
  value: string;
}

/**
 * Reusable, presentational text input with a label.
 *
 * Dumb component: it owns no data and has no dependencies. The value comes in
 * via `value` (controlled by the parent) and changes are emitted as an
 * `input-change` event carrying the field `name`. Reuse it anywhere a labelled
 * text field is needed.
 *
 * @fires input-change - CustomEvent<InputChangeDetail> on every input.
 * @csspart input - The inner <input> element.
 * @csspart label - The <label> element.
 */
@customElement('app-input')
export class AppInput extends LitElement {
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
      color: var(--color-danger, #e5484d);
    }

    input {
      box-sizing: border-box;
      width: 100%;
      padding: 9px 12px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      font: inherit;
      font-family: var(--font-sans);
      font-size: 14px;
      color: var(--color-text);
      transition: border-color 0.15s ease, background 0.15s ease;
    }

    input::placeholder {
      color: var(--color-text-subtle);
    }

    input:focus {
      outline: none;
      border-color: var(--color-primary);
    }

    input:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }
  `;

  /** Current value (controlled by the parent). */
  @property() value = '';

  /** Field label shown above the input. */
  @property() label = '';

  /** Placeholder text. */
  @property() placeholder = '';

  /** Field name, echoed back in the change event. */
  @property() name = '';

  /** Native input type (text, email, ...). */
  @property() type = 'text';

  /** Marks the field required (shows a red asterisk). */
  @property({type: Boolean}) required = false;

  /** Disables interaction. */
  @property({type: Boolean, reflect: true}) disabled = false;

  private handleInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
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
        <input
          part="input"
          type=${this.type}
          .value=${this.value}
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          aria-label=${this.label}
          @input=${this.handleInput}
        />
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-input': AppInput;
  }
}
