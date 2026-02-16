import type { ReactNode } from 'react';

interface ArticleLayoutProps {
  content: ReactNode;
  sidebar: ReactNode;
}

export function ArticleLayout({ content, sidebar }: ArticleLayoutProps) {
  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-16 xl:gap-20">
      <article className="min-w-0">
        <div className="mx-auto w-full max-w-[78ch] lg:max-w-[74ch] xl:max-w-[76ch]">{content}</div>
      </article>
      <div className="relative self-start">{sidebar}</div>
    </div>
  );
}
