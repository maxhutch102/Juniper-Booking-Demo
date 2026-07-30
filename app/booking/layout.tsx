import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Try the Salon Booking Flow",
  description: "Choose a fictional Juniper Studio artist, explore their live service menu, and test the Pixel Hutch booking experience.",
  alternates: { canonical: "/booking" },
  robots: { index: true, follow: true },
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
