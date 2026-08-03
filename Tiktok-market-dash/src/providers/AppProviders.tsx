import { Provider as ReduxProvider } from 'react-redux'
import { store } from '@/redux/store'

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReduxProvider store={store}>
      {/* ThemeProvider will go here */}
        {children}
    </ReduxProvider>
  )
}
