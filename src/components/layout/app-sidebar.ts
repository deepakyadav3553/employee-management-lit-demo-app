import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import type {NavItem, NavSelectDetail} from '../../types/navigation.types';

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
      background: var(--color-surface);
      border-right: 1px solid var(--color-border-subtle);
      font-family: var(--font-sans);
      color: var(--color-text);
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
      border-radius: var(--radius-md);
      background: transparent;
      color: var(--color-text-muted);
      font: inherit;
      font-size: 14px;
      font-weight: 600;
      text-align: left;
      cursor: pointer;
    }

    .nav-btn:hover {
      background: var(--color-surface-hover);
      color: var(--color-text);
    }

    .nav-btn.active {
      background: var(--color-primary-soft);
      color: var(--color-primary);
    }

    /* Tablet and below: behave as an off-canvas drawer slid in from the left. */
    @media (max-width: 1024px) {
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
        box-shadow: var(--shadow-drawer);
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
