import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/shared/navbar";

export const metadata: Metadata = {
  title: "EEPS — Pizza & Kebab Ordering",
  description:
    "Order delicious pizzas and kebabs for delivery or pickup.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 font-sans text-gray-900 antialiased">
        <div className="mx-auto min-h-screen max-w-lg">
          <Navbar />
          <main className="px-4 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
