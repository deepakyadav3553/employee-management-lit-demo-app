import {LitElement, html, css, nothing, type TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

export interface Movie {
  employee: string;
  movie: string;
  rating: string;
  recommended: boolean;
}

export const DEFAULT_RATINGS: readonly string[] = [
  '1 - Terrible',
  '2 - Bad',
  '3 - OK',
  '4 - Good',
  '5 - Excellent',
];

@customElement('movie-card')
export class MovieCard extends LitElement {
  static override styles = css`
    :host {
      display: block;
      box-sizing: border-box;
      font-family: 'Segoe UI', system-ui, sans-serif;
      color: #1f2933;
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

    .add-section {
      padding: 24px;
      margin-bottom: 48px;
      background: #f7f7f7;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
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
      color: #1f2933;
    }

    input[type='text'],
    select {
      width: 100%;
      height: 44px;
      padding: 0 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #ffffff;
      font: inherit;
      font-size: 14px;
      color: #1f2933;
    }

    input[type='text']:focus,
    select:focus {
      outline: none;
      border-color: #1f2933;
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
      color: #64748b;
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
      accent-color: #1f2933;
      cursor: pointer;
    }

    .add-btn {
      align-self: flex-start;
      min-width: 110px;
      padding: 11px 24px;
      border: none;
      border-radius: 8px;
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

    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #e2e8f0;
    }

    thead th {
      text-align: left;
      padding: 12px 16px;
      font-size: 13px;
      font-weight: 700;
      color: #1f2933;
      border: 1px solid #e2e8f0;
      border-bottom: 1px solid #1f2933;
    }

    tbody td {
      padding: 16px;
      font-size: 14px;
      color: #1f2933;
      border: 1px solid #e2e8f0;
    }

    tbody tr:hover {
      background: #f7f7f7;
    }

    .empty {
      padding: 32px 16px;
      text-align: center;
      color: #64748b;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }

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
      border-bottom: 1px solid #1f2933;
    }

    .row {
      border-bottom: 1px solid #e2e8f0;
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
      color: #1f2933;
      cursor: pointer;
    }

    .row-summary .toggle {
      display: inline-flex;
      justify-content: flex-end;
      color: #64748b;
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
      color: #64748b;
    }

    .detail-value {
      font-size: 15px;
      color: #1f2933;
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

  @property({attribute: false}) movies: Movie[] = [];

  @property({attribute: false}) ratings: readonly string[] = DEFAULT_RATINGS;

  @property({attribute: 'form-title'}) formTitle = 'Add a movie';

  @property({attribute: 'list-title'}) listTitle = 'Movie list';

  @state() private employee = '';
  @state() private movieName = '';
  @state() private rating = '';
  @state() private recommend = false;

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

    this.dispatchEvent(
      new CustomEvent<Movie>('movie-add', {
        detail: newMovie,
        bubbles: true,
        composed: true,
      })
    );

    this.employee = '';
    this.movieName = '';
    this.rating = '';
    this.recommend = false;
  }

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
