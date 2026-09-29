import {LitElement, html, css, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {widgetCardStyles} from '../styles/widget-card.styles';
import {buildHash} from '../router/routes';
import '../components/ui/app-button';
import '../components/ui/app-input';
import '../components/ui/app-select';
import '../components/ui/app-toggle';
import type {InputChangeDetail} from '../components/ui/app-input';
import type {SelectOption} from '../components/ui/app-select';
import type {ToggleChangeDetail} from '../components/ui/app-toggle';

/** A single employee record. */
interface Employee {
  name: string;
  department: string;
  designation: string;
  email: string;
  status: 'active' | 'inactive';
}

/** An empty draft used to reset the form. */
const EMPTY_DRAFT: Employee = {
  name: '',
  department: '',
  designation: '',
  email: '',
  status: 'active',
};

/** Departments available in the dropdown. */
const DEPARTMENTS: SelectOption[] = [
  {value: 'engineering', label: 'Engineering'},
  {value: 'hr', label: 'HR'},
  {value: 'finance', label: 'Finance'},
  {value: 'marketing', label: 'Marketing'},
  {value: 'sales', label: 'Sales'},
];

/**
 * Employees widget — owns the "Employees" section of the dashboard.
 * Presents an "Employee Form" built from the reusable <app-input> primitive.
 */
@customElement('employees-widget')
export class EmployeesWidget extends LitElement {
  static override styles = [
    widgetCardStyles,
    css`
      :host {
        display: block;
        font-family: var(--font-sans);
        color: var(--color-text);
        height: 100%;
        /* Let the fields respond to the CARD's width, not the viewport, so the
           same widget lays out differently on the narrow dashboard vs. the
           full-width Employees page. */
        container-type: inline-size;
      }

      .card {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .title {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
      }

      .view-all {
        border: none;
        background: none;
        padding: 0;
        cursor: pointer;
        font: inherit;
        font-size: 14px;
        font-weight: 600;
        color: var(--color-primary);
      }

      .view-all:hover {
        text-decoration: underline;
      }

      /* ---------- Employee form ---------- */
      .form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 20px;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
      }

      .form-title {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
      }

      /*
       * Field grid, sized to the CARD width (container queries):
       *  - narrow card (dashboard, mobile): 1 column
       *  - medium card (dashboard widget):  2 columns
       *  - wide card (full Employees page): every field + status on one row
       */
      .fields {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 18px 20px;
        align-items: start;
      }

      @container (min-width: 480px) {
        .fields {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @container (min-width: 900px) {
        .fields {
          grid-template-columns: repeat(5, minmax(0, 1fr));
        }
      }

      /* Match the toggle's control height to the text inputs so it aligns
         when it shares a row with them. */
      .fields app-toggle {
        --app-toggle-control-height: 38px;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding-top: 4px;
        border-top: 1px solid var(--color-border-subtle);
      }
    `,
  ];

  /** Show the "View all" link (only on the dashboard home view). */
  @property({type: Boolean, attribute: 'view-all'}) viewAll = false;

  @state() private draft: Employee = {...EMPTY_DRAFT};

  private handleFieldChange(event: CustomEvent<InputChangeDetail>): void {
    const {name, value} = event.detail;
    this.draft = {...this.draft, [name as keyof Employee]: value};
  }

  private handleStatusChange(event: CustomEvent<ToggleChangeDetail>): void {
    this.draft = {
      ...this.draft,
      status: event.detail.checked ? 'active' : 'inactive',
    };
  }

  private handleSave(): void {
    // Keep it simple: emit the new employee for a parent/store to handle.
    this.dispatchEvent(
      new CustomEvent<Employee>('employee-add', {
        detail: {...this.draft},
        bubbles: true,
        composed: true,
      })
    );
    this.draft = {...EMPTY_DRAFT};
  }

  private handleClear(): void {
    this.draft = {...EMPTY_DRAFT};
  }

  private handleViewAll(): void {
    window.location.hash = buildHash('employees');
  }

  override render() {
    return html`
      <div class="card">
        <div class="header">
          <h2 class="title">Employees</h2>
          ${this.viewAll
            ? html`<button
                type="button"
                class="view-all"
                @click=${this.handleViewAll}
              >
                View all →
              </button>`
            : nothing}
        </div>

        <div class="form" @input-change=${this.handleFieldChange}>
          <h3 class="form-title">Employee Form</h3>
          <div class="fields">
            <app-input
              name="name"
              label="Name"
              placeholder="Enter name"
              required
              .value=${this.draft.name}
            ></app-input>
            <app-select
              name="department"
              label="Department"
              placeholder="Select department"
              required
              .options=${DEPARTMENTS}
              .value=${this.draft.department}
            ></app-select>
            <app-input
              name="designation"
              label="Designation"
              placeholder="Enter designation"
              .value=${this.draft.designation}
            ></app-input>
            <app-input
              name="email"
              label="Email"
              type="email"
              placeholder="Enter email"
              required
              .value=${this.draft.email}
            ></app-input>
            <app-toggle
              name="status"
              label="Status"
              onLabel="Active"
              offLabel="Inactive"
              .checked=${this.draft.status === 'active'}
              @toggle-change=${this.handleStatusChange}
            ></app-toggle>
          </div>
          <div class="form-actions">
            <app-button variant="secondary" @click=${this.handleClear}>
              Clear
            </app-button>
            <app-button variant="primary" @click=${this.handleSave}>
              Save
            </app-button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'employees-widget': EmployeesWidget;
  }
}
