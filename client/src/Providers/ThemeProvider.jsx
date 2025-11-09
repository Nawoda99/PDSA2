import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

const palettes = {
  light: {
    bar: "#1a1a2e",
    background: "#f8f9fa",
    surface: "#ffffff",
    primary: "#6c5ce7",
    secondary: "#a29bfe",
    accent: "#fd79a8",
    textPrimary: "#2d3436",
    textSecondary: "#636e72",
    topBarText: "#ffffff",
    iconButton: {
      background: "#e8e8e8",
      border: "#ffffff",
      text: "#ffffff",
      iconColor: "#6c5ce7",
    },
    textFieldIcon: "#6c5ce7",
    modal: {
      background: "#ffffff",
      border: "#6c5ce7",
      text: "#2d3436",
      overlay: "#00000080",
    },
    button: {
      primaryBg: "#6c5ce7",
      primaryBgGradient: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
      primaryText: "#ffffff",
      secondaryBg: "#74b9ff",
      secondaryBgGradient: "linear-gradient(135deg, #74b9ff, #0984e3)",
      secondaryText: "#ffffff",
      dangerBg: "#e17055",
      dangerBgGradient: "linear-gradient(135deg, #e17055, #d63031)",
      dangerText: "#ffffff",
      successBg: "#00b894",
      successBgGradient: "linear-gradient(135deg, #00b894, #00cec9)",
      successText: "#ffffff",
      warningBg: "#fdcb6e",
      warningBgGradient: "linear-gradient(135deg, #fdcb6e, #e17055)",
      warningText: "#ffffff",
      outlineBg: "transparent",
      outlineText: "#6c5ce7",
      outlineBorder: "#6c5ce7",
      disabledBg: "#ddd",
      disabledText: "#b2bec3",
      hover: {
        primary: "linear-gradient(135deg, #5f3dc4, #9775fa)",
        secondary: "linear-gradient(135deg, #339af0, #1971c2)",
        danger: "linear-gradient(135deg, #ff6b6b, #ee5a52)",
        success: "linear-gradient(135deg, #51cf66, #40c057)",
        warning: "linear-gradient(135deg, #ffd43b, #fab005)",
        outline: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
      },
    },
    deactivate: "linear-gradient(135deg, #fab005, #fd7e14)",
    table: {
      background: "#ffffff",
      border: "#6c5ce7",
      header: "#f1f3f4",
      text: "#2d3436",
      pagination: {
        currentPageBackground: "#6c5ce7",
        currentPageText: "#ffffff",
        background: "#ffffff",
        border: "#6c5ce7",
        text: "#636e72",
        currentPageBorder: "#ffffff",
      },
    },
    toolTip: {
      background: "#1a1a2e",
      text: "#ffffff",
      border: "#6c5ce7",
    },
    panel: {
      background: "#6c5ce7",
      border: "#a29bfe",
      panelText: "#ffffff",
      text: "#2d3436",
      overlay: "#00000080",
    },
    menuColor: "#1a1a2e",
    input: {
      background: "#ffffff",
      border: "#6c5ce7",
      text: "#2d3436",
      icons: "#636e72",
      errors: "#e17055",
      label: "#6c5ce7",
      placeholder: "#b2bec3",
      selectedBg: "#f8f9ff",
      selectedText: "#6c5ce7",
      dropdownBg: "#ffffff",
      dropdownBorder: "#6c5ce7",
      dropdownHeaderBg: "#f1f3f4",
      dropdownHeaderBorder: "#ddd",
      disabledText: "#b2bec3",
      disabledBg: "#f1f3f4",
      disabledBorder: "#ddd",
      textSecondary: "#636e72",
    },
  },
  dark: {
    bar: "#0f0f23",
    background: "#0f0f23",
    surface: "#1a1a2e",
    primary: "#a29bfe",
    secondary: "#74b9ff",
    accent: "#fd79a8",
    textFieldIcon: "#a29bfe",
    textPrimary: "#ffffff",
    textSecondary: "#b2bec3",
    topBarText: "#ffffff",
    iconButton: {
      background: "#16213e",
      border: "#333",
      text: "#ffffff",
      iconColor: "#a29bfe",
    },
    modal: {
      background: "#16213e",
      border: "#a29bfe",
      text: "#ffffff",
      overlay: "#00000090",
    },
    panel: {
      background: "#16213e",
      border: "#a29bfe",
      panelText: "#ffffff",
      text: "#ffffff",
      overlay: "#00000090",
    },
    deactivate: "linear-gradient(135deg, #fab005, #fd7e14)",
    button: {
      primaryBg: "#a29bfe",
      primaryBgGradient: "linear-gradient(135deg, #a29bfe, #6c5ce7)",
      primaryText: "#ffffff",
      secondaryBg: "#74b9ff",
      secondaryBgGradient: "linear-gradient(135deg, #74b9ff, #0984e3)",
      secondaryText: "#ffffff",
      dangerBg: "#e17055",
      dangerBgGradient: "linear-gradient(135deg, #e17055, #d63031)",
      dangerText: "#ffffff",
      successBg: "#00b894",
      successBgGradient: "linear-gradient(135deg, #00b894, #00cec9)",
      successText: "#ffffff",
      warningBg: "#fdcb6e",
      warningBgGradient: "linear-gradient(135deg, #fdcb6e, #e17055)",
      warningText: "#ffffff",
      outlineBg: "transparent",
      outlineText: "#a29bfe",
      outlineBorder: "#a29bfe",
      disabledBg: "#16213e",
      disabledText: "#636e72",
      hover: {
        primary: "linear-gradient(135deg, #9775fa, #7c3aed)",
        secondary: "linear-gradient(135deg, #339af0, #1971c2)",
        danger: "linear-gradient(135deg, #ff6b6b, #ee5a52)",
        success: "linear-gradient(135deg, #51cf66, #40c057)",
        warning: "linear-gradient(135deg, #ffd43b, #fab005)",
        outline: "linear-gradient(135deg, #16213e, #1a1a2e)",
      },
    },
    table: {
      background: "#16213e",
      border: "#a29bfe",
      header: "#1a1a2e",
      text: "#ffffff",
      pagination: {
        currentPageBackground: "#a29bfe",
        currentPageText: "#ffffff",
        background: "#16213e",
        border: "#a29bfe",
        text: "#b2bec3",
        currentPageBorder: "#ffffff",
      },
    },
    toolTip: {
      background: "#0f0f23",
      text: "#ffffff",
      border: "#a29bfe",
    },
    menuColor: "#0f0f23",
    input: {
      background: "#16213e",
      border: "#a29bfe",
      text: "#ffffff",
      icons: "#b2bec3",
      errors: "#e17055",
      label: "#a29bfe",
      placeholder: "#636e72",
      selectedBg: "#1a1a2e",
      selectedText: "#a29bfe",
      dropdownBg: "#16213e",
      dropdownBorder: "#a29bfe",
      dropdownHeaderBg: "#1a1a2e",
      dropdownHeaderBorder: "#16213e",
      disabledText: "#636e72",
      disabledBg: "#16213e",
      disabledBorder: "#636e72",
      textSecondary: "#b2bec3",
    },
  },
};

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (themeName === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", themeName);
  }, [themeName]);

  const toggleTheme = () => {
    setThemeName((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider
      value={{ themeName, theme: palettes[themeName], toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
