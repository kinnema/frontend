import { Modal } from "@/lib/components/Modal";
import LoginModule from "@/lib/features/auth/login";

export default function Page() {
  return (
    <Modal>
      <LoginModule />
    </Modal>
  );
}
