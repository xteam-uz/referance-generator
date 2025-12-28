// TanStack Query hooks - Documents uchun server-side data fetching
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Document, CreateDocumentDto, UpdateDocumentDto, ApiResponse } from '@/lib/types';
import { fetchData, postData, putData, deleteData } from '@/lib/api';
import apiClient from '@/lib/api';

// Query keys - cache key lari uchun
export const documentKeys = {
    all: ['documents'] as const,
    lists: () => [...documentKeys.all, 'list'] as const,
    list: (filters?: string) => [...documentKeys.lists(), { filters }] as const,
    details: () => [...documentKeys.all, 'detail'] as const,
    detail: (id: number) => [...documentKeys.details(), id] as const,
};

// GET - Barcha documents ni olish
export function useDocuments() {
    return useQuery({
        queryKey: documentKeys.lists(),
        queryFn: async (): Promise<Document[]> => {
            const response = await fetchData<ApiResponse<Document[]>>('/documents');
            if (Array.isArray(response.data)) {
                return response.data;
            }
            return [];
        },
    });
}

// GET - Bitta document ni olish
export function useDocument(id: number) {
    return useQuery({
        queryKey: documentKeys.detail(id),
        queryFn: async (): Promise<Document> => {
            const response = await fetchData<ApiResponse<Document>>(`/documents/${id}`);
            return response.data;
        },
        enabled: !!id,
    });
}

// POST - Yangi document yaratish
export function useCreateDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateDocumentDto): Promise<Document> => {
            // FormData yaratish (photo uchun)
            const formData = new FormData();

            formData.append('document_type', data.document_type);

            // Photo qo'shish agar bo'lsa
            if (data.photo) {
                formData.append('photo', data.photo);
            }

            // Personal information
            formData.append('personal_information[familya]', data.personal_information.familya);
            formData.append('personal_information[ism]', data.personal_information.ism);
            formData.append('personal_information[sharif]', data.personal_information.sharif);
            formData.append('personal_information[joriy_lavozim_sanasi]', data.personal_information.joriy_lavozim_sanasi);
            formData.append('personal_information[joriy_lavozim_toliq]', data.personal_information.joriy_lavozim_toliq);
            formData.append('personal_information[tugilgan_sana]', data.personal_information.tugilgan_sana);
            formData.append('personal_information[tugilgan_joyi]', data.personal_information.tugilgan_joyi);
            formData.append('personal_information[millati]', data.personal_information.millati);
            formData.append('personal_information[malumoti]', data.personal_information.malumoti);

            // Education records
            data.education_records.forEach((record, index) => {
                formData.append(`education_records[${index}][description]`, record.description);
            });

            // Relatives
            data.relatives.forEach((relative, index) => {
                formData.append(`relatives[${index}][qarindoshligi]`, relative.qarindoshligi);
                formData.append(`relatives[${index}][fio]`, relative.fio);
                formData.append(`relatives[${index}][tugilgan]`, relative.tugilgan);
                formData.append(`relatives[${index}][vafot_etgan]`, relative.vafot_etgan ? '1' : '0');
                formData.append(`relatives[${index}][ish_joyi]`, relative.ish_joyi);
                formData.append(`relatives[${index}][turar_joyi]`, relative.turar_joyi);
            });

            const response = await apiClient.post<ApiResponse<Document>>('/documents', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
        },
    });
}

// PUT - Document ni yangilash
export function useUpdateDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: number;
            data: UpdateDocumentDto;
        }): Promise<Document> => {
            // FormData yaratish (photo uchun)
            const formData = new FormData();

            if (data.document_type) {
                formData.append('document_type', data.document_type);
            }
            if (data.status) {
                formData.append('status', data.status);
            }

            // Photo qo'shish agar bo'lsa
            if (data.photo) {
                formData.append('photo', data.photo);
            }

            // Personal information
            if (data.personal_information) {
                Object.entries(data.personal_information).forEach(([key, value]) => {
                    if (value !== undefined) {
                        formData.append(`personal_information[${key}]`, value.toString());
                    }
                });
            }

            // Education records
            if (data.education_records) {
                data.education_records.forEach((record, index) => {
                    formData.append(`education_records[${index}][description]`, record.description);
                });
            }

            // Relatives
            if (data.relatives) {
                data.relatives.forEach((relative, index) => {
                    formData.append(`relatives[${index}][qarindoshligi]`, relative.qarindoshligi);
                    formData.append(`relatives[${index}][fio]`, relative.fio);
                    formData.append(`relatives[${index}][tugilgan]`, relative.tugilgan);
                    formData.append(`relatives[${index}][vafot_etgan]`, relative.vafot_etgan ? '1' : '0');
                    formData.append(`relatives[${index}][ish_joyi]`, relative.ish_joyi);
                    formData.append(`relatives[${index}][turar_joyi]`, relative.turar_joyi);
                });
            }

            const response = await apiClient.put<ApiResponse<Document>>(`/documents/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
            queryClient.setQueryData(documentKeys.detail(data.id), data);
        },
    });
}

// DELETE - Document ni o'chirish
export function useDeleteDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number): Promise<void> => {
            await deleteData<ApiResponse<void>>(`/documents/${id}`);
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
            queryClient.removeQueries({ queryKey: documentKeys.detail(id) });
        },
    });
}

