// Auth slice exports
export {
    login,
    register,
    logout,
    clearError as clearAuthError,
    setUser,
} from './authSlice';

export type {
    User,
    LoginDto,
    RegisterDto,
    AuthResponse,
} from './authSlice';

export { default as authReducer } from './authSlice';

// References slice exports - Client-side state uchun
export {
    setTypeFilter,
    setSearchQuery,
    setSortBy,
    setSortOrder,
    clearFilters,
    toggleSelection,
    clearSelection,
    setViewMode,
} from './referencesSlice';

export { default as referencesReducer } from './referencesSlice';

