import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';

/** Payload emitted by <app-search> when the query changes. */
export interface SearchChangeDetail {
  value: string;
}

/**
 * Reusable, presentational search input.
 *
 * Dumb component: it owns no data. The current query comes in via `value`
 * (controlled by the parent) and changes are emitted as a `search-change`
 * event. Reuse it in any widget that needs a search field.
 *
 * @fires search-change - CustomEvent<SearchChangeDetail> on every input.
 * @csspart input - The inner <input> element.
 */
@customElement('app-search')
export class AppSearch extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .field {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 9px 14px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface-muted);
      box-sizing: border-box;
      transition: border-color 0.15s ease, background 0.15s ease;
    }

    .field:focus-within {
      border-color: var(--color-primary);
      background: var(--color-surface);
    }

    input {
      flex: 1;
      min-width: 0;
      border: none;
      background: transparent;
      font: inherit;
      font-family: var(--font-sans);
      font-size: 14px;
      color: var(--color-text);
      outline: none;
    }

    input::placeholder {
      color: var(--color-text-subtle);
    }
  `;

  /** Current query value (controlled by the parent). */
  @property() value = '';

  /** Placeholder text. */
  @property() placeholder = 'Search...';

  /** Accessible label for the input. */
  @property() label = 'Search';

  private handleInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.dispatchEvent(
      new CustomEvent<SearchChangeDetail>('search-change', {
        detail: {value},
        bubbles: true,
        composed: true,
      })
    );
  }

  override render() {
    return html`
      <div class="field">
        <input
          part="input"
          type="search"
          .value=${this.value}
          placeholder=${this.placeholder}
          aria-label=${this.label}
          @input=${this.handleInput}
        />
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-search': AppSearch;
  }
}
