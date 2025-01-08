import { Footer } from "@/components/footer";
import { Header } from "@/lib/components/Header";
import classNames from "classnames";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kinnema",
  description: "Kinnema",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
      />
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <body
        className={classNames(
          montserrat.className,
          "text-sm bg-white dark:bg-zinc-900"
        )}
      >
        <Providers>
          <Header />
          <div className="min-h-screen bg-black/95 text-white">
            <main className="pt-16">{children}</main>
          </div>
          {modal}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
