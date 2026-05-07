import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../contexts/CurrencyContext';
import './CurrencySelector.css';

const CurrencySelector = () => {
  const { t } = useTranslation();
  const { selectedCurrency, changeCurrency, loading, error } = useCurrency();

  const currencies = [
    { code: 'COP', name: t('currency.cop'), symbol: '$' },
    { code: 'USD', name: t('currency.usd'), symbol: '$' },
    { code: 'EUR', name: t('currency.eur'), symbol: '€' }
  ];

  const handleCurrencyChange = (e) => {
    changeCurrency(e.target.value);
  };

  return (
    <div className="currency-selector">
      <div className="currency-selector-wrapper">
        <select
          id="currency-select"
          className="currency-select"
          value={selectedCurrency}
          onChange={handleCurrencyChange}
          disabled={loading}
        >
          {currencies.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.symbol} {currency.code}
            </option>
          ))}
        </select>
        {loading && (
          <span className="currency-selector-loading">
            <span className="spinner-small"></span>
          </span>
        )}
        {error && (
          <span className="currency-selector-error" title={error}>
            ⚠️
          </span>
        )}
      </div>
    </div>
  );
};

export default CurrencySelector;

