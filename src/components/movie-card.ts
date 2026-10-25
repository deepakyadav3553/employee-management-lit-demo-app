import {LitElement, html, css, nothing} from 'lit';
import {customElement, state} from 'lit/decorators.js';

/** A single movie entry in the list. */
interface Movie {
  employee: string;
  movie: string;
  /** Stored as the display label, e.g. "4 - Good". Empty when unrated. */
  rating: string;
  recommended: boolean;
}

/** Options for the "Rate the movie" select. */
const RATINGS = [
  '1 - Terrible',
  '2 - Bad',
  '3 - OK',
  '4 - Good',
  '5 - Excellent',
];

/** Seed data — mirrors the Figma ("John Doe / The Jungle Book / 4 - Good / Yes"
 *  plus enough rows to make the "1-5 of 20" pager meaningful). */
const SEED: Movie[] = [
  {employee: 'John Doe', movie: 'The Jungle Book', rating: '4 - Good', recommended: true},
  {employee: 'Jane Smith', movie: 'Inception', rating: '5 - Excellent', recommended: true},
  {employee: 'Alan Turing', movie: 'The Matrix', rating: '5 - Excellent', recommended: true},
  {employee: 'Ada Lovelace', movie: 'Interstellar', rating: '4 - Good', recommended: true},
  {employee: 'Grace Hopper', movie: 'Arrival', rating: '4 - Good', recommended: false},
  {employee: 'Linus Nilsson', movie: 'The Lion King', rating: '3 - OK', recommended: false},
  {employee: 'Maria Garcia', movie: 'Parasite', rating: '5 - Excellent', recommended: true},
  {employee: 'Omar Hassan', movie: 'Dune', rating: '4 - Good', recommended: true},
  {employee: 'Wei Chen', movie: 'Spirited Away', rating: '5 - Excellent', recommended: true},
  {employee: 'Ingrid Berg', movie: 'Frozen', rating: '3 - OK', recommended: false},
  {employee: 'Paolo Rossi', movie: 'The Godfather', rating: '5 - Excellent', recommended: true},
  {employee: 'Sofia Lind', movie: 'Toy Story', rating: '4 - Good', recommended: true},
  {employee: 'Noah Kim', movie: 'Oppenheimer', rating: '4 - Good', recommended: true},
  {employee: 'Emma Wilson', movie: 'La La Land', rating: '3 - OK', recommended: false},
  {employee: 'Lucas Meyer', movie: 'Gladiator', rating: '4 - Good', recommended: true},
  {employee: 'Olivia Brown', movie: 'Coco', rating: '5 - Excellent', recommended: true},
  {employee: 'Hugo Lund', movie: 'Tenet', rating: '2 - Bad', recommended: false},
  {employee: 'Mia Johansson', movie: 'Up', rating: '4 - Good', recommended: true},
  {employee: 'Leo Andersson', movie: 'Joker', rating: '3 - OK', recommended: false},
  {employee: 'Freja Holm', movie: 'Soul', rating: '4 - Good', recommended: true},
];

const PAGE_SIZE_OPTIONS = [5, 10, 20];

/**
 * "Coding exercise" movie widget — an Add-a-movie form plus a paginated movie
 * list, matching the Figma design.
 *
 * Self-contained: holds its own in-memory list state. On desktop the list is a
 * four-column table; below 640px it collapses into expandable cards where each
 * row reveals Rating and Recommended as stacked label/value pairs.
 */
@customElement('movie-card')
export class MovieCard extends LitElement {
  static override styles = css`
    :host {
      display: block;
      box-sizing: border-box;
      max-width: 1100px;
      margin: 0 auto;
      padding: 24px;
      font-family: var(--font-sans);
      color: var(--color-text);
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    h2 {
      margin: 0 0 20px;
      font-size: 20px;
      font-weight: 700;
    }

    /* ---------- Add a movie form ---------- */
    .form {
      display: flex;
      flex-direction: column;
      gap: 18px;
      max-width: 440px;
      margin-bottom: 48px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    label {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text);
    }

    input[type='text'],
    select {
      width: 100%;
      height: 44px;
      padding: 0 12px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: var(--color-surface);
      font: inherit;
      font-size: 14px;
      color: var(--color-text);
    }

    input[type='text']:focus,
    select:focus {
      outline: none;
      border-color: var(--color-text);
    }

    /* Native select with a custom chevron. */
    .select-wrap {
      position: relative;
    }

    select {
      appearance: none;
      -webkit-appearance: none;
      padding-right: 36px;
      cursor: pointer;
    }

    .select-wrap .chevron {
      position: absolute;
      top: 50%;
      right: 12px;
      transform: translateY(-50%);
      pointer-events: none;
      color: var(--color-text-muted);
    }

    .checkbox {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      cursor: pointer;
    }

    .checkbox input {
      width: 18px;
      height: 18px;
      accent-color: var(--color-text);
      cursor: pointer;
    }

    .add-btn {
      align-self: flex-start;
      min-width: 110px;
      padding: 11px 24px;
      border: none;
      border-radius: var(--radius-sm);
      background: #111111;
      color: #ffffff;
      font: inherit;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .add-btn:hover {
      background: #2b2b2b;
    }

    .add-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    /* ---------- Movie list (table) ---------- */
    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead th {
      text-align: left;
      padding: 12px 16px;
      font-size: 13px;
      font-weight: 700;
      color: var(--color-text);
      border-bottom: 1px solid var(--color-text);
    }

    tbody td {
      padding: 16px;
      font-size: 14px;
      color: var(--color-text);
      border-bottom: 1px solid var(--color-border);
    }

    tbody tr:hover {
      background: var(--color-surface-muted);
    }

    .empty {
      padding: 32px 16px;
      text-align: center;
      color: var(--color-text-muted);
    }

    /* ---------- Pagination ---------- */
    .pager {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 20px;
      margin-top: 16px;
      padding: 8px 4px;
      font-size: 13px;
      color: var(--color-text-muted);
    }

    .pager .per-page {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pager select {
      width: auto;
      height: 32px;
      padding: 0 28px 0 10px;
    }

    .pager .per-page .select-wrap .chevron {
      right: 8px;
    }

    .pager-buttons {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .pager-buttons button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      border-radius: var(--radius-sm);
      background: transparent;
      color: var(--color-text);
      cursor: pointer;
    }

    .pager-buttons button:hover:not(:disabled) {
      background: var(--color-surface-hover);
    }

    .pager-buttons button:disabled {
      color: var(--color-text-subtle);
      cursor: not-allowed;
    }

    /* ---------- Mobile cards ---------- */
    .cards {
      display: none;
      flex-direction: column;
    }

    .card-head {
      display: grid;
      grid-template-columns: 1fr 1fr 24px;
      gap: 12px;
      padding: 16px 4px;
      font-size: 13px;
      font-weight: 700;
      border-bottom: 1px solid var(--color-text);
    }

    .row {
      border-bottom: 1px solid var(--color-border);
    }

    .row-summary {
      display: grid;
      grid-template-columns: 1fr 1fr 24px;
      gap: 12px;
      align-items: center;
      width: 100%;
      padding: 16px 4px;
      border: none;
      background: transparent;
      font: inherit;
      font-size: 14px;
      text-align: left;
      color: var(--color-text);
      cursor: pointer;
    }

    .row-summary .toggle {
      display: inline-flex;
      justify-content: flex-end;
      color: var(--color-text-muted);
      transition: transform 0.2s ease;
    }

    .row[open] .row-summary .toggle {
      transform: rotate(180deg);
    }

    .row-detail {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 4px 4px 18px;
    }

    .detail-label {
      font-size: 12px;
      color: var(--color-text-muted);
    }

    .detail-value {
      font-size: 15px;
      color: var(--color-text);
    }

    @media (max-width: 640px) {
      :host {
        padding: 16px;
      }
      .form {
        max-width: none;
      }
      table {
        display: none;
      }
      .cards {
        display: flex;
      }
      .pager {
        justify-content: center;
      }
      .pager .per-page {
        display: none;
      }
    }
  `;

  @state() private movies: Movie[] = [...SEED];

  // Form state
  @state() private employee = '';
  @state() private movieName = '';
  @state() private rating = '';
  @state() private recommend = false;

  // Pagination state
  @state() private page = 0;
  @state() private pageSize = 5;

  // Which mobile card is expanded (index into the current page), -1 = none.
  @state() private expanded = 0;

  private get totalPages(): number {
    return Math.max(1, Math.ceil(this.movies.length / this.pageSize));
  }

  private get pageRows(): Movie[] {
    const start = this.page * this.pageSize;
    return this.movies.slice(start, start + this.pageSize);
  }

  private get canAdd(): boolean {
    return (
      this.employee.trim() !== '' &&
      this.movieName.trim() !== '' &&
      this.rating !== ''
    );
  }

  private addMovie(e: Event) {
    e.preventDefault();
    if (!this.canAdd) return;
    this.movies = [
      {
        employee: this.employee.trim(),
        movie: this.movieName.trim(),
        rating: this.rating,
        recommended: this.recommend,
      },
      ...this.movies,
    ];
    // Reset the form and jump to the first page to reveal the new entry.
    this.employee = '';
    this.movieName = '';
    this.rating = '';
    this.recommend = false;
    this.page = 0;
    this.expanded = 0;
  }

  private goToPage(next: number) {
    this.page = Math.min(Math.max(0, next), this.totalPages - 1);
    this.expanded = -1;
  }

  private changePageSize(size: number) {
    this.pageSize = size;
    this.page = 0;
    this.expanded = -1;
  }

  // ----- render helpers -----

  private renderForm() {
    return html`
      <section>
        <h2>Add a movie</h2>
        <form class="form" @submit=${this.addMovie}>
          <div class="field">
            <label for="employee">Employee name</label>
            <input
              id="employee"
              type="text"
              .value=${this.employee}
              @input=${(e: Event) =>
                (this.employee = (e.target as HTMLInputElement).value)}
            />
          </div>

          <div class="field">
            <label for="movie">Movie name</label>
            <input
              id="movie"
              type="text"
              .value=${this.movieName}
              @input=${(e: Event) =>
                (this.movieName = (e.target as HTMLInputElement).value)}
            />
          </div>

          <div class="field">
            <label for="rating">Rate the movie</label>
            <div class="select-wrap">
              <select
                id="rating"
                .value=${this.rating}
                @change=${(e: Event) =>
                  (this.rating = (e.target as HTMLSelectElement).value)}
              >
                <option value="" disabled selected>Select a rating</option>
                ${RATINGS.map(
                  (r) => html`<option value=${r}>${r}</option>`
                )}
              </select>
              ${this.chevron()}
            </div>
          </div>

          <label class="checkbox">
            <input
              type="checkbox"
              .checked=${this.recommend}
              @change=${(e: Event) =>
                (this.recommend = (e.target as HTMLInputElement).checked)}
            />
            I recommend the movie
          </label>

          <button class="add-btn" type="submit" ?disabled=${!this.canAdd}>
            Add
          </button>
        </form>
      </section>
    `;
  }

  private renderTable() {
    return html`
      <table>
        <thead>
          <tr>
            <th>Employee name</th>
            <th>Movie name</th>
            <th>Rating</th>
            <th>Recommended</th>
          </tr>
        </thead>
        <tbody>
          ${this.pageRows.map(
            (m) => html`
              <tr>
                <td>${m.employee}</td>
                <td>${m.movie}</td>
                <td>${m.rating || '—'}</td>
                <td>${m.recommended ? 'Yes' : 'No'}</td>
              </tr>
            `
          )}
        </tbody>
      </table>
    `;
  }

  private renderCards() {
    return html`
      <div class="cards">
        <div class="card-head">
          <span>Employee name</span>
          <span>Movie name</span>
          <span></span>
        </div>
        ${this.pageRows.map((m, i) => {
          const open = this.expanded === i;
          return html`
            <div class="row" ?open=${open}>
              <button
                class="row-summary"
                aria-expanded=${open}
                @click=${() => (this.expanded = open ? -1 : i)}
              >
                <span>${m.employee}</span>
                <span>${m.movie}</span>
                <span class="toggle">${this.chevron()}</span>
              </button>
              ${open
                ? html`
                    <div class="row-detail">
                      <div>
                        <div class="detail-label">Rating</div>
                        <div class="detail-value">${m.rating || '—'}</div>
                      </div>
                      <div>
                        <div class="detail-label">Recommended</div>
                        <div class="detail-value">
                          ${m.recommended ? 'Yes' : 'No'}
                        </div>
                      </div>
                    </div>
                  `
                : nothing}
            </div>
          `;
        })}
      </div>
    `;
  }

  private renderPager() {
    const total = this.movies.length;
    const start = total === 0 ? 0 : this.page * this.pageSize + 1;
    const end = Math.min(total, (this.page + 1) * this.pageSize);
    const first = this.page === 0;
    const last = this.page >= this.totalPages - 1;
    return html`
      <div class="pager">
        <div class="per-page">
          <span>items per page</span>
          <div class="select-wrap">
            <select
              .value=${String(this.pageSize)}
              @change=${(e: Event) =>
                this.changePageSize(
                  Number((e.target as HTMLSelectElement).value)
                )}
            >
              ${PAGE_SIZE_OPTIONS.map(
                (n) => html`<option value=${n}>${n}</option>`
              )}
            </select>
            ${this.chevron()}
          </div>
        </div>

        <span>${start}–${end} of ${total}</span>

        <div class="pager-buttons">
          <button
            aria-label="First page"
            ?disabled=${first}
            @click=${() => this.goToPage(0)}
          >
            ${this.pageIcon('first')}
          </button>
          <button
            aria-label="Previous page"
            ?disabled=${first}
            @click=${() => this.goToPage(this.page - 1)}
          >
            ${this.pageIcon('prev')}
          </button>
          <button
            aria-label="Next page"
            ?disabled=${last}
            @click=${() => this.goToPage(this.page + 1)}
          >
            ${this.pageIcon('next')}
          </button>
          <button
            aria-label="Last page"
            ?disabled=${last}
            @click=${() => this.goToPage(this.totalPages - 1)}
          >
            ${this.pageIcon('last')}
          </button>
        </div>
      </div>
    `;
  }

  private chevron() {
    return html`<svg
      class="chevron"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>`;
  }

  private pageIcon(kind: 'first' | 'prev' | 'next' | 'last') {
    const s = 16;
    const stroke = html`stroke="currentColor" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round"`;
    switch (kind) {
      case 'first':
        return html`<svg width=${s} height=${s} viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 4L6 8l4 4" ${stroke} /><path d="M4 4v8" ${stroke} />
        </svg>`;
      case 'prev':
        return html`<svg width=${s} height=${s} viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 4L6 8l4 4" ${stroke} />
        </svg>`;
      case 'next':
        return html`<svg width=${s} height=${s} viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M6 4l4 4-4 4" ${stroke} />
        </svg>`;
      case 'last':
        return html`<svg width=${s} height=${s} viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M6 4l4 4-4 4" ${stroke} /><path d="M12 4v8" ${stroke} />
        </svg>`;
    }
  }

  override render() {
    return html`
      ${this.renderForm()}
      <section>
        <h2>Movie list</h2>
        ${this.movies.length === 0
          ? html`<div class="empty">No movies yet. Add one above.</div>`
          : html`${this.renderTable()}${this.renderCards()}${this.renderPager()}`}
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'movie-card': MovieCard;
  }
}
