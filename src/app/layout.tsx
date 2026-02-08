import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/shared/navbar";

export const metadata: Metadata = {
  title: "EEPS — Picų ir kebabų užsakymas",
  description:
    "Užsisakykite skaniausias picas ir kebabus pristatymui arba atsiėmimui.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="lt">
      <body className="bg-gray-50 font-sans text-gray-900 antialiased">
        <div className="mx-auto min-h-screen max-w-lg overflow-hidden">
          <Navbar />
          <main className="px-4 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
