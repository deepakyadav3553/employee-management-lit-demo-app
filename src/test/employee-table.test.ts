import {html, fixture, expect} from '@open-wc/testing';
import '../components/employee-table.ts';
import type {EmployeeTable} from '../components/employee-table.ts';

async function createElement(): Promise<EmployeeTable> {
  // Start each test from a clean store.
  localStorage.clear();
  return fixture<EmployeeTable>(html`<employee-table></employee-table>`);
}

function rows(el: EmployeeTable): HTMLTableRowElement[] {
  return Array.from(el.shadowRoot!.querySelectorAll('tbody tr'));
}

function setInput(el: EmployeeTable, id: string, value: string): void {
  const input = el.shadowRoot!.querySelector<HTMLInputElement>(`#${id}`)!;
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

function submit(el: EmployeeTable): void {
  el.shadowRoot!
    .querySelector('form')!
    .dispatchEvent(new Event('submit', {cancelable: true}));
}

describe('employee-table', () => {
  it('is registered as a custom element', () => {
    expect(customElements.get('employee-table')).to.exist;
  });

  it('renders the seeded employees in a table', async () => {
    const el = await createElement();
    expect(rows(el).length).to.equal(3);
    expect(el.shadowRoot!.querySelector('h1')!.textContent).to.equal(
      'Employee Management'
    );
  });

  it('creates a new employee from the form', async () => {
    const el = await createElement();
    const startCount = rows(el).length;

    setInput(el, 'name', 'Margaret Hamilton');
    setInput(el, 'department', 'Engineering');
    setInput(el, 'designation', 'Director');
    setInput(el, 'email', 'margaret@example.com');
    submit(el);
    await el.updateComplete;

    expect(rows(el).length).to.equal(startCount + 1);
    expect(el.shadowRoot!.textContent).to.contain('Margaret Hamilton');
  });

  it('clears the form after a successful save', async () => {
    const el = await createElement();
    setInput(el, 'name', 'Temp Person');
    setInput(el, 'department', 'Operations');
    setInput(el, 'designation', 'Lead');
    setInput(el, 'email', 'temp@example.com');
    // Flush the render so the inputs reflect the typed values before saving,
    // mirroring how a real browser commits each keystroke.
    await el.updateComplete;
    submit(el);
    await el.updateComplete;

    const nameInput =
      el.shadowRoot!.querySelector<HTMLInputElement>('#name')!;
    expect(nameInput.value).to.equal('');
  });

  it('shows validation errors for an invalid email', async () => {
    const el = await createElement();
    const startCount = rows(el).length;

    setInput(el, 'name', 'Test User');
    setInput(el, 'department', 'Marketing');
    setInput(el, 'designation', 'Tester');
    setInput(el, 'email', 'not-an-email');
    submit(el);
    await el.updateComplete;

    expect(el.shadowRoot!.querySelectorAll('.error').length).to.be.greaterThan(
      0
    );
    // Nothing was added because submission was blocked.
    expect(rows(el).length).to.equal(startCount);
  });

  it('updates an existing employee via Edit', async () => {
    const el = await createElement();
    el.shadowRoot!.querySelector<HTMLButtonElement>('.btn-edit')!.click();
    await el.updateComplete;

    setInput(el, 'designation', 'Updated Designation');
    submit(el);
    await el.updateComplete;

    expect(el.shadowRoot!.textContent).to.contain('Updated Designation');
    // Editing then saving should not create an extra row.
    expect(rows(el).length).to.equal(3);
  });

  it('deletes an employee', async () => {
    const el = await createElement();
    // Auto-confirm the delete dialog.
    const originalConfirm = window.confirm;
    window.confirm = () => true;
    try {
      el.shadowRoot!.querySelector<HTMLButtonElement>('.btn-delete')!.click();
      await el.updateComplete;
    } finally {
      window.confirm = originalConfirm;
    }
    expect(rows(el).length).to.equal(2);
  });

  it('passes the accessibility audit', async () => {
    const el = await createElement();
    await expect(el).to.be.accessible();
  });
});
