import React, { useState, useEffect, useRef } from 'react';
import './SearchBar.css';

const SearchBar = ({
  placeholder = "Search...",
  onSearch,
  onClear,
  debounceMs = 300,
  size = "medium",
  variant = "default",
  disabled = false,
  autoFocus = false,
  showClearButton = true,
  showSearchIcon = true,
  className = "",
  initialValue = "",
  suggestions = [],
  onSuggestionSelect,
  maxSuggestions = 5,
  searchCategories = [],
  onCategoryChange,
  isLoading = false
}) => {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    searchCategories[0]?.value || ''
  );
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim() && onSearch) {
      debounceRef.current = setTimeout(() => {
        onSearch(query, selectedCategory);
      }, debounceMs);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, selectedCategory, debounceMs, onSearch]);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setQuery(value);
  };

  const handleClear = () => {
    setQuery('');
    if (onClear) {
      onClear();
    }
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
    setIsFocused(false);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (onCategoryChange) {
      onCategoryChange(category);
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const showSuggestions = isFocused && suggestions.length > 0 && query.length > 0;
  const showClear = showClearButton && query.length > 0;

  const searchBarClass = `
    search-bar
    search-bar-size-${size}
    search-bar-variant-${variant}
    ${disabled ? 'search-bar-disabled' : ''}
    ${isFocused ? 'search-bar-focused' : ''}
    ${className}
  `.trim();

  return (
    <div className={searchBarClass}>
      {/* Search Categories */}
      {searchCategories.length > 0 && (
        <div className="search-categories">
          {searchCategories.map((category) => (
            <button
              key={category.value}
              className={`search-category ${
                selectedCategory === category.value ? 'active' : ''
              }`}
              onClick={() => handleCategoryChange(category.value)}
              type="button"
            >
              {category.icon && (
                <span className="category-icon">{category.icon}</span>
              )}
              <span className="category-label">{category.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="search-input-container">
        {/* Search Icon */}
        {showSearchIcon && (
          <div className="search-icon">
            {isLoading ? (
              <div className="search-spinner"></div>
            ) : (
              '🔍'
            )}
          </div>
        )}

        {/* Search Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className="search-input"
        />

        {/* Clear Button */}
        {showClear && (
          <button
            className="search-clear-button"
            onClick={handleClear}
            type="button"
            aria-label="Clear search"
          >
            <span className="clear-icon">×</span>
          </button>
        )}
      </div>

      {/* Search Suggestions */}
      {showSuggestions && (
        <div className="search-suggestions">
          {suggestions.slice(0, maxSuggestions).map((suggestion, index) => (
            <button
              key={index}
              className="search-suggestion"
              onClick={() => handleSuggestionClick(suggestion)}
              type="button"
            >
              <span className="suggestion-icon">💡</span>
              <span className="suggestion-text">{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {/* Recent Searches (when no query) */}
      {isFocused && query.length === 0 && suggestions.length > 0 && (
        <div className="search-suggestions">
          <div className="suggestions-header">Recent Searches</div>
          {suggestions.slice(0, maxSuggestions).map((suggestion, index) => (
            <button
              key={index}
              className="search-suggestion"
              onClick={() => handleSuggestionClick(suggestion)}
              type="button"
            >
              <span className="suggestion-icon">🕒</span>
              <span className="suggestion-text">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Specialized search bars for common use cases
export const SupplierSearchBar = (props) => {
  const supplierCategories = [
    { value: 'all', label: 'All Suppliers', icon: '👥' },
    { value: 'active', label: 'Active', icon: '✅' },
    { value: 'pending', label: 'Pending', icon: '⏳' },
    { value: 'suspended', label: 'Suspended', icon: '❌' }
  ];

  return (
    <SearchBar
      placeholder="Search suppliers by name, email, or category..."
      searchCategories={supplierCategories}
      {...props}
    />
  );
};

export const ProductSearchBar = (props) => {
  const productCategories = [
    { value: 'all', label: 'All Products', icon: '📦' },
    { value: 'in-stock', label: 'In Stock', icon: '✅' },
    { value: 'low-stock', label: 'Low Stock', icon: '⚠️' },
    { value: 'out-of-stock', label: 'Out of Stock', icon: '❌' }
  ];

  return (
    <SearchBar
      placeholder="Search products by name, SKU, or category..."
      searchCategories={productCategories}
      {...props}
    />
  );
};

export const OrderSearchBar = (props) => {
  const orderCategories = [
    { value: 'all', label: 'All Orders', icon: '📋' },
    { value: 'pending', label: 'Pending', icon: '⏳' },
    { value: 'approved', label: 'Approved', icon: '✅' },
    { value: 'rejected', label: 'Rejected', icon: '❌' }
  ];

  return (
    <SearchBar
      placeholder="Search orders by ID, supplier, or status..."
      searchCategories={orderCategories}
      {...props}
    />
  );
};

export default SearchBar;