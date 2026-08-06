import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/redux/store';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { StoreConnectionProvider } from '@/contexts/StoreConnectionContext';

export const AppProviders = ({ children }) => (
  <ReduxProvider store={store}>
    <ThemeProvider>
      <StoreConnectionProvider>
        {children}
      </StoreConnectionProvider>
    </ThemeProvider>
  </ReduxProvider>
);
