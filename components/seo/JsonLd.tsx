/**
 * JSON-LD structured data components.
 * Drop these into page.tsx files to improve rich results in Google Search.
 */

interface OrganizationJsonLdProps {
  url?: string;
}

export function OrganizationJsonLd({
  url = "https://makemymemory.in",
}: OrganizationJsonLdProps) {
  // Also declares WebSite alongside Organization (both belong on the
  // homepage per Google's guidance) so there's one reconciled script here
  // instead of scattering structured data across multiple files.
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: "Make My Memory",
        url,
        logo: `${url}/icon.png`,
        sameAs: [
          "https://www.instagram.com/makemymemory.in",
          "https://www.facebook.com/share/1FxXf4Z36i/?mibextid=wwXIfr",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+91-8097486800",
          contactType: "customer service",
          email: "support@makemymemory.in",
          availableLanguage: ["English", "Hindi"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        name: "Make My Memory",
        url,
        publisher: { "@id": `${url}/#organization` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface ProductJsonLdProps {
  name: string;
  description: string;
  price: number;
  currency?: string;
  url: string;
  image?: string;
  availability?: "InStock" | "OutOfStock";
  rating?: number;
  reviewCount?: number;
}

export function ProductJsonLd({
  name,
  description,
  price,
  currency = "INR",
  url,
  image,
  availability = "InStock",
  rating,
  reviewCount,
}: ProductJsonLdProps) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    url,
    ...(image ? { image } : {}),
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: currency,
      availability:  `https://schema.org/${availability}`,
      url,
    },
  };

  if (rating && reviewCount) {
    data.aggregateRating = {
      "@type":       "AggregateRating",
      ratingValue:   rating,
      reviewCount,
      bestRating:    5,
      worstRating:   1,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function FAQPageJsonLd({ items }: { items: Array<{ q: string; a: string }> }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type":    "ListItem",
      position:   i + 1,
      name:       item.name,
      item:       item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
