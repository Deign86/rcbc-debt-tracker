/**
 * Formats a number string with commas (e.g., "5000" -> "5,000")
 * Preserves decimal points and allows typing
 */
export const formatCurrencyInput = (value: string): string => {
    // Remove existing commas
    const cleanValue = value.replace(/,/g, '');

    // Handle empty or invalid input
    if (!cleanValue || isNaN(Number(cleanValue))) {
        return value;
    }

    // Split integer and decimal parts
    const parts = cleanValue.split('.');

    // Format integer part with commas
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Rejoin with decimal part if it exists
    return parts.join('.');
};

/**
 * Parses a formatted currency string back to a number
 * Removes commas and converts to float
 */
export const parseCurrencyInput = (value: string): number => {
    if (!value) return 0;
    return parseFloat(value.replace(/,/g, ''));
};
