import {LitElement, html, css, nothing} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import '../components/layout/app-topbar';
import '../components/layout/app-sidebar';
import '../widgets/employees-widget';
import '../widgets/departments-widget';
import '../widgets/reports-widget';
import {NAV_ITEMS} from '../config/navigation';
import type {NavSelectDetail} from '../types/navigation.types';

/**
 * App shell — pure composition + layout. Owns the single source of truth for
 * the active nav item and the mobile sidebar-drawer state, wiring the layout
 * components (top bar, sidebar) to the dashboard widgets via a responsive grid.
 */
@customElement('app-shell')
export class AppShell extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      font-family: var(--font-sans);
      color: var(--color-text);
      background: var(--color-bg);
    }

    .body {
      flex: 1;
      display: grid;
      grid-template-columns: 220px minmax(0, 1fr);
    }

    .main {
      min-width: 0;
      padding: clamp(16px, 3vw, 32px);
      box-sizing: border-box;
    }

    /* Cap content width on ultra-wide screens so it stays readable. */
    .container {
      max-width: 1600px;
      margin: 0 auto;
    }

    .greeting {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
    }

    .greeting h1 {
      margin: 0 0 4px;
      font-size: clamp(20px, 2.5vw, 24px);
      font-weight: 700;
    }

    .greeting p {
      margin: 0;
      font-size: 14px;
      color: var(--color-text-muted);
    }

    .date {
      display: inline-flex;
      align-items: center;
      padding: 8px 14px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      font-size: 13px;
      color: var(--color-text-muted);
      white-space: nowrap;
    }

    /* ---------- Widget grid (matches screenshot) ---------- */
    .widgets {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: clamp(16px, 2vw, 5px);
      align-items: stretch;
    }

    .widgets > * {
      min-width: 0;
    }

    /* Backdrop behind the mobile drawer. */
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 40;
      background: var(--color-overlay);
    }

    /* Tablet: Employees spans the top row, other two share the row below. */
    @media (max-width: 1024px) {
      .body {
        grid-template-columns: 200px minmax(0, 1fr);
      }

      .widgets {
        grid-template-columns: 1fr 1fr;
      }

      .widgets employees-widget {
        grid-column: 1 / -1;
      }
    }

    /* Mobile: single column; sidebar becomes an off-canvas drawer. */
    @media (max-width: 768px) {
      .body {
        grid-template-columns: 1fr;
      }

      .greeting {
        flex-direction: column;
        align-items: flex-start;
      }

      .widgets {
        grid-template-columns: 1fr;
      }

      .widgets employees-widget {
        grid-column: auto;
      }
    }

    /* Backdrop only matters on mobile. */
    @media (min-width: 769px) {
      .backdrop {
        display: none;
      }
    }
  `;

  @state() private activeNav = 'home';
  @state() private sidebarOpen = false;

  private handleNavSelect(event: CustomEvent<NavSelectDetail>): void {
    this.activeNav = event.detail.id;
    this.sidebarOpen = false;
  }

  private handleMenuToggle(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  private closeSidebar(): void {
    this.sidebarOpen = false;
  }

  private get today(): string {
    return new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  override render() {
    return html`
      <app-topbar
        .items=${NAV_ITEMS}
        .active=${this.activeNav}
        @nav-select=${this.handleNavSelect}
        @menu-toggle=${this.handleMenuToggle}
      ></app-topbar>

      <div class="body">
        <app-sidebar
          .items=${NAV_ITEMS}
          .active=${this.activeNav}
          ?open=${this.sidebarOpen}
          @nav-select=${this.handleNavSelect}
        ></app-sidebar>

        ${this.sidebarOpen
          ? html`<div class="backdrop" @click=${this.closeSidebar}></div>`
          : nothing}

        <main class="main">
          <div class="container">
            <div class="greeting">
              <div>
                <h1>Good morning, John</h1>
                <p>Here's what's happening with your team today.</p>
              </div>
              <span class="date">${this.today}</span>
            </div>

            <section class="widgets">
              <employees-widget></employees-widget>
              <departments-widget></departments-widget>
              <reports-widget></reports-widget>
            </section>
          </div>
        </main>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-shell': AppShell;
  }
}
