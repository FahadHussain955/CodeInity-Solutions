import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/redux/store';
import { ThemeProvider } from '@/contexts/ThemeContext';

export const AppProviders = ({ children }) => (
  <ReduxProvider store={store}>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </ReduxProvider>
);
