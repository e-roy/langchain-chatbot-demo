// components/MarkdownDisplay.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

interface IMarkDownDisplayProps {
  content: string;
}

export const MarkDownDisplay = React.memo(function MarkDownDisplay({
  content,
}: IMarkDownDisplayProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      linkTarget="_blank"
      components={{
        pre: ({ node, ...props }) => (
          <pre
            className="markdown-pre"
            style={{
              borderRadius: "0.3rem",
            }}
            {...props}
          />
        ),
        a: ({ node, ...props }) => <a className="markdown-a" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
});
