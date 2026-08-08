import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, ShieldAlert, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { AdminDashboardData } from "./admin-dashboard-client";

interface RecentSignupsProps {
  signups: AdminDashboardData["recentSignups"];
}

export function RecentSignups({ signups }: RecentSignupsProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Recent Signups</CardTitle>
          <CardDescription className="text-balance">
            The latest users to join the platform.
          </CardDescription>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="ml-auto shrink-0 gap-1 px-4"
        >
          <Link href="/admin/users" className="flex items-center gap-2">
            <span>View All</span>
            <ArrowUpRight className="hidden size-4 sm:block" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {signups.length === 0 ? (
          <div className="text-muted-foreground flex justify-center py-6 text-sm">
            No recent signups found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="hidden sm:table-cell">Role</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {signups.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.name || "Unnamed"}</div>
                    <div className="text-muted-foreground text-sm">
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.emailVerified ? (
                      <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                        <ShieldCheck className="h-3.5 w-3.5" /> Verified
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                        <ShieldAlert className="h-3.5 w-3.5" /> Unverified
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm whitespace-nowrap">
                    {formatDistanceToNow(new Date(user.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
