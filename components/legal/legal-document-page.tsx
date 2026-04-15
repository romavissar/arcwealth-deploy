import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type LegalDocumentPageProps = {
  title: string;
  subtitle: string;
  sourceFile: string;
};

export async function LegalDocumentPage({ title, subtitle, sourceFile }: LegalDocumentPageProps) {
  const filePath = path.join(process.cwd(), sourceFile);
  const content = await readFile(filePath, "utf8");

  return (
    <main className="bg-slate-50/70 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:py-14">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 sm:px-6">
        <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <Link
            href="/"
            className="rounded-full px-2 py-1 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 dark:decoration-slate-600 dark:hover:text-slate-100"
          >
            Home
          </Link>
          <span aria-hidden className="text-slate-400 dark:text-slate-500">
            /
          </span>
          <Link
            href="/credentials/register"
            className="rounded-full px-2 py-1 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 dark:decoration-slate-600 dark:hover:text-slate-100"
          >
            Registration
          </Link>
          <span aria-hidden className="text-slate-400 dark:text-slate-500">
            /
          </span>
          <span className="font-medium text-slate-900 dark:text-slate-100">{title}</span>
        </nav>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">ArcWealth Legal</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">{subtitle}</p>
        </section>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 sm:p-10">
          <div className="mx-auto max-w-3xl">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: () => null,
                h2: ({ children }) => (
                  <h2 className="mt-10 border-b border-slate-200 pb-3 text-2xl font-semibold tracking-tight text-slate-900 first:mt-2 dark:border-slate-700 dark:text-slate-100">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mt-7 text-lg font-semibold text-slate-900 dark:text-slate-100">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="mt-4 text-base leading-8 text-slate-700 dark:text-slate-200">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-8 text-slate-700 marker:text-slate-400 dark:text-slate-200 dark:marker:text-slate-500">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mt-4 list-decimal space-y-2 pl-6 text-base leading-8 text-slate-700 marker:font-medium marker:text-slate-500 dark:text-slate-200 dark:marker:text-slate-400">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="pl-1">{children}</li>,
                hr: () => <hr className="my-8 border-slate-200 dark:border-slate-700" />,
                blockquote: ({ children }) => (
                  <blockquote className="mt-6 rounded-lg border border-amber-200/70 bg-amber-50/70 px-4 py-3 text-slate-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-slate-200">
                    {children}
                  </blockquote>
                ),
                strong: ({ children }) => <strong className="font-semibold text-slate-900 dark:text-slate-100">{children}</strong>,
                code: ({ children }) => (
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.92em] text-slate-800 dark:bg-slate-800 dark:text-slate-100">
                    {children}
                  </code>
                ),
                a: ({ href, children }) => {
                  if (!href) return <>{children}</>;
                  if (href.startsWith("/")) {
                    return (
                      <Link
                        href={href}
                        className="font-medium text-primary underline decoration-primary/60 underline-offset-4 transition hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                      >
                        {children}
                      </Link>
                    );
                  }
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary underline decoration-primary/60 underline-offset-4 transition hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </main>
  );
}
