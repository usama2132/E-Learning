import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Import CSS files in logical order (base styles first, then themes, then utilities)
import './styles/variables.css';
import './styles/base/reset.css';
import './styles/base/typography.css';
import './styles/base/grid.css';
import './styles/globals.css';
import './styles/utilities.css';
import './styles/animations.css';
import './styles/responsive.css';
import './styles/themes/light.css';
import './styles/themes/dark.css';
import { enableMockAPI } from './utils/api';
enableMockAPI();

// Initialize theme from localStorage or system preference
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  let initialTheme = 'light'; // default
  
  if (savedTheme) {
    initialTheme = savedTheme;
  } else if (systemPrefersDark) {
    initialTheme = 'dark';
  }
  
  // Apply theme immediately to prevent flash
  document.documentElement.setAttribute('data-theme', initialTheme);
  
  // Listen for system theme changes if user has 'system' preference
  if (savedTheme === 'system' || !savedTheme) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      if (localStorage.getItem('theme') === 'system' || !localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
  }
};

// Initialize theme before React renders
initializeTheme();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();