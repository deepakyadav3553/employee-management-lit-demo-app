import {fixture, html, oneEvent, elementUpdated} from '@open-wc/testing';
import {expect} from 'chai';
import '../components/ui/app-search';
import type {AppSearch, SearchChangeDetail} from '../components/ui/app-search';

function search(value = '', debounce = 0) {
  return fixture<AppSearch>(
    html`<app-search .value=${value} .debounce=${debounce}></app-search>`
  );
}

function inputOf(el: AppSearch): HTMLInputElement {
  return el.shadowRoot!.querySelector('input')!;
}

function type(el: AppSearch, value: string): void {
  const input = inputOf(el);
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

describe('app-search', () => {
  it('emits search-change with the typed term', async () => {
    const el = await search();
    setTimeout(() => type(el, 'ada'));
    const event = (await oneEvent(
      el,
      'search-change'
    )) as CustomEvent<SearchChangeDetail>;
    expect(event.detail.value).to.equal('ada');
    expect(el.value).to.equal('ada');
  });

  it('debounces rapid typing into a single event', async () => {
    const el = await search('', 30);
    let emitted: string[] = [];
    el.addEventListener('search-change', (e) =>
      emitted.push((e as CustomEvent<SearchChangeDetail>).detail.value)
    );

    type(el, 'a');
    type(el, 'ad');
    type(el, 'ada');
    expect(emitted).to.have.length(0);

    await oneEvent(el, 'search-change');
    expect(emitted).to.deep.equal(['ada']);
  });

  it('shows a clear button only when there is a term', async () => {
    const el = await search();
    expect(el.shadowRoot!.querySelector('.clear')).to.equal(null);

    type(el, 'ada');
    await elementUpdated(el);
    expect(el.shadowRoot!.querySelector('.clear')).to.exist;
  });

  it('clears the term and emits an empty search-change', async () => {
    const el = await search('ada');
    const clearBtn = el.shadowRoot!.querySelector<HTMLElement>('.clear')!;
    setTimeout(() => clearBtn.click());
    const event = (await oneEvent(
      el,
      'search-change'
    )) as CustomEvent<SearchChangeDetail>;
    expect(event.detail.value).to.equal('');
    expect(el.value).to.equal('');
  });

  it('clears on Escape', async () => {
    const el = await search('ada');
    setTimeout(() =>
      inputOf(el).dispatchEvent(
        new KeyboardEvent('keydown', {key: 'Escape', bubbles: true})
      )
    );
    const event = (await oneEvent(
      el,
      'search-change'
    )) as CustomEvent<SearchChangeDetail>;
    expect(event.detail.value).to.equal('');
  });

  it('uses the placeholder as the accessible name when no label is set', async () => {
    const el = await fixture<AppSearch>(
      html`<app-search placeholder="Search employees"></app-search>`
    );
    expect(inputOf(el).getAttribute('aria-label')).to.equal('Search employees');
  });
});
