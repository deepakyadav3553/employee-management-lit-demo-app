import {html, fixture, expect} from '@open-wc/testing';
import '../components/employee-table.ts';
import type {EmployeeTable} from '../components/employee-table.ts';

describe('employee-table', () => {
  it('is registered as a custom element', () => {
    expect(customElements.get('employee-table')).to.exist;
  });

  it('renders "Hello, World!" inside an <h1>', async () => {
    const el = await fixture<EmployeeTable>(
      html`<employee-table></employee-table>`
    );
    const heading = el.shadowRoot!.querySelector('h1');
    expect(heading).to.exist;
    expect(heading!.textContent).to.equal('Hello, World!');
  });

  it('passes the accessibility audit', async () => {
    const el = await fixture<EmployeeTable>(
      html`<employee-table></employee-table>`
    );
    await expect(el).to.be.accessible();
  });
});
