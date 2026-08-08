"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "@/actions/onboarding";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Globe,
  Loader2,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

const STEPS = [
  { id: 1, name: "Workspace", icon: Building2 },
  { id: 2, name: "Business Profile", icon: Globe },
  { id: 3, name: "Location", icon: MapPin },
];

export function OnboardingClient() {
  const router = useRouter();
  // Fetch the organizations this user belongs to
  const { data: org, isPending: orgLoading } =
    authClient.useActiveOrganization();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1
    name: "",
    slug: "",
    email: "",
    // Step 2
    businessName: "",
    businessType: "",
    businessDescription: "",
    website: "",
    // Step 3
    country: "",
    city: "",
    address: "",
    phone: "",
    currency: "USD",
  });

  // Update form data when the org object finally loads
  useEffect(() => {
    if (org && !orgLoading) {
      setFormData((prev) => ({
        ...prev,
        name: org.name || prev.name,
        slug: org.slug || prev.slug,
        email: (org as any).email || prev.email,
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

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== STEPS.length) return nextStep();

    // Prevent submission if Better Auth hasn't loaded their teams yet
    if (orgLoading || !org || !org.id) {
      toast.error(
        "We couldn't locate your default workspace. Please refresh the page.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Pass it securely to the server action
      const result = await completeOnboarding({
        ...formData,
        teamId: org.id,
      });

      if (result.error) {
        toast.error(result.error);
        setIsSubmitting(false);
      } else {
        toast.success("Onboarding completed successfully!");
        router.push("/dashboard");
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error(error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Progress Indicator */}
      <div className="relative mb-8">
        <div className="bg-muted absolute top-1/2 left-0 h-1 w-full -translate-y-1/2 rounded-full">
          <div
            className="bg-primary h-full rounded-full transition-all duration-300"
            style={{
              width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
            }}
          />
        </div>
        <div className="relative flex justify-between">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep >= step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div
                key={step.id}
                className="bg-background flex flex-col items-center gap-2 px-2"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-card text-card-foreground border-border rounded-xl border p-6 shadow-sm sm:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* STEP 1: Workspace Basics */}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 space-y-4 duration-300">
              <div>
                <h2 className="text-foreground text-xl font-bold">
                  Set up your workspace
                </h2>
                <p className="text-muted-foreground text-sm">
                  Let&apos;s start with the basics of your team.
                </p>
              </div>
              <div className="grid gap-4">
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
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Acme Corp"
                    className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:border-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
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
                      value={formData.slug}
                      onChange={handleChange}
                      placeholder="acme"
                      className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:border-ring flex h-10 w-full rounded-r-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
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
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="billing@acmecorp.com"
                    className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Business Profile */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 space-y-4 duration-300">
              <div>
                <h2 className="text-foreground text-xl font-bold">
                  Business Details
                </h2>
                <p className="text-muted-foreground text-sm">
                  Tell us a bit about what your company does.
                </p>
              </div>
              <div className="grid gap-4">
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
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="Acme Corporation LLC"
                    className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
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
                    value={formData.businessType}
                    onChange={handleChange}
                    className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <option value="">Select a type...</option>
                    <option value="LLC">LLC</option>
                    <option value="Corporation">Corporation</option>
                    <option value="Sole Proprietorship">
                      Sole Proprietorship
                    </option>
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
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://acmecorp.com"
                    className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
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
                    value={formData.businessDescription}
                    onChange={handleChange}
                    placeholder="What does your team do?"
                    className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Location & Contact */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 space-y-4 duration-300">
              <div>
                <h2 className="text-foreground text-xl font-bold">
                  Location & Settings
                </h2>
                <p className="text-muted-foreground text-sm">
                  Final step to customize your workspace.
                </p>
              </div>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
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
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="United States"
                      className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
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
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="San Francisco"
                      className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
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
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Startup Blvd"
                    className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
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
                      value={formData.currency}
                      onChange={handleChange}
                      className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
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
          )}

          {/* Navigation Buttons */}
          <div className="border-border mt-4 flex items-center justify-between border-t pt-4">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1 || isSubmitting}
              className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-md px-6 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : currentStep === STEPS.length ? (
                <>
                  Complete Setup
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
