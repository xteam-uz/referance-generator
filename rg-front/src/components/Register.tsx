'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { register, clearError } from '@/store/slices/authSlice';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/tgInit';
import Lottie from 'lottie-react';

// Animatsiyalarni import qilish
const TelegramAnimation = require('../../public/animations/telegram.json');
const ErrorAnimation = require('../../public/animations/error.json');

// Xatoliklarni tarjima qilish uchun
const errorTranslations: Record<string, string> = {
    "The first name field must be at least 3 characters.":
        "Ism kamida 3 ta harfdan iborat bo'lishi kerak.",
    "The last name field must be at least 3 characters.":
        "Familiya kamida 3 ta harfdan iborat bo'lishi kerak.",
    "The first name field is required.": "Ism maydoni to'ldirilishi shart.",
    "The last name field is required.": "Familiya maydoni to'ldirilishi shart.",
    "The telegram user id field is required.":
        "Telegram foydalanuvchi IDsi topilmadi.",
    "The telegram user id has already been taken.":
        "Bu Telegram foydalanuvchi allaqachon ro'yxatdan o'tgan.",
};

const translateError = (error: string): string => {
    return errorTranslations[error] || error;
};

export default function Register() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);
    const firstNameRef = useRef<HTMLInputElement>(null);
    const lastNameRef = useRef<HTMLInputElement>(null);
    const usernameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const [telegramUser, setTelegramUser] = useState<any>(null);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    useEffect(() => {
        // initTelegramApp() hozirda TWAProvider orqali chaqiriladi
        const user = getUserData();
        if (user) {
            setTelegramUser(user);
            if (firstNameRef.current) firstNameRef.current.value = user.first_name || '';
            if (lastNameRef.current) lastNameRef.current.value = user.last_name || '';
            if (usernameRef.current) usernameRef.current.value = user.username || '';
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, router]);

    useEffect(() => {
        if (error) {
            setErrors({ general: [error] });
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // if (!telegramUser?.id) {
        //     setErrors({
        //         telegram_user_id: ["Telegram foydalanuvchi ma'lumoti topilmadi"],
        //     });
        //     return;
        // }

        const payload = {
            telegram_user_id: Number('3983986265'), // Number(telegramUser.id),
            first_name: firstNameRef.current?.value || telegramUser?.first_name || '',
            last_name: lastNameRef.current?.value || telegramUser?.last_name || '',
            username: usernameRef.current?.value || telegramUser?.username || undefined,
            email: emailRef.current?.value || undefined,
        };

        const result = await dispatch(register(payload));

        if (register.rejected.match(result)) {
            const errorPayload = result.payload as any;
            if (errorPayload?.errors) {
                setErrors(errorPayload.errors);
            } else if (errorPayload?.data?.errors) {
                setErrors(errorPayload.data.errors);
            } else {
                setErrors({ general: [errorPayload || 'Xatolik yuz berdi'] });
            }
        }
    };

    const hasErrors = (errors.general || errors.telegram_user_id);

    return (
        <form onSubmit={onSubmit} className="max-w-md mx-auto p-4">
            <div className="flex flex-col items-center gap-5 mb-6">
                {hasErrors ? (
                    <Lottie
                        animationData={ErrorAnimation}
                        className="w-32 h-32"
                        loop={true}
                    />
                ) : (
                    <Lottie
                        animationData={TelegramAnimation}
                        className="w-40 h-40"
                        loop={true}
                    />
                )}
                <h1 className="text-xl font-semibold text-center">Ro'yxatdan o'tish</h1>
            </div>

            {errors.general && (
                <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded mb-4">
                    {errors.general.map((error, index) => (
                        <p key={index}>{translateError(error)}</p>
                    ))}
                </div>
            )}

            {errors.telegram_user_id && (
                <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded mb-4">
                    <p>{translateError(errors.telegram_user_id[0])}</p>
                </div>
            )}

            <div className="grid md:grid-cols-2 md:gap-6">
                <div className="relative z-0 w-full mb-5 group">
                    <input
                        ref={firstNameRef}
                        type="text"
                        id="floating_first_name"
                        className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2
                               border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                        placeholder=" "
                        defaultValue={telegramUser?.first_name || ""}
                    />
                    <label
                        htmlFor="floating_first_name"
                        className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300
                               transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0
                               peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0
                               peer-focus:scale-75 peer-focus:-translate-y-6"
                    >
                        Ism
                    </label>
                    {errors.first_name && (
                        <p className="text-red-500 text-xs mt-1">
                            {translateError(errors.first_name[0])}
                        </p>
                    )}
                </div>

                <div className="relative z-0 w-full mb-5 group">
                    <input
                        ref={lastNameRef}
                        type="text"
                        id="floating_last_name"
                        className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2
                               border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                        placeholder=" "
                        defaultValue={telegramUser?.last_name || ""}
                    />
                    <label
                        htmlFor="floating_last_name"
                        className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300
                               transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0
                               peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0
                               peer-focus:scale-75 peer-focus:-translate-y-6"
                    >
                        Familiya
                    </label>
                    {errors.last_name && (
                        <p className="text-red-500 text-xs mt-1">
                            {translateError(errors.last_name[0])}
                        </p>
                    )}
                </div>
            </div>

            <div className="mb-5">
                <div className="relative z-0 w-full group">
                    <input
                        ref={usernameRef}
                        type="text"
                        id="floating_username"
                        className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2
                               border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                        placeholder=" "
                        defaultValue={telegramUser?.username || ""}
                    />
                    <label
                        htmlFor="floating_username"
                        className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300
                               transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0
                               peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0
                               peer-focus:scale-75 peer-focus:-translate-y-6"
                    >
                        Username (ixtiyoriy)
                    </label>
                    {errors.username && (
                        <p className="text-red-500 text-xs mt-1">
                            {translateError(errors.username[0])}
                        </p>
                    )}
                </div>
            </div>

            <div className="mb-5">
                <div className="relative z-0 w-full group">
                    <input
                        ref={emailRef}
                        type="email"
                        id="floating_email"
                        className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2
                               border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                        placeholder=" "
                    />
                    <label
                        htmlFor="floating_email"
                        className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300
                               transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0
                               peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0
                               peer-focus:scale-75 peer-focus:-translate-y-6"
                    >
                        Email (ixtiyoriy)
                    </label>
                    {errors.email && (
                        <p className="text-red-500 text-xs mt-1">
                            {translateError(errors.email[0])}
                        </p>
                    )}
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none
                           focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center
                           disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Yuklanmoqda...' : "Ro'yxatdan o'tish"}
            </button>
            <p className="text-sm text-center mt-4">
                Allaqachon ro'yxatdan o'tganmisiz?{' '}
                <Link href="/login" className="text-blue-500 hover:underline">
                    Kirish
                </Link>
            </p>
        </form>
    );
}

