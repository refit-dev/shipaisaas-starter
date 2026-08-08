"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// You will likely want to duplicate/rename your onboarding action for settings
import { updateOrganizationSettings } from "@/actions/organizations";
import { Building2, Globe, Loader2, MapPin, Save } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Team } from "@/lib/db/schema/account";

interface SettingsClientProps {
  initialData: Team | null;
}

export function OrganizationSettingsClient({
  initialData,
}: SettingsClientProps) {
  const router = useRouter();
  const { data: org, isPending: orgLoading } =
    authClient.useActiveOrganization();
  const { data: activeMember } = authClient.useActiveMemberRole();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    email: initialData?.email || "",
    businessName: initialData?.businessName || "",
    businessType: initialData?.businessType || "",
    businessDescription: initialData?.businessDescription || "",
    website: initialData?.website || "",
    country: initialData?.country || "",
    city: initialData?.city || "",
    address: initialData?.address || "",
    phone: initialData?.phone || "",
    currency: initialData?.currency || "USD",
  });

  // Sync the form data when the org object loads
  useEffect(() => {
    if (org && !orgLoading) {
      setFormData((prev) => ({
        ...prev,
        name: org.name || prev.name,
        slug: org.slug || prev.slug,
        email: (org as any).email || prev.email,
        businessName: (org as any).businessName || prev.businessName,
        businessType: (org as any).businessType || prev.businessType,
        businessDescription:
          (org as any).businessDescription || prev.businessDescription,
        website: (org as any).website || prev.website,
        country: (org as any).country || prev.country,
        city: (org as any).city || prev.city,
        address: (org as any).address || prev.address,
        phone: (org as any).phone || prev.phone,
        currency: (org as any).currency || prev.currency,
      }));
    }
  }, [org, orgLoading]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (orgLoading || !org || !org.id) {
      toast.error("We couldn't locate your workspace. Please refresh.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateOrganizationSettings({
        ...formData,
        teamId: org.id,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Workspace settings updated successfully!");
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orgLoading) {
    return (
      <div className="border-border bg-card flex h-64 items-center justify-center rounded-xl border">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Prevent standard members from modifying workspace settings
  const canEdit =
    activeMember?.role === "admin" || activeMember?.role === "owner";

  return (
    <div className="animate-in fade-in mx-auto w-full max-w-3xl duration-500">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: Workspace Basics */}
        <div className="border-border bg-card rounded-xl border p-6 shadow-sm sm:p-8">
          <div className="border-border mb-6 flex items-center gap-3 border-b pb-4">
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-foreground text-xl font-bold">
                Workspace Settings
              </h2>
              <p className="text-muted-foreground text-sm">
                Manage your team's basic information.
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="grid gap-2">
              <label
                htmlFor="name"
                className="text-foreground text-sm leading-none font-medium"
              >
                Workspace Name *
              </label>
              <input
                id="name"
                name="name"
                required
                disabled={!canEdit}
                value={formData.name}
                onChange={handleChange}
                placeholder="Acme Corp"
                className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="grid gap-2">
              <label
                htmlFor="slug"
                className="text-foreground text-sm leading-none font-medium"
              >
                Workspace URL *
              </label>
              <div className="flex items-center">
                <span className="border-input bg-muted text-muted-foreground flex h-10 items-center rounded-l-md border border-r-0 px-3 text-sm">
                  /
                </span>
                <input
                  id="slug"
                  name="slug"
                  required
                  disabled={!canEdit}
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="acme"
                  className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-r-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <label
                htmlFor="email"
                className="text-foreground text-sm leading-none font-medium"
              >
                Billing/Contact Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={!canEdit}
                value={formData.email}
                onChange={handleChange}
                placeholder="billing@acmecorp.com"
                className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Business Profile */}
        <div className="border-border bg-card rounded-xl border p-6 shadow-sm sm:p-8">
          <div className="border-border mb-6 flex items-center gap-3 border-b pb-4">
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-foreground text-xl font-bold">
                Business Profile
              </h2>
              <p className="text-muted-foreground text-sm">
                Legal and descriptive details for billing.
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="grid gap-2">
              <label
                htmlFor="businessName"
                className="text-foreground text-sm leading-none font-medium"
              >
                Legal Business Name
              </label>
              <input
                id="businessName"
                name="businessName"
                disabled={!canEdit}
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Acme Corporation LLC"
                className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="grid gap-2">
              <label
                htmlFor="businessType"
                className="text-foreground text-sm leading-none font-medium"
              >
                Business Type
              </label>
              <select
                id="businessType"
                name="businessType"
                disabled={!canEdit}
                value={formData.businessType}
                onChange={handleChange}
                className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a type...</option>
                <option value="LLC">LLC</option>
                <option value="Corporation">Corporation</option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
                <option value="Non-Profit">Non-Profit</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label
                htmlFor="website"
                className="text-foreground text-sm leading-none font-medium"
              >
                Website URL
              </label>
              <input
                id="website"
                name="website"
                type="url"
                disabled={!canEdit}
                value={formData.website}
                onChange={handleChange}
                placeholder="https://acmecorp.com"
                className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="grid gap-2">
              <label
                htmlFor="businessDescription"
                className="text-foreground text-sm leading-none font-medium"
              >
                Short Description
              </label>
              <textarea
                id="businessDescription"
                name="businessDescription"
                disabled={!canEdit}
                value={formData.businessDescription}
                onChange={handleChange}
                placeholder="What does your team do?"
                className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Location & Settings */}
        <div className="border-border bg-card rounded-xl border p-6 shadow-sm sm:p-8">
          <div className="border-border mb-6 flex items-center gap-3 border-b pb-4">
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-foreground text-xl font-bold">
                Location & Settings
              </h2>
              <p className="text-muted-foreground text-sm">
                Currency and regional preferences.
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="grid gap-2">
                <label
                  htmlFor="country"
                  className="text-foreground text-sm leading-none font-medium"
                >
                  Country
                </label>
                <input
                  id="country"
                  name="country"
                  disabled={!canEdit}
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="United States"
                  className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="grid gap-2">
                <label
                  htmlFor="city"
                  className="text-foreground text-sm leading-none font-medium"
                >
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  disabled={!canEdit}
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="San Francisco"
                  className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <label
                htmlFor="address"
                className="text-foreground text-sm leading-none font-medium"
              >
                Address
              </label>
              <input
                id="address"
                name="address"
                disabled={!canEdit}
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Startup Blvd"
                className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="grid gap-2">
                <label
                  htmlFor="phone"
                  className="text-foreground text-sm leading-none font-medium"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  disabled={!canEdit}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="grid gap-2">
                <label
                  htmlFor="currency"
                  className="text-foreground text-sm leading-none font-medium"
                >
                  Default Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  disabled={!canEdit}
                  value={formData.currency}
                  onChange={handleChange}
                  className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="TRY">TRY (₺)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        {canEdit ? (
          <div className="flex items-center justify-end pt-2 pb-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-md px-8 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-muted text-muted-foreground rounded-md p-4 text-center text-sm">
            You do not have permission to modify workspace settings. Contact
            your administrator.
          </div>
        )}
      </form>
    </div>
  );
}
