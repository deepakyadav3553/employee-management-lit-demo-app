import {fixture, html} from '@open-wc/testing';
import {expect} from 'chai';
import '../components/ui/app-toast';
import type {AppToast} from '../components/ui/app-toast';

describe('app-toast', () => {
  it('shows a toast with its message and type class', async () => {
    const el = await fixture<AppToast>(html`<app-toast></app-toast>`);
    el.show('Saved!', 'success');
    await el.updateComplete;
    const toast = el.shadowRoot!.querySelector('.toast')!;
    expect(toast.classList.contains('success')).to.equal(true);
    expect(toast.textContent).to.contain('Saved!');
  });

  it('defaults to the success type', async () => {
    const el = await fixture<AppToast>(html`<app-toast></app-toast>`);
    el.show('Done');
    await el.updateComplete;
    expect(
      el.shadowRoot!.querySelector('.toast')!.classList.contains('success')
    ).to.equal(true);
  });

  it('renders an icon for each toast type', async () => {
    const el = await fixture<AppToast>(html`<app-toast></app-toast>`);
    el.show('a', 'success');
    el.show('b', 'error');
    el.show('c', 'info');
    await el.updateComplete;
    expect(el.shadowRoot!.querySelectorAll('.toast')).to.have.length(3);
    expect(el.shadowRoot!.querySelectorAll('.icon')).to.have.length(3);
  });

  it('dismisses a toast when its close button is clicked', async () => {
    const el = await fixture<AppToast>(html`<app-toast></app-toast>`);
    el.show('Bye', 'error');
    await el.updateComplete;
    el.shadowRoot!.querySelector<HTMLButtonElement>('.close')!.click();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.toast')).to.equal(null);
  });
});
