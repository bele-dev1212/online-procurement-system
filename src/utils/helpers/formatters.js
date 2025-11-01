/**
 * Formatter Utilities
 * Comprehensive formatting functions for data presentation
 */

import { PROCUREMENT_CONSTANTS, APP_CONFIG } from '../constants/appConstants';

/**
 * Currency Formatters
 */
export const CurrencyFormatters = {
  // Format amount to currency string
  formatCurrency: (amount, currency = PROCUREMENT_CONSTANTS.CURRENCY.DEFAULT, locale = 'en-US') => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return 'N/A';
    }

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: PROCUREMENT_CONSTANTS.CURRENCY.DECIMAL_PLACES,
        maximumFractionDigits: PROCUREMENT_CONSTANTS.CURRENCY.DECIMAL_PLACES,
      }).format(amount);
    } catch (error) {
      console.error('Currency formatting error:', error);
      return `${PROCUREMENT_CONSTANTS.CURRENCY.SYMBOL}${amount.toFixed(PROCUREMENT_CONSTANTS.CURRENCY.DECIMAL_PLACES)}`;
    }
  },

  // Format currency without symbol
  formatCurrencyWithoutSymbol: (amount, decimalPlaces = PROCUREMENT_CONSTANTS.CURRENCY.DECIMAL_PLACES) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '0.00';
    }

    return amount.toLocaleString('en-US', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });
  },

  // Format large numbers with K, M, B suffixes
  formatCompactCurrency: (amount, currency = PROCUREMENT_CONSTANTS.CURRENCY.DEFAULT) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return 'N/A';
    }

    const ranges = [
      { divider: 1e9, suffix: 'B' },
      { divider: 1e6, suffix: 'M' },
      { divider: 1e3, suffix: 'K' },
    ];

    for (const range of ranges) {
      if (amount >= range.divider) {
        const formatted = (amount / range.divider).toFixed(1);
        return `${PROCUREMENT_CONSTANTS.CURRENCY.SYMBOL}${formatted}${range.suffix}`;
      }
    }

    return CurrencyFormatters.formatCurrency(amount, currency);
  },

  // Parse currency string to number
  parseCurrency: (currencyString) => {
    if (!currencyString || typeof currencyString !== 'string') {
      return 0;
    }

    // Remove currency symbols and commas
    const cleaned = currencyString.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);

    return isNaN(parsed) ? 0 : parsed;
  },

  // Calculate percentage of total
  formatPercentage: (value, total, decimalPlaces = 1) => {
    if (total === 0 || value === null || total === null) {
      return '0%';
    }

    const percentage = (value / total) * 100;
    return `${percentage.toFixed(decimalPlaces)}%`;
  },

  // Format change (positive/negative) with colors
  formatChange: (current, previous, includeSymbol = true) => {
    if (current === null || previous === null || previous === 0) {
      return { value: 'N/A', isPositive: false, isNegative: false };
    }

    const change = current - previous;
    const percentage = ((change / previous) * 100);

    const value = includeSymbol 
      ? `${change >= 0 ? '+' : ''}${CurrencyFormatters.formatCurrency(change)} (${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%)`
      : `${change >= 0 ? '+' : ''}${CurrencyFormatters.formatCurrency(change)}`;

    return {
      value,
      isPositive: change > 0,
      isNegative: change < 0,
      absoluteValue: Math.abs(change),
      percentage: Math.abs(percentage),
    };
  },
};

/**
 * Number Formatters
 */
export const NumberFormatters = {
  // Format number with thousands separators
  formatNumber: (number, decimalPlaces = 0) => {
    if (number === null || number === undefined || isNaN(number)) {
      return '0';
    }

    return number.toLocaleString('en-US', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });
  },

  // Format number with compact notation
  formatCompactNumber: (number) => {
    if (number === null || number === undefined || isNaN(number)) {
      return '0';
    }

    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(number);
  },

  // Format file sizes
  formatFileSize: (bytes, decimalPlaces = 1) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimalPlaces))} ${sizes[i]}`;
  },

  // Format phone numbers
  formatPhoneNumber: (phoneNumber) => {
    if (!phoneNumber) return '';

    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // US phone number format
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
    
    // International format with country code
    if (cleaned.length > 10) {
      return `+${cleaned.slice(0, cleaned.length - 10)} (${cleaned.slice(cleaned.length - 10, cleaned.length - 7)}) ${cleaned.slice(cleaned.length - 7, cleaned.length - 4)}-${cleaned.slice(cleaned.length - 4)}`;
    }

    // Return original if doesn't match expected formats
    return phoneNumber;
  },

  // Format percentages
  formatPercent: (value, decimalPlaces = 1) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0%';
    }

    return `${value.toFixed(decimalPlaces)}%`;
  },

  // Format units of measurement
  formatUnit: (value, unit, decimalPlaces = 2) => {
    if (value === null || value === undefined || isNaN(value)) {
      return `0 ${unit}`;
    }

    return `${NumberFormatters.formatNumber(value, decimalPlaces)} ${unit}`;
  },
};

/**
 * Text Formatters
 */
export const TextFormatters = {
  // Capitalize first letter
  capitalize: (text) => {
    if (!text || typeof text !== 'string') return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  // Title case (capitalize each word)
  titleCase: (text) => {
    if (!text || typeof text !== 'string') return '';
    return text.replace(/\w\S*/g, (word) => 
      word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
    );
  },

  // Convert snake_case to Title Case
  snakeToTitleCase: (text) => {
    if (!text || typeof text !== 'string') return '';
    return text.split('_').map(TextFormatters.capitalize).join(' ');
  },

  // Convert camelCase to Title Case
  camelToTitleCase: (text) => {
    if (!text || typeof text !== 'string') return '';
    return text
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  },

  // Truncate text with ellipsis
  truncate: (text, maxLength = 50, ellipsis = '...') => {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= maxLength) return text;
    
    return text.substr(0, maxLength - ellipsis.length) + ellipsis;
  },

  // Format text for display (remove extra spaces, etc.)
  cleanText: (text) => {
    if (!text || typeof text !== 'string') return '';
    return text.replace(/\s+/g, ' ').trim();
  },

  // Format enumeration (array to comma-separated string)
  formatList: (items, maxItems = 5, separator = ', ') => {
    if (!items || !Array.isArray(items)) return '';
    
    if (items.length <= maxItems) {
      return items.join(separator);
    }
    
    return `${items.slice(0, maxItems).join(separator)} and ${items.length - maxItems} more`;
  },

  // Format ID with padding
  formatId: (id, prefix = '', length = 6) => {
    if (!id) return '';
    
    const paddedId = id.toString().padStart(length, '0');
    return prefix ? `${prefix}-${paddedId}` : paddedId;
  },

  // Mask sensitive information
  maskSensitive: (text, visibleChars = 4, maskChar = '*') => {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= visibleChars * 2) return maskChar.repeat(text.length);
    
    const firstVisible = text.substring(0, visibleChars);
    const lastVisible = text.substring(text.length - visibleChars);
    const maskedLength = text.length - (visibleChars * 2);
    
    return firstVisible + maskChar.repeat(maskedLength) + lastVisible;
  },
};

/**
 * Data Formatters
 */
export const DataFormatters = {
  // Format status for display
  formatStatus: (status, type = 'general') => {
    if (!status) return 'Unknown';

    const statusMaps = {
      purchase_order: PROCUREMENT_CONSTANTS.PURCHASE_ORDER_STATUS,
      requisition: PROCUREMENT_CONSTANTS.REQUISITION_STATUS,
      rfq: PROCUREMENT_CONSTANTS.RFQ_STATUS,
      bid: PROCUREMENT_CONSTANTS.BID_STATUS,
      supplier: PROCUREMENT_CONSTANTS.SUPPLIER_STATUS,
      product: PROCUREMENT_CONSTANTS.PRODUCT_STATUS,
    };

    const statusMap = statusMaps[type] || {};
    const statusKey = Object.keys(statusMap).find(key => statusMap[key] === status);
    
    return statusKey ? TextFormatters.snakeToTitleCase(statusKey) : TextFormatters.snakeToTitleCase(status);
  },

  // Get status color
  getStatusColor: (status) => {
    const colorMap = {
      // Positive statuses
      approved: 'success',
      active: 'success',
      received: 'success',
      completed: 'success',
      awarded: 'success',
      open: 'success',
      published: 'success',
      
      // Warning statuses
      draft: 'warning',
      pending: 'warning',
      pending_approval: 'warning',
      under_review: 'warning',
      under_evaluation: 'warning',
      partially_received: 'warning',
      
      // Negative statuses
      rejected: 'error',
      cancelled: 'error',
      closed: 'error',
      suspended: 'error',
      blacklisted: 'error',
      out_of_stock: 'error',
      
      // Neutral statuses
      ordered: 'info',
      converted_to_po: 'info',
      inactive: 'secondary',
    };

    return colorMap[status] || 'secondary';
  },

  // Format array of items for display
  formatArray: (array, field = null, separator = ', ') => {
    if (!array || !Array.isArray(array)) return '';
    
    if (field) {
      return array.map(item => item[field]).filter(Boolean).join(separator);
    }
    
    return array.filter(Boolean).join(separator);
  },

  // Format object for display
  formatObject: (obj, separator = ': ', itemSeparator = ', ') => {
    if (!obj || typeof obj !== 'object') return '';
    
    return Object.entries(obj)
      .map(([key, value]) => `${TextFormatters.camelToTitleCase(key)}${separator}${value}`)
      .join(itemSeparator);
  },

  // Format data for CSV export
  formatForCSV: (data) => {
    if (Array.isArray(data)) {
      return data.map(item => 
        typeof item === 'object' ? JSON.stringify(item) : String(item)
      ).join(',');
    }
    
    return String(data);
  },

  // Format validation errors for display
  formatValidationErrors: (errors) => {
    if (!errors || typeof errors !== 'object') return '';
    
    if (Array.isArray(errors)) {
      return errors.join(', ');
    }
    
    return Object.entries(errors)
      .map(([field, message]) => `${TextFormatters.camelToTitleCase(field)}: ${message}`)
      .join(', ');
  },
};

/**
 * Address Formatters
 */
export const AddressFormatters = {
  // Format full address
  formatAddress: (address) => {
    if (!address || typeof address !== 'object') return '';
    
    const parts = [
      address.street,
      address.city,
      address.state,
      address.postalCode,
      address.country,
    ].filter(Boolean);
    
    return parts.join(', ');
  },

  // Format address for maps
  formatAddressForMaps: (address) => {
    if (!address || typeof address !== 'object') return '';
    
    const parts = [
      address.street,
      address.city,
      address.state,
      address.postalCode,
    ].filter(Boolean);
    
    return parts.join('+').replace(/\s+/g, '+');
  },

  // Format contact information
  formatContact: (contact) => {
    if (!contact || typeof contact !== 'object') return '';
    
    const parts = [
      contact.name,
      contact.email ? `📧 ${contact.email}` : '',
      contact.phone ? `📞 ${NumberFormatters.formatPhoneNumber(contact.phone)}` : '',
      contact.position ? `💼 ${contact.position}` : '',
    ].filter(Boolean);
    
    return parts.join(' | ');
  },
};

/**
 * Export all formatters
 */
export default {
  currency: CurrencyFormatters,
  number: NumberFormatters,
  text: TextFormatters,
  data: DataFormatters,
  address: AddressFormatters,
  
  // Convenience methods
  format: (value, type, ...args) => {
    const formatters = {
      currency: CurrencyFormatters.formatCurrency,
      number: NumberFormatters.formatNumber,
      percentage: NumberFormatters.formatPercent,
      phone: NumberFormatters.formatPhoneNumber,
      fileSize: NumberFormatters.formatFileSize,
      status: DataFormatters.formatStatus,
      address: AddressFormatters.formatAddress,
      truncate: TextFormatters.truncate,
      capitalize: TextFormatters.capitalize,
      titleCase: TextFormatters.titleCase,
    };

    const formatter = formatters[type];
    return formatter ? formatter(value, ...args) : String(value);
  },
};