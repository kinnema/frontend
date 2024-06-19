import { useAuthStore } from "@/lib/stores/auth.store";
import { Button } from "@nextui-org/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { Key, useCallback } from "react";
import { FiUser } from "react-icons/fi";

export default function AccountDropdown() {
  const user = useAuthStore((state) => state.user);
  const logOut = useAuthStore((state) => state.logOut);

  const onAction = useCallback((action: Key) => {
    switch (action) {
      case "logout":
        logOut();
        break;
    }
  }, []);

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          variant="bordered"
          className="w-10/12"
          startContent={<FiUser />}
        >
          {user?.username}
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="User actions" onAction={onAction}>
        <DropdownItem key="logout" className="text-danger" color="danger">
          Cikis Yap
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
