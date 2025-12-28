// TanStack Query hooks - References uchun server-side data fetching
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Reference, CreateReferenceDto, ApiResponse } from '@/lib/types';
import { fetchData, postData, putData, deleteData } from '@/lib/api';

// Query keys - cache key lari uchun
export const referenceKeys = {
    all: ['references'] as const,
    lists: () => [...referenceKeys.all, 'list'] as const,
    list: (filters?: string) => [...referenceKeys.lists(), { filters }] as const,
    details: () => [...referenceKeys.all, 'detail'] as const,
    detail: (id: number) => [...referenceKeys.details(), id] as const,
};

// GET - Barcha references ni olish
export function useReferences() {
    return useQuery({
        queryKey: referenceKeys.lists(),
        queryFn: async (): Promise<Reference[]> => {
            const response = await fetchData<ApiResponse<Reference[]>>('/references');
            // Agar response.data array bo'lsa, uni qaytarish
            if (Array.isArray(response.data)) {
                return response.data;
            }
            // Agar response.data undefined yoki null bo'lsa, bo'sh array qaytarish
            return [];
        },
    });
}

// GET - Bitta reference ni olish (agar kerak bo'lsa)
export function useReference(id: number) {
    return useQuery({
        queryKey: referenceKeys.detail(id),
        queryFn: async (): Promise<Reference> => {
            const response = await fetchData<ApiResponse<Reference>>(`/references/${id}`);
            return response.data;
        },
        enabled: !!id, // Faqat id bo'lsa fetch qilish
    });
}

// POST - Yangi reference yaratish
export function useCreateReference() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateReferenceDto): Promise<Reference> => {
            const response = await postData<ApiResponse<Reference>>('/references', data);
            return response.data;
        },
        // Muvaffaqiyatli yaratilgandan keyin, references list ni invalidate qilish
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: referenceKeys.lists() });
        },
    });
}

// PUT - Reference ni yangilash
export function useUpdateReference() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: number;
            data: Partial<CreateReferenceDto>;
        }): Promise<Reference> => {
            const response = await putData<ApiResponse<Reference>>(`/references/${id}`, data);
            return response.data;
        },
        // Muvaffaqiyatli yangilangandan keyin, cache ni yangilash
        onSuccess: (data) => {
            // List ni invalidate qilish
            queryClient.invalidateQueries({ queryKey: referenceKeys.lists() });
            // Detail ni yangilash
            queryClient.setQueryData(referenceKeys.detail(data.id), data);
        },
    });
}

// DELETE - Reference ni o'chirish
export function useDeleteReference() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number): Promise<void> => {
            await deleteData<ApiResponse<void>>(`/references/${id}`);
        },
        // Muvaffaqiyatli o'chirilgandan keyin, cache ni yangilash
        onSuccess: (_, id) => {
            // List ni invalidate qilish
            queryClient.invalidateQueries({ queryKey: referenceKeys.lists() });
            // Detail ni o'chirish
            queryClient.removeQueries({ queryKey: referenceKeys.detail(id) });
        },
    });
}

