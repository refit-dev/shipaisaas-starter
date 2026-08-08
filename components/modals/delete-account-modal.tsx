import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useAssistantStore } from "@/stores/assistantStore";
import { useUserStore } from "@/stores/userStore";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { UserAvatar } from "@/components/shared/user-avatar";

function DeleteAccountModal({
  showDeleteAccountModal,
  setShowDeleteAccountModal,
}: {
  showDeleteAccountModal: boolean;
  setShowDeleteAccountModal: Dispatch<SetStateAction<boolean>>;
}) {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const { resetUserStore } = useUserStore();
  const { resetAssistantStore } = useAssistantStore();
  const [deleting, setDeleting] = useState(false);

  async function deleteAccount() {
    setDeleting(true);
    await fetch(`/api/user`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(async (res) => {
      if (res.status === 200) {
        try {
          await authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                // Clear any client-side state related to the user or assistants
                resetUserStore();
                resetAssistantStore();
                window.location.href = "/login";
              },
            },
          });
        } catch (error) {
          console.error("Sign out error:", error);
        }
      } else {
        setDeleting(false);
        const error = await res.text();
        throw error;
      }
    });
  }

  return (
    <Modal
      showModal={showDeleteAccountModal}
      setShowModal={setShowDeleteAccountModal}
      className="gap-0"
    >
      <div className="flex flex-col items-center justify-center space-y-3 border-b p-4 pt-8 sm:px-16">
        {user && (
          <UserAvatar
            user={{
              name: user.name,
              image: user.image || null,
            }}
          />
        )}
        <h3 className="text-lg font-semibold">Delete Account</h3>
        <p className="text-muted-foreground text-center text-sm">
          <b>Warning:</b> This will permanently delete your account and your
          active subscription!
        </p>

        {/* TODO: Use getUserSubscriptionPlan(session.user.id) to display the user's subscription if he have a paid plan */}
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          toast.promise(deleteAccount(), {
            loading: "Deleting account...",
            success: "Account deleted successfully!",
            error: (err) => err,
          });
        }}
        className="bg-accent flex flex-col space-y-6 px-4 py-8 text-left sm:px-16"
      >
        <div>
          <label htmlFor="verification" className="block text-sm">
            To verify, type{" "}
            <span className="font-semibold text-black dark:text-white">
              confirm delete account
            </span>{" "}
            below
          </label>
          <Input
            type="text"
            name="verification"
            id="verification"
            pattern="confirm delete account"
            required
            autoFocus={false}
            autoComplete="off"
            className="bg-background mt-1 w-full border"
          />
        </div>

        <Button
          variant={deleting ? "disable" : "destructive"}
          disabled={deleting}
        >
          Confirm delete account
        </Button>
      </form>
    </Modal>
  );
}

export function useDeleteAccountModal() {
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  const DeleteAccountModalCallback = useCallback(() => {
    return (
      <DeleteAccountModal
        showDeleteAccountModal={showDeleteAccountModal}
        setShowDeleteAccountModal={setShowDeleteAccountModal}
      />
    );
  }, [showDeleteAccountModal, setShowDeleteAccountModal]);

  return useMemo(
    () => ({
      setShowDeleteAccountModal,
      DeleteAccountModal: DeleteAccountModalCallback,
    }),
    [setShowDeleteAccountModal, DeleteAccountModalCallback],
  );
}
