import {LitElement, html, css, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';

/** A row is any plain record keyed by column key. */
export type TableRow = Record<string, unknown>;

/** Column definition for <app-table>. */
export interface TableColumn<T extends TableRow = TableRow> {
  /** Key read from each row (also used as a fallback header). */
  key: string;
  /** Column header text. */
  label: string;
  /** Text alignment for the column. */
  align?: 'left' | 'center' | 'right';
  /** Optional fixed/relative width (any CSS width, e.g. "120px" or "20%"). */
  width?: string;
  /**
   * Optional custom cell renderer. Return a string or a Lit template. Use
   * inline styles in returned templates — this component is style-isolated.
   */
  render?: (row: T, rowIndex: number) => unknown;
}

/** Payload emitted when a row is clicked. */
export interface RowSelectDetail<T extends TableRow = TableRow> {
  row: T;
  index: number;
}

/**
 * Reusable, presentational data table.
 *
 * Dumb component: it owns no data and has no dependencies. Feed it `columns`
 * and `rows`; it renders them and (optionally) emits `row-select` on click.
 * Custom cells are supported via a column's `render` function, keeping all
 * formatting in the caller while this component only lays things out.
 *
 * @fires row-select - CustomEvent<RowSelectDetail> when a body row is clicked.
 * @csspart table - The <table> element.
 * @csspart header - The <thead> element.
 * @csspart row - Each body <tr>.
 */
@customElement('app-table')
export class AppTable extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--font-sans);
      color: var(--color-text);
    }

    /* Fills the host; scrolls when the host has a constrained height, otherwise
       grows with its content. */
    .wrap {
      width: 100%;
      height: 100%;
      overflow: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    th,
    td {
      padding: 12px 14px;
      text-align: left;
      vertical-align: middle;
    }

    thead th {
      position: sticky;
      top: 0;
      z-index: 1;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: var(--color-text-muted);
      background: var(--color-surface-muted);
      border-bottom: 1px solid var(--color-border);
      white-space: nowrap;
    }

    tbody td {
      border-bottom: 1px solid var(--color-border-subtle);
    }

    /* Zebra striping: shade alternate rows. */
    tbody tr:nth-child(even) td {
      background: var(--color-surface-muted);
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    tbody tr.clickable {
      cursor: pointer;
    }

    tbody tr.clickable:hover td {
      background: var(--color-surface-hover);
    }

    .align-center {
      text-align: center;
    }

    .align-right {
      text-align: right;
    }

    .empty {
      padding: 32px 14px;
      text-align: center;
      color: var(--color-text-subtle);
      font-size: 14px;
    }
  `;

  /** Column definitions. */
  @property({attribute: false}) columns: TableColumn[] = [];

  /** Row records to display. */
  @property({attribute: false}) rows: TableRow[] = [];

  /** Text shown when there are no rows. */
  @property({attribute: 'empty-text'}) emptyText = 'No records';

  /** When true, rows are clickable and emit `row-select`. */
  @property({type: Boolean}) selectable = false;

  private alignClass(align?: TableColumn['align']): string {
    if (align === 'center') return 'align-center';
    if (align === 'right') return 'align-right';
    return '';
  }

  private handleRowClick(row: TableRow, index: number): void {
    if (!this.selectable) return;
    this.dispatchEvent(
      new CustomEvent<RowSelectDetail>('row-select', {
        detail: {row, index},
        bubbles: true,
        composed: true,
      })
    );
  }

  private renderCell(column: TableColumn, row: TableRow, index: number): unknown {
    if (column.render) return column.render(row, index);
    const value = row[column.key];
    return value == null ? '' : String(value);
  }

  override render() {
    const {columns, rows} = this;
    return html`
      <div class="wrap">
        <table part="table">
          <thead part="header">
            <tr>
              ${columns.map(
                (col) => html`<th
                  class=${this.alignClass(col.align)}
                  style=${col.width ? `width:${col.width}` : nothing}
                >
                  ${col.label}
                </th>`
              )}
            </tr>
          </thead>
          <tbody>
            ${rows.length === 0
              ? html`<tr>
                  <td class="empty" colspan=${columns.length}>
                    ${this.emptyText}
                  </td>
                </tr>`
              : rows.map(
                  (row, index) => html`<tr
                    part="row"
                    class=${this.selectable ? 'clickable' : ''}
                    @click=${() => this.handleRowClick(row, index)}
                  >
                    ${columns.map(
                      (col) => html`<td class=${this.alignClass(col.align)}>
                        ${this.renderCell(col, row, index)}
                      </td>`
                    )}
                  </tr>`
                )}
          </tbody>
        </table>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-table': AppTable;
  }
}
