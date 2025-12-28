'use client';

// CLIENT COMPONENT - TanStack Query bilan server-side data fetching

import { useReferences, useDeleteReference } from '@/lib/queries/references';
import { Reference } from '@/lib/types';

export default function ReferenceList() {
    // TanStack Query orqali server-side data fetching
    const { data: references = [], isLoading, error } = useReferences();
    const deleteMutation = useDeleteReference();

    const handleDelete = async (id: number) => {
        if (confirm('Bu referenceni o\'chirishni xohlaysizmi?')) {
            try {
                await deleteMutation.mutateAsync(id);
            } catch (error) {
                console.error('Delete error:', error);
            }
        }
    };

    if (isLoading) {
        return <div className="p-4">Yuklanmoqda...</div>;
    }

    if (error) {
        return (
            <div className="p-4 text-red-500">
                Xatolik: {error instanceof Error ? error.message : 'Ma\'lumotlarni yuklashda xatolik'}
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">References List</h2>
            <div className="grid gap-4">
                {references.length === 0 ? (
                    <p>Hozircha reference yo'q</p>
                ) : (
                    references.map((ref: Reference) => (
                        <div
                            key={ref.id}
                            className="border p-4 rounded hover:shadow-md transition"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg">{ref.title}</h3>
                                    <p className="text-gray-600">{ref.author} ({ref.year})</p>
                                    <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                                        {ref.type}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleDelete(ref.id)}
                                    className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                >
                                    O'chirish
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

