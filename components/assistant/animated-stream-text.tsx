"use client";

import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

import MarkdownRenderer from "./markdown-renderer";

interface AnimatedStreamTextProps {
  text: string;
  isStreaming: boolean;
  renderImages?: boolean;
  className?: string;
}

export function AnimatedStreamText({
  text,
  isStreaming,
  renderImages = false,
  className,
}: AnimatedStreamTextProps) {
  const [displayedText, setDisplayedText] = useState("");

  // 1. Keep a live reference to the network text so the interval can read it without re-rendering
  const fullTextRef = useRef(text);

  // 2. Remember if this component MOUNTED while streaming.
  // This ensures old chat history loads instantly, but new messages animate.
  const startedStreaming = useRef(isStreaming);

  // Update the ref whenever the network gives us new chunks
  useEffect(() => {
    fullTextRef.current = text;
  }, [text]);

  useEffect(() => {
    // If this is an old message loaded from history, snap instantly and do nothing.
    if (!startedStreaming.current) {
      setDisplayedText(fullTextRef.current);
      return;
    }

    // The independent visual smoothing engine
    const animationInterval = setInterval(() => {
      setDisplayedText((prev) => {
        const targetText = fullTextRef.current;

        // If the visual text has caught up to the network text, do nothing.
        if (prev.length >= targetText.length) return prev;

        // Drain the buffer smoothly (3 characters per 15ms is great)
        return targetText.slice(0, prev.length + 3);
      });
    }, 15);

    // Clean up when the component unmounts
    return () => clearInterval(animationInterval);
  }, []); // Only run this effect ONCE when the message mounts!

  // The cursor should show if the network is still going OR if our visual buffer is still catching up
  const isVisuallyTyping =
    isStreaming || displayedText.length < fullTextRef.current.length;

  return (
    <div
      className={cn(
        "prose prose-neutral dark:prose-invert relative inline-block max-w-none",
        className,
      )}
    >
      {/* <Markdown>{displayedText}</Markdown> */}
      {/* <Markdown remarkPlugins={[remarkGfm]}>{displayedText}</Markdown> */}
      <MarkdownRenderer content={displayedText} renderImages={renderImages} />

      {/* The Blinking Cursor */}
      {/* {isVisuallyTyping && (
        <span className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-indigo-500 align-middle shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
      )} */}
    </div>
  );
}
