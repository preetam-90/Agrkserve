const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agriserve.in';

interface BlogAuthor {
  name: string;
  jobTitle?: string;
  description?: string;
  image?: string;
  url?: string;
  sameAs?: string[];
}

export interface BlogPost {
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: BlogAuthor;
  url: string;
  articleBody?: string;
  wordCount?: number;
  articleSection?: string;
  keywords?: string[];
  inLanguage?: 'en-IN' | 'hi-IN';
}

interface FAQItem {
  question: string;
  answer: string;
}

interface HowToStep {
  name: string;
  text: string;
  image?: string;
  url?: string;
}

interface HowToSupply {
  name: string;
  image?: string;
}

interface HowToTool {
  name: string;
  image?: string;
}

export function createAuthorSchema(author: BlogAuthor) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${siteUrl}/authors/${author.name.toLowerCase().replace(/\s+/g, '-')}#person`,
    name: author.name,
    ...(author.jobTitle && { jobTitle: author.jobTitle }),
    ...(author.description && { description: author.description }),
    ...(author.image && { image: author.image }),
    url: author.url || `${siteUrl}/authors/${author.name.toLowerCase().replace(/\s+/g, '-')}`,
    ...(author.sameAs && author.sameAs.length > 0 && { sameAs: author.sameAs }),
    worksFor: {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
    },
  };
}

export function createBlogPostingSchema(post: BlogPost) {
  const wordCount =
    post.wordCount || (post.articleBody ? post.articleBody.split(/\s+/).length : undefined);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${post.url}#blogposting`,
    headline: post.title,
    description: post.description,
    image: post.image
      ? {
          '@type': 'ImageObject',
          url: post.image,
          ...(post.image && { '@id': `${post.image}#image` }),
        }
      : {
          '@type': 'ImageObject',
          url: `${siteUrl}/og-image.jpg`,
        },
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    author: createAuthorSchema(post.author),
    publisher: {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'AgriServe',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.url,
    },
    ...(post.articleBody && { articleBody: post.articleBody }),
    ...(wordCount && { wordCount }),
    ...(post.articleSection && { articleSection: post.articleSection }),
    ...(post.keywords && post.keywords.length > 0 && { keywords: post.keywords.join(', ') }),
    inLanguage: post.inLanguage || 'en-IN',
    copyrightYear: new Date(post.datePublished).getFullYear().toString(),
    copyrightHolder: {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
    },
  };
}

function createArticleSchema(post: BlogPost) {
  const wordCount =
    post.wordCount || (post.articleBody ? post.articleBody.split(/\s+/).length : undefined);

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${post.url}#article`,
    headline: post.title,
    description: post.description,
    image: post.image || `${siteUrl}/og-image.jpg`,
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    author: createAuthorSchema(post.author),
    publisher: {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'AgriServe',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.url,
    },
    ...(post.articleBody && { articleBody: post.articleBody }),
    ...(wordCount && { wordCount }),
    ...(post.articleSection && { articleSection: post.articleSection }),
    ...(post.keywords && post.keywords.length > 0 && { keywords: post.keywords.join(', ') }),
    inLanguage: post.inLanguage || 'en-IN',
  };
}

export function createBlogBreadcrumbSchema(post: BlogPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${post.url}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${siteUrl}/blog`,
      },
      ...(post.articleSection
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: post.articleSection,
              item: `${siteUrl}/blog/category/${post.articleSection.toLowerCase().replace(/\s+/g, '-')}`,
            },
            {
              '@type': 'ListItem',
              position: 4,
              name: post.title,
              item: post.url,
            },
          ]
        : [
            {
              '@type': 'ListItem',
              position: 3,
              name: post.title,
              item: post.url,
            },
          ]),
    ],
  };
}

function createFAQSchema(questions: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };
}

function createHowToSchema(
  steps: HowToStep[],
  title: string,
  options?: {
    description?: string;
    image?: string;
    totalTime?: string;
    estimatedCost?: string;
    supplies?: HowToSupply[];
    tools?: HowToTool[];
  }
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    ...(options?.description && { description: options.description }),
    ...(options?.image && { image: options.image }),
    ...(options?.totalTime && { totalTime: options.totalTime }),
    ...(options?.estimatedCost && {
      estimatedCost: {
        '@type': 'MonetaryAmount',
        currency: 'INR',
        value: options.estimatedCost,
      },
    }),
    ...(options?.supplies &&
      options.supplies.length > 0 && {
        supply: options.supplies.map((supply) => ({
          '@type': 'HowToSupply',
          name: supply.name,
          ...(supply.image && { image: supply.image }),
        })),
      }),
    ...(options?.tools &&
      options.tools.length > 0 && {
        tool: options.tools.map((tool) => ({
          '@type': 'HowToTool',
          name: tool.name,
          ...(tool.image && { image: tool.image }),
        })),
      }),
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: step.image }),
      ...(step.url && { url: step.url }),
    })),
  };
}

function createBlogPageSchema(post: BlogPost) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      createBlogPostingSchema(post),
      createBlogBreadcrumbSchema(post),
      {
        '@type': 'WebPage',
        '@id': post.url,
        url: post.url,
        name: post.title,
        description: post.description,
        inLanguage: post.inLanguage || 'en-IN',
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${siteUrl}/#website`,
        },
        about: {
          '@type': 'Organization',
          '@id': `${siteUrl}/#organization`,
        },
        ...(post.keywords &&
          post.keywords.length > 0 && {
            mentions: post.keywords.map((keyword) => ({
              '@type': 'Thing',
              name: keyword,
            })),
          }),
      },
    ],
  };
}

function createAuthorPageSchema(author: BlogAuthor, posts: BlogPost[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      createAuthorSchema(author),
      {
        '@type': 'WebPage',
        '@id': author.url || `${siteUrl}/authors/${author.name.toLowerCase().replace(/\s+/g, '-')}`,
        url: author.url || `${siteUrl}/authors/${author.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: `${author.name} - Author at AgriServe`,
        description: author.description || `Articles and posts written by ${author.name}`,
        inLanguage: 'en-IN',
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${siteUrl}/#website`,
        },
        mainEntity: createAuthorSchema(author),
      },
      ...(posts.length > 0
        ? [
            {
              '@type': 'ItemList',
              name: `Articles by ${author.name}`,
              numberOfItems: posts.length,
              itemListElement: posts.map((post, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: post.title,
                url: post.url,
              })),
            },
          ]
        : []),
    ],
  };
}

export function createBlogListingSchema(posts: BlogPost[], page: number = 1) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${siteUrl}/blog${page > 1 ? `/page/${page}` : ''}`,
        url: `${siteUrl}/blog${page > 1 ? `/page/${page}` : ''}`,
        name: page > 1 ? `Blog - Page ${page}` : 'Blog',
        description:
          'Latest articles and guides about farming, agricultural equipment, and tips for Indian farmers.',
        inLanguage: 'en-IN',
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${siteUrl}/#website`,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: page > 1 ? `Blog - Page ${page}` : 'Blog',
            item: `${siteUrl}/blog${page > 1 ? `/page/${page}` : ''}`,
          },
        ],
      },
      {
        '@type': 'ItemList',
        name: 'Blog Posts',
        numberOfItems: posts.length,
        itemListElement: posts.map((post, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: post.title,
          url: post.url,
          image: post.image,
          description: post.description,
        })),
      },
    ],
  };
}
