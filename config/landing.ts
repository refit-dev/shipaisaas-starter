import { FeatureLdg, InfoLdg, TestimonialType } from "types";

export const infos: InfoLdg[] = [
  {
    title: "Empower your projects",
    description:
      "Unlock the full potential of your projects with our open-source SaaS platform. Collaborate seamlessly, innovate effortlessly, and scale limitlessly.",
    image: "/_static/illustrations/work-from-home.jpg",
    list: [
      {
        title: "Collaborative",
        description: "Work together with your team members in real-time.",
        icon: "laptop",
      },
      {
        title: "Innovative",
        description: "Stay ahead of the curve with access constant updates.",
        icon: "settings",
      },
      {
        title: "Scalable",
        description:
          "Our platform offers the scalability needed to adapt to your needs.",
        icon: "search",
      },
    ],
  },
  {
    title: "Seamless Integration",
    description:
      "Integrate our open-source SaaS seamlessly into your existing workflows. Effortlessly connect with your favorite tools and services for a streamlined experience.",
    image: "/_static/illustrations/work-from-home.jpg",
    list: [
      {
        title: "Flexible",
        description:
          "Customize your integrations to fit your unique requirements.",
        icon: "laptop",
      },
      {
        title: "Efficient",
        description: "Streamline your processes and reducing manual effort.",
        icon: "search",
      },
      {
        title: "Reliable",
        description:
          "Rely on our robust infrastructure and comprehensive documentation.",
        icon: "settings",
      },
    ],
  },
];

export const features: FeatureLdg[] = [
  {
    title: "Feature 1",
    description:
      "Amet praesentium deserunt ex commodi tempore fuga voluptatem. Sit, sapiente.",
    link: "/",
    icon: "nextjs",
  },
  {
    title: "Feature 2",
    description:
      "Amet praesentium deserunt ex commodi tempore fuga voluptatem. Sit, sapiente.",
    link: "/",
    icon: "google",
  },
  {
    title: "Feature 3",
    description:
      "Amet praesentium deserunt ex commodi tempore fuga voluptatem. Sit, sapiente.",
    link: "/",
    icon: "gitHub",
  },
  {
    title: "Feature 4",
    description:
      "Amet praesentium deserunt ex commodi tempore fuga voluptatem. Sit, sapiente.",
    link: "/",
    icon: "laptop",
  },
  {
    title: "Feature 5",
    description:
      "Amet praesentium deserunt ex commodi tempore fuga voluptatem. Sit, sapiente.",
    link: "/",
    icon: "user",
  },
  {
    title: "Feature 6",
    description:
      "Amet praesentium deserunt ex commodi tempore fuga voluptatem. Sit, sapiente.",
    link: "/",
    icon: "copy",
  },
];

export const testimonials: TestimonialType[] = [
  {
    name: "John Doe",
    job: "Full Stack Developer",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
    twitter: "https://twitter.com/johndoe",
    review:
      "The Ship AI SaaS boilerplate has truly revolutionized my workflow. The decoupled orchestrator and built-in QStash background queues saved me months of architecture design. I shipped my vertical AI product in a single weekend.",
  },
  {
    name: "Alice Smith",
    job: "SaaS Founder",
    image: "https://randomuser.me/api/portraits/women/2.jpg",
    review:
      "I wanted to build an AI tool for legal tech but dreaded the Stripe and Auth setup. This starter kit gave me the plumbing and the LLM routing out of the box. I just focused on my custom agent prompts and hit deploy.",
  },
  {
    name: "David Johnson",
    job: "DevOps Engineer",
    image: "https://randomuser.me/api/portraits/men/3.jpg",
    twitter: "https://twitter.com/davidjohnson",
    review:
      "Handling long-running agent tasks without Vercel timeouts was a nightmare until I used this boilerplate. The serverless-proof queueing is brilliantly implemented.",
  },
  {
    name: "Michael Wilson",
    job: "Product Manager",
    image: "https://randomuser.me/api/portraits/men/5.jpg",
    review:
      "The 'Human-in-the-Loop' guardrails are exactly what our enterprise clients demand. Being able to pause an agent, review its work, and approve it directly in the chat UI is an absolute game-changer for safety.",
  },
  {
    name: "Sophia Garcia",
    job: "AI Engineer",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    twitter: "https://twitter.com/sophiagarcia",
    review:
      "I love how easy it is to add a new tool to the registry. The UI and LLM routers instantly pick it up. Plus, the Zod-enforced schemas make it mathematically impossible for the LLM to hallucinate function arguments.",
  },
  {
    name: "Emily Brown",
    job: "Indie Hacker",
    image: "https://randomuser.me/api/portraits/women/4.jpg",
    review:
      "I skipped all the boring stuff. Auth, the Stripe customer portal, and the dashboard were ready on day one. I was able to start charging customers immediately while I perfected my multi-agent workflows.",
  },
  {
    name: "Jason Stan",
    job: "Software Architect",
    image: "https://randomuser.me/api/portraits/men/9.jpg",
    twitter: "https://twitter.com/jasonstan",
    review:
      "The Chat-as-State UI is a masterpiece. Users can actually watch the agents 'think' and execute step-by-step in the background ledger. It builds so much trust with the end user compared to a loading spinner.",
  },
];
