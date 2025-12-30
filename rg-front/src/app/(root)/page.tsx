'use client';

import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import DocumentList from '@/components/DocumentList';

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
      {/* <h1 className="text-3xl font-bold mb-6 text-center">Reference Generator</h1> */}
      <h2 className="text-2xl font-bold text-center">Dokumentlar ro'yxati</h2>


      <div className="max-w-md mx-auto">

        {/* Current features */}
        <button
          onClick={handleObyektivkaClick}
          className="hidden cursor-pointer w-full bg-green-500 text-white text-center py-3 px-4 rounded-lg hover:bg-green-600 transition"
        >
          Obyektivka qo'shish
        </button>

        {/* Future features */}
        <button
          onClick={handleIshgaOlishArizaClick}
          className="hidden cursor-pointer w-full bg-purple-500 text-white text-center py-3 px-4 rounded-lg hover:bg-purple-600 transition"
        >
          Ishga olish bo'yicha ariza
        </button>

        <button
          onClick={handleKochirishArizaClick}
          className="hidden cursor-pointer w-full bg-orange-500 text-white text-center py-3 px-4 rounded-lg hover:bg-orange-600 transition"
        >
          Ko'chirish bo'yicha ariza
        </button>

        <button
          onClick={handleReferencesClick}
          className="hidden cursor-pointer w-full bg-blue-500 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-600 transition"
        >
          Reference qo'shish
        </button>

      </div>
      <DocumentList />
    </div>
  );
}
