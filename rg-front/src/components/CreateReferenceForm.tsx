'use client';

// CLIENT COMPONENT - TanStack Query bilan form boshqarish

import { useState } from 'react';
import { useCreateReference } from '@/lib/queries/references';
import { CreateReferenceDto } from '@/lib/types';

export default function CreateReferenceForm() {
    // TanStack Query mutation - server-side data yaratish
    const createMutation = useCreateReference();
    const [message, setMessage] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateReferenceDto>({
        title: '',
        author: '',
        year: new Date().getFullYear(),
        type: 'book',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        try {
            await createMutation.mutateAsync(formData);
            setMessage('Muvaffaqiyatli qo\'shildi!');
            // Formni tozalash
            setFormData({
                title: '',
                author: '',
                year: new Date().getFullYear(),
                type: 'book',
            });
        } catch (error) {
            setMessage(
                error instanceof Error ? error.message : 'Xatolik yuz berdi'
            );
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 border rounded">
            <h2 className="text-xl font-bold mb-4">Yangi Reference Qo'shish</h2>

            <div className="mb-4">
                <label className="block mb-2">Sarlavha</label>
                <input
                    type="text"
                    placeholder='Sarlavha...'
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>

            <div className="mb-4">
                <label className="block mb-2">Muallif</label>
                <input
                    type="text"
                    placeholder='Muallif...'
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>

            <div className="mb-4">
                <label className="block mb-2">Yil</label>
                {/* <input
                    type="date"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full p-2 border rounded"
                    required
                /> */}

                <input
                    type="date"
                    value={formData.year ? `${formData.year}-01-01` : ''}
                    onChange={(e) => {
                        const selectedDate = e.target.value;
                        if (selectedDate) {
                            const year = new Date(selectedDate).getFullYear();
                            setFormData({ ...formData, year });
                        }
                    }}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>

            <div className="mb-4">
                <label className="block mb-2">Tur</label>
                <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as CreateReferenceDto['type'] })}
                    className="w-full p-2 border rounded"
                >
                    <option value="book">Kitob</option>
                    <option value="article">Maqola</option>
                    <option value="website">Veb-sayt</option>
                    <option value="other">Boshqa</option>
                </select>
            </div>

            {message && (
                <div className={`mb-4 p-2 rounded ${message.includes('Muvaffaqiyatli') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message}
                </div>
            )}

            <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
                {createMutation.isPending ? 'Yuklanmoqda...' : 'Qo\'shish'}
            </button>
        </form>
    );
}

