import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';

/** Payload emitted by <app-pagination> when the page changes. */
export interface PageChangeDetail {
  page: number;
}

/**
 * Reusable, presentational pagination control.
 *
 * Dumb component: it owns no data. Feed it the total item `count`, the
 * `pageSize`, and the current `page`; it works out the page numbers and emits a
 * `page-change` event when the user picks one. The parent slices its own data
 * accordingly. Reuse it under any list or table.
 *
 * @fires page-change - CustomEvent<PageChangeDetail> when a page is selected.
 */
@customElement('app-pagination')
export class AppPagination extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      font-family: var(--font-sans);
      color: var(--color-text);
    }

    .summary {
      font-size: 13px;
      color: var(--color-text-muted);
    }

    .pages {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    button {
      min-width: 32px;
      height: 32px;
      padding: 0 8px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      color: var(--color-text);
      font: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease, border-color 0.15s ease;
    }

    button:hover:not(:disabled):not(.active) {
      background: var(--color-surface-hover);
    }

    button.active {
      background: var(--color-primary);
      border-color: var(--color-primary);
      color: var(--color-primary-contrast);
      cursor: default;
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .ellipsis {
      min-width: 20px;
      text-align: center;
      color: var(--color-text-subtle);
      font-size: 13px;
    }
  `;

  /** Total number of items across all pages. */
  @property({type: Number}) count = 0;

  /** Items shown per page. */
  @property({type: Number, attribute: 'page-size'}) pageSize = 10;

  /** Current page (1-based). */
  @property({type: Number}) page = 1;

  private get totalPages(): number {
    return Math.max(1, Math.ceil(this.count / Math.max(1, this.pageSize)));
  }

  private get currentPage(): number {
    return Math.min(Math.max(1, this.page), this.totalPages);
  }

  /** Page numbers to render, collapsing long ranges with '…'. */
  private get items(): Array<number | '…'> {
    const total = this.totalPages;
    const current = this.currentPage;
    if (total <= 7) {
      return Array.from({length: total}, (_, i) => i + 1);
    }
    const result: Array<number | '…'> = [1];
    const left = Math.max(2, current - 1);
    const right = Math.min(total - 1, current + 1);
    if (left > 2) result.push('…');
    for (let p = left; p <= right; p++) result.push(p);
    if (right < total - 1) result.push('…');
    result.push(total);
    return result;
  }

  private go(page: number): void {
    const next = Math.min(Math.max(1, page), this.totalPages);
    if (next === this.currentPage) return;
    this.dispatchEvent(
      new CustomEvent<PageChangeDetail>('page-change', {
        detail: {page: next},
        bubbles: true,
        composed: true,
      })
    );
  }

  override render() {
    const current = this.currentPage;
    const total = this.totalPages;
    const start = this.count === 0 ? 0 : (current - 1) * this.pageSize + 1;
    const end = Math.min(current * this.pageSize, this.count);

    return html`
      <span class="summary">
        Showing ${start}-${end} of ${this.count}
      </span>
      <div class="pages">
        <button
          ?disabled=${current === 1}
          @click=${() => this.go(current - 1)}
          aria-label="Previous page"
        >
          ‹
        </button>
        ${this.items.map((item) =>
          item === '…'
            ? html`<span class="ellipsis">…</span>`
            : html`<button
                class=${item === current ? 'active' : ''}
                @click=${() => this.go(item)}
              >
                ${item}
              </button>`
        )}
        <button
          ?disabled=${current === total}
          @click=${() => this.go(current + 1)}
          aria-label="Next page"
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
