import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-muted-foreground mb-4 text-sm font-semibold tracking-widest uppercase">
        404 — Page not found
      </p>
      <h1 className="text-foreground mb-4 text-5xl font-bold tracking-tight sm:text-6xl">
        Nothing to see here.
      </h1>
      <p className="text-muted-foreground mb-8 max-w-md text-lg leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
      >
        Back to homepage
      </Link>
    </div>
  );
}
