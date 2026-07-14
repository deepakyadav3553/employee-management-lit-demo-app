import {fixture, html, oneEvent} from '@open-wc/testing';
import {expect} from 'chai';
import '../components/ui/confirm-modal';
import type {ConfirmModal} from '../components/ui/confirm-modal';

describe('confirm-modal', () => {
  it('renders nothing when closed', async () => {
    const el = await fixture<ConfirmModal>(
      html`<confirm-modal heading="Delete"></confirm-modal>`
    );
    expect(el.shadowRoot!.querySelector('.overlay')).to.equal(null);
  });

  it('renders heading, message and highlight when open', async () => {
    const el = await fixture<ConfirmModal>(
      html`<confirm-modal
        open
        heading="Delete Employee"
        message="Are you sure you want to delete"
        highlight="Jane?"
      ></confirm-modal>`
    );
    expect(el.shadowRoot!.querySelector('.title')!.textContent).to.contain(
      'Delete Employee'
    );
    expect(el.shadowRoot!.querySelector('.body')!.textContent).to.contain(
      'Are you sure you want to delete'
    );
    expect(el.shadowRoot!.querySelector('.highlight')!.textContent).to.contain(
      'Jane?'
    );
  });

  it('emits modal-confirm when the confirm button is clicked', async () => {
    const el = await fixture<ConfirmModal>(
      html`<confirm-modal open confirmLabel="Delete"></confirm-modal>`
    );
    const confirmBtn = el.shadowRoot!.querySelector<HTMLElement>(
      'app-button[variant="danger"]'
    )!;
    setTimeout(() => confirmBtn.click());
    await oneEvent(el, 'modal-confirm');
  });

  it('emits modal-cancel when the cancel button is clicked', async () => {
    const el = await fixture<ConfirmModal>(
      html`<confirm-modal open cancelLabel="Cancel"></confirm-modal>`
    );
    const cancelBtn = el.shadowRoot!.querySelector<HTMLElement>(
      'app-button[variant="secondary"]'
    )!;
    setTimeout(() => cancelBtn.click());
    await oneEvent(el, 'modal-cancel');
  });

  it('emits modal-cancel when the overlay backdrop is clicked', async () => {
    const el = await fixture<ConfirmModal>(
      html`<confirm-modal open></confirm-modal>`
    );
    const overlay = el.shadowRoot!.querySelector<HTMLElement>('.overlay')!;
    setTimeout(() => overlay.click());
    await oneEvent(el, 'modal-cancel');
  });

  it('emits modal-cancel from the close button', async () => {
    const el = await fixture<ConfirmModal>(
      html`<confirm-modal open></confirm-modal>`
    );
    const close = el.shadowRoot!.querySelector<HTMLElement>('.close')!;
    setTimeout(() => close.click());
    await oneEvent(el, 'modal-cancel');
  });
});
