import {fixture, html, oneEvent, elementUpdated} from '@open-wc/testing';
import {expect} from 'chai';
import '../components/employee/employee-table';
import type {EmployeeTable} from '../components/employee/employee-table';
import type {Employee} from '../models/employee';

function makeEmployees(n: number): Employee[] {
  return Array.from({length: n}, (_, i) => ({
    id: String(i),
    name: `Person ${i}`,
    department: 'Engineering',
    designation: 'Developer',
    email: `p${i}@example.com`,
  }));
}

const table = (employees: Employee[]) =>
  fixture<EmployeeTable>(
    html`<employee-table .employees=${employees}></employee-table>`
  );

describe('employee-table', () => {
  it('renders the empty state when there are no employees', async () => {
    const el = await table([]);
    expect(el.shadowRoot!.querySelector('empty-state')).to.exist;
    expect(el.shadowRoot!.querySelector('table')).to.equal(null);
  });

  it('renders one row per employee', async () => {
    const el = await table(makeEmployees(3));
    expect(el.shadowRoot!.querySelectorAll('tbody tr')).to.have.length(3);
  });

  it('shows a summary of the visible range', async () => {
    const el = await table(makeEmployees(3));
    expect(el.shadowRoot!.querySelector('.summary')!.textContent).to.contain(
      'Showing 1 to 3 of 3'
    );
  });

  it('renders avatar initials from the name', async () => {
    const el = await fixture<EmployeeTable>(
      html`<employee-table
        .employees=${[
          {
            id: '1',
            name: 'Ada Lovelace',
            department: 'Engineering',
            designation: 'Developer',
            email: 'ada@example.com',
          },
        ]}
      ></employee-table>`
    );
    expect(el.shadowRoot!.querySelector('.avatar')!.textContent!.trim()).to.equal(
      'AL'
    );
  });

  it('paginates with five per page', async () => {
    const el = await table(makeEmployees(6));
    expect(el.shadowRoot!.querySelectorAll('tbody tr')).to.have.length(5);

    el.shadowRoot!
      .querySelector('app-pagination')!
      .dispatchEvent(
        new CustomEvent('page-change', {detail: {page: 2}})
      );
    await elementUpdated(el);
    expect(el.shadowRoot!.querySelectorAll('tbody tr')).to.have.length(1);
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

  it('clamps the page when the employee list shrinks', async () => {
    const el = await table(makeEmployees(6));
    el.shadowRoot!
      .querySelector('app-pagination')!
      .dispatchEvent(new CustomEvent('page-change', {detail: {page: 2}}));
    await elementUpdated(el);

    el.employees = makeEmployees(3);
    await elementUpdated(el);
    expect(el.shadowRoot!.querySelector('.summary')!.textContent).to.contain(
      'Showing 1 to 3 of 3'
    );
  });
});
