import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/redux/store';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { StoreConnectionProvider } from '@/contexts/StoreConnectionContext';
import AuthBootstrap from '@/components/auth/AuthBootstrap';

export const AppProviders = ({ children }) => (
  <ReduxProvider store={store}>
    <ThemeProvider>
      <StoreConnectionProvider>
        <AuthBootstrap>{children}</AuthBootstrap>
      </StoreConnectionProvider>
    </ThemeProvider>
  </ReduxProvider>
);
