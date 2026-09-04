/**
 * Utility functions for currency and date formatting across the application.
 */

export const formatCurrency = (amount: number): string => {
  return `₱${amount.toLocaleString('en-PH')}`;
};

export const formatDateTime = (dateString?: string): string => {
  const date = dateString ? new Date(dateString) : new Date();
  return date.toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
