import Link from "next/link";
import { stylistProfiles as team } from "../lib/stylists";
const services = [
  ["Custom Color", "Dimensional color tailored to your hair, lifestyle, and goals.", "From $125"],
  ["Blonding", "Highlights, balayage, foilyage, and maintenance sessions.", "From $165"],
  ["Haircuts", "A customized cut, finished with a polished blowout.", "From $50"],
  ["Extensions", "Color matching, installation, move-ups, and shaping.", "Consultation"],
];

export default function Home() {
  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({
      "@context":"https://schema.org","@type":"HairSalon",name:"Juniper Studio",
      url:"https://hutch-salon.mhutchi2517.chatgpt.site",
      address:{"@type":"PostalAddress",addressLocality:"Phoenix",addressRegion:"AZ",addressCountry:"US"},
      openingHoursSpecification:[
        {"@type":"OpeningHoursSpecification",dayOfWeek:["Monday"],opens:"09:30",closes:"20:00"},
        {"@type":"OpeningHoursSpecification",dayOfWeek:["Tuesday","Wednesday","Thursday"],opens:"09:30",closes:"19:00"},
        {"@type":"OpeningHoursSpecification",dayOfWeek:["Friday"],opens:"09:30",closes:"18:00"},
        {"@type":"OpeningHoursSpecification",dayOfWeek:["Saturday"],opens:"10:00",closes:"17:00"}
      ],priceRange:"$$"
    })}} />
    <header className="site-header">
      <Link className="logo-lockup wordmark" href="/">Juniper <em>Studio</em></Link>
      <nav><a href="#about">About</a><a href="#team">Our team</a><Link href="/services">Services</Link><a href="#visit">Visit</a></nav>
      <Link className="button button-dark" href="/booking">Book now</Link>
    </header>
    <section className="hero">
      <div className="hero-copy"><p className="eyebrow">Independent artists. One beautiful space.</p><h1>Your hair,<br/><em>your confidence.</em></h1><p className="hero-text">A modern, welcoming salon where talented independent artists create hair that feels unmistakably you.</p><div className="hero-actions"><Link className="button button-dark" href="/booking">Find an appointment</Link><a className="text-link" href="#team">Meet the artists <span>↗</span></a></div></div>
      <div className="hero-art"><div className="arch portrait-placeholder"><span>J</span><small>Your brand<br/>belongs here</small></div><span className="hero-note">Phoenix, Arizona<br/>Fictional demo salon</span></div>
    </section>
    <section className="statement" id="about"><p className="eyebrow">The Juniper experience</p><h2>Great hair starts with being heard.</h2><p>We believe your appointment should feel personal from the moment you book. Choose the artist whose work speaks to you, explore their services, and reserve a time that fits your life.</p></section>
    <section className="services-section" id="services"><div className="section-heading"><div><p className="eyebrow">What we do</p><h2>Services designed around you.</h2></div><Link className="text-link" href="/services">View all services <span>↗</span></Link></div><div className="service-grid">{services.map(([name,description,price],i)=><article className="service-card" key={name}><span>0{i+1}</span><h3>{name}</h3><p>{description}</p><strong>{price}</strong></article>)}</div></section>
    <section className="team-section" id="team"><div className="section-heading"><div><p className="eyebrow">Our collective</p><h2>Meet your next favorite stylist.</h2></div><p className="section-intro">Each artist runs their own chair, sets their own services, and brings something special to the studio.</p></div><div className="team-grid">{team.map(({name,title,slug})=><article className="team-card" key={name}><Link className="team-photo portrait-placeholder" href={`/stylists/${slug}`}><span>{name.split(" ").map(part=>part[0]).join("")}</span><small>Artist profile</small></Link><div><h3><Link href={`/stylists/${slug}`}>{name}</Link></h3><p>{title}</p></div><Link href={`/stylists/${slug}`} aria-label={`Meet ${name}`}>↗</Link></article>)}</div></section>
    <section className="visit-section" id="visit"><div><p className="eyebrow">Fictional demo salon</p><h2>Your location belongs here.</h2><p>This sample business, team, and location are fictional.<br/>Pixel Hutch can tailor the experience to any salon brand.</p><Link className="text-link light-link" href="/booking">Try the booking flow <span>↗</span></Link></div><div className="hours"><p className="eyebrow">Sample salon hours</p>{[["Mon","9:30 AM – 8 PM"],["Tue – Thu","9:30 AM – 7 PM"],["Friday","9:30 AM – 6 PM"],["Saturday","10 AM – 5 PM"],["Sunday","Closed"]].map(([day,time])=><div key={day}><span>{day}</span><span>{time}</span></div>)}</div></section>
    <footer><span className="wordmark">Juniper <em>Studio</em></span><p>A fictional salon showing the Pixel Hutch booking platform.</p><div><Link href="/booking">Book an appointment</Link><Link href="/dashboard">Team login</Link><a href="https://pixel-hutch.com/booking-systems">About this system</a></div><small>© 2026 Juniper Studio. A Pixel Hutch product demo.</small></footer>
  </main>;
}
