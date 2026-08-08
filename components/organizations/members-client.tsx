"use client";

import { useState } from "react";
import {
  Building2,
  Loader2,
  Mail,
  MoreHorizontal,
  Plus,
  ShieldAlert,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/user-avatar";

export function MembersClient() {
  // Better Auth hooks for organization data
  const { data: activeOrg, isPending } = authClient.useActiveOrganization();
  const { data: activeMember, isPending: isMemberPending } =
    authClient.useActiveMemberRole();

  const [activeTab, setActiveTab] = useState<"members" | "invitations">(
    "members",
  );

  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [isInviting, setIsInviting] = useState(false);
  // Remove Modal State
  const [memberToRemove, setMemberToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  if (isPending) {
    return (
      <div className="border-border bg-card flex h-64 items-center justify-center rounded-xl border">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!activeOrg) {
    return (
      <div className="border-border bg-card text-muted-foreground flex h-64 flex-col items-center justify-center gap-2 rounded-xl border">
        <Building2 className="h-8 w-8" />
        <p>No active workspace found.</p>
      </div>
    );
  }

  // Role-based access control
  const isOwner = activeMember?.role === "owner";
  const isAdmin = isOwner || activeMember?.role === "admin";

  const pendingInvites = (activeOrg?.invitations || []).filter(
    (invite: any) => invite.status === "pending",
  );

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      const { error } = await authClient.organization.inviteMember({
        email: inviteEmail,
        role: inviteRole as "admin" | "member",
      });

      if (error) {
        toast.error(error.message || "Failed to send invitation.");
      } else {
        toast.success(`Invitation sent to ${inviteEmail}`);
        setShowInviteModal(false);
        setInviteEmail("");
        setInviteRole("member");
        // Optionally trigger a refresh of the invitations list here
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsInviting(false);
    }
  };

  // Just opens the modal and sets the target
  const initiateRemoveMember = (memberId: string, name: string) => {
    setMemberToRemove({ id: memberId, name });
  };

  // Executes the actual API call when they click confirm in the modal
  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;

    setIsRemoving(true);

    try {
      const { error } = await authClient.organization.removeMember({
        memberIdOrEmail: memberToRemove.id,
      });

      if (error) {
        throw error;
      }

      toast.success("Member removed successfully.");
      setMemberToRemove(null); // Close the modal
    } catch (err: any) {
      toast.error(err.message || "Failed to remove member.");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleUpdateRole = async (
    memberId: string,
    newRole: "admin" | "member",
  ) => {
    try {
      const { error } = await authClient.organization.updateMemberRole({
        memberId,
        role: newRole,
      });
      if (error) throw error;
      toast.success("Member role updated.");
    } catch (err: any) {
      toast.error(err.message || "Failed to update role.");
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await authClient.organization.cancelInvitation({
        invitationId,
      });
      if (error) throw error;
      toast.success("Invitation cancelled.");
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel invitation.");
    }
  };

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="border-border bg-card flex items-center gap-2 rounded-lg border p-1 shadow-sm">
          <button
            onClick={() => setActiveTab("members")}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "members"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Active Members
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab("invitations")}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTab === "invitations"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pending Invites
            </button>
          )}
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <Plus className="mr-2 h-4 w-4" />
            Invite Member
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="border-border bg-card rounded-xl border shadow-sm">
        {/* MEMBERS TAB */}
        {activeTab === "members" && (
          <div className="flex flex-col">
            {/* Better Auth usually includes members in the activeOrg payload, or requires a separate fetch depending on your exact configuration. Assuming they are populated here: */}
            {(activeOrg as any).members?.length > 0 ? (
              <div className="divide-border divide-y">
                {(activeOrg as any).members.map((member: any) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 sm:p-6"
                  >
                    <div className="flex items-center gap-4">
                      <UserAvatar
                        user={{
                          name: member.user.name,
                          image: member.user.image,
                        }}
                        className="border-border h-10 w-10 border"
                      />
                      <div>
                        <p className="text-foreground mb-1 text-sm leading-none font-medium">
                          {member.user.name || "Unknown User"}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {member.user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-xs capitalize">
                        {member.role}
                      </Badge>

                      {/* Action Menu - Only show if current user is admin/owner AND the target isn't the owner */}
                      {isAdmin && member.role !== "owner" && (
                        <div className="group relative">
                          <button className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-8 w-8 items-center justify-center rounded-md transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                          {/* Simple CSS Dropdown for Actions */}
                          <div className="border-border bg-popover text-popover-foreground absolute top-full right-0 z-50 mt-1 hidden w-40 flex-col overflow-hidden rounded-md border shadow-md group-focus-within:flex group-hover:flex">
                            {member.role === "member" ? (
                              <button
                                onClick={() =>
                                  handleUpdateRole(member.id, "admin")
                                }
                                className="hover:bg-muted flex w-full items-center px-3 py-2 text-sm"
                              >
                                <ShieldAlert className="mr-2 h-4 w-4" /> Make
                                Admin
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleUpdateRole(member.id, "member")
                                }
                                className="hover:bg-muted flex w-full items-center px-3 py-2 text-sm"
                              >
                                <UserMinus className="mr-2 h-4 w-4" /> Revoke
                                Admin
                              </button>
                            )}
                            <button
                              onClick={() =>
                                initiateRemoveMember(
                                  member.id,
                                  member.user.name,
                                )
                              }
                              className="text-destructive hover:bg-destructive/10 flex w-full items-center px-3 py-2 text-sm"
                            >
                              <UserMinus className="mr-2 h-4 w-4" /> Remove User
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <p className="text-muted-foreground text-sm">
                  No members found.
                </p>
              </div>
            )}
          </div>
        )}

        {/* INVITATIONS TAB */}
        {activeTab === "invitations" && isAdmin && (
          <div className="flex flex-col">
            {pendingInvites?.length > 0 ? (
              <div className="divide-border divide-y">
                {pendingInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-4 sm:p-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-muted text-muted-foreground border-border flex h-10 w-10 items-center justify-center rounded-full border">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-foreground mb-1 text-sm leading-none font-medium">
                          {invite.email}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Invited as{" "}
                          <span className="font-medium capitalize">
                            {invite.role}
                          </span>
                        </p>
                      </div>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => handleCancelInvitation(invite.id)}
                        className="text-destructive text-xs font-medium hover:underline"
                      >
                        Cancel Invite
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <Mail className="text-muted-foreground/50 mb-4 h-8 w-8" />
                <h3 className="text-foreground text-lg font-medium">
                  No pending invitations
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  When you invite someone to your workspace, their pending
                  status will appear here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invite Modal Overlay */}
      {showInviteModal && isAdmin && (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="border-border bg-card animate-in zoom-in-95 w-full max-w-md rounded-xl border p-6 shadow-lg duration-200">
            <div className="mb-6">
              <h2 className="text-foreground text-lg font-bold">
                Invite to Workspace
              </h2>
              <p className="text-muted-foreground text-sm">
                They will receive an email with a link to join {activeOrg.name}.
              </p>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-foreground text-sm font-medium"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoFocus
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="role"
                  className="text-foreground text-sm font-medium"
                >
                  Workspace Role
                </label>
                <select
                  id="role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                >
                  <option value="member">
                    Member (Can view and edit data)
                  </option>
                  <option value="admin">
                    Admin (Can manage settings and billing)
                  </option>
                </select>
              </div>

              <div className="border-border mt-6 flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  disabled={isInviting}
                  className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md border border-transparent bg-transparent px-4 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting || !inviteEmail.trim()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
                >
                  {isInviting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Send Invite
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      {memberToRemove && (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="border-border bg-card animate-in zoom-in-95 w-full max-w-md rounded-xl border p-6 shadow-lg duration-200">
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-3">
                <div className="bg-destructive/10 text-destructive flex h-10 w-10 items-center justify-center rounded-full">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <h2 className="text-foreground text-lg font-bold">
                  Remove Member
                </h2>
              </div>
              <p className="text-muted-foreground mt-2 text-sm">
                Are you sure you want to remove{" "}
                <span className="text-foreground font-semibold">
                  {memberToRemove.name}
                </span>{" "}
                from your workspace? They will immediately lose access to all
                data and settings.
              </p>
            </div>

            <div className="border-border mt-6 flex justify-end gap-3 border-t pt-4">
              <button
                type="button"
                onClick={() => setMemberToRemove(null)}
                disabled={isRemoving}
                className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md border border-transparent bg-transparent px-4 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveMember}
                disabled={isRemoving}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
              >
                {isRemoving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  "Remove Member"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
