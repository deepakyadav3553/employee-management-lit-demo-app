import {css} from 'lit';

/**
 * Base card surface shared by dashboard widgets. Compose it into a component's
 * styles array and layer component-specific rules on top:
 *
 *   static override styles = [widgetCardStyles, css`...`];
 */
export const widgetCardStyles = css`
  .card {
    box-sizing: border-box;
    min-height: 260px;
    height: 100%;
    padding: 24px;
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
  }
`;
