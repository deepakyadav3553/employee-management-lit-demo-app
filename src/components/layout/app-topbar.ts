import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import type {NavItem, NavSelectDetail} from '../../models/nav';

/**
 * Fired when the mobile menu button is pressed. The shell toggles the
 * sidebar drawer in response.
 */
export type MenuToggleEvent = CustomEvent<void>;

/**
 * Top navigation bar: brand, horizontal nav, search, notifications, avatar.
 * Stateless — the active item is passed in via `active`, and selections are
 * emitted upward as a `nav-select` event. The shell owns the state.
 */
@customElement('app-topbar')
export class AppTopbar extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: 'Segoe UI', system-ui, sans-serif;
      color: #1f2933;
    }

    .topbar {
      display: flex;
      align-items: center;
      gap: clamp(12px, 2vw, 24px);
      padding: 12px clamp(16px, 3vw, 24px);
      background: #fff;
      border-bottom: 1px solid #e6eaf1;
    }

    .menu-btn {
      display: none;
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      background: #f8fafc;
      color: #1f2933;
      font: inherit;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }

    .menu-btn:hover {
      background: #f1f5f9;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: none;
    }

    .brand-mark {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(115deg, #3b6fe0 0%, #4f46e5 100%);
      color: #f8fafc;
      font-size: 15px;
      font-weight: 700;
    }

    .brand-name {
      font-size: 18px;
      font-weight: 700;
    }

    .top-nav {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .nav-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: #64748b;
      font: inherit;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }

    .nav-btn:hover {
      background: #f1f5f9;
      color: #1f2933;
    }

    .nav-btn.active {
      background: #eef2ff;
      color: #4f46e5;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-left: auto;
    }

    .search {
      display: flex;
      align-items: center;
      gap: 8px;
      width: clamp(160px, 22vw, 280px);
      padding: 8px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      background: #f8fafc;
    }

    .search input {
      flex: 1;
      border: none;
      background: transparent;
      font: inherit;
      font-size: 14px;
      color: #1f2933;
      outline: none;
    }

    .icon-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 10px;
      background: #f8fafc;
      font-size: 18px;
      cursor: pointer;
    }

    .badge {
      position: absolute;
      top: 6px;
      right: 6px;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      border-radius: 8px;
      background: #ef4444;
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      line-height: 16px;
      text-align: center;
    }

    .avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(115deg, #3b6fe0 0%, #4f46e5 100%);
      color: #fff;
      font-size: 14px;
      font-weight: 700;
    }

    /* Tablet: sidebar covers navigation, so drop the inline top nav. */
    @media (max-width: 1024px) {
      .top-nav {
        display: none;
      }
    }

    /* Mobile: show the menu button, hide the search field. */
    @media (max-width: 768px) {
      .menu-btn {
        display: inline-flex;
      }

      .search {
        display: none;
      }

      .brand-name {
        display: none;
      }
    }
  `;

  /** Navigation entries to render. */
  @property({attribute: false}) items: readonly NavItem[] = [];

  /** Id of the currently active nav item. */
  @property() active = '';

  private select(id: string): void {
    this.dispatchEvent(
      new CustomEvent<NavSelectDetail>('nav-select', {
        detail: {id},
        bubbles: true,
        composed: true,
      })
    );
  }

  private toggleMenu(): void {
    this.dispatchEvent(
      new CustomEvent('menu-toggle', {bubbles: true, composed: true})
    );
  }

  override render() {
    return html`
      <header class="topbar">
        <button
          class="menu-btn"
          @click=${this.toggleMenu}
          aria-label="Toggle navigation menu"
        >
          Menu
        </button>
        <div class="brand">
          <span class="brand-mark">HR</span>
          <span class="brand-name">Employee Hub</span>
        </div>
        <nav class="top-nav">
          ${this.items.map(
            (item) => html`
              <button
                class=${item.id === this.active ? 'nav-btn active' : 'nav-btn'}
                @click=${() => this.select(item.id)}
              >
                ${item.label}
              </button>
            `
          )}
        </nav>
        <div class="actions">
          <label class="search">
            <input
              type="search"
              placeholder="Search employees, departments..."
              aria-label="Search"
            />
          </label>
          <button class="icon-btn" aria-label="Notifications">
            <span class="badge">1</span>
          </button>
          <span class="avatar" title="John Doe">JD</span>
        </div>
      </header>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-topbar': AppTopbar;
  }
}
