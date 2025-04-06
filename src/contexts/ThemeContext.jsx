import { createContext, useContext, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material';

const ThemeContext = createContext();

export function ThemeContextProvider({ children }) {
  // Verificar localStorage ao inicializar
  const savedUserData = localStorage.getItem('userData');
  const initialColor = savedUserData ? 
    JSON.parse(savedUserData)?.avatarData?.color || '#8A05BE' : 
    '#8A05BE';

  const [primaryColor, setPrimaryColor] = useState(initialColor);

  const theme = createTheme({
    palette: {
      primary: {
        main: primaryColor,
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ setPrimaryColor }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);