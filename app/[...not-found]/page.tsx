import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
            <h1 className="text-4xl font-bold mb-4">Sayfa Bulunamadı</h1>
            <p className="text-gray-600 mb-6">
                Bir şeyler yanlış gitti. Lütfen sayfayı yenilemeyi deneyin.
            </p>
            <Link href="/">
                <Button
                >
                    Ana Sayfaya Dön
                </Button>
            </Link>
        </div>
    );
} 