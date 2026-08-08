import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminOrganizationDetails } from "@/actions/admin";
import { ArrowLeft, Building2, Globe, Users, Zap } from "lucide-react";

import { constructMetadata, formatCompactNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/header";
import { UserAvatar } from "@/components/shared/user-avatar";

export const metadata = constructMetadata({
  title: "Organization Details",
});

export default async function AdminOrganizationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let data;
  try {
    data = await getAdminOrganizationDetails(id);
  } catch (error) {
    return notFound();
  }

  if (!data.team) return notFound();

  const { team, members, usage } = data;
  const currentMonthUsage = usage[0]?.totalTokens || 0;

  return (
    <>
      <div className="mb-6">
        <Link
          href="/admin/organizations"
          className="text-muted-foreground hover:text-foreground flex items-center text-sm font-medium transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Organizations
        </Link>
      </div>

      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="flex items-center gap-4">
          <div className="bg-card flex h-16 w-16 items-center justify-center rounded-xl border shadow-sm">
            <Building2 className="text-primary h-8 w-8" />
          </div>
          <div>
            <h1 className="text-foreground text-2xl font-bold">{team.name}</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              /{team.slug}
              {team.planName && team.planName.toLowerCase() !== "free" ? (
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                  {team.planName} Plan
                </Badge>
              ) : (
                <Badge variant="secondary">Free Plan</Badge>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="animate-in fade-in grid grid-cols-1 gap-6 duration-500 md:grid-cols-3">
        {/* Left Column: Details & Usage */}
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="text-muted-foreground h-4 w-4" /> Business
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{team.email}</p>
              </div>
              {team.businessName && (
                <div>
                  <p className="text-muted-foreground">Legal Name</p>
                  <p className="font-medium">{team.businessName}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Country</p>
                <p className="font-medium">{team.country || "Not provided"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="text-muted-foreground h-4 w-4" /> Usage Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatCompactNumber(currentMonthUsage)}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Tokens used this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Members List */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="text-muted-foreground h-4 w-4" /> Team Members
                ({members.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-border divide-y">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        user={{
                          name: member.user.name,
                          image: member.user.image,
                        }}
                        className="h-8 w-8"
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {member.user.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
