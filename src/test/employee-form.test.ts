import {fixture, html, oneEvent, elementUpdated} from '@open-wc/testing';
import {expect} from 'chai';
import '../components/employee/employee-form';
import type {
  EmployeeForm,
  EmployeeSaveDetail,
} from '../components/employee/employee-form';
import type {AppInput} from '../components/ui/app-input';
import type {AppButton} from '../components/ui/app-button';
import type {Employee} from '../models/employee';

async function setField(
  form: EmployeeForm,
  index: number,
  value: string
): Promise<void> {
  const appInput = form.shadowRoot!.querySelectorAll('app-input')[
    index
  ] as AppInput;
  const control = appInput.shadowRoot!.querySelector<
    HTMLInputElement | HTMLSelectElement
  >('input, select')!;
  control.value = value;
  control.dispatchEvent(
    new Event(control.tagName === 'SELECT' ? 'change' : 'input')
  );
  await elementUpdated(form);
}

async function fillValidForm(form: EmployeeForm): Promise<void> {
  await setField(form, 0, 'Jane Smith');
  await setField(form, 1, 'HR');
  await setField(form, 2, 'Manager');
  await setField(form, 3, 'jane@example.com');
}

describe('employee-form', () => {
  it('shows validation errors and does not emit on empty submit', async () => {
    const el = await fixture<EmployeeForm>(
      html`<employee-form></employee-form>`
    );
    let saved = false;
    el.addEventListener('employee-save', () => (saved = true));
    el.shadowRoot!.querySelector('form')!.requestSubmit();
    await elementUpdated(el);
    expect(saved).to.equal(false);
    const nameInput = el.shadowRoot!.querySelectorAll('app-input')[0] as AppInput;
    expect(nameInput.error).to.contain('required');
  });

  it('rejects an invalid email', async () => {
    const el = await fixture<EmployeeForm>(
      html`<employee-form></employee-form>`
    );
    await setField(el, 0, 'Jane');
    await setField(el, 1, 'HR');
    await setField(el, 2, 'Manager');
    await setField(el, 3, 'not-an-email');
    let saved = false;
    el.addEventListener('employee-save', () => (saved = true));
    el.shadowRoot!.querySelector('form')!.requestSubmit();
    await elementUpdated(el);
    expect(saved).to.equal(false);
    const emailInput = el.shadowRoot!.querySelectorAll(
      'app-input'
    )[3] as AppInput;
    expect(emailInput.error).to.contain('valid email');
  });

  it('emits employee-save with a trimmed draft on valid submit', async () => {
    const el = await fixture<EmployeeForm>(
      html`<employee-form></employee-form>`
    );
    await fillValidForm(el);
    setTimeout(() => el.shadowRoot!.querySelector('form')!.requestSubmit());
    const event = (await oneEvent(
      el,
      'employee-save'
    )) as CustomEvent<EmployeeSaveDetail>;
    expect(event.detail.id).to.equal(null);
    expect(event.detail.draft).to.deep.equal({
      name: 'Jane Smith',
      department: 'HR',
      designation: 'Manager',
      email: 'jane@example.com',
    });
  });

  it('prefills fields and shows Update when editing', async () => {
    const employee: Employee = {
      id: '42',
      name: 'John Doe',
      department: 'Engineering',
      designation: 'Developer',
      email: 'john@example.com',
    };
    const el = await fixture<EmployeeForm>(
      html`<employee-form .editing=${employee}></employee-form>`
    );
    await elementUpdated(el);
    const nameInput = el.shadowRoot!.querySelectorAll('app-input')[0] as AppInput;
    expect(nameInput.value).to.equal('John Doe');
    const submitBtn = el.shadowRoot!.querySelector(
      'app-button[type="submit"]'
    ) as AppButton;
    expect(submitBtn.label).to.equal('Update');
  });

  it('emits form-cancel when cancelling an edit', async () => {
    const employee: Employee = {
      id: '42',
      name: 'John Doe',
      department: 'Engineering',
      designation: 'Developer',
      email: 'john@example.com',
    };
    const el = await fixture<EmployeeForm>(
      html`<employee-form .editing=${employee}></employee-form>`
    );
    await elementUpdated(el);
    const cancelBtn = el.shadowRoot!.querySelector<HTMLElement>(
      'app-button[variant="secondary"]'
    )!;
    setTimeout(() => cancelBtn.click());
    await oneEvent(el, 'form-cancel');
  });

  it('focusFirstField focuses the first field', async () => {
    const el = await fixture<EmployeeForm>(
      html`<employee-form></employee-form>`
    );
    el.focusFirstField();
    const firstInput = el.shadowRoot!.querySelectorAll(
      'app-input'
    )[0] as AppInput;
    const control = firstInput.shadowRoot!.querySelector('input');
    expect(firstInput.shadowRoot!.activeElement).to.equal(control);
  });
});
