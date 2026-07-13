import {LitElement, html, css, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';

export interface InputChangeDetail {
  value: string;
}

@customElement('app-input')
export class AppInput extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    label {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }

    input,
    select {
      font: inherit;
      padding: 9px 10px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: #fff;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    input:focus,
    select:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }

    input.invalid,
    select.invalid {
      border-color: #dc2626;
    }

    .error {
      color: #dc2626;
      font-size: 12px;
    }
  `;

  @property() label = '';
  @property() type = 'text';
  @property() placeholder = '';
  @property() value = '';
  @property() error = '';

  /** When provided, renders a <select> with these options instead of an <input>. */
  @property({attribute: false}) options: string[] | null = null;

  private handleInput(event: Event): void {
    this.value = (event.target as HTMLInputElement | HTMLSelectElement).value;
    this.dispatchEvent(
      new CustomEvent<InputChangeDetail>('input-change', {
        detail: {value: this.value},
        bubbles: true,
        composed: true,
      })
    );
  }

  override render() {
    return html`
      ${this.label ? html`<label for="control">${this.label}</label>` : nothing}
      ${this.options ? this.renderSelect() : this.renderInput()}
      ${this.error ? html`<span class="error">${this.error}</span>` : nothing}
    `;
  }

  private renderInput() {
    return html`
      <input
        id="control"
        type=${this.type}
        class=${this.error ? 'invalid' : ''}
        placeholder=${this.placeholder}
        .value=${this.value}
        @input=${this.handleInput}
      />
    `;
  }

  private renderSelect() {
    return html`
      <select
        id="control"
        class=${this.error ? 'invalid' : ''}
        .value=${this.value}
        @change=${this.handleInput}
      >
        <option value="" disabled ?selected=${!this.value}>
          ${this.placeholder || 'Select an option'}
        </option>
        ${this.options!.map(
          (option) => html`
            <option value=${option} ?selected=${this.value === option}>
              ${option}
            </option>
          `
        )}
      </select>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-input': AppInput;
  }
}
