"use client";

import { Children, isValidElement, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

type RenderSegment = { type: "markdown"; value: string } | { type: "iframe"; src: string; title?: string; height: number };

interface SimpleTextbookMarkdownProps {
  markdown: string;
}

const ALLOWED_IFRAME_PREFIX = "/components/textbook/diagrams/";
const DEFAULT_IFRAME_HEIGHT = 420;
const MIN_IFRAME_HEIGHT = 240;
const MAX_IFRAME_HEIGHT = 760;
const MAX_DYNAMIC_IFRAME_HEIGHT = 1400;

function extractIframeAttribute(iframeHtml: string, attr: string): string | null {
  const doubleQuoted = iframeHtml.match(new RegExp(`${attr}="([^"]+)"`, "i"))?.[1];
  if (doubleQuoted) return doubleQuoted;
  const singleQuoted = iframeHtml.match(new RegExp(`${attr}='([^']+)'`, "i"))?.[1];
  return singleQuoted ?? null;
}

function clampIframeHeight(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_IFRAME_HEIGHT;
  return Math.max(MIN_IFRAME_HEIGHT, Math.min(MAX_IFRAME_HEIGHT, value));
}

function splitMarkdownWithIframes(markdown: string): RenderSegment[] {
  const segments: RenderSegment[] = [];
  const iframeRegex = /<iframe[\s\S]*?<\/iframe>/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = iframeRegex.exec(markdown)) !== null) {
    const rawIframe = match[0];
    if (match.index > lastIndex) {
      segments.push({ type: "markdown", value: markdown.slice(lastIndex, match.index) });
    }

    const src = extractIframeAttribute(rawIframe, "src");
    if (src && src.startsWith(ALLOWED_IFRAME_PREFIX) && src.endsWith(".html")) {
      const height = clampIframeHeight(Number(extractIframeAttribute(rawIframe, "height") ?? DEFAULT_IFRAME_HEIGHT));
      const title = extractIframeAttribute(rawIframe, "title") ?? "Interactive diagram";
      segments.push({ type: "iframe", src, title, height });
    }

    lastIndex = match.index + rawIframe.length;
  }

  if (lastIndex < markdown.length) {
    segments.push({ type: "markdown", value: markdown.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: "markdown", value: markdown }];
}

export function SimpleTextbookMarkdown({ markdown }: SimpleTextbookMarkdownProps) {
  const segments = splitMarkdownWithIframes(markdown);
  const [iframeHeights, setIframeHeights] = useState<Record<string, number>>({});

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; src?: string; height?: number } | null;
      if (!data || data.type !== "arcwealth-embed-height" || !data.src || typeof data.height !== "number") return;
      if (!data.src.startsWith(ALLOWED_IFRAME_PREFIX)) return;
      const nextHeight = Math.max(MIN_IFRAME_HEIGHT, Math.min(MAX_DYNAMIC_IFRAME_HEIGHT, Math.ceil(data.height)));
      setIframeHeights((prev) => (prev[data.src!] === nextHeight ? prev : { ...prev, [data.src!]: nextHeight }));
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="space-y-8">
      {segments.map((segment, index) => {
        if (segment.type === "iframe") {
          const iframeHeight = iframeHeights[segment.src] ?? segment.height;
          return (
            <section
              key={`${segment.src}-${index}`}
              className="overflow-hidden rounded-2xl border border-sky-200/80 bg-white shadow-sm dark:border-sky-700/70 dark:bg-slate-900"
              aria-label={segment.title ?? "Interactive curriculum diagram"}
            >
              <div className="border-b border-sky-100 bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-2 text-xs font-semibold tracking-wide text-blue-700 dark:border-sky-800 dark:from-slate-900 dark:to-slate-800 dark:text-cyan-300">
                Interactive breakdown
              </div>
              <iframe
                src={segment.src}
                title={segment.title}
                width="100%"
                height={iframeHeight}
                loading="lazy"
                scrolling="no"
                className="block w-full border-0 bg-white transition-[height] duration-200 dark:bg-slate-900"
              />
            </section>
          );
        }

        return (
          <article key={`md-${index}`} className="prose prose-slate max-w-none dark:prose-invert">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 className="text-3xl font-extrabold leading-tight text-slate-900 dark:text-slate-100">{children}</h1>,
                h2: ({ children }) => (
                  <h2 className="mt-10 border-b border-slate-200 pb-2 text-2xl font-bold text-slate-900 dark:border-slate-700 dark:text-slate-100">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => <h3 className="mt-8 text-xl font-semibold text-blue-800 dark:text-cyan-300">{children}</h3>,
                p: ({ children }) => {
                  const nonEmptyChildren = Children.toArray(children).filter((child) => !(typeof child === "string" && child.trim().length === 0));
                  if (nonEmptyChildren.length === 1 && isValidElement(nonEmptyChildren[0])) {
                    const childElement = nonEmptyChildren[0];
                    if (typeof childElement.type === "string" && (childElement.type === "figure" || childElement.type === "img")) {
                      return <>{childElement}</>;
                    }
                  }
                  return <p className="text-[1.05rem] leading-8 text-slate-700 dark:text-slate-300">{children}</p>;
                },
                strong: ({ children }) => <strong className="font-semibold text-slate-900 dark:text-slate-100">{children}</strong>,
                blockquote: ({ children }) => (
                  <blockquote className="rounded-r-xl border-l-4 border-amber-500 bg-amber-50/80 px-4 py-2 text-slate-800 dark:border-amber-400 dark:bg-amber-950/30 dark:text-slate-200">
                    {children}
                  </blockquote>
                ),
                ul: ({ children }) => <ul className="space-y-2 pl-5 marker:text-blue-500">{children}</ul>,
                ol: ({ children }) => <ol className="space-y-2 pl-5 marker:font-semibold marker:text-blue-500">{children}</ol>,
                li: ({ children }) => <li className="text-slate-700 dark:text-slate-300">{children}</li>,
                hr: () => <hr className="my-8 border-slate-200 dark:border-slate-700" />,
                table: ({ children }) => (
                  <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                    <table className="min-w-full text-sm">{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="bg-slate-100 px-4 py-3 text-left font-semibold text-slate-900 dark:bg-slate-800 dark:text-slate-100">{children}</th>
                ),
                td: ({ children }) => <td className="border-t border-slate-200 px-4 py-3 text-slate-700 dark:border-slate-700 dark:text-slate-300">{children}</td>,
                img: ({ src, alt }) => {
                  if (!src) return null;
                  const isDiagram = src.startsWith("/components/textbook/diagrams/");
                  return (
                    <figure
                      className={
                        isDiagram
                          ? "my-8 overflow-hidden rounded-2xl border border-sky-300/50 bg-gradient-to-b from-slate-900 to-slate-800 p-4 shadow-sm dark:border-sky-700/60"
                          : "my-8 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                      }
                    >
                      <img src={src} alt={alt ?? ""} loading="lazy" className="w-full rounded-lg border border-slate-200/80 dark:border-slate-700/80" />
                      {alt ? <figcaption className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">{alt}</figcaption> : null}
                    </figure>
                  );
                },
                a: ({ href, children }) => {
                  if (!href) return <>{children}</>;
                  if (href.startsWith("/")) {
                    return (
                      <Link href={href} className="font-medium text-blue-600 underline decoration-blue-400 underline-offset-2 hover:text-blue-700 dark:text-cyan-300 dark:hover:text-cyan-200">
                        {children}
                      </Link>
                    );
                  }
                  return (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 underline decoration-blue-400 underline-offset-2 hover:text-blue-700 dark:text-cyan-300 dark:hover:text-cyan-200">
                      {children}
                    </a>
                  );
                },
              }}
            >
              {segment.value}
            </ReactMarkdown>
          </article>
        );
      })}
    </div>
  );
}
