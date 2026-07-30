import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Salon Services | Juniper Studio Demo",
  description: "Explore fictional services connected to the Pixel Hutch salon booking demonstration.",
};

const categories = [
  ["01", "Color", "Personalized color plans designed around your hair, lifestyle, and ideal maintenance schedule.", ["All-over color", "Root touch-up", "Dimensional color", "Gloss or toner", "Color correction consultation"]],
  ["02", "Blonding", "Bright, blended, and lived-in blonding with placement selected for your desired finish.", ["Full highlight", "Partial highlight", "Balayage", "Foilyage", "Face-framing refresh"]],
  ["03", "Cuts & styling", "Shape, movement, and finishing tailored to your texture and everyday routine.", ["Customized haircut", "Clipper cut", "Blowout", "Special occasion styling", "Consultation"]],
  ["04", "Extensions", "Thoughtful color matching, installation, maintenance, blending, and shaping.", ["Extension consultation", "New installation", "Move-up appointment", "Removal", "Custom blending cut"]],
  ["05", "Treatments", "Targeted care that supports softness, strength, shine, and a healthier-looking finish.", ["Deep conditioning", "Bond-building treatment", "Scalp treatment", "Clarifying treatment", "Add-on treatment"]],
  ["06", "Specialty services", "Artist-specific services and transformations available through select Juniper Studio professionals.", ["Creative color", "Major transformation", "Bridal styling", "Corrective work", "Personalized consultation"]],
] as const;

export default function ServicesPage() {
  return <main className="services-page">
    <header className="site-header">
      <Link className="logo-lockup wordmark" href="/">Juniper <em>Studio</em></Link>
      <nav><Link href="/#about">About</Link><Link href="/#team">Our team</Link><Link href="/services">Services</Link><Link href="/#visit">Visit</Link></nav>
      <Link className="button button-dark" href="/booking">Book now</Link>
    </header>
    <section className="services-hero">
      <p className="eyebrow">The Juniper service menu</p>
      <h1>Beautiful hair starts with the <em>right artist.</em></h1>
      <p>Every professional at Juniper Studio is independent, so service names, pricing, timing, and availability vary by artist. Start here, then choose the stylist whose work and menu fit you best.</p>
      <Link className="button button-dark" href="/booking">Explore live availability</Link>
    </section>
    <section className="services-directory">
      {categories.map(([number,name,description,items]) => <article className="service-category" key={name}>
        <div className="service-category-copy"><span>{number}</span><div><h2>{name}</h2><p>{description}</p></div></div>
        <ul>{items.map((service) => <li key={service}>{service}</li>)}</ul>
      </article>)}
    </section>
    <section className="services-note">
      <p className="eyebrow">A personal approach</p><h2>Not sure what to book?</h2>
      <p>Choose an artist to see their current menu, or begin booking and compare the services available for each stylist. For major color changes or extensions, start with a consultation.</p>
      <div><Link className="button button-dark" href="/booking">Start booking</Link><Link className="text-link" href="/#team">Meet the artists <span>↗</span></Link></div>
    </section>
    <footer><span className="wordmark">Juniper <em>Studio</em></span><p>A fictional salon showing the Pixel Hutch booking platform.</p><div><Link href="/booking">Book an appointment</Link><Link href="/dashboard">Team login</Link></div><small>© 2026 Juniper Studio. A Pixel Hutch product demo.</small></footer>
  </main>;
}
