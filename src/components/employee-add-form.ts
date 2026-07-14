import {LitElement, html, css, PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {Employee, EmployeeDraft, emptyDraft, DEPARTMENTS} from '../types';
import './app-button';
import './app-input';
import type {InputChangeDetail, InputIcon} from './app-input';

export interface EmployeeSaveDetail {
  id: string | null;
  draft: EmployeeDraft;
}

@customElement('employee-add-form')
export class EmployeeAddForm extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }

    @media (max-width: 820px) {
      .form-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 560px) {
      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-actions app-button {
        flex: 1;
      }
    }
  `;

  @property({attribute: false}) editing: Employee | null = null;

  @state() private draft: EmployeeDraft = emptyDraft();
  @state() private errors: Partial<Record<keyof EmployeeDraft, string>> = {};

  override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('editing')) {
      const {id: _id, ...rest} = this.editing ?? {id: '', ...emptyDraft()};
      this.draft = this.editing ? {...rest} : emptyDraft();
      this.errors = {};
    }
  }

  private handleInput(
    field: keyof EmployeeDraft,
    event: CustomEvent<InputChangeDetail>
  ): void {
    this.draft = {...this.draft, [field]: event.detail.value};
    if (this.errors[field]) {
      const {[field]: _removed, ...rest} = this.errors;
      this.errors = rest;
    }
  }

  private validate(draft: EmployeeDraft): typeof this.errors {
    const errors: typeof this.errors = {};
    if (!draft.name.trim()) errors.name = 'Name is required.';
    if (!draft.department.trim()) errors.department = 'Department is required.';
    if (!draft.designation.trim())
      errors.designation = 'Designation is required.';
    if (!draft.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) {
      errors.email = 'Enter a valid email.';
    }
    return errors;
  }

  private handleSubmit(event: Event): void {
    event.preventDefault();
    const trimmed: EmployeeDraft = {
      name: this.draft.name.trim(),
      department: this.draft.department.trim(),
      designation: this.draft.designation.trim(),
      email: this.draft.email.trim(),
    };
    const errors = this.validate(trimmed);
    if (Object.keys(errors).length > 0) {
      this.errors = errors;
      return;
    }

    this.dispatchEvent(
      new CustomEvent<EmployeeSaveDetail>('employee-save', {
        detail: {id: this.editing?.id ?? null, draft: trimmed},
        bubbles: true,
        composed: true,
      })
    );
    this.handleClear();
  }

  private handleClear(): void {
    this.draft = emptyDraft();
    this.errors = {};
    if (this.editing) {
      this.dispatchEvent(
        new CustomEvent('form-cancel', {bubbles: true, composed: true})
      );
    }
  }

  override render() {
    const isEditing = this.editing !== null;
    return html`
      <form @submit=${this.handleSubmit} novalidate>
        <div class="form-grid">
          ${this.renderField('name', 'Full Name', 'user')}
          ${this.renderField('department', 'Department', 'department', {
            options: DEPARTMENTS,
          })}
          ${this.renderField('designation', 'Designation', 'designation')}
          ${this.renderField('email', 'Email', 'email', {type: 'email'})}
        </div>

        <div class="form-actions">
          <app-button
            variant="primary"
            type="submit"
            label=${isEditing ? 'Update' : 'Save'}
          ></app-button>
          <app-button
            variant="secondary"
            label=${isEditing ? 'Cancel' : 'Clear'}
            @click=${this.handleClear}
          ></app-button>
        </div>
      </form>
    `;
  }

  focusFirst(): void {
    const input = this.renderRoot?.querySelector('app-input');
    input?.renderRoot?.querySelector<HTMLElement>('input, select')?.focus();
  }

  private renderField(
    field: keyof EmployeeDraft,
    placeholder: string,
    icon: InputIcon,
    {type = 'text', options = null}: {type?: string; options?: string[] | null} = {}
  ) {
    return html`
      <app-input
        type=${type}
        placeholder=${placeholder}
        icon=${icon}
        .options=${options}
        .value=${this.draft[field]}
        error=${this.errors[field] ?? ''}
        @input-change=${(e: CustomEvent<InputChangeDetail>) =>
          this.handleInput(field, e)}
      ></app-input>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'employee-add-form': EmployeeAddForm;
  }
}
