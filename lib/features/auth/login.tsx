"use client";

import Button from "@/lib/components/Button";
import { Loading } from "@/lib/components/Loading";
import { ILoginResponse, IMutationLogin } from "@/lib/models";
import { login } from "@/lib/services/auth.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Input } from "@nextui-org/input";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
export default function LoginModule() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const loginMutation = useMutation<ILoginResponse, void, IMutationLogin>({
    mutationFn: (data) => login(data.data),
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
        <label
          htmlFor="email"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          E-mail
        </label>
        <Input
          type="email"
          id="email"
          placeholder="selman@kinnema.com"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div id="group">
        <label
          htmlFor="password"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Sifreniz
        </label>
        <Input
          type="password"
          id="password"
          placeholder="******"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-row gap-5 self-end">
        <Button secondary onClick={() => router.back()}>
          Kapat
        </Button>

        <Button onClick={onLogin}>
          {loginMutation.isPending ? <Loading /> : "Giris yap"}
        </Button>
      </div>
    </form>
  );
}
