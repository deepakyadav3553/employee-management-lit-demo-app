import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';

/**
 * Font Awesome icon name → glyph (Free set). Add entries here as needed. Using
 * the raw glyph (rather than the `.fa-*` classes) means the icon renders inside
 * a shadow root, where the global Font Awesome class rules do not reach — only
 * its @font-face does.
 */
const GLYPHS: Record<string, string> = {
  pen: '',
  edit: '', // pen-to-square
  'pen-to-square': '',
  trash: '',
  'trash-can': '',
  plus: '',
  xmark: '',
  check: '',
  'chevron-left': '',
  'chevron-right': '',
  search: '',
  user: '',
  eye: ''
};

/**
 * Reusable, presentational Font Awesome icon.
 *
 * Dumb component: pass an icon `name` (or a raw `glyph`). It renders the glyph
 * with the Font Awesome font, scaling to the current font-size and colour so it
 * inherits from whatever contains it (e.g. a button). Decorative by default;
 * set `label` to expose it to assistive tech.
 */
@customElement('app-icon')
export class AppIcon extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }

    .glyph {
      font-family: 'Font Awesome 6 Free';
      font-weight: 900;
      font-style: normal;
      font-variant: normal;
      text-rendering: auto;
      -webkit-font-smoothing: antialiased;
    }
  `;

  /** Icon name from the GLYPHS map (e.g. "edit", "trash"). */
  @property() name = '';

  /** Raw glyph override, if the icon isn't in the map. */
  @property() glyph = '';

  /** Accessible label; when omitted the icon is treated as decorative. */
  @property() label = '';

  override render() {
    const glyph = this.glyph || GLYPHS[this.name] || '';
    const decorative = !this.label;
    return html`
      <span
        class="glyph"
        role=${decorative ? 'presentation' : 'img'}
        aria-hidden=${decorative ? 'true' : 'false'}
        aria-label=${this.label || ''}
        >${glyph}</span
      >
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-icon': AppIcon;
  }
}
