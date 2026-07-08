import {LitElement, html, css, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import './app-button';

@customElement('confirm-modal')
export class ConfirmModal extends LitElement {
  static override styles = css`
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 1000;
    }

    .card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.25);
      width: 100%;
      max-width: 420px;
      padding: 24px;
      font-family: 'Segoe UI', system-ui, sans-serif;
      color: #1f2933;
    }

    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }

    .title {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }

    .close {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
      color: #94a3b8;
      padding: 2px;
      border-radius: 4px;
    }

    .close:hover {
      color: #475569;
      background: #f1f5f9;
    }

    .body {
      margin: 12px 0 24px;
      color: #64748b;
      font-size: 15px;
    }

    .highlight {
      display: block;
      margin-top: 4px;
      color: #1f2933;
      font-weight: 600;
    }

    .footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
  `;

  @property({type: Boolean, reflect: true}) open = false;
  @property() heading = 'Confirm';
  @property() message = '';
  @property() highlight = '';
  @property() confirmLabel = 'Confirm';
  @property() cancelLabel = 'Cancel';

  private cancel(): void {
    this.dispatchEvent(new CustomEvent('modal-cancel'));
  }

  private confirm(): void {
    this.dispatchEvent(new CustomEvent('modal-confirm'));
  }

  private handleOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.cancel();
  }

  override render() {
    if (!this.open) return nothing;
    return html`
      <div
        class="overlay"
        role="dialog"
        aria-modal="true"
        aria-label=${this.heading}
        @click=${this.handleOverlayClick}
      >
        <div class="card">
          <div class="header">
            <h2 class="title">${this.heading}</h2>
            <button class="close" aria-label="Close" @click=${this.cancel}>
              &times;
            </button>
          </div>
          <p class="body">
            ${this.message}
            ${this.highlight
              ? html`<span class="highlight">${this.highlight}</span>`
              : nothing}
          </p>
          <div class="footer">
            <app-button
              variant="secondary"
              label=${this.cancelLabel}
              @click=${this.cancel}
            ></app-button>
            <app-button
              variant="danger"
              label=${this.confirmLabel}
              @click=${this.confirm}
            ></app-button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'confirm-modal': ConfirmModal;
  }
}
