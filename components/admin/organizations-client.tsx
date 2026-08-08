"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getAdminOrganizations } from "@/actions/admin";
import { formatDistanceToNow } from "date-fns";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function OrganizationsClient() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isFetching, setIsFetching] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchOrganizations = useCallback(async () => {
    setIsFetching(true);
    try {
      const data = await getAdminOrganizations(
        currentPage,
        pageSize,
        debouncedSearch,
      );
      setOrganizations(data.organizations);
      setTotalItems(data.total);
    } catch (err: any) {
      toast.error("Failed to load organizations.");
    } finally {
      setIsFetching(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  return (
    <div className="animate-in fade-in w-full min-w-0 space-y-4 overflow-hidden duration-500">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Search workspaces or URLs..."
            className="bg-card w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border-border bg-card w-full overflow-x-auto rounded-md border shadow-sm">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Workspace</TableHead>
              <TableHead>URL Slug</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Created</TableHead>
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
            ) : organizations.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground h-48 text-center"
                >
                  No organizations found.
                </TableCell>
              </TableRow>
            ) : (
              organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-md border">
                        <Building2 className="text-muted-foreground h-4 w-4" />
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate font-medium">{org.name}</span>
                        <span className="text-muted-foreground truncate text-xs">
                          {org.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    /{org.slug}
                  </TableCell>
                  <TableCell>
                    {org.planName && org.planName.toLowerCase() !== "free" ? (
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                        {org.planName}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Free</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                    {formatDistanceToNow(new Date(org.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Link
                        href={`/admin/organizations/${org.id}`}
                        className="flex items-center justify-between"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isFetching && totalItems > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 pt-2 sm:flex-row">
          <div className="text-muted-foreground text-sm">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
