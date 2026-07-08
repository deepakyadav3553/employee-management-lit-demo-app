import {LitElement, html, css, nothing, PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {Employee, EmployeeDraft, emptyDraft, DEPARTMENTS} from '../types';
import './app-button';

export interface EmployeeSaveDetail {
  id: string | null;
  draft: EmployeeDraft;
}

@customElement('employee-add-form')
export class EmployeeAddForm extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: 'Segoe UI', system-ui, sans-serif;
      color: #1f2933;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #374151;
    }

    input,
    select {
      font: inherit;
      padding: 0.55rem 0.65rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: #fff;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    input:focus,
    select:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }

    input.invalid,
    select.invalid {
      border-color: #dc2626;
    }

    .error {
      color: #dc2626;
      font-size: 0.75rem;
    }

    .form-actions {
      display: flex;
      gap: 0.6rem;
      margin-top: 1.25rem;
    }

    @media (max-width: 720px) {
      .form-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 440px) {
      .form-grid {
        grid-template-columns: 1fr;
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

  private handleInput(field: keyof EmployeeDraft, event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLSelectElement).value;
    this.draft = {...this.draft, [field]: value};
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
          ${this.renderField('name', 'Name', 'Enter name')}
          ${this.renderDepartmentField()}
          ${this.renderField('designation', 'Designation', 'Enter designation')}
          ${this.renderField('email', 'Email', 'Enter email', 'email')}
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

  private renderField(
    field: keyof EmployeeDraft,
    label: string,
    placeholder: string,
    type = 'text'
  ) {
    const error = this.errors[field];
    return html`
      <div class="field">
        <label for=${field}>${label}</label>
        <input
          id=${field}
          type=${type}
          class=${error ? 'invalid' : ''}
          placeholder=${placeholder}
          .value=${this.draft[field]}
          @input=${(e: Event) => this.handleInput(field, e)}
        />
        ${error ? html`<span class="error">${error}</span>` : nothing}
      </div>
    `;
  }

  private renderDepartmentField() {
    const error = this.errors.department;
    return html`
      <div class="field">
        <label for="department">Department</label>
        <select
          id="department"
          class=${error ? 'invalid' : ''}
          .value=${this.draft.department}
          @change=${(e: Event) => this.handleInput('department', e)}
        >
          <option value="" disabled ?selected=${!this.draft.department}>
            Select department
          </option>
          ${DEPARTMENTS.map(
            (department) => html`
              <option
                value=${department}
                ?selected=${this.draft.department === department}
              >
                ${department}
              </option>
            `
          )}
        </select>
        ${error ? html`<span class="error">${error}</span>` : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'employee-add-form': EmployeeAddForm;
  }
}
