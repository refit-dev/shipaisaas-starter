export const BLOG_CATEGORIES: {
  title: string;
  slug: "news" | "education";
  description: string;
}[] = [
  {
    title: "News",
    slug: "news",
    description: "Product updates and announcements from the Ship AI SaaS team.",
  },
  {
    title: "Education",
    slug: "education",
    description: "Deep dives, guides, and best practices for building with AI agents.",
  },
];

export const BLOG_AUTHORS = {
  james_okafor: {
    name: "James Okafor",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    twitter: "jamesokafor",
  },
  sara_chen: {
    name: "Sara Chen",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    twitter: "sarachen",
  },
  priya_nair: {
    name: "Priya Nair",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    twitter: "priyanair",
  },
};
