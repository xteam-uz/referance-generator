// Redux Toolkit slice - References uchun CLIENT-SIDE state boshqarish
// Server-side data fetching TanStack Query orqali amalga oshiriladi
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Client-side state interface - UI state, filters, va boshqa client-side ma'lumotlar uchun
interface ReferencesUIState {
    // Filter state (masalan, type filter, search query, va hokazo)
    filters: {
        type?: 'book' | 'article' | 'website' | 'other' | null;
        searchQuery?: string;
        sortBy?: 'title' | 'author' | 'year' | 'created_at';
        sortOrder?: 'asc' | 'desc';
    };
    // UI state (masalan, selected items, expanded items, va hokazo)
    selectedIds: number[];
    // Boshqa client-side state lar
    viewMode?: 'grid' | 'list';
}

// Initial state
const initialState: ReferencesUIState = {
    filters: {
        type: null,
        searchQuery: '',
        sortBy: 'created_at',
        sortOrder: 'desc',
    },
    selectedIds: [],
    viewMode: 'list',
};

// Slice - faqat client-side state uchun
const referencesSlice = createSlice({
    name: 'references',
    initialState,
    reducers: {
        // Filter actions
        setTypeFilter: (state, action: PayloadAction<'book' | 'article' | 'website' | 'other' | null>) => {
            state.filters.type = action.payload;
        },
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.filters.searchQuery = action.payload;
        },
        setSortBy: (state, action: PayloadAction<'title' | 'author' | 'year' | 'created_at'>) => {
            state.filters.sortBy = action.payload;
        },
        setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
            state.filters.sortOrder = action.payload;
        },
        clearFilters: (state) => {
            state.filters = {
                type: null,
                searchQuery: '',
                sortBy: 'created_at',
                sortOrder: 'desc',
            };
        },
        // Selection actions
        toggleSelection: (state, action: PayloadAction<number>) => {
            const id = action.payload;
            const index = state.selectedIds.indexOf(id);
            if (index === -1) {
                state.selectedIds.push(id);
            } else {
                state.selectedIds.splice(index, 1);
            }
        },
        clearSelection: (state) => {
            state.selectedIds = [];
        },
        // View mode
        setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
            state.viewMode = action.payload;
        },
    },
});

export const {
    setTypeFilter,
    setSearchQuery,
    setSortBy,
    setSortOrder,
    clearFilters,
    toggleSelection,
    clearSelection,
    setViewMode,
} = referencesSlice.actions;

export default referencesSlice.reducer;

