'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function LoginPage() {
    const router = useRouter();
    const { openLoginModal } = useApp();

    useEffect(() => {
        openLoginModal();
        router.push('/');
    }, [openLoginModal, router]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50/50">
            <div className="animate-pulse text-sm text-gray-400 font-bold">Redirecting to Three Wheeler Secure Portal...</div>
        </div>
    );
}