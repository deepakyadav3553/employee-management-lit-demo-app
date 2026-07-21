import {fixture, html, elementUpdated, waitUntil} from '@open-wc/testing';
import {expect} from 'chai';
import '../app-root';
import type {AppRoot} from '../app-root';
import type {EmployeeTable} from '../components/employee/employee-table';
import type {EmployeeSaveDetail} from '../components/employee/employee-form';
import type {Employee} from '../models/employee';

function tableOf(root: AppRoot): EmployeeTable {
  return root.shadowRoot!.querySelector('employee-table') as EmployeeTable;
}

function saveEvent(detail: EmployeeSaveDetail): CustomEvent<EmployeeSaveDetail> {
  return new CustomEvent('employee-save', {detail, bubbles: true, composed: true});
}

/**
 * Minimal in-memory stand-in for the REST backend so the component can be
 * exercised without a live server. Routes on method + path and records calls.
 */
function installFetchStub(initial: Employee[] = []) {
  const store = new Map(initial.map((e) => [e.id, {...e}]));
  const calls: {method: string; url: string; body?: unknown}[] = [];
  let nextId = 1;

  const json = (data: unknown, status = 200) =>
    Promise.resolve(new Response(JSON.stringify(data), {status}));

  const original = globalThis.fetch;
  globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = (init?.method ?? 'GET').toUpperCase();
    const body = init?.body ? JSON.parse(init.body as string) : undefined;
    calls.push({method, url, body});
    const idMatch = url.match(/\/employees\/(.+)$/);

    if (method === 'GET') return json([...store.values()]);
    if (method === 'POST') {
      const record = {...body, id: String(nextId++)};
      store.set(record.id, record);
      return json(record, 201);
    }
    if (method === 'PUT' && idMatch) {
      const record = {...body, id: idMatch[1]};
      store.set(record.id, record);
      return json(record);
    }
    if (method === 'DELETE' && idMatch) {
      store.delete(idMatch[1]);
      return Promise.resolve(new Response(null, {status: 204}));
    }
    return Promise.resolve(new Response(null, {status: 404}));
  }) as typeof fetch;

  return {
    calls,
    store,
    restore: () => {
      globalThis.fetch = original;
    },
  };
}

const sample: Employee = {
  id: '1',
  name: 'Ada Lovelace',
  department: 'Engineering',
  designation: 'Developer',
  email: 'ada@example.com',
};

describe('app-root', () => {
  let backend: ReturnType<typeof installFetchStub>;

  afterEach(() => backend?.restore());

  it('loads employees from the API', async () => {
    backend = installFetchStub([sample]);
    const el = await fixture<AppRoot>(html`<app-root></app-root>`);
    const table = tableOf(el);
    await waitUntil(() => table.shadowRoot!.textContent!.includes('Ada Lovelace'));
    expect(table.shadowRoot!.textContent).to.contain('Ada Lovelace');
  });

  it('creates a new employee on save', async () => {
    backend = installFetchStub();
    const el = await fixture<AppRoot>(html`<app-root></app-root>`);
    await elementUpdated(el);
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
    const table = tableOf(el);
    await waitUntil(() => table.shadowRoot!.textContent!.includes('Grace Hopper'));
    expect(table.shadowRoot!.textContent).to.contain('Grace Hopper');
    expect(backend.calls.some((c) => c.method === 'POST')).to.equal(true);
    expect(backend.store.size).to.equal(1);
  });

  it('opens the confirm modal on delete request and removes on confirm', async () => {
    backend = installFetchStub([sample]);
    const el = await fixture<AppRoot>(html`<app-root></app-root>`);
    const table = tableOf(el);
    await waitUntil(() => table.shadowRoot!.textContent!.includes('Ada Lovelace'));

    table.dispatchEvent(
      new CustomEvent('employee-delete', {
        detail: sample,
        bubbles: true,
        composed: true,
      })
    );
    await elementUpdated(el);
    const modal = el.shadowRoot!.querySelector('confirm-modal')!;
    expect(modal.hasAttribute('open')).to.equal(true);

    modal.dispatchEvent(new CustomEvent('modal-confirm'));
    await waitUntil(() => backend.store.size === 0);
    expect(backend.calls.some((c) => c.method === 'DELETE')).to.equal(true);
    expect(backend.store.size).to.equal(0);
  });

  it('updates an existing employee when saving with an id', async () => {
    backend = installFetchStub([sample]);
    const el = await fixture<AppRoot>(html`<app-root></app-root>`);
    await elementUpdated(el);
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
    await waitUntil(() => backend.store.get('1')!.designation === 'Lead');
    expect(backend.calls.some((c) => c.method === 'PUT')).to.equal(true);
    expect(backend.store.get('1')!.designation).to.equal('Lead');
  });
});
