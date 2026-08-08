"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Lock, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UserData = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

// ---------------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------------

function Avatar({
  src,
  name,
  size = 80,
}: {
  src: string | null;
  name: string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <span className="text-foreground text-xl font-semibold">{initials}</span>
  );
}

// ---------------------------------------------------------------------------
// Settings client
// ---------------------------------------------------------------------------

export function SettingsClient({ user }: { user: UserData }) {
  const t = useTranslations("dashboard.settings");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.image);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [name, setName] = useState(user.name);
  const [nameSaving, setNameSaving] = useState(false);

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const nameChanged = name.trim() !== user.name;

  // -------------------------------------------------------------------------
  // Avatar upload
  // -------------------------------------------------------------------------

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/user/avatar", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Upload failed");
      }

      const { url } = await res.json();
      setAvatarUrl(url);
      toast.success(t("toastPhotoUpdated"));
    } catch (err) {
      toast.error((err as Error).message ?? t("toastPhotoFailed"));
    } finally {
      setAvatarUploading(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // -------------------------------------------------------------------------
  // Name update
  // -------------------------------------------------------------------------

  async function handleSaveName() {
    if (!nameChanged) return;
    setNameSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success(t("toastNameUpdated"));
      router.refresh();
    } catch {
      toast.error(t("toastNameFailed"));
    } finally {
      setNameSaving(false);
    }
  }

  // -------------------------------------------------------------------------
  // Account deletion
  // -------------------------------------------------------------------------

  async function handleDeleteAccount() {
    if (deleteConfirm !== user.email) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/user", { method: "DELETE" });
      if (!res.ok) throw new Error("Deletion failed");
      toast.success(t("toastAccountDeleted"));
      router.push("/login");
    } catch {
      toast.error(t("toastDeleteFailed"));
      setDeleting(false);
    }
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-6 p-8 pt-6">
      {/* Page header */}
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </div>

      {/* Profile card */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profileSection")}</CardTitle>
          <CardDescription>{t("profileSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar uploader */}
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => !avatarUploading && fileInputRef.current?.click()}
              className="group bg-muted relative flex size-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border transition-opacity"
              disabled={avatarUploading}
            >
              <Avatar src={avatarUrl} name={name || user.email} />
              {avatarUploading && (
                <div className="bg-foreground/50 absolute inset-0 flex items-center justify-center">
                  <Loader2 className="text-background size-5 animate-spin" />
                </div>
              )}
              {!avatarUploading && (
                <div className="bg-foreground/50 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="text-background size-5" />
                </div>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{t("photoLabel")}</p>
              <p className="text-muted-foreground text-xs">{t("photoHint")}</p>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("displayNameLabel")}</Label>
            <div className="flex gap-2">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={32}
                placeholder={t("displayNamePlaceholder")}
                className="max-w-sm"
              />
              <Button onClick={handleSaveName} disabled={!nameChanged || nameSaving}>
                {nameSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
                {t("saveButton")}
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">{t("displayNameHint")}</p>
          </div>

          {/* Email — readonly */}
          <div className="space-y-2">
            <Label htmlFor="email">{t("emailLabel")}</Label>
            <div className="relative max-w-sm">
              <Input
                id="email"
                value={user.email}
                readOnly
                className="text-muted-foreground cursor-default pr-9 select-all"
              />
              <Lock className="text-muted-foreground absolute top-1/2 right-3 size-3.5 -translate-y-1/2" />
            </div>
            <p className="text-muted-foreground text-xs">{t("emailHint")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone card */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">{t("dangerZone")}</CardTitle>
          <CardDescription className="text-destructive/70">
            {t("dangerZoneSubtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">{t("deleteAccountTitle")}</p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {t("deleteAccountDescription")}
              </p>
            </div>
            <Button
              variant="destructive"
              className="shrink-0"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="mr-2 size-4" />
              {t("deleteAccountButton")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!deleting) {
            setDeleteOpen(open);
            if (!open) setDeleteConfirm("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              {t("deleteConfirmTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("deleteConfirmDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="delete-confirm">
                {t("deleteConfirmPrompt", { email: user.email })}
              </Label>
              <Input
                id="delete-confirm"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteOpen(false);
                  setDeleteConfirm("");
                }}
                disabled={deleting}
              >
                {tCommon("cancel")}
              </Button>
              <Button
                variant="destructive"
                disabled={deleteConfirm !== user.email || deleting}
                onClick={handleDeleteAccount}
              >
                {deleting && <Loader2 className="mr-2 size-4 animate-spin" />}
                {t("deleteConfirmButton")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
