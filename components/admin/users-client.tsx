"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MoreHorizontal,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCog,
} from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// Modal Imports
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserAvatar } from "@/components/shared/user-avatar";

interface UsersClientProps {
  currentUserId?: string;
  currentUserRole?: string | null | undefined;
}

export function UsersClient({
  currentUserId,
  currentUserRole,
}: UsersClientProps) {
  // Data State
  const [users, setUsers] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isFetching, setIsFetching] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal State
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [userToBan, setUserToBan] = useState<{ id: string } | null>(null);
  const [banReason, setBanReason] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchField, setSearchField] = useState<"name" | "email">("email");

  // 1. Debounce the search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // 2. Fetch Users Function
  const fetchUsers = useCallback(async () => {
    setIsFetching(true);
    try {
      const queryParams: any = {
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
        sortBy: "createdAt",
        sortDirection: "desc",
      };

      if (debouncedSearch.trim()) {
        queryParams.searchValue = debouncedSearch;
        queryParams.searchField = searchField;
        queryParams.searchOperator = "contains";
      }

      const { data, error } = await authClient.admin.listUsers({
        query: queryParams,
      });

      if (error) throw error;

      if (data) {
        setUsers(data.users || []);
        setTotalUsers(data.total || 0);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load users.");
    } finally {
      setIsFetching(false);
    }
  }, [currentPage, debouncedSearch, searchField]);

  // 3. Trigger fetch on dependencies change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // --- Better Auth Admin Actions ---

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    setActionLoading(userId);
    try {
      const { error } = await authClient.admin.setRole({
        userId,
        role: newRole,
      });
      if (error) throw error;
      toast.success(`Role updated to ${newRole}.`);
      await fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update role.");
    } finally {
      setActionLoading(null);
    }
  };

  // Triggers the Ban Modal or directly unbans
  const triggerBanAction = async (
    userId: string,
    isCurrentlyBanned: boolean,
  ) => {
    if (isCurrentlyBanned) {
      setActionLoading(userId);
      try {
        const { error } = await authClient.admin.unbanUser({ userId });
        if (error) throw error;
        toast.success("User has been unbanned.");
        await fetchUsers();
      } catch (err: any) {
        toast.error(err.message || "Failed to unban user.");
      } finally {
        setActionLoading(null);
      }
    } else {
      setUserToBan({ id: userId });
      setBanReason("");
    }
  };

  // Executes the actual ban after modal confirmation
  const executeBan = async () => {
    if (!userToBan) return;
    setActionLoading(userToBan.id);
    try {
      const { error } = await authClient.admin.banUser({
        userId: userToBan.id,
        banReason: banReason.trim() || "Violation of terms",
      });
      if (error) throw error;
      toast.success("User has been banned.");
      await fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to ban user.");
    } finally {
      setActionLoading(null);
      setUserToBan(null);
    }
  };

  // Executes the actual delete after alert dialog confirmation
  const executeDelete = async () => {
    if (!userToDelete) return;
    setActionLoading(userToDelete.id);
    try {
      const { error } = await authClient.admin.removeUser({
        userId: userToDelete.id,
      });
      if (error) throw error;
      toast.success("User deleted successfully.");

      if (users.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user.");
    } finally {
      setActionLoading(null);
      setUserToDelete(null);
    }
  };

  return (
    <div className="animate-in fade-in w-full space-y-4 duration-500">
      {/* Toolbar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-row">
          <div className="relative w-full">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              placeholder={`Search by ${searchField}...`}
              className="bg-card w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value as "name" | "email")}
            className="border-input bg-card focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none sm:w-32"
          >
            <option value="name">Name</option>
            <option value="email">Email</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="border-border bg-card w-full overflow-x-auto rounded-md border shadow-sm">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <Loader2 className="text-primary mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground h-48 text-center"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const isSelf = user.id === currentUserId;
                const isLoading = actionLoading === user.id;

                return (
                  <TableRow
                    key={user.id}
                    className={
                      isLoading ? "pointer-events-none opacity-50" : ""
                    }
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          user={{ name: user.name, image: user.image }}
                          className="h-9 w-9 border"
                        />
                        <div className="flex min-w-0 flex-col">
                          <span className="flex items-center gap-2 truncate font-medium">
                            {user.name || "Unnamed User"}
                            {isSelf && (
                              <Badge
                                variant="outline"
                                className="h-4 shrink-0 px-1.5 text-[10px]"
                              >
                                You
                              </Badge>
                            )}
                          </span>
                          <span className="text-muted-foreground truncate text-xs">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      {user.banned ? (
                        <Badge
                          variant="destructive"
                          className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20"
                        >
                          Banned
                        </Badge>
                      ) : user.emailVerified ? (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                          <ShieldCheck className="h-4 w-4" /> Active
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                          <ShieldAlert className="h-4 w-4" /> Unverified
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {user.role}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {formatDistanceToNow(new Date(user.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>

                    <TableCell className="text-right">
                      {user.role !== "superadmin" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              disabled={isSelf || isLoading}
                            >
                              <span className="sr-only">Open menu</span>
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() =>
                                handleRoleChange(user.id, user.role)
                              }
                            >
                              <UserCog className="mr-2 h-4 w-4" />
                              {user.role === "admin"
                                ? "Demote to User"
                                : "Promote to Admin"}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() =>
                                triggerBanAction(user.id, user.banned)
                              }
                              className={
                                user.banned
                                  ? "text-green-600 focus:text-green-600"
                                  : "text-amber-600 focus:text-amber-600"
                              }
                            >
                              {user.banned ? (
                                <>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />{" "}
                                  Unban User
                                </>
                              ) : (
                                <>
                                  <Ban className="mr-2 h-4 w-4" /> Ban User
                                </>
                              )}
                            </DropdownMenuItem>

                            {currentUserRole === "superadmin" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    setUserToDelete({
                                      id: user.id,
                                      name: user.name,
                                    })
                                  }
                                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Account
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {!isFetching && totalUsers > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 pt-2 sm:flex-row">
          <div className="text-muted-foreground text-center text-sm sm:text-left">
            Showing{" "}
            <span className="text-foreground font-medium">
              {(currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="text-foreground font-medium">
              {Math.min(currentPage * pageSize, totalUsers)}
            </span>{" "}
            of <span className="text-foreground font-medium">{totalUsers}</span>{" "}
            users
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isFetching}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || isFetching}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <Dialog
        open={!!userToBan}
        onOpenChange={(open) => !open && setUserToBan(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Please provide a reason for banning this user. This action will
              immediately revoke their access to the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="E.g., Violation of terms, Spamming..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUserToBan(null)}
              disabled={actionLoading === userToBan?.id}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={executeBan}
              disabled={actionLoading === userToBan?.id}
            >
              Confirm Ban
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <strong className="text-foreground">{userToDelete?.name}</strong>
              's account and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setUserToDelete(null)}
              disabled={actionLoading === userToDelete?.id}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={actionLoading === userToDelete?.id}
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
