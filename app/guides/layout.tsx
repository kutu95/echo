import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Measurement guide — Canine Echo Helper",
  description: "Searchable echocardiography measurement instructions for dogs.",
};

export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
