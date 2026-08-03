import {fixture, html, elementUpdated} from '@open-wc/testing';
import {expect} from 'chai';
import '../widgets/employee-widget';
import type {EmployeeWidget} from '../widgets/employee-widget';
import type {EmployeeTable} from '../components/employee/employee-table';
import type {EmployeeDraft} from '../models/employee';

const STORAGE_KEY = 'employee-management:employees';

const ADA = {
  id: '1',
  name: 'Ada Lovelace',
  department: 'Engineering',
  designation: 'Developer',
  email: 'ada@example.com',
};

function seed(employees: unknown[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
}

function tableOf(widget: EmployeeWidget): EmployeeTable {
  return widget.shadowRoot!.querySelector('employee-table') as EmployeeTable;
}

function emit(target: Element, type: string, detail?: unknown): void {
  target.dispatchEvent(
    new CustomEvent(type, {detail, bubbles: true, composed: true})
  );
}

/** Drives the dumb form the way employee-form does: a change per field, then submit. */
async function fillAndSubmit(
  widget: EmployeeWidget,
  draft: EmployeeDraft
): Promise<void> {
  const form = widget.shadowRoot!.querySelector('employee-form')!;
  for (const [field, value] of Object.entries(draft)) {
    emit(form, 'field-change', {field, value});
    await elementUpdated(widget);
  }
  emit(form, 'form-submit');
  await elementUpdated(widget);
}

describe('employee-widget', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('loads employees from localStorage', async () => {
    seed([ADA]);
    const el = await fixture<EmployeeWidget>(
      html`<employee-widget></employee-widget>`
    );
    const table = tableOf(el);
    await elementUpdated(table);
    expect(table.shadowRoot!.textContent).to.contain('Ada Lovelace');
  });

  it('adds and persists a new employee on submit', async () => {
    const el = await fixture<EmployeeWidget>(
      html`<employee-widget></employee-widget>`
    );
    await fillAndSubmit(el, {
      name: 'Grace Hopper',
      department: 'Engineering',
      designation: 'Developer',
      email: 'grace@example.com',
    });

    const table = tableOf(el);
    await elementUpdated(table);
    expect(table.shadowRoot!.textContent).to.contain('Grace Hopper');

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored).to.have.length(1);
    expect(stored[0].name).to.equal('Grace Hopper');
  });

  it('keeps an invalid draft out of storage and surfaces errors', async () => {
    const el = await fixture<EmployeeWidget>(
      html`<employee-widget></employee-widget>`
    );
    await fillAndSubmit(el, {
      name: 'Grace Hopper',
      department: 'Engineering',
      designation: 'Developer',
      email: 'not-an-email',
    });

    expect(el.employees).to.have.length(0);
    const form = el.shadowRoot!.querySelector('employee-form')!;
    await elementUpdated(form);
    const emailInput = form.shadowRoot!.querySelectorAll('app-input')[3];
    expect(emailInput.getAttribute('error')).to.contain('valid email');
  });

  it('adds five dummy records', async () => {
    const el = await fixture<EmployeeWidget>(
      html`<employee-widget></employee-widget>`
    );
    const table = tableOf(el);
    await elementUpdated(table);
    emit(table, 'add-dummies');
    await elementUpdated(el);
    await elementUpdated(table);
    expect(table.shadowRoot!.querySelectorAll('tbody tr')).to.have.length(5);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).to.have.length(5);
  });

  it('opens the confirm modal on delete request and removes on confirm', async () => {
    seed([ADA]);
    const el = await fixture<EmployeeWidget>(
      html`<employee-widget></employee-widget>`
    );
    const table = tableOf(el);
    await elementUpdated(table);

    emit(table, 'employee-delete', ADA);
    await elementUpdated(el);
    const modal = el.shadowRoot!.querySelector('confirm-modal')!;
    expect(modal.hasAttribute('open')).to.equal(true);

    modal.dispatchEvent(new CustomEvent('modal-confirm'));
    await elementUpdated(el);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).to.have.length(0);
  });

  it('keeps the employee when the confirm modal is cancelled', async () => {
    seed([ADA]);
    const el = await fixture<EmployeeWidget>(
      html`<employee-widget></employee-widget>`
    );
    const table = tableOf(el);
    await elementUpdated(table);

    emit(table, 'employee-delete', ADA);
    await elementUpdated(el);
    const modal = el.shadowRoot!.querySelector('confirm-modal')!;
    modal.dispatchEvent(new CustomEvent('modal-cancel'));
    await elementUpdated(el);
    expect(modal.hasAttribute('open')).to.equal(false);
    expect(el.employees).to.have.length(1);
  });

  it('filters the table across every employee field', async () => {
    seed([
      ADA,
      {
        id: '2',
        name: 'Grace Hopper',
        department: 'Finance',
        designation: 'Analyst',
        email: 'grace@example.com',
      },
    ]);
    const el = await fixture<EmployeeWidget>(
      html`<employee-widget></employee-widget>`
    );
    const table = tableOf(el);
    const searchFor = async (value: string) => {
      emit(el.shadowRoot!.querySelector('app-search')!, 'search-change', {value});
      await elementUpdated(el);
      await elementUpdated(table);
    };

    // Matches on a department, not just the name.
    await searchFor('finance');
    expect(table.shadowRoot!.textContent).to.contain('Grace Hopper');
    expect(table.shadowRoot!.textContent).to.not.contain('Ada Lovelace');

    // ...and on an email fragment.
    await searchFor('ada@');
    expect(table.shadowRoot!.textContent).to.contain('Ada Lovelace');
    expect(table.shadowRoot!.textContent).to.not.contain('Grace Hopper');

    await searchFor('');
    expect(table.shadowRoot!.querySelectorAll('tbody tr')).to.have.length(2);
  });

  it('shows a no-matches empty state without the seeding actions', async () => {
    seed([ADA]);
    const el = await fixture<EmployeeWidget>(
      html`<employee-widget></employee-widget>`
    );
    const table = tableOf(el);
    emit(el.shadowRoot!.querySelector('app-search')!, 'search-change', {
      value: 'nobody',
    });
    await elementUpdated(el);
    await elementUpdated(table);

    const emptyState = table.shadowRoot!.querySelector('empty-state')!;
    expect(emptyState.getAttribute('heading')).to.equal('No matching employees');
    expect(table.shadowRoot!.querySelector('.dummy-link')).to.equal(null);
  });

  it('returns to the first page when the search term changes', async () => {
    const el = await fixture<EmployeeWidget>(
      html`<employee-widget></employee-widget>`
    );
    const table = tableOf(el);
    emit(table, 'add-dummies');
    emit(table, 'add-dummies');
    await elementUpdated(el);

    emit(table, 'page-change', {page: 2});
    await elementUpdated(el);
    await elementUpdated(table);
    expect(table.page).to.equal(2);

    emit(el.shadowRoot!.querySelector('app-search')!, 'search-change', {
      value: 'e',
    });
    await elementUpdated(el);
    await elementUpdated(table);
    expect(table.page).to.equal(1);
  });

  it('hides the search bar while there are no employees', async () => {
    const el = await fixture<EmployeeWidget>(
      html`<employee-widget></employee-widget>`
    );
    expect(el.shadowRoot!.querySelector('app-search')).to.equal(null);

    const table = tableOf(el);
    emit(table, 'add-dummies');
    await elementUpdated(el);
    expect(el.shadowRoot!.querySelector('app-search')).to.exist;
  });

  it('updates an existing employee when editing', async () => {
    const ada = {...ADA, name: 'Ada', designation: 'Developer'};
    seed([ada]);
    const el = await fixture<EmployeeWidget>(
      html`<employee-widget></employee-widget>`
    );
    const table = tableOf(el);
    await elementUpdated(table);

    emit(table, 'employee-edit', ada);
    await elementUpdated(el);

    const form = el.shadowRoot!.querySelector('employee-form')!;
    emit(form, 'field-change', {field: 'designation', value: 'Lead'});
    await elementUpdated(el);
    emit(form, 'form-submit');
    await elementUpdated(el);

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored).to.have.length(1);
    expect(stored[0].id).to.equal('1');
    expect(stored[0].designation).to.equal('Lead');
  });
});
