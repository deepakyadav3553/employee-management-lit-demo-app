import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {
  EmployeeDraft,
  EmployeeDraftErrors,
  emptyDraft,
  DEPARTMENTS,
} from '../../models/employee';
import '../ui/app-button';
import '../ui/app-input';
import type {InputChangeDetail, InputIcon} from '../ui/app-input';

export interface FieldChangeDetail {
  field: keyof EmployeeDraft;
  value: string;
}

@customElement('employee-form')
export class EmployeeForm extends LitElement {
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

  @property({attribute: false}) draft: EmployeeDraft = emptyDraft();
  @property({attribute: false}) errors: EmployeeDraftErrors = {};
  @property({attribute: false}) isEditing = false;
  @property({attribute: false}) disableSubmit = false;

  private emit(type: string, detail?: unknown): void {
    this.dispatchEvent(
      new CustomEvent(type, {detail, bubbles: true, composed: true})
    );
  }

  private handleInput(
    field: keyof EmployeeDraft,
    event: CustomEvent<InputChangeDetail>
  ): void {
    this.emit('field-change', {
      field,
      value: event.detail.value,
    } as FieldChangeDetail);
  }

  private handleSubmit(event: Event): void {
    event.preventDefault();
    if (this.disableSubmit) return;
    this.emit('form-submit');
  }

  private handleClear(): void {
    this.emit('form-clear');
  }

  override render() {
    return html`
      <form @submit=${this.handleSubmit} novalidate>
        <div class="form-grid">
          ${this.renderField('name', 'Full Name', 'user')}
          ${this.renderField('department', 'Select', 'department', {
            options: DEPARTMENTS,
          })}
          ${this.renderField('designation', 'Designation', 'designation')}
          ${this.renderField('email', 'Email', 'email', {type: 'email'})}
        </div>

        <div class="form-actions">
          <app-button
            variant="primary"
            label=${this.isEditing ? 'Update' : 'Save'}
            .disabled=${this.disableSubmit}
            @click=${this.handleSubmit}
          ></app-button>
          <app-button
            variant="secondary"
            label=${this.isEditing ? 'Cancel' : 'Clear'}
            @click=${this.handleClear}
          ></app-button>
        </div>
      </form>
    `;
  }

  focusFirstField(): void {
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
    'employee-form': EmployeeForm;
  }
}
