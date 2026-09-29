import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import type {NavItem, NavSelectDetail} from '../../models/nav';

/**
 * Left sidebar navigation. Stateless — active item comes in via `active`,
 * selections are emitted upward as a `nav-select` event handled by the shell.
 */
@customElement('app-sidebar')
export class AppSidebar extends LitElement {
  static override styles = css`
    :host {
      display: block;
      height: 100%;
      background: #fff;
      border-right: 1px solid #e6eaf1;
      font-family: 'Segoe UI', system-ui, sans-serif;
      color: #1f2933;
    }

    nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 24px 16px;
    }

    .nav-btn {
      display: block;
      width: 100%;
      padding: 10px 14px;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: #64748b;
      font: inherit;
      font-size: 14px;
      font-weight: 600;
      text-align: left;
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

    /* Mobile: behave as an off-canvas drawer slid in from the left. */
    @media (max-width: 768px) {
      :host {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        width: 260px;
        max-width: 80vw;
        z-index: 50;
        transform: translateX(-100%);
        transition: transform 0.25s ease;
        box-shadow: 0 20px 45px rgba(15, 23, 42, 0.2);
      }

      :host([open]) {
        transform: translateX(0);
      }
    }
  `;

  /** Navigation entries to render. */
  @property({attribute: false}) items: readonly NavItem[] = [];

  /** Id of the currently active nav item. */
  @property() active = '';

  /** Drawer open state (used on mobile; shell reflects it for styling). */
  @property({type: Boolean, reflect: true}) open = false;

  private select(id: string): void {
    this.dispatchEvent(
      new CustomEvent<NavSelectDetail>('nav-select', {
        detail: {id},
        bubbles: true,
        composed: true,
      })
    );
  }

  override render() {
    return html`
      <nav>
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
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-sidebar': AppSidebar;
  }
}
