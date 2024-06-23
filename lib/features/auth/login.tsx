"use client";

import Button from "@/lib/components/Button";
import { ILoginResponse, IMutationLogin } from "@/lib/models";
import { AuthService } from "@/lib/services/auth.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Input } from "@nextui-org/input";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { FiLogIn } from "react-icons/fi";
export default function LoginModule() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const loginMutation = useMutation<ILoginResponse, void, IMutationLogin>({
    mutationFn: (data) => AuthService.login(data.data),
    onSuccess(data) {
      setUser(data);
      toast.success("Giris yapildi");

      setTimeout(() => {
        router.back();
      }, 200);
    },
    onError() {
      toast.error("Giris yapilamadi");
    },
  });
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const onLogin = useCallback(async () => {
    if (!email || !password) {
      toast.error("Bos alan bırakmayın");
      return;
    }

    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    await loginMutation.mutateAsync({
      data: formData,
    });
  }, [email, password]);

  return (
    <form className="flex flex-col gap-5">
      <div id="group">
        <Input
          type="email"
          id="email"
          label="Email"
          placeholder="selman@kinnema.com"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div id="group">
        <Input
          type="password"
          id="password"
          label="Sifreniz"
          placeholder="******"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-row gap-5 self-end">
        <Button secondary onClick={() => router.back()}>
          Kapat
        </Button>

        <Button
          onClick={onLogin}
          isLoading={loginMutation.isPending}
          icon={<FiLogIn />}
        >
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
