import {fixture, html, elementUpdated} from '@open-wc/testing';
import {expect} from 'chai';
import '../app-root';
import type {AppRoot} from '../app-root';
import type {EmployeeTable} from '../components/employee/employee-table';
import type {EmployeeSaveDetail} from '../components/employee/employee-form';

const STORAGE_KEY = 'employee-management:employees';

function tableOf(root: AppRoot): EmployeeTable {
  return root.shadowRoot!.querySelector('employee-table') as EmployeeTable;
}

function saveEvent(detail: EmployeeSaveDetail): CustomEvent<EmployeeSaveDetail> {
  return new CustomEvent('employee-save', {detail, bubbles: true, composed: true});
}

describe('app-root', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('loads employees from localStorage', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: '1',
          name: 'Ada Lovelace',
          department: 'Engineering',
          designation: 'Developer',
          email: 'ada@example.com',
        },
      ])
    );
    const el = await fixture<AppRoot>(html`<app-root></app-root>`);
    const table = tableOf(el);
    await elementUpdated(table);
    expect(table.shadowRoot!.textContent).to.contain('Ada Lovelace');
  });

  it('adds and persists a new employee on save', async () => {
    const el = await fixture<AppRoot>(html`<app-root></app-root>`);
    const form = el.shadowRoot!.querySelector('employee-form')!;
    form.dispatchEvent(
      saveEvent({
        id: null,
        draft: {
          name: 'Grace Hopper',
          department: 'Engineering',
          designation: 'Developer',
          email: 'grace@example.com',
        },
      })
    );
    await elementUpdated(el);
    const table = tableOf(el);
    await elementUpdated(table);
    expect(table.shadowRoot!.textContent).to.contain('Grace Hopper');

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored).to.have.length(1);
    expect(stored[0].name).to.equal('Grace Hopper');
  });

  it('adds five dummy records', async () => {
    const el = await fixture<AppRoot>(html`<app-root></app-root>`);
    const table = tableOf(el);
    await elementUpdated(table);
    table.dispatchEvent(
      new CustomEvent('add-dummies', {bubbles: true, composed: true})
    );
    await elementUpdated(el);
    await elementUpdated(table);
    expect(table.shadowRoot!.querySelectorAll('tbody tr')).to.have.length(5);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).to.have.length(5);
  });

  it('opens the confirm modal on delete request and removes on confirm', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: '1',
          name: 'Ada Lovelace',
          department: 'Engineering',
          designation: 'Developer',
          email: 'ada@example.com',
        },
      ])
    );
    const el = await fixture<AppRoot>(html`<app-root></app-root>`);
    const table = tableOf(el);
    await elementUpdated(table);

    table.dispatchEvent(
      new CustomEvent('employee-delete', {
        detail: {
          id: '1',
          name: 'Ada Lovelace',
          department: 'Engineering',
          designation: 'Developer',
          email: 'ada@example.com',
        },
        bubbles: true,
        composed: true,
      })
    );
    await elementUpdated(el);
    const modal = el.shadowRoot!.querySelector('confirm-modal')!;
    expect(modal.hasAttribute('open')).to.equal(true);

    modal.dispatchEvent(new CustomEvent('modal-confirm'));
    await elementUpdated(el);
    await elementUpdated(table);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).to.have.length(0);
  });

  it('updates an existing employee when saving with an id', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: '1',
          name: 'Ada',
          department: 'Engineering',
          designation: 'Developer',
          email: 'ada@example.com',
        },
      ])
    );
    const el = await fixture<AppRoot>(html`<app-root></app-root>`);
    const form = el.shadowRoot!.querySelector('employee-form')!;
    form.dispatchEvent(
      saveEvent({
        id: '1',
        draft: {
          name: 'Ada Lovelace',
          department: 'Engineering',
          designation: 'Lead',
          email: 'ada@example.com',
        },
      })
    );
    await elementUpdated(el);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored).to.have.length(1);
    expect(stored[0].designation).to.equal('Lead');
  });
});
