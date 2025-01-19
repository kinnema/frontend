import { logoutServerAction } from "@/app/actions/logoutAction";
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
import { LogOut, User } from "lucide-react";

export function UserNav() {
  const user = useAuthStore((state) => state.user);
  const logOut = useAuthStore((state) => state.logOut);
  const toast = useToast();

  function onPressLogout(): void {
    logOut();
    logoutServerAction();
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
        {/* <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Ayarlar</span>
        </DropdownMenuItem> */}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600" onClick={onPressLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Çıkış Yap</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
