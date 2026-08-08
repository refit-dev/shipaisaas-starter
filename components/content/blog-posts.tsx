import { Post } from "@/.contentlayer/generated";

import { BlogCard } from "./blog-card";

export function BlogPosts({
  posts,
}: {
  posts: (Post & {
    blurDataURL: string;
  })[];
}) {
  const [featured, ...rest] = posts;

  return (
    <main className="space-y-6">
      {/* Featured — horizontal card */}
      {featured && <BlogCard data={featured} horizontale priority />}

      {/* Grid — individual separated cards */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post, idx) => (
            <BlogCard
              key={post._id}
              data={post}
              priority={idx <= 2}
            />
          ))}
        </div>
      )}
    </main>
  );
}
