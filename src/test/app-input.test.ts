import {fixture, html, oneEvent} from '@open-wc/testing';
import {expect} from 'chai';
import '../components/ui/app-input';
import type {AppInput, InputChangeDetail} from '../components/ui/app-input';

describe('app-input', () => {
  it('renders an input with the given placeholder', async () => {
    const el = await fixture<AppInput>(
      html`<app-input placeholder="Full Name"></app-input>`
    );
    const input = el.shadowRoot!.querySelector('input')!;
    expect(input).to.exist;
    expect(input.placeholder).to.equal('Full Name');
  });

  it('renders a label when provided', async () => {
    const el = await fixture<AppInput>(
      html`<app-input label="Email"></app-input>`
    );
    expect(el.shadowRoot!.querySelector('label')!.textContent).to.contain(
      'Email'
    );
  });

  it('renders a select when options are provided', async () => {
    const el = await fixture<AppInput>(
      html`<app-input
        .options=${['Engineering', 'HR']}
        placeholder="Department"
      ></app-input>`
    );
    const select = el.shadowRoot!.querySelector('select')!;
    expect(select).to.exist;
    // placeholder option + 2 real options
    expect(select.querySelectorAll('option')).to.have.length(3);
  });

  it('renders an icon image when an icon is set', async () => {
    const el = await fixture<AppInput>(
      html`<app-input icon="user" placeholder="Name"></app-input>`
    );
    const img = el.shadowRoot!.querySelector('img')!;
    expect(img).to.exist;
    expect(img.getAttribute('src')).to.contain('user.svg');
  });

  it('dispatches input-change with the typed value', async () => {
    const el = await fixture<AppInput>(html`<app-input></app-input>`);
    const input = el.shadowRoot!.querySelector('input')!;
    setTimeout(() => {
      input.value = 'Jane';
      input.dispatchEvent(new Event('input'));
    });
    const event = (await oneEvent(
      el,
      'input-change'
    )) as CustomEvent<InputChangeDetail>;
    expect(event.detail.value).to.equal('Jane');
  });

  it('shows an error message and marks the input invalid', async () => {
    const el = await fixture<AppInput>(
      html`<app-input error="Name is required."></app-input>`
    );
    expect(el.shadowRoot!.querySelector('.error')!.textContent).to.contain(
      'Name is required.'
    );
    expect(
      el.shadowRoot!.querySelector('input')!.classList.contains('invalid')
    ).to.equal(true);
  });

  it('falls back to placeholder for the accessible name', async () => {
    const el = await fixture<AppInput>(
      html`<app-input placeholder="Email"></app-input>`
    );
    expect(
      el.shadowRoot!.querySelector('input')!.getAttribute('aria-label')
    ).to.equal('Email');
  });
});
