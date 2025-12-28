// Redux Toolkit slice - Authentication uchun
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { postData } from '@/lib/api';

// Types
export interface User {
    id: number;
    first_name: string;
    last_name: string;
    username?: string;
    email?: string;
    telegram_user_id: number;
    created_at: string;
    updated_at: string;
}

export interface LoginDto {
    telegram_user_id: number;
    first_name: string;
    last_name: string;
}

export interface RegisterDto {
    telegram_user_id: number;
    first_name: string;
    last_name: string;
    username?: string;
    email?: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

// Async thunks
export const login = createAsyncThunk(
    'auth/login',
    async (data: LoginDto, { rejectWithValue }) => {
        try {
            const response = await postData<{ success: boolean; data: AuthResponse; message: string }>('/login', data);
            if (response.success && response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Login xatolik'
            );
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (data: RegisterDto, { rejectWithValue }) => {
        try {
            const response = await postData<{ success: boolean; data: AuthResponse; message: string }>('/register', data);
            if (response.success && response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Register xatolik'
            );
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await postData('/logout', {});
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return true;
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return rejectWithValue(
                error instanceof Error ? error.message : 'Logout xatolik'
            );
        }
    }
);

// State interface
interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

// Initial state - localStorage dan yuklash
const getInitialState = (): AuthState => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        return {
            user,
            token,
            loading: false,
            error: null,
            isAuthenticated: !!token && !!user,
        };
    }

    return {
        user: null,
        token: null,
        loading: false,
        error: null,
        isAuthenticated: false,
    };
};

// Slice
const authSlice = createSlice({
    name: 'auth',
    initialState: getInitialState(),
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            if (typeof window !== 'undefined') {
                localStorage.setItem('user', JSON.stringify(action.payload));
            }
        },
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false;
            });

        // Register
        builder
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false;
            });

        // Logout
        builder
            .addCase(logout.pending, (state) => {
                state.loading = true;
            })
            .addCase(logout.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.error = null;
            })
            .addCase(logout.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;

