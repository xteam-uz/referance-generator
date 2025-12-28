import type { Metadata } from 'next';
import React from 'react';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
    title: "References Home",
    description: "Home page of references",
    icons: {
        icon: "favicon.ico"
    }
}

export default function Layout({ children }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Navbar />
            {children}
        </>
    )
}
