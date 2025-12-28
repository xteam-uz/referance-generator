import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: "References Auth",
    description: "Login or Register before create references",
    icons: {
        icon: "favicon.ico"
    }
}

export default function Layout({ children }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            {children}
        </>
    )
}
