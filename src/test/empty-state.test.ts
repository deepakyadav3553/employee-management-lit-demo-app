import {fixture, html} from '@open-wc/testing';
import {expect} from 'chai';
import '../components/ui/empty-state';
import type {EmptyState} from '../components/ui/empty-state';

describe('empty-state', () => {
  it('renders the heading and message', async () => {
    const el = await fixture<EmptyState>(
      html`<empty-state
        heading="No employees found"
        message="Add your first employee."
      ></empty-state>`
    );
    expect(el.shadowRoot!.querySelector('.title')!.textContent).to.contain(
      'No employees found'
    );
    expect(el.shadowRoot!.querySelector('.message')!.textContent).to.contain(
      'Add your first employee.'
    );
  });

  it('renders the illustration when an image is provided', async () => {
    const el = await fixture<EmptyState>(
      html`<empty-state image="/assets/icons/empty-folder.svg"></empty-state>`
    );
    const img = el.shadowRoot!.querySelector('img')!;
    expect(img.getAttribute('src')).to.contain('empty-folder.svg');
  });

  it('omits the image when none is provided', async () => {
    const el = await fixture<EmptyState>(html`<empty-state></empty-state>`);
    expect(el.shadowRoot!.querySelector('img')).to.equal(null);
  });

  it('projects slotted action content', async () => {
    const el = await fixture<EmptyState>(
      html`<empty-state><button>Add</button></empty-state>`
    );
    const slot = el.shadowRoot!.querySelector('slot')!;
    const assigned = slot.assignedElements();
    expect(assigned).to.have.length(1);
    expect(assigned[0].textContent).to.equal('Add');
  });
});
