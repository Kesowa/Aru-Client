import React, { lazy } from "react";
import Dashboard from "../../Dashboard";
import { ThemeSwitcherProvider } from "react-css-theme-switcher";

const themeMap = {
  dark: `/dark-theme.css`,
  light: `/light-theme.css`,
};

function DashboardWrapper() {
  return (
    <ThemeSwitcherProvider themeMap={themeMap} defaultTheme="light">
      <div>
        <Dashboard />
      </div>
    </ThemeSwitcherProvider>
  );
}

export default DashboardWrapper;
