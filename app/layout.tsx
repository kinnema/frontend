import { Header } from "@/lib/components/Header";
import { LeftSidebar } from "@/lib/components/LeftSidebar";
import { RightSidebar } from "@/lib/components/RightSidebar";
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
      <body
        className={classNames(
          montserrat.className,
          "text-sm bg-white dark:bg-zinc-900"
        )}
      >
        <div id="modal-root" />
        <div className="flex min-h-screen  2xl:max-w-screen-2xl 2xl:mx-auto 2xl:border-x-2 2xl:border-gray-200 dark:2xl:border-zinc-700">
          <LeftSidebar />
          <main className="flex-1 py-10  px-5 sm:px-10">
            <Header />
            <Providers>
              {children}
              {modal}
            </Providers>
          </main>
          <RightSidebar />
        </div>
      </body>
    </html>
  );
}
