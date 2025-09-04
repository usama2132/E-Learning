import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Available themes
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

// Color schemes for different themes
const THEME_COLORS = {
  light: {
    primary: '#007bff',
    primaryHover: '#0056b3',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    
    background: '#ffffff',
    backgroundSecondary: '#f8f9fa',
    backgroundTertiary: '#e9ecef',
    
    text: '#212529',
    textSecondary: '#6c757d',
    textMuted: '#adb5bd',
    
    border: '#dee2e6',
    borderLight: '#e9ecef',
    
    card: '#ffffff',
    cardHover: '#f8f9fa',
    
    sidebar: '#ffffff',
    sidebarActive: '#f8f9fa',
    
    header: '#ffffff',
    headerText: '#212529',
    
    input: '#ffffff',
    inputBorder: '#ced4da',
    inputFocus: '#80bdff',
    
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowHover: 'rgba(0, 0, 0, 0.15)'
  },
  dark: {
    primary: '#0d6efd',
    primaryHover: '#0b5ed7',
    secondary: '#6c757d',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    
    background: '#1a1a1a',
    backgroundSecondary: '#2d2d2d',
    backgroundTertiary: '#404040',
    
    text: '#ffffff',
    textSecondary: '#adb5bd',
    textMuted: '#6c757d',
    
    border: '#404040',
    borderLight: '#2d2d2d',
    
    card: '#2d2d2d',
    cardHover: '#404040',
    
    sidebar: '#1a1a1a',
    sidebarActive: '#2d2d2d',
    
    header: '#1a1a1a',
    headerText: '#ffffff',
    
    input: '#2d2d2d',
    inputBorder: '#404040',
    inputFocus: '#0d6efd',
    
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowHover: 'rgba(0, 0, 0, 0.4)'
  }
};

// Font sizes
const FONT_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  EXTRA_LARGE: 'extra-large'
};

const FONT_SIZE_VALUES = {
  small: {
    base: '14px',
    sm: '12px',
    md: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '20px',
    '3xl': '24px',
    '4xl': '28px'
  },
  medium: {
    base: '16px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '28px',
    '4xl': '32px'
  },
  large: {
    base: '18px',
    sm: '16px',
    md: '18px',
    lg: '20px',
    xl: '22px',
    '2xl': '26px',
    '3xl': '30px',
    '4xl': '36px'
  },
  'extra-large': {
    base: '20px',
    sm: '18px',
    md: '20px',
    lg: '22px',
    xl: '24px',
    '2xl': '28px',
    '3xl': '32px',
    '4xl': '40px'
  }
};

// Initial state
const initialState = {
  theme: THEMES.AUTO,
  actualTheme: THEMES.LIGHT,
  fontSize: FONT_SIZES.MEDIUM,
  animations: true,
  reducedMotion: false,
  highContrast: false,
  customColors: null,
  loading: false
};

// Action types
const THEME_ACTIONS = {
  SET_THEME: 'SET_THEME',
  SET_ACTUAL_THEME: 'SET_ACTUAL_THEME',
  SET_FONT_SIZE: 'SET_FONT_SIZE',
  SET_ANIMATIONS: 'SET_ANIMATIONS',
  SET_REDUCED_MOTION: 'SET_REDUCED_MOTION',
  SET_HIGH_CONTRAST: 'SET_HIGH_CONTRAST',
  SET_CUSTOM_COLORS: 'SET_CUSTOM_COLORS',
  RESET_CUSTOM_COLORS: 'RESET_CUSTOM_COLORS',
  SET_LOADING: 'SET_LOADING',
  RESET_THEME: 'RESET_THEME'
};

// Theme reducer
const themeReducer = (state, action) => {
  switch (action.type) {
    case THEME_ACTIONS.SET_THEME:
      return { ...state, theme: action.payload };

    case THEME_ACTIONS.SET_ACTUAL_THEME:
      return { ...state, actualTheme: action.payload };

    case THEME_ACTIONS.SET_FONT_SIZE:
      return { ...state, fontSize: action.payload };

    case THEME_ACTIONS.SET_ANIMATIONS:
      return { ...state, animations: action.payload };

    case THEME_ACTIONS.SET_REDUCED_MOTION:
      return { ...state, reducedMotion: action.payload };

    case THEME_ACTIONS.SET_HIGH_CONTRAST:
      return { ...state, highContrast: action.payload };

    case THEME_ACTIONS.SET_CUSTOM_COLORS:
      return { ...state, customColors: action.payload };

    case THEME_ACTIONS.RESET_CUSTOM_COLORS:
      return { ...state, customColors: null };

    case THEME_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case THEME_ACTIONS.RESET_THEME:
      return initialState;

    default:
      return state;
  }
};

// Create context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Apply CSS variables to document root
  const applyCSSVariables = (theme, fontSize, customColors) => {
    const root = document.documentElement;
    const colors = customColors || THEME_COLORS[theme];
    const fontSizes = FONT_SIZE_VALUES[fontSize];

    // Apply theme data attribute
    root.setAttribute('data-theme', theme);
    
    // Apply color variables
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Apply font size variables
    Object.entries(fontSizes).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });

    // Apply animation duration
    const animationDuration = state.reducedMotion || !state.animations ? '0ms' : '0.3s';
    root.style.setProperty('--animation-duration', animationDuration);

    // Apply theme classes
    root.className = `theme-${theme} font-${fontSize}${state.highContrast ? ' high-contrast' : ''}`;
  };

  // Load theme preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('themePreferences');
      if (savedTheme) {
        const parsedTheme = JSON.parse(savedTheme);
        
        if (parsedTheme.theme) {
          dispatch({ type: THEME_ACTIONS.SET_THEME, payload: parsedTheme.theme });
        }
        if (parsedTheme.fontSize) {
          dispatch({ type: THEME_ACTIONS.SET_FONT_SIZE, payload: parsedTheme.fontSize });
        }
        if (parsedTheme.animations !== undefined) {
          dispatch({ type: THEME_ACTIONS.SET_ANIMATIONS, payload: parsedTheme.animations });
        }
        if (parsedTheme.reducedMotion !== undefined) {
          dispatch({ type: THEME_ACTIONS.SET_REDUCED_MOTION, payload: parsedTheme.reducedMotion });
        }
        if (parsedTheme.highContrast !== undefined) {
          dispatch({ type: THEME_ACTIONS.SET_HIGH_CONTRAST, payload: parsedTheme.highContrast });
        }
        if (parsedTheme.customColors) {
          dispatch({ type: THEME_ACTIONS.SET_CUSTOM_COLORS, payload: parsedTheme.customColors });
        }
      }
    } catch (error) {
      console.error('Error loading theme preferences:', error);
    }
  }, []);

  // Resolve actual theme from auto/system preference
  useEffect(() => {
    const resolveTheme = () => {
      if (state.theme === THEMES.AUTO) {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const actualTheme = systemPrefersDark ? THEMES.DARK : THEMES.LIGHT;
        dispatch({ type: THEME_ACTIONS.SET_ACTUAL_THEME, payload: actualTheme });
      } else {
        dispatch({ type: THEME_ACTIONS.SET_ACTUAL_THEME, payload: state.theme });
      }
    };

    resolveTheme();

    // Listen for system theme changes only if using auto
    if (state.theme === THEMES.AUTO) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = resolveTheme;
      
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
    }
  }, [state.theme]);

  // Apply theme changes to DOM
  useEffect(() => {
    applyCSSVariables(state.actualTheme, state.fontSize, state.customColors);
  }, [state.actualTheme, state.fontSize, state.customColors, state.animations, state.reducedMotion, state.highContrast]);

  // Save preferences to localStorage
  useEffect(() => {
    const themeData = {
      theme: state.theme,
      fontSize: state.fontSize,
      animations: state.animations,
      reducedMotion: state.reducedMotion,
      highContrast: state.highContrast,
      customColors: state.customColors
    };
    
    try {
      localStorage.setItem('themePreferences', JSON.stringify(themeData));
    } catch (error) {
      console.error('Error saving theme preferences:', error);
    }
  }, [state.theme, state.fontSize, state.animations, state.reducedMotion, state.highContrast, state.customColors]);

  // Helper functions
  const setTheme = (theme) => {
    if (Object.values(THEMES).includes(theme)) {
      dispatch({ type: THEME_ACTIONS.SET_THEME, payload: theme });
    }
  };

  const toggleTheme = () => {
    if (state.theme === THEMES.AUTO) {
      const newTheme = state.actualTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
      setTheme(newTheme);
    } else {
      const newTheme = state.theme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
      setTheme(newTheme);
    }
  };

  const setFontSize = (fontSize) => {
    if (Object.values(FONT_SIZES).includes(fontSize)) {
      dispatch({ type: THEME_ACTIONS.SET_FONT_SIZE, payload: fontSize });
    }
  };

  const toggleAnimations = () => {
    dispatch({ type: THEME_ACTIONS.SET_ANIMATIONS, payload: !state.animations });
  };

  const toggleReducedMotion = () => {
    dispatch({ type: THEME_ACTIONS.SET_REDUCED_MOTION, payload: !state.reducedMotion });
  };

  const toggleHighContrast = () => {
    dispatch({ type: THEME_ACTIONS.SET_HIGH_CONTRAST, payload: !state.highContrast });
  };

  const setCustomColors = (colors) => {
    dispatch({ type: THEME_ACTIONS.SET_CUSTOM_COLORS, payload: colors });
  };

  const resetCustomColors = () => {
    dispatch({ type: THEME_ACTIONS.RESET_CUSTOM_COLORS });
  };

  const resetTheme = () => {
    dispatch({ type: THEME_ACTIONS.RESET_THEME });
    localStorage.removeItem('themePreferences');
  };

  const getCurrentColors = () => {
    return state.customColors || THEME_COLORS[state.actualTheme];
  };

  const getCurrentFontSizes = () => {
    return FONT_SIZE_VALUES[state.fontSize];
  };

  const isDarkMode = () => {
    return state.actualTheme === THEMES.DARK;
  };

  const isLightMode = () => {
    return state.actualTheme === THEMES.LIGHT;
  };

  const isAutoMode = () => {
    return state.theme === THEMES.AUTO;
  };

  const value = {
    ...state,
    THEMES,
    FONT_SIZES,
    THEME_COLORS,
    FONT_SIZE_VALUES,
    setTheme,
    toggleTheme,
    setFontSize,
    toggleAnimations,
    toggleReducedMotion,
    toggleHighContrast,
    setCustomColors,
    resetCustomColors,
    resetTheme,
    getCurrentColors,
    getCurrentFontSizes,
    isDarkMode,
    isLightMode,
    isAutoMode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;