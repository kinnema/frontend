import LoginModule from "@/lib/features/auth/login";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/login")({
  codeSplitGroupings: [["component"]],
  component: () => (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Giriş yap</h1>
        <p className="text-gray-400 mb-6">İzlediğiniz herşeyi kaydedin!</p>
        <Suspense>
          <LoginModule />
        </Suspense>
      </div>
    </div>
  ),
});
