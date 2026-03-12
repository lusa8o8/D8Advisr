import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "D8Advisr",
  description: "Plan memorable date and group experiences in Lusaka, Zambia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background text-text-primary min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
