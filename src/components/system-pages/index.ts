/**
 * System Pages Components
 * Export all system page components and utilities
 */

// Layout
export { SystemPageLayout } from './SystemPageLayout';
export type { SystemPageLayoutProps } from './SystemPageLayout';

// Templates
export { ErrorPageTemplate } from './ErrorPageTemplate';
export type { ErrorPageTemplateProps, ErrorPageAction } from './ErrorPageTemplate';

export { EmptyStateTemplate } from './EmptyStateTemplate';
export type {
  EmptyStateTemplateProps,
  EmptyStateAction,
  EmptyStateVariant,
} from './EmptyStateTemplate';

// Components
export { StatusIndicator } from './StatusIndicator';
export type { StatusIndicatorProps, StatusType, StatusSize } from './StatusIndicator';

export { NetworkStatus } from './NetworkStatus';
export type { NetworkStatusProps } from './NetworkStatus';

// Illustrations
export * from './illustrations';
