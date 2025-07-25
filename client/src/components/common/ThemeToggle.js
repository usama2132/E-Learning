import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/components/ThemeToggle.css';

const ThemeToggle = ({ className = '', showLabel = true, size = 'medium' }) => {
  const { isDarkMode, toggleTheme, isAutoMode, theme } = useTheme();

  const getIcon = () => {
    if (isAutoMode()) {
      return isDarkMode() ? '🌙' : '☀️';
    }
    return isDarkMode() ? '🌙' : '☀️';
  };

  const getLabel = () => {
    if (isAutoMode()) {
      return `Auto (${isDarkMode() ? 'Dark' : 'Light'})`;
    }
    return isDarkMode() ? 'Dark Mode' : 'Light Mode';
  };

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle ${size} ${isDarkMode() ? 'dark' : 'light'} ${className}`}
      aria-label={`Switch to ${isDarkMode() ? 'light' : 'dark'} mode`}
      title={getLabel()}
    >
      <span className="theme-toggle-icon">
        {getIcon()}
      </span>
      {showLabel && (
        <span className="theme-toggle-label">
          {isDarkMode() ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
};

// Advanced toggle with all theme options
export const AdvancedThemeToggle = ({ className = '' }) => {
  const { theme, setTheme, THEMES, isDarkMode, isAutoMode } = useTheme();

  const options = [
    { value: THEMES.LIGHT, label: 'Light', icon: '☀️' },
    { value: THEMES.DARK, label: 'Dark', icon: '🌙' },
    { value: THEMES.AUTO, label: 'Auto', icon: '🔄' }
  ];

  return (
    <div className={`advanced-theme-toggle ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => setTheme(option.value)}
          className={`theme-option ${theme === option.value ? 'active' : ''}`}
          aria-label={`Switch to ${option.label} mode`}
          title={option.label}
        >
          <span className="theme-option-icon">{option.icon}</span>
          <span className="theme-option-label">{option.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;