import { configureStore } from '@reduxjs/toolkit';
import { referencesReducer, authReducer } from './slices';

export const store = configureStore({
    reducer: {
        references: referencesReducer,
        auth: authReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

