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

/** Seed data — mirrors the Figma ("John Doe / The Jungle Book / 4 - Good / Yes")
 *  with five starter rows. */
const SEED: Movie[] = [
  {employee: 'John Doe', movie: 'The Jungle Book', rating: '4 - Good', recommended: true},
  {employee: 'Jane Smith', movie: 'Inception', rating: '5 - Excellent', recommended: true},
  {employee: 'Alan Turing', movie: 'The Matrix', rating: '5 - Excellent', recommended: true},
  {employee: 'Ada Lovelace', movie: 'Interstellar', rating: '4 - Good', recommended: true},
  {employee: 'Grace Hopper', movie: 'Arrival', rating: '4 - Good', recommended: false},
];

/**
 * "Coding exercise" movie widget — an Add-a-movie form plus a movie list,
 * matching the Figma design.
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
    .add-section {
      padding: 24px;
      margin-bottom: 48px;
      background: #f7f7f7;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
    }

    .add-section h2 {
      margin-bottom: 20px;
    }

    .form {
      display: flex;
      flex-direction: column;
      gap: 18px;
      max-width: 440px;
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
    }
  `;

  @state() private movies: Movie[] = [...SEED];

  // Form state
  @state() private employee = '';
  @state() private movieName = '';
  @state() private rating = '';
  @state() private recommend = false;

  // Which mobile card is expanded (index into the list), -1 = none.
  @state() private expanded = 0;

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
    // Reset the form and expand the new (first) entry.
    this.employee = '';
    this.movieName = '';
    this.rating = '';
    this.recommend = false;
    this.expanded = 0;
  }

  // ----- render helpers -----

  private renderForm() {
    return html`
      <section class="add-section">
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
          ${this.movies.map(
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
        ${this.movies.map((m, i) => {
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

  override render() {
    return html`
      ${this.renderForm()}
      <section>
        <h2>Movie list</h2>
        ${this.movies.length === 0
          ? html`<div class="empty">No movies yet. Add one above.</div>`
          : html`${this.renderTable()}${this.renderCards()}`}
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'movie-card': MovieCard;
  }
}
