import {fixture, html, oneEvent} from '@open-wc/testing';
import {expect} from 'chai';
import '../components/employee/employee-table';
import type {EmployeeTable} from '../components/employee/employee-table';
import type {Employee} from '../models/employee';

const PAGE_SIZE = 5;

function makeEmployees(n: number, offset = 0): Employee[] {
  return Array.from({length: n}, (_, i) => ({
    id: String(i + offset),
    name: `Person ${i + offset}`,
    department: 'Engineering',
    designation: 'Developer',
    email: `p${i + offset}@example.com`,
  }));
}

/**
 * The table is dumb: it gets the current page's rows plus counts, never the
 * full employee list.
 */
const table = (pageItems: Employee[], total = pageItems.length, page = 1) =>
  fixture<EmployeeTable>(
    html`<employee-table
      .pageItems=${pageItems}
      .total=${total}
      .page=${page}
      .pageSize=${PAGE_SIZE}
    ></employee-table>`
  );

describe('employee-table', () => {
  it('renders the empty state when there are no employees', async () => {
    const el = await table([]);
    expect(el.shadowRoot!.querySelector('empty-state')).to.exist;
    expect(el.shadowRoot!.querySelector('table')).to.equal(null);
  });

  it('renders one row per employee on the page', async () => {
    const el = await table(makeEmployees(3));
    expect(el.shadowRoot!.querySelectorAll('tbody tr')).to.have.length(3);
  });

  it('derives the visible range from the counts', async () => {
    const el = await table(makeEmployees(3));
    expect(el.shadowRoot!.querySelector('.summary')!.textContent).to.contain(
      'Showing 1 to 3 of 3'
    );
  });

  it('derives the range for a later page', async () => {
    const el = await table(makeEmployees(1, 5), 6, 2);
    expect(el.shadowRoot!.querySelector('.summary')!.textContent).to.contain(
      'Showing 6 to 6 of 6'
    );
  });

  it('derives the page count from total and pageSize', async () => {
    const el = await table(makeEmployees(5), 6);
    const pagination = el.shadowRoot!.querySelector('app-pagination')!;
    expect(pagination.totalPages).to.equal(2);
    expect(pagination.page).to.equal(1);
  });

  it('renders avatar initials from the name', async () => {
    const el = await table([
      {
        id: '1',
        name: 'Ada Lovelace',
        department: 'Engineering',
        designation: 'Developer',
        email: 'ada@example.com',
      },
    ]);
    expect(el.shadowRoot!.querySelector('.avatar')!.textContent!.trim()).to.equal(
      'AL'
    );
  });

  it('emits employee-edit with the row employee', async () => {
    const el = await table(makeEmployees(1));
    const editBtn = el.shadowRoot!.querySelector<HTMLElement>(
      'app-button[variant="icon-primary"]'
    )!;
    setTimeout(() => editBtn.click());
    const event = (await oneEvent(
      el,
      'employee-edit'
    )) as CustomEvent<Employee>;
    expect(event.detail.id).to.equal('0');
  });

  it('emits employee-delete with the row employee', async () => {
    const el = await table(makeEmployees(1));
    const deleteBtn = el.shadowRoot!.querySelector<HTMLElement>(
      'app-button[variant="icon-danger"]'
    )!;
    setTimeout(() => deleteBtn.click());
    const event = (await oneEvent(
      el,
      'employee-delete'
    )) as CustomEvent<Employee>;
    expect(event.detail.id).to.equal('0');
  });

  it('emits employee-add-request from the empty-state action', async () => {
    const el = await table([]);
    const addBtn = el.shadowRoot!.querySelector<HTMLElement>(
      'app-button[variant="primary"]'
    )!;
    setTimeout(() => addBtn.click());
    await oneEvent(el, 'employee-add-request');
  });

  it('emits add-dummies from the empty-state link', async () => {
    const el = await table([]);
    const link = el.shadowRoot!.querySelector<HTMLButtonElement>(
      '.dummy-link'
    )!;
    setTimeout(() => link.click());
    await oneEvent(el, 'add-dummies');
  });
});
