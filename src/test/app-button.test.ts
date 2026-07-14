import {fixture, html} from '@open-wc/testing';
import {expect} from 'chai';
import '../components/ui/app-button';
import type {AppButton} from '../components/ui/app-button';

describe('app-button', () => {
  it('renders the label text', async () => {
    const el = await fixture<AppButton>(
      html`<app-button label="Save"></app-button>`
    );
    const button = el.shadowRoot!.querySelector('button')!;
    expect(button.textContent).to.contain('Save');
  });

  it('applies the variant name as a class', async () => {
    const el = await fixture<AppButton>(
      html`<app-button variant="danger" label="Delete"></app-button>`
    );
    expect(
      el.shadowRoot!.querySelector('button')!.classList.contains('danger')
    ).to.equal(true);
  });

  it('exposes the label as aria-label for icon variants', async () => {
    const el = await fixture<AppButton>(
      html`<app-button variant="icon-primary" label="Edit"></app-button>`
    );
    const button = el.shadowRoot!.querySelector('button')!;
    expect(button.getAttribute('aria-label')).to.equal('Edit');
  });

  it('does not set aria-label for text variants', async () => {
    const el = await fixture<AppButton>(
      html`<app-button variant="primary" label="Save"></app-button>`
    );
    const button = el.shadowRoot!.querySelector('button')!;
    expect(button.getAttribute('aria-label')).to.equal(null);
  });

  it('submits the parent form when type is submit', async () => {
    const form = await fixture<HTMLFormElement>(
      html`<form>
        <app-button type="submit" label="Go"></app-button>
      </form>`
    );
    let submitted = false;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitted = true;
    });
    form
      .querySelector('app-button')!
      .shadowRoot!.querySelector('button')!
      .click();
    expect(submitted).to.equal(true);
  });

  it('does not submit when type is button', async () => {
    const form = await fixture<HTMLFormElement>(
      html`<form>
        <app-button type="button" label="Go"></app-button>
      </form>`
    );
    let submitted = false;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitted = true;
    });
    form
      .querySelector('app-button')!
      .shadowRoot!.querySelector('button')!
      .click();
    expect(submitted).to.equal(false);
  });
});
