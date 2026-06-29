import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('employee-table')
export class EmployeeTable extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: sans-serif;
    }
  `;

  override render() {
    return html`<h1>Hello, World</h1>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'employee-table': EmployeeTable;
  }
}
