"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ILoginResponse, IMutationLogin } from "@/lib/models";
import { AuthService } from "@/lib/services/auth.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export default function LoginModule() {
  const router = useRouter();
  const toast = useToast();
  const setUser = useAuthStore((state) => state.setUser);
  const loginMutation = useMutation<ILoginResponse, void, IMutationLogin>({
    mutationFn: (data) => AuthService.login(data.data),
    onSuccess(data) {
      setUser(data);
      toast.toast({
        title: "Giriş başarılı",
        description: "Yönlendirilliyorsunuz...",
        variant: "default",
      });

      setTimeout(() => {
        router.back();
      }, 2000);
    },
    onError() {
      toast.toast({
        title: "Giriş baraşırısız",
        description: "Lütfen e-posta adresinizi ve şifrenizi kontrol ediniz",
        variant: "destructive",
      });
    },
  });
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const onLogin = useCallback(
    async (e: any) => {
      e.preventDefault();

      if (!email || !password) {
        toast.toast({
          title: "Giriş baraşırısız",
          description: "Lütfen boş alan bırakmayın",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      await loginMutation.mutateAsync({
        data: formData,
      });
    },
    [email, password]
  );

  return (
    <form className="flex flex-col gap-5" onSubmit={onLogin}>
      <div id="group">
        <Input
          type="email"
          id="email"
          placeholder="selman@kinnema.com"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div id="group">
        <Input
          type="password"
          id="password"
          placeholder="******"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-row gap-5 self-end">
        <Button variant="secondary" onClick={() => router.back()}>
          Kapat
        </Button>

        <Button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending && <Loader2 className="animate-spin" />}
          Giris yap
        </Button>
      </div>

      <hr />
      <span className="text-center">veya...</span>
      <Link href="/register" passHref legacyBehavior>
        <Button className="mb-5">Kayit olun</Button>
      </Link>
    </form>
  );
}
