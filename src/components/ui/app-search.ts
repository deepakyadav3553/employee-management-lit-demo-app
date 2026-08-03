import {LitElement, html, css, svg, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';

export interface SearchChangeDetail {
  value: string;
}

@customElement('app-search')
export class AppSearch extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .field {
      position: relative;
      display: flex;
      align-items: center;
    }

    .icon {
      position: absolute;
      left: 12px;
      width: 18px;
      height: 18px;
      color: #9aa5b8;
      pointer-events: none;
    }

    input {
      font: inherit;
      width: 100%;
      box-sizing: border-box;
      padding: 11px 38px 11px 40px;
      border: 1px solid #e2e6ee;
      border-radius: 10px;
      background: #fff;
      color: #1f2933;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    input::placeholder {
      color: #9aa5b8;
    }

    input:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }

    input::-webkit-search-decoration,
    input::-webkit-search-cancel-button {
      -webkit-appearance: none;
      appearance: none;
    }

    .clear {
      position: absolute;
      right: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      padding: 0;
      border: none;
      border-radius: 6px;
      background: none;
      color: #64748b;
      font-size: 18px;
      line-height: 1;
      cursor: pointer;
    }

    .clear:hover {
      background: #f1f5f9;
      color: #1f2933;
    }
  `;

  @property() value = '';
  @property() placeholder = 'Search';
  @property() label = '';
  @property({type: Number}) debounce = 200;

  private timer: ReturnType<typeof setTimeout> | undefined;

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.cancelPending();
  }

  focusInput(): void {
    this.renderRoot?.querySelector('input')?.focus();
  }

  private cancelPending(): void {
    if (this.timer !== undefined) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  private emit(): void {
    this.dispatchEvent(
      new CustomEvent<SearchChangeDetail>('search-change', {
        detail: {value: this.value},
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.cancelPending();
    if (this.debounce <= 0) {
      this.emit();
      return;
    }
    this.timer = setTimeout(() => {
      this.timer = undefined;
      this.emit();
    }, this.debounce);
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.value) {
      event.stopPropagation();
      this.clear();
    }
  }

  private clear(): void {
    this.cancelPending();
    this.value = '';
    this.emit();
    this.focusInput();
  }

  override render() {
    return html`
      <div class="field">
        ${svg`
          <svg
            class="icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        `}
        <input
          type="search"
          role="searchbox"
          placeholder=${this.placeholder}
          aria-label=${this.label || this.placeholder}
          .value=${this.value}
          @input=${this.handleInput}
          @keydown=${this.handleKeydown}
        />
        ${this.value
          ? html`
              <button
                class="clear"
                type="button"
                aria-label="Clear search"
                @click=${this.clear}
              >
                &times;
              </button>
            `
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-search': AppSearch;
  }
}
