import React, { createContext, useContext, useState } from 'react';

// TODO: Implement actual ThemeContext logic
export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeContext.Provider value={null}>
      {children}
    </ThemeContext.Provider>
  );
};
