import {fixture, html, oneEvent} from '@open-wc/testing';
import {expect} from 'chai';
import '../components/ui/app-pagination';
import type {AppPagination, PageChangeDetail} from '../components/ui/app-pagination';

describe('app-pagination', () => {
  const make = (page: number, totalPages: number) =>
    fixture<AppPagination>(
      html`<app-pagination
        .page=${page}
        .totalPages=${totalPages}
      ></app-pagination>`
    );

  it('renders a button per page plus prev/next', async () => {
    const el = await make(1, 3);
    // 3 numbered + prev + next = 5
    expect(el.shadowRoot!.querySelectorAll('button')).to.have.length(5);
  });

  it('marks the current page active', async () => {
    const el = await make(2, 3);
    const active = el.shadowRoot!.querySelector('button.active')!;
    expect(active.textContent!.trim()).to.equal('2');
  });

  it('disables prev on the first page', async () => {
    const el = await make(1, 3);
    const prev = el.shadowRoot!.querySelector<HTMLButtonElement>(
      'button[aria-label="Previous page"]'
    )!;
    expect(prev.disabled).to.equal(true);
  });

  it('disables next on the last page', async () => {
    const el = await make(3, 3);
    const next = el.shadowRoot!.querySelector<HTMLButtonElement>(
      'button[aria-label="Next page"]'
    )!;
    expect(next.disabled).to.equal(true);
  });

  it('emits page-change when a page is clicked', async () => {
    const el = await make(1, 3);
    const page3 = el.shadowRoot!.querySelector<HTMLButtonElement>(
      'button[aria-label="Page 3"]'
    )!;
    setTimeout(() => page3.click());
    const event = (await oneEvent(
      el,
      'page-change'
    )) as CustomEvent<PageChangeDetail>;
    expect(event.detail.page).to.equal(3);
  });

  it('does not emit when clicking the current page', async () => {
    const el = await make(2, 3);
    let fired = false;
    el.addEventListener('page-change', () => (fired = true));
    el.shadowRoot!
      .querySelector<HTMLButtonElement>('button[aria-label="Page 2"]')!
      .click();
    expect(fired).to.equal(false);
  });
});
