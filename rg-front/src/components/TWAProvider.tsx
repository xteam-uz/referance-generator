'use client'

import { useEffect, useState } from 'react';
import { initTelegramApp } from '@/lib/tgInit';

// TWA SDK Provider komponenti - @twa-dev/sdk/react hooks o'z-o'zidan ishlaydi
export default function TWAProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    // Hydration muammolarini oldini olish uchun
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        initTelegramApp();
    }, []);

    if (!mounted) return null;

    return <>{children}</>;
}

