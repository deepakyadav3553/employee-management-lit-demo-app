import {LitElement, html, css, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('empty-state')
export class EmptyState extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 48px 24px;
    }

    .illustration {
      width: 150px;
      max-width: 55%;
      height: auto;
      margin-bottom: 4px;
    }

    .title {
      font-size: 18px;
      font-weight: 700;
      color: #1f2933;
      margin: 0 0 6px;
    }

    .message {
      font-size: 14px;
      color: #94a3b8;
      margin: 0 0 22px;
    }

    .actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
    }
  `;

  @property() image = '';
  @property() heading = '';
  @property() message = '';

  override render() {
    return html`
      <div class="empty">
        ${this.image
          ? html`<img class="illustration" src=${this.image} alt="" />`
          : nothing}
        ${this.heading
          ? html`<h3 class="title">${this.heading}</h3>`
          : nothing}
        ${this.message
          ? html`<p class="message">${this.message}</p>`
          : nothing}
        <div class="actions">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'empty-state': EmptyState;
  }
}
