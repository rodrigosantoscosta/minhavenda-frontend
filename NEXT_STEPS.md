# Next Steps & Recommended Refactoring

This document outlines recommended improvements and refactoring opportunities for the project.

## Critical Issues Resolved ✓

- **Login error display:** Fixed component remounting issue with `PublicRoute`
- **Form submission:** Prevented browser default form behavior causing page reloads
- **Error persistence:** Implemented sessionStorage pattern for error messages

---

## High Priority Refactoring

### 1. Extract Error Handling to Custom Hook

**Current:** Error handling logic duplicated in Login.jsx
**Suggested:** Create `useFormError.js` hook

```javascript
// src/hooks/useFormError.js
export function useFormError(storageKey) {
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey)
    if (saved) {
      setError(saved)
      sessionStorage.removeItem(storageKey)
    }
  }, [storageKey])

  const saveError = useCallback((message) => {
    sessionStorage.setItem(storageKey, message)
    setError(message)
  }, [storageKey])

  const clearError = useCallback(() => {
    sessionStorage.removeItem(storageKey)
    setError('')
  }, [storageKey])

  return { error, saveError, clearError }
}
```

**Usage in Login.jsx:**

```javascript
const { error: serverError, saveError, clearError } = useFormError('loginError')
```

**Benefits:**

- Reusable across Register, ForgotPassword, etc.
- Centralizes sessionStorage logic
- Easier to test

---

### 2. Standardize API Error Response Handling

**Current:** Error extraction logic in both `authService.js` and `AuthContext.jsx`

**Suggested:** Create `src/utils/errorHandler.js`

```javascript
export function extractApiError(error, defaultMessage = 'Erro ao processar requisição') {
  if (error.response?.data?.mensagem) {
    return error.response.data.mensagem
  }
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.response?.status === 401) {
    return 'Credenciais inválidas'
  }
  if (error.response?.status === 403) {
    return 'Acesso negado'
  }
  if (error.response?.status >= 500) {
    return 'Erro no servidor. Tente novamente mais tarde.'
  }
  if (error.message) {
    return error.message
  }
  return defaultMessage
}
```

**Refactor `authService.js`:**

```javascript
import { extractApiError } from '../utils/errorHandler'

async login(email, senha) {
  try {
    // ... existing code
  } catch (error) {
    logger.error({ error }, 'Erro no authService.login')
    throw new Error(extractApiError(error, 'Erro ao fazer login'))
  }
}
```

**Benefits:**

- Consistent error messages across all API calls
- Single source of truth for error extraction
- Easier to add new error types

---

### 3. Review api.js Interceptor Logic

**Current Issue:** The 401 interceptor might interfere with other scenarios

**Suggested Changes:**

```javascript
// api.js - Response interceptor
case 401:
  const isAuthEndpoint = 
    config?.url?.includes('/auth/login') || 
    config?.url?.includes('/auth/register') ||
    config?.url?.includes('/auth/forgot-password') ||
    config?.url?.includes('/auth/reset-password')
  
  if (!isAuthEndpoint) {
    logger.warn({ url: config?.url }, 'Token inválido ou expirado')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('tokenExpiration')
    window.dispatchEvent(new CustomEvent('auth:unauthorized'))
  }
  break
```

**Add to excluded endpoints:**

- Password reset flows
- Email verification
- Any other public endpoints that might return 401

---

### 4. Optimize PublicRoute Performance

**Current:** Creates new state on every render

**Suggested:** Move initial check logic to ref

```javascript
export function PublicRoute({ children, redirectTo = '/' }) {
  const { isAuthenticated, loading } = useAuth()
  const hasCheckedRef = useRef(false)

  useEffect(() => {
    if (!loading) {
      hasCheckedRef.current = true
    }
  }, [loading])

  // Only show spinner during first mount check
  if (loading && !hasCheckedRef.current) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}
```

**Benefits:**

- Avoids creating state unnecessarily
- Slightly better performance
- More semantic (ref for imperative flag)

---

## Medium Priority

### 5. Add Form Validation Hook

Create `useFormValidation.js` for reusable validation logic:

```javascript
export function useFormValidation(validationRules) {
  const [errors, setErrors] = useState({})

  const validate = useCallback((formData) => {
    const newErrors = {}
    
    Object.entries(validationRules).forEach(([field, rules]) => {
      const value = formData[field]
      
      if (rules.required && !value) {
        newErrors[field] = rules.requiredMessage || `${field} é obrigatório`
        return
      }
      
      if (rules.pattern && !rules.pattern.test(value)) {
        newErrors[field] = rules.patternMessage || `${field} inválido`
        return
      }
      
      if (rules.minLength && value.length < rules.minLength) {
        newErrors[field] = `Mínimo ${rules.minLength} caracteres`
        return
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [validationRules])

  const clearError = useCallback((field) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  return { errors, validate, clearError, setErrors }
}
```


---

### 6. Extract Input Components

Create reusable form input components:

**`src/components/common/FormInput.jsx`:**

```javascript
export function FormInput({ 
  label, 
  name, 
  type = 'text',
  value,
  onChange,
  error,
  icon: Icon,
  placeholder,
  required = false,
  ...props 
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && '*'}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="text-gray-400" size={20} />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          {...props}
        />
      </div>
      {error && (
        ```
        <p className="mt-1 text-sm text-red-600">{error}</p>
        ```
      )}
    </div>
  )
}
```


---

### 7. Add Loading States Hook

Centralize loading state management:

```javascript
// src/hooks/useLoadingState.js
export function useLoadingState() {
  const [loadingStates, setLoadingStates] = useState({})

  const setLoading = useCallback((key, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }))
  }, [])

  const isLoading = useCallback((key) => {
    return loadingStates[key] || false
  }, [loadingStates])

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(Boolean)
  }, [loadingStates])

  return { setLoading, isLoading, isAnyLoading }
}
```


---

## Low Priority / Nice to Have

### 8. Add Unit Tests for Auth Flow

- Test `authService.js` error extraction
- Test `useFormError` hook
- Test `PublicRoute` and `ProtectedRoute` logic
- Mock axios responses


### 9. Add Error Boundary

Wrap app in error boundary to catch render errors:

```javascript
// src/components/common/ErrorBoundary.jsx
export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    logger.error({ error, errorInfo }, 'React Error Boundary caught error')
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1>Algo deu errado</h1>
            <button onClick={() => window.location.reload()}>
              Recarregar página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```


### 10. Improve Accessibility

- Add ARIA labels to form inputs
- Ensure keyboard navigation works
- Add focus management after error display
- Test with screen readers


### 11. Add Toast Notifications

Replace inline errors with toast notifications for better UX:

- Success: "Login realizado com sucesso"
- Error: "Email ou senha inválidos"
- Info: "Sessão expirada"

---

## Architecture Recommendations

### Consider Moving to React Query

For API state management, consider migrating to `@tanstack/react-query`:

**Benefits:**

- Automatic caching and background refetching
- Built-in loading and error states
- Optimistic updates
- Better TypeScript support


### Consider Form Library

For complex forms, evaluate `react-hook-form`:

**Benefits:**

- Less re-renders
- Built-in validation
- Better performance with large forms
- TypeScript support

---

## Performance Optimizations

1. **Lazy load pages** with `React.lazy()`
2. **Memoize expensive computations** with `useMemo`
3. **Add React.memo** to pure components
4. **Code splitting** by route
5. **Optimize bundle size** - analyze with `vite-bundle-visualizer`

---

## Documentation

1. Add JSDoc comments to all utility functions
2. Document API error response formats
3. Create authentication flow diagram
4. Document environment variables in README

---

## Summary Priority Order

1. Extract error handling hook (immediate reuse benefit)
2. Standardize API error responses (consistency)
3. Review 401 interceptor logic (prevent future bugs)
4. Add form validation hook (code reuse)
5. Extract form input components (DRY principle)
6. Everything else based on time/priority

---

**Note:** These are recommendations, not requirements. Implement based on project timeline and team priorities.
