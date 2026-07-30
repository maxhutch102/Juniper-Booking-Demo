import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStylist, stylistProfiles } from "../../../lib/stylists";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return stylistProfiles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const stylist = getStylist((await params).slug);
  if (!stylist) return {};
  const description = `${stylist.intro} Meet ${stylist.name} and try the Juniper Studio booking demo.`;
  return {
    title: { absolute: `${stylist.name} | Stylist | Juniper Studio Demo` },
    description,
    alternates: { canonical: `/stylists/${stylist.slug}` },
    openGraph: {
      title: `${stylist.name} at Juniper Studio`,
      description,
      type: "profile",
    },
  };
}

export default async function StylistPage({ params }: Props) {
  const stylist = getStylist((await params).slug);
  if (!stylist) notFound();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: stylist.name,
    jobTitle: stylist.title,
    worksFor: {
      "@type": "HairSalon",
      name: "Juniper Studio",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Phoenix",
        addressRegion: "AZ",
      },
    },
  };
  return <main className="profile-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <header className="site-header">
      <Link className="logo-lockup wordmark" href="/">Juniper <em>Studio</em></Link>
      <nav><Link href="/#about">About</Link><Link href="/#team">Our team</Link><Link href="/#services">Services</Link><Link href="/#visit">Visit</Link></nav>
      <Link className="button button-dark" href={`/booking?stylist=${encodeURIComponent(stylist.name)}`}>Book {stylist.name.split(" ")[0]}</Link>
    </header>
    <section className="profile-hero">
      <div className="profile-image portrait-placeholder"><span>{stylist.name.split(" ").map(part=>part[0]).join("")}</span><small>Fictional artist profile</small></div>
      <div className="profile-copy">
        <p className="eyebrow">Meet your artist</p>
        <h1>{stylist.name}</h1>
        <p className="profile-title">{stylist.title}</p>
        <h2>{stylist.intro}</h2>
        <p>{stylist.bio}</p>
        <div className="specialty-list">{stylist.specialties.map(item=><span key={item}>{item}</span>)}</div>
        <div className="hero-actions"><Link className="button button-dark" href={`/booking?stylist=${encodeURIComponent(stylist.name)}`}>View services & book</Link><Link className="text-link" href="/#team">Meet every artist <span>↗</span></Link></div>
      </div>
    </section>
    <section className="profile-visit">
      <p className="eyebrow">Your appointment</p>
      <h2>Come as you are.<br/>Leave feeling even more like yourself.</h2>
      <p>Juniper Studio · Fictional salon created for this interactive product demo</p>
      <Link className="button" href={`/booking?stylist=${encodeURIComponent(stylist.name)}`}>Book with {stylist.name}</Link>
    </section>
  </main>;
}
