const fs = require('fs');
const path = require('path');

const filesToCreate = {
  'vite.config.ts': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
`,
  'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
`,
  '.prettierrc': `{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
`,
  '.editorconfig': `root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
`,
  '.env.example': `VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME="AI E-Commerce Growth"
VITE_DEFAULT_THEME=light
`,
  'src/redux/store.ts': `import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from './rootReducer'

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
`,
  'src/redux/rootReducer.ts': `import { combineReducers } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'

export const rootReducer = combineReducers({
  auth: authReducer,
  // TODO: Add other feature reducers here (products, orders, customers, etc)
})
`,
  'src/redux/hooks.ts': `import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './store'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
`,
  'src/features/auth/authSlice.ts': `import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
})

export default authSlice.reducer
`,
  'src/lib/axios.ts': `import axios from 'axios'
import { API_BASE_URL } from '@/constants/config'

export const axiosPublic = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export const axiosPrivate = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

axiosPrivate.interceptors.request.use(
  (config) => {
    // TODO: Add JWT access token here
    return config
  },
  (error) => Promise.reject(error)
)

axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    // TODO: Handle 401 Unauthorized & Refresh Token logic here
    return Promise.reject(error)
  }
)
`,
  'src/routes/AppRouter.tsx': `import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import PublicRoute from './PublicRoute'
import ProtectedRoute from './ProtectedRoute'
import { Suspense } from 'react'

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path={ROUTES.LOGIN} element={<div>Login Page Placeholder</div>} />
            <Route path={ROUTES.REGISTER} element={<div>Register Page Placeholder</div>} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path={ROUTES.DASHBOARD} element={<div>Dashboard Layout Placeholder</div>}>
               {/* Nested dashboard routes will go here */}
            </Route>
          </Route>
          
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
`,
  'src/routes/PublicRoute.tsx': `import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

const PublicRoute = () => {
  const isAuthenticated = false // TODO: Replace with real auth check

  return isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Outlet />
}

export default PublicRoute
`,
  'src/routes/ProtectedRoute.tsx': `import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

const ProtectedRoute = () => {
  const isAuthenticated = false // TODO: Replace with real auth check

  return isAuthenticated ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />
}

export default ProtectedRoute
`,
  'src/providers/AppProviders.tsx': `import { Provider as ReduxProvider } from 'react-redux'
import { store } from '@/redux/store'

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReduxProvider store={store}>
      {/* ThemeProvider will go here */}
        {children}
    </ReduxProvider>
  )
}
`,
  'src/constants/routes.ts': `export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PRODUCTS: '/dashboard/products',
  ORDERS: '/dashboard/orders',
  CUSTOMERS: '/dashboard/customers',
  INVENTORY: '/dashboard/inventory',
  ANALYTICS: '/dashboard/analytics',
  SETTINGS: '/dashboard/settings',
} as const
`,
  'src/constants/config.ts': `export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'
`,
  'src/types/index.ts': `export interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'SELLER'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
`,
  'src/utils/formatters.ts': `export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}
`,
  'src/utils/storage.ts': `export const storage = {
  get: (key: string) => {
    // TODO: Implement safe local storage parsing
  },
  set: (key: string, value: any) => {
    // TODO: Implement safe local storage setting
  },
  remove: (key: string) => {
    // TODO: Implement local storage removal
  }
}
`,
  'src/contexts/ThemeContext.tsx': `import React, { createContext, useContext, useState } from 'react';

// TODO: Implement actual ThemeContext logic
export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeContext.Provider value={null}>
      {children}
    </ThemeContext.Provider>
  );
};
`
}

// Generate hooks
const hooks = ['useAuth', 'useProducts', 'useOrders', 'useCustomers', 'useAnalytics', 'useInventory', 'useMedia', 'useTheme', 'useDebounce', 'useAxios']
hooks.forEach(hook => {
  filesToCreate[`src/hooks/${hook}.ts`] = `export const ${hook} = () => {
  // TODO: Implement logic
  return {}
}
`
})

// Generate services
const services = ['auth', 'products', 'orders', 'customers', 'analytics', 'inventory', 'media', 'ai']
services.forEach(service => {
  filesToCreate[`src/services/${service}Service.ts`] = `import { axiosPrivate } from '@/lib/axios'

export const ${service}Service = {
  // TODO: Implement API endpoints
}
`
})

const createFiles = () => {
  for (const [filePath, content] of Object.entries(filesToCreate)) {
    const fullPath = path.join(__dirname, filePath)
    const dir = path.dirname(fullPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(fullPath, content, 'utf8')
    console.log(`Created ${filePath}`)
  }
}

createFiles()
