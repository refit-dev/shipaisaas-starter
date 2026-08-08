import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

const MarkdownRenderer = ({
  content,
  renderImages = false,
}: {
  content: string;
  renderImages?: boolean;
}) => (
  <Markdown
    remarkPlugins={[remarkGfm]}
    components={{
      h1: ({ children }) => (
        <h1 className="mt-6 mb-3 text-2xl font-bold">{children}</h1>
      ),
      h2: ({ children }) => (
        <h2 className="mt-5 mb-2 text-xl font-semibold">{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 className="mt-4 mb-1 text-lg font-semibold">{children}</h3>
      ),
      p: ({ children }) => <p className="mb-3 leading-7">{children}</p>,
      ul: ({ children }) => (
        <ul className="mb-3 list-disc space-y-1 pl-6">{children}</ul>
      ),
      ol: ({ children }) => (
        <ol className="mb-3 list-decimal space-y-1 pl-6">{children}</ol>
      ),
      li: ({ children }) => <li className="leading-7">{children}</li>,
      blockquote: ({ children }) => (
        <blockquote className="my-3 border-l-4 border-gray-300 pl-4 text-gray-600 italic dark:border-gray-600 dark:text-gray-400">
          {children}
        </blockquote>
      ),
      //   code({ node, className, children, ...props }) {
      //     const match = /language-(\w+)/.exec(className || "");
      //     return (
      //       <SyntaxHighlighter
      //         style={oneDark}
      //         language={match[1]}
      //         PreTag="div"
      //         className="my-3 rounded-lg text-sm"
      //       >
      //         {String(children).replace(/\n$/, "")}
      //       </SyntaxHighlighter>
      //     )
      //   },
      table: ({ children }) => (
        <div className="my-4 overflow-x-auto">
          <table className="min-w-full rounded-lg border border-gray-200 text-sm dark:border-gray-700">
            {children}
          </table>
        </div>
      ),
      th: ({ children }) => (
        <th className="border-b bg-gray-100 px-4 py-2 text-left font-semibold dark:bg-gray-800">
          {children}
        </th>
      ),
      td: ({ children }) => (
        <td className="border-b border-gray-100 px-4 py-2 dark:border-gray-800">
          {children}
        </td>
      ),
      img: renderImages
        ? ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt ?? "Attached image"}
              className="mt-1 max-h-60 max-w-[280px] rounded-xl border object-cover"
            />
          )
        : () => null,
      a: ({ children, href }) => (
        <a
          href={href}
          className="text-blue-500 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      ),
      hr: () => <hr className="my-6 border-gray-200 dark:border-gray-700" />,
      strong: ({ children }) => (
        <strong className="font-semibold">{children}</strong>
      ),
    }}
  >
    {content}
  </Markdown>
);

export default MarkdownRenderer;
