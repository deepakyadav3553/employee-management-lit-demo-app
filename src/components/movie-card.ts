import {LitElement, html, css, nothing, type TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

/**
 * A single movie entry.
 *
 * `rating` is stored as the display label (e.g. "4 - Good") so the component
 * stays agnostic about how the host scores movies.
 */
export interface Movie {
  employee: string;
  movie: string;
  rating: string;
  recommended: boolean;
}

/** Default options for the "Rate the movie" select. Override via `.ratings`. */
export const DEFAULT_RATINGS: readonly string[] = [
  '1 - Terrible',
  '2 - Bad',
  '3 - OK',
  '4 - Good',
  '5 - Excellent',
];

/**
 * `<movie-card>` — a framework-agnostic, presentational movie widget.
 *
 * It renders an "Add a movie" form plus a movie list (a bordered table on wide
 * viewports, expandable cards below 640px). It is a **dumb / controlled**
 * component: it never owns the data.
 *
 * ## Data in (properties — set as JS properties, not attributes)
 * - `movies: Movie[]`   The list to render. Default `[]`.
 * - `ratings: string[]` Options for the rating select. Default `DEFAULT_RATINGS`.
 * - `formTitle` / `listTitle` Section headings (for i18n / reuse).
 *
 * ## Changes out (events)
 * - `movie-add` — `CustomEvent<Movie>` fired when the form is submitted.
 *   Bubbles and is `composed`, so any outer shell or framework can listen.
 *   The component clears the form but does **not** touch `movies`; the host
 *   appends the entry and passes the new array back in.
 *
 * ## Theming (CSS custom properties, all optional)
 * `--mc-font`, `--mc-text`, `--mc-text-muted`, `--mc-text-subtle`,
 * `--mc-surface`, `--mc-surface-muted`, `--mc-border`, `--mc-border-strong`,
 * `--mc-radius-sm`, `--mc-radius-lg`, `--mc-accent`, `--mc-button-bg`,
 * `--mc-button-bg-hover`, `--mc-button-text`. Each has a built-in fallback,
 * so the component looks right with no external stylesheet.
 *
 * @fires movie-add - A movie was submitted via the form. `detail` is the `Movie`.
 *
 * @example Plain HTML
 * ```html
 * <movie-card></movie-card>
 * <script type="module">
 *   const el = document.querySelector('movie-card');
 *   el.movies = [{employee: 'John Doe', movie: 'Dune', rating: '4 - Good', recommended: true}];
 *   el.addEventListener('movie-add', (e) => { el.movies = [e.detail, ...el.movies]; });
 * </script>
 * ```
 *
 * @example React
 * ```tsx
 * <movie-card
 *   ref={el => { if (el) el.movies = movies; }}
 *   onmovie-add={e => setMovies(m => [e.detail, ...m])}
 * />
 * ```
 */
@customElement('movie-card')
export class MovieCard extends LitElement {
  static override styles = css`
    :host {
      /* Theming tokens — each falls back to the host app's token, then to a
         hard default, so the component is self-sufficient anywhere. */
      --_font: var(--mc-font, var(--font-sans, 'Segoe UI', system-ui, sans-serif));
      --_text: var(--mc-text, var(--color-text, #1f2933));
      --_text-muted: var(--mc-text-muted, var(--color-text-muted, #64748b));
      --_text-subtle: var(--mc-text-subtle, var(--color-text-subtle, #94a3b8));
      --_surface: var(--mc-surface, var(--color-surface, #ffffff));
      --_surface-muted: var(--mc-surface-muted, #f7f7f7);
      --_border: var(--mc-border, var(--color-border, #e2e8f0));
      --_border-strong: var(--mc-border-strong, var(--color-text, #1f2933));
      --_radius-sm: var(--mc-radius-sm, var(--radius-sm, 8px));
      --_radius-lg: var(--mc-radius-lg, var(--radius-lg, 16px));
      --_accent: var(--mc-accent, var(--color-primary, #4f46e5));
      --_button-bg: var(--mc-button-bg, #111111);
      --_button-bg-hover: var(--mc-button-bg-hover, #2b2b2b);
      --_button-text: var(--mc-button-text, #ffffff);

      display: block;
      box-sizing: border-box;
      font-family: var(--_font);
      color: var(--_text);
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
      background: var(--_surface-muted);
      border: 1px solid var(--_border);
      border-radius: var(--_radius-lg);
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
      color: var(--_text);
    }

    input[type='text'],
    select {
      width: 100%;
      height: 44px;
      padding: 0 12px;
      border: 1px solid var(--_border);
      border-radius: var(--_radius-sm);
      background: var(--_surface);
      font: inherit;
      font-size: 14px;
      color: var(--_text);
    }

    input[type='text']:focus,
    select:focus {
      outline: none;
      border-color: var(--_text);
    }

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
      color: var(--_text-muted);
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
      accent-color: var(--_text);
      cursor: pointer;
    }

    .add-btn {
      align-self: flex-start;
      min-width: 110px;
      padding: 11px 24px;
      border: none;
      border-radius: var(--_radius-sm);
      background: var(--_button-bg);
      color: var(--_button-text);
      font: inherit;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .add-btn:hover {
      background: var(--_button-bg-hover);
    }

    .add-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    /* ---------- Movie list (table) ---------- */
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid var(--_border);
    }

    thead th {
      text-align: left;
      padding: 12px 16px;
      font-size: 13px;
      font-weight: 700;
      color: var(--_text);
      border: 1px solid var(--_border);
      border-bottom: 1px solid var(--_border-strong);
    }

    tbody td {
      padding: 16px;
      font-size: 14px;
      color: var(--_text);
      border: 1px solid var(--_border);
    }

    tbody tr:hover {
      background: var(--_surface-muted);
    }

    .empty {
      padding: 32px 16px;
      text-align: center;
      color: var(--_text-muted);
      border: 1px solid var(--_border);
      border-radius: var(--_radius-sm);
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
      border-bottom: 1px solid var(--_border-strong);
    }

    .row {
      border-bottom: 1px solid var(--_border);
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
      color: var(--_text);
      cursor: pointer;
    }

    .row-summary .toggle {
      display: inline-flex;
      justify-content: flex-end;
      color: var(--_text-muted);
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
      color: var(--_text-muted);
    }

    .detail-value {
      font-size: 15px;
      color: var(--_text);
    }

    @media (max-width: 640px) {
      .add-section {
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

  /** The movies to render. Owned by the host; set as a JS property. */
  @property({attribute: false}) movies: Movie[] = [];

  /** Options shown in the rating select. */
  @property({attribute: false}) ratings: readonly string[] = DEFAULT_RATINGS;

  /** Heading above the form. */
  @property({attribute: 'form-title'}) formTitle = 'Add a movie';

  /** Heading above the list. */
  @property({attribute: 'list-title'}) listTitle = 'Movie list';

  // ----- transient UI state (local to the component) -----
  @state() private employee = '';
  @state() private movieName = '';
  @state() private rating = '';
  @state() private recommend = false;

  /** Index of the expanded mobile card, -1 = none. */
  @state() private expanded = 0;

  private get canAdd(): boolean {
    return (
      this.employee.trim() !== '' &&
      this.movieName.trim() !== '' &&
      this.rating !== ''
    );
  }

  private onSubmit(submitEvent: Event): void {
    submitEvent.preventDefault();
    if (!this.canAdd) {
      return;
    }

    const newMovie: Movie = {
      employee: this.employee.trim(),
      movie: this.movieName.trim(),
      rating: this.rating,
      recommended: this.recommend,
    };

    // Notify the host; it owns the list and decides what to do with the entry.
    this.dispatchEvent(
      new CustomEvent<Movie>('movie-add', {
        detail: newMovie,
        bubbles: true,
        composed: true,
      })
    );

    // Reset the transient form state.
    this.employee = '';
    this.movieName = '';
    this.rating = '';
    this.recommend = false;
  }

  // ----- render helpers -----

  private renderForm(): TemplateResult {
    return html`
      <section class="add-section">
        <h2>${this.formTitle}</h2>
        <form class="form" @submit=${this.onSubmit}>
          <div class="field">
            <label for="employee">Employee name</label>
            <input
              id="employee"
              type="text"
              .value=${this.employee}
              @input=${(inputEvent: Event): void => {
                this.employee = (inputEvent.target as HTMLInputElement).value;
              }}
            />
          </div>

          <div class="field">
            <label for="movie">Movie name</label>
            <input
              id="movie"
              type="text"
              .value=${this.movieName}
              @input=${(inputEvent: Event): void => {
                this.movieName = (inputEvent.target as HTMLInputElement).value;
              }}
            />
          </div>

          <div class="field">
            <label for="rating">Rate the movie</label>
            <div class="select-wrap">
              <select
                id="rating"
                .value=${this.rating}
                @change=${(changeEvent: Event): void => {
                  this.rating = (changeEvent.target as HTMLSelectElement).value;
                }}
              >
                <option value="" disabled selected>Select a rating</option>
                ${this.ratings.map(
                  (ratingOption) =>
                    html`<option value=${ratingOption}>${ratingOption}</option>`
                )}
              </select>
              ${this.chevron()}
            </div>
          </div>

          <label class="checkbox">
            <input
              type="checkbox"
              .checked=${this.recommend}
              @change=${(changeEvent: Event): void => {
                this.recommend = (changeEvent.target as HTMLInputElement).checked;
              }}
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

  private renderTable(): TemplateResult {
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
            (movieEntry) => html`
              <tr>
                <td>${movieEntry.employee}</td>
                <td>${movieEntry.movie}</td>
                <td>${movieEntry.rating || '—'}</td>
                <td>${movieEntry.recommended ? 'Yes' : 'No'}</td>
              </tr>
            `
          )}
        </tbody>
      </table>
    `;
  }

  private renderCards(): TemplateResult {
    return html`
      <div class="cards">
        <div class="card-head">
          <span>Employee name</span>
          <span>Movie name</span>
          <span></span>
        </div>
        ${this.movies.map((movieEntry, rowIndex) => {
          const isExpanded = this.expanded === rowIndex;
          return html`
            <div class="row" ?open=${isExpanded}>
              <button
                class="row-summary"
                aria-expanded=${isExpanded}
                @click=${(): void => {
                  this.expanded = isExpanded ? -1 : rowIndex;
                }}
              >
                <span>${movieEntry.employee}</span>
                <span>${movieEntry.movie}</span>
                <span class="toggle">${this.chevron()}</span>
              </button>
              ${isExpanded
                ? html`
                    <div class="row-detail">
                      <div>
                        <div class="detail-label">Rating</div>
                        <div class="detail-value">
                          ${movieEntry.rating || '—'}
                        </div>
                      </div>
                      <div>
                        <div class="detail-label">Recommended</div>
                        <div class="detail-value">
                          ${movieEntry.recommended ? 'Yes' : 'No'}
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

  private chevron(): TemplateResult {
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

  override render(): TemplateResult {
    return html`
      ${this.renderForm()}
      <section>
        <h2>${this.listTitle}</h2>
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
  interface HTMLElementEventMap {
    'movie-add': CustomEvent<Movie>;
  }
}
