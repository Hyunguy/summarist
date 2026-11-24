import type { Metadata } from "next";
import "./globals.css";
import "./application.css";
import Providers from "@/components/Providers";
export const metadata: Metadata = {
  title: "Summarist",
  description:
    "Gain more knowledge in less time. Read and listen to book summaries.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
