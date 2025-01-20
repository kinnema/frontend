import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Heart, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function UserNav() {
  const user = useAuthStore((state) => state.user);
  const logOut = useAuthStore((state) => state.logOut);
  const toast = useToast();
  const router = useRouter();

  function onPressLogout(): void {
    logOut();
    toast.toast({
      title: "Çıkış başarılı",
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="md:inline-flex">
          {user?.username}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>{user?.username}</span>
        </DropdownMenuItem>
        <Link href="/favorites" legacyBehavior>
          <DropdownMenuItem
            className="cursor-pointer"
          >
            <Heart className="mr-2 h-4 w-4" />
            <span>Favoriler</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600" onClick={onPressLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Çıkış Yap</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
