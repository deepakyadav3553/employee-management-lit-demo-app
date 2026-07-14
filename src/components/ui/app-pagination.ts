import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';

export interface PageChangeDetail {
  page: number;
}

@customElement('app-pagination')
export class AppPagination extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
    }

    .pager {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    button {
      font: inherit;
      min-width: 32px;
      height: 32px;
      padding: 0 8px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #fff;
      color: #475569;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
    }

    button:hover:not(:disabled) {
      background: #f1f5f9;
    }

    button.active {
      background: #2563eb;
      border-color: #2563eb;
      color: #fff;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;

  @property({type: Number}) page = 1;
  @property({type: Number}) totalPages = 1;

  private goTo(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.page) return;
    this.dispatchEvent(
      new CustomEvent<PageChangeDetail>('page-change', {
        detail: {page},
        bubbles: true,
        composed: true,
      })
    );
  }

  override render() {
    const page = this.page;
    const totalPages = this.totalPages;
    return html`
      <div class="pager">
        <button
          aria-label="Previous page"
          ?disabled=${page === 1}
          @click=${() => this.goTo(page - 1)}
        >
          ‹
        </button>
        ${Array.from({length: totalPages}, (_, i) => i + 1).map(
          (n) => html`
            <button
              class=${n === page ? 'active' : ''}
              aria-label=${`Page ${n}`}
              aria-current=${n === page ? 'page' : 'false'}
              @click=${() => this.goTo(n)}
            >
              ${n}
            </button>
          `
        )}
        <button
          aria-label="Next page"
          ?disabled=${page === totalPages}
          @click=${() => this.goTo(page + 1)}
        >
          ›
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-pagination': AppPagination;
  }
}
