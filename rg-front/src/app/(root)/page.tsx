'use client';

import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);

  const handleReferencesClick = () => {
    // Token tekshirish
    const tokenFromStorage = typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

    if (!tokenFromStorage && !isAuthenticated && !token) {
      router.push('/login');
    } else {
      router.push('/references');
    }
  };

  const handleObyektivkaClick = () => {
    const tokenFromStorage = typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

    if (!tokenFromStorage && !isAuthenticated && !token) {
      router.push('/login');
    } else {
      router.push('/documents/obyektivka');
    }
  };

  const handleIshgaOlishArizaClick = () => {
    const tokenFromStorage = typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

    if (!tokenFromStorage && !isAuthenticated && !token) {
      router.push('/login');
    } else {
      router.push('/documents/ishga-olish-ariza');
    }
  };

  const handleKochirishArizaClick = () => {
    const tokenFromStorage = typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

    if (!tokenFromStorage && !isAuthenticated && !token) {
      router.push('/login');
    } else {
      router.push('/documents/kochirish-ariza');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Reference Generator</h1>

      <div className="max-w-md mx-auto space-y-4">
        <button
          onClick={handleReferencesClick}
          className="block cursor-pointer w-full bg-blue-500 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-600 transition"
        >
          Reference qo'shish
        </button>

        <button
          onClick={handleObyektivkaClick}
          className="block cursor-pointer w-full bg-green-500 text-white text-center py-3 px-4 rounded-lg hover:bg-green-600 transition"
        >
          Obyektivka qo'shish
        </button>

        <button
          onClick={handleIshgaOlishArizaClick}
          className="block cursor-pointer w-full bg-purple-500 text-white text-center py-3 px-4 rounded-lg hover:bg-purple-600 transition"
        >
          Ishga olish bo'yicha ariza
        </button>

        <button
          onClick={handleKochirishArizaClick}
          className="block cursor-pointer w-full bg-orange-500 text-white text-center py-3 px-4 rounded-lg hover:bg-orange-600 transition"
        >
          Ko'chirish bo'yicha ariza
        </button>
      </div>
    </div>
  );
}
