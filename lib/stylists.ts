export type StylistProfile = {
  slug: string;
  name: string;
  title: string;
  specialties: string[];
  intro: string;
  bio: string;
};

export const stylistProfiles: StylistProfile[] = [
  { slug:"morgan-reed", name:"Morgan Reed", title:"Owner · Colorist · Extension Artist", specialties:["Dimensional color","Blonding","Extensions"], intro:"Lived-in color, seamless extensions, and hair that still feels like you.", bio:"Morgan leads Juniper Studio with a thoughtful approach to consultations, dimensional color, and polished transformations. This fictional profile demonstrates how an owner page connects directly to booking." },
  { slug:"avery-lane", name:"Avery Lane", title:"Stylist", specialties:["Haircuts","Styling","Personalized color"], intro:"Fresh, wearable hair shaped around your texture and everyday routine.", bio:"Avery creates approachable, personalized looks with an easygoing appointment experience and close attention to the details that make a style work in real life." },
  { slug:"jordan-blake", name:"Jordan Blake", title:"Colorist · Stylist", specialties:["Custom color","Highlights","Haircuts"], intro:"Custom color and cuts with a relaxed, collaborative approach.", bio:"Jordan pairs color and shape to create cohesive, flattering results. Every appointment begins with a conversation about goals, maintenance, and personal style." },
  { slug:"riley-hart", name:"Riley Hart", title:"Colorist · Stylist", specialties:["Color","Blonding","Haircuts"], intro:"Bright blondes, rich color, and cuts made to move beautifully.", bio:"Riley offers customized color and cutting services with a focus on healthy-looking results, clear expectations, and a finished style clients can recreate at home." },
  { slug:"casey-monroe", name:"Casey Monroe", title:"Stylist", specialties:["Haircuts","Styling","Color"], intro:"Comfortable, confidence-building hair with a distinctly personal finish.", bio:"Casey brings a warm, attentive approach to every service, shaping each appointment around the client’s hair, lifestyle, and vision." },
  { slug:"taylor-quinn", name:"Taylor Quinn", title:"Colorist · Stylist", specialties:["Dimensional color","Highlights","Haircuts"], intro:"Dimension, softness, and a color plan designed for the long term.", bio:"Taylor creates personalized color and cuts with an emphasis on beautiful grow-out, hair health, and a plan that fits each client’s preferred maintenance schedule." },
  { slug:"cameron-sage", name:"Cameron Sage", title:"Stylist", specialties:["Haircuts","Color","Styling"], intro:"Modern, expressive hair tailored to the person wearing it.", bio:"Cameron blends current inspiration with a practical, personal approach, creating a look that feels exciting in the salon and natural in daily life." },
  { slug:"parker-ellis", name:"Parker Ellis", title:"Stylist", specialties:["Haircuts","Color","Styling"], intro:"Thoughtful styling and color in a welcoming, no-pressure chair.", bio:"Parker offers a calm, collaborative salon experience and customized services that help clients feel comfortable, confident, and completely themselves." },
];

export function getStylist(slug: string) {
  return stylistProfiles.find((stylist) => stylist.slug === slug);
}
