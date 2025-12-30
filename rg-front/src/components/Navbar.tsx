'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';
import { useRouter } from 'next/navigation';
import { logout } from '@/store/slices/authSlice';
import { useAppDispatch } from '@/store/hooks';
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { isAuthenticated, token, user } = useAppSelector((state) => state.auth);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Client-side da token tekshirish - hydration xatosini oldini olish uchun
    const hasToken = mounted && (
        (typeof window !== 'undefined' && !!localStorage.getItem('token')) ||
        isAuthenticated ||
        !!token
    );

    const handleLogout = async () => {
        await dispatch(logout());
        router.push('/login');
        setIsMenuOpen(false);
    };

    const [openDropdown, setOpenDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const mobileDropdownRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

    const toggleDropdown = () => setOpenDropdown(!openDropdown);

    // Click outside handler for dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const isInsideDesktop = dropdownRef.current?.contains(target);
            const isInsideMobile = mobileDropdownRef.current?.contains(target);

            // Close if click is outside both dropdowns
            if (!isInsideDesktop && !isInsideMobile) {
                setOpenDropdown(false);
            }
        };

        if (openDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openDropdown]);

    // Click outside handler for mobile menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const isInsideMenu = mobileMenuRef.current?.contains(target);
            const isInsideButton = mobileMenuButtonRef.current?.contains(target);

            // Close if click is outside menu and button
            if (!isInsideMenu && !isInsideButton) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <nav className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="text-lg font-bold text-blue-600">
                        RG
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link
                            href="/"
                            className="text-sm text-gray-700 hover:text-blue-600 transition"
                        >
                            Home
                        </Link>
                        {!mounted ? (
                            // SSR vaqtida default holat (Login/Register ko'rsatish)
                            <>
                                <Link
                                    href="/login"
                                    className="text-sm text-gray-700 hover:text-blue-600 transition"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="text-sm bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                                >
                                    Register
                                </Link>
                            </>
                        ) : hasToken ? (
                            <>
                                {/* <Link
                                    href="/references"
                                    className="text-sm text-gray-700 hover:text-blue-600 transition"
                                >
                                    References
                                </Link> */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        className="flex items-center text-sm text-gray-700 hover:text-blue-600 transition"
                                        onClick={toggleDropdown}
                                    >
                                        Documents
                                        <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform ${openDropdown ? "rotate-180" : ""}`} />
                                    </button>

                                    {openDropdown && (
                                        <div
                                            className="absolute top-full left-0 mt-1 w-56 bg-white border rounded-md shadow-md p-2 z-20"
                                        >
                                            {/* <Link
                                                href="/documents/ishga-olish-ariza"
                                                onClick={() => setOpenDropdown(false)}
                                                className="block text-sm text-gray-700 hover:text-blue-600 transition px-2 py-1"
                                            >
                                                Ishga olish arizasi
                                            </Link>
                                            <Link
                                                href="/documents/kochirish-ariza"
                                                onClick={() => setOpenDropdown(false)}
                                                className="block text-sm text-gray-700 hover:text-blue-600 transition px-2 py-1"
                                            >
                                                Kochirish arizasi
                                            </Link> */}
                                            <Link
                                                href="/documents/obyektivka"
                                                onClick={() => setOpenDropdown(false)}
                                                className="block text-sm text-gray-700 hover:text-blue-600 transition px-2 py-1"
                                            >
                                                Obyektivka
                                            </Link>
                                        </div>
                                    )}
                                </div>
                                {user && (
                                    <div className="flex items-center gap-2 px-2 py-1 text-sm text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>

                                        {user.first_name} {user.last_name}
                                    </div>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="text-sm text-gray-700 hover:text-red-600 transition"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-sm text-gray-700 hover:text-blue-600 transition"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="text-sm bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        ref={mobileMenuButtonRef}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {isMenuOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                <div
                    ref={mobileMenuRef}
                    className={`md:hidden fixed top-16 left-0 right-0 w-full bg-white border-t shadow-lg z-30 transform transition-all duration-300 ease-in-out ${isMenuOpen
                        ? 'translate-y-0 opacity-100 visible pointer-events-auto'
                        : '-translate-y-full opacity-0 invisible pointer-events-none'
                        }`}
                >
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col space-y-3 pb-3">
                            <Link
                                href="/"
                                onClick={() => setIsMenuOpen(false)}
                                className="m-0 text-sm text-gray-700 hover:text-blue-600 transition px-2 py-1"
                            >
                                Home
                            </Link>
                            {!mounted ? (
                                // SSR vaqtida default holat
                                <>
                                    <Link
                                        href="/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="border-b-2 border-transparent hover:border-blue-500 text-sm text-gray-700 hover:text-blue-600 transition px-2 py-1"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="border-b-2 border-transparent hover:border-blue-500 text-sm bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-center"
                                    >
                                        Register
                                    </Link>
                                </>
                            ) : hasToken ? (
                                <div className="relative">
                                    {/* <Link
                                        href="/references"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-sm text-gray-700 hover:text-blue-600 transition px-2 py-1"
                                    >
                                        References
                                    </Link> */}
                                    <div className="relative" ref={mobileDropdownRef}>
                                        <button
                                            className="flex items-center text-sm text-gray-700 hover:text-blue-600 transition px-2 py-1"
                                            onClick={toggleDropdown}
                                        >
                                            Documents
                                            <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform ${openDropdown ? "rotate-180" : ""}`} />
                                        </button>

                                        {openDropdown && (
                                            <div
                                                className="absolute top-8 left-0 w-56 bg-white border rounded-md shadow-md p-2 z-20"
                                            >
                                                {/* <Link
                                                    href="/documents/ishga-olish-ariza"
                                                    onClick={() => {
                                                        setIsMenuOpen(false);
                                                        setOpenDropdown(false);
                                                    }}
                                                    className="block text-sm text-gray-700 hover:text-blue-600 transition px-2 py-1"
                                                >
                                                    Ishga olish arizasi
                                                </Link>

                                                <Link
                                                    href="/documents/kochirish-ariza"
                                                    onClick={() => {
                                                        setIsMenuOpen(false);
                                                        setOpenDropdown(false);
                                                    }}
                                                    className="block text-sm text-gray-700 hover:text-blue-600 transition px-2 py-1"
                                                >
                                                    Ko'chirish arizasi
                                                </Link> */}

                                                <Link
                                                    href="/documents/obyektivka"
                                                    onClick={() => {
                                                        setIsMenuOpen(false);
                                                        setOpenDropdown(false);
                                                    }}
                                                    className="block text-sm text-gray-700 hover:text-blue-600 transition px-2 py-1"
                                                >
                                                    Obyektivka
                                                </Link>
                                            </div>
                                        )}
                                    </div>

                                    <hr className="1 h-0.5 my-2 border-t-0 bg-gray-500" />

                                    <div className="flex items-center justify-between">
                                        {user && (
                                            <div className="flex items-center gap-2 px-2 py-1 text-sm text-gray-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                </svg>

                                                {user.first_name} {user.last_name}
                                            </div>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="px-2 py-1 font-bold text-white bg-red-500 rounded-md hover:bg-red-600 transition"
                                        >
                                            Logout
                                        </button>
                                    </div>

                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <Link
                                        href="/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="w-full text-center text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-4 py-2.5 rounded-lg transition border border-gray-200 hover:border-blue-500"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="w-full text-center text-sm font-medium bg-blue-500 text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 transition shadow-sm hover:shadow-md"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}
