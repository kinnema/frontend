'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
            <h1 className="text-4xl font-bold mb-4">Bir hata oluştu. Lütfen tekrar dene.</h1>
            <p className="text-gray-600 mb-6">
                Bir şeyler yanlış gitti. Lütfen sayfayı yenilemeyi deneyin.
            </p>
            <button
                onClick={() => reset()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                Tekrar Dene
            </button>
        </div>
    );
} 