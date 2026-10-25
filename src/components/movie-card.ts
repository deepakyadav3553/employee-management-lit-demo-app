import {LitElement, html, css, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';

/**
 * Presentational movie card.
 *
 * Dumb component: no data fetching, no business logic. Feed it a poster, a
 * title and some metadata and it renders a self-contained card. Reads the
 * global theme tokens from variables.css via var(...), so it restyles with
 * the rest of the app.
 *
 * @csspart card - The outer card element, for advanced overrides.
 */
@customElement('movie-card')
export class MovieCard extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
      width: 240px;
    }

    .card {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card);
      font-family: var(--font-sans);
      color: var(--color-text);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-drawer);
    }

    .poster {
      position: relative;
      aspect-ratio: 2 / 3;
      background: var(--color-surface-muted);
    }

    .poster img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .poster .placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      font-size: 40px;
      color: var(--color-text-subtle);
    }

    .rating {
      position: absolute;
      top: 10px;
      right: 10px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      background: var(--color-overlay);
      color: #ffffff;
      font-size: 13px;
      font-weight: 600;
    }

    .body {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 14px 16px 16px;
    }

    .title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      line-height: 1.3;
    }

    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 10px;
      font-size: 13px;
      color: var(--color-text-muted);
    }

    .genre {
      align-self: flex-start;
      margin-top: 4px;
      padding: 3px 10px;
      border-radius: var(--radius-sm);
      background: var(--color-primary-soft);
      color: var(--color-primary);
      font-size: 12px;
      font-weight: 600;
    }
  `;

  /** URL of the poster image. Falls back to a placeholder when empty. */
  @property() poster = '';

  /** Movie title. */
  @property() title = 'Untitled';

  /** Release year. */
  @property() year = '';

  /** Primary genre, shown as a pill. */
  @property() genre = '';

  /** Rating out of 10 (e.g. "8.4"). Hidden when empty. */
  @property() rating = '';

  override render() {
    return html`
      <article class="card" part="card">
        <div class="poster">
          ${this.poster
            ? html`<img src=${this.poster} alt=${`${this.title} poster`} />`
            : html`<div class="placeholder" aria-hidden="true">🎬</div>`}
          ${this.rating
            ? html`<span class="rating">★ ${this.rating}</span>`
            : nothing}
        </div>
        <div class="body">
          <h3 class="title">${this.title}</h3>
          ${this.year
            ? html`<div class="meta"><span>${this.year}</span></div>`
            : nothing}
          ${this.genre
            ? html`<span class="genre">${this.genre}</span>`
            : nothing}
        </div>
      </article>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'movie-card': MovieCard;
  }
}
