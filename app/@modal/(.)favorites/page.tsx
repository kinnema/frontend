"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FavoritesPageFeature } from "@/lib/features/favorites/FavoritesPage";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FavoritesModal() {
    const router = useRouter();
    return (
        <Dialog open modal>
            <DialogContent className="max-w-[95vw] w-full md:max-w-3xl lg:max-w-4xl xl:max-w-5xl h-[90vh] overflow-y-auto">
                <DialogHeader className="relative">
                    <DialogTitle>Favoriler</DialogTitle>
                    <DialogDescription>İzlediğiniz herşeyi kaydedin!</DialogDescription>
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-white/10 text-white"
                            onClick={() => router.back()}
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>
                </DialogHeader>
                <FavoritesPageFeature />
            </DialogContent>
        </Dialog>
    );
}
