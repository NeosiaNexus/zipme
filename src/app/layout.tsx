import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const IMAGES = [
  "/img/back/beach.jpeg",
  "/img/back/city.jpg",
  "/img/back/forest.jpeg",
  "public/img/back/jungle.jpg",
];

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ZipMe",
  description: "ZipMe pour des échanges rapides et sécurisés",
};


import { cookies } from "next/headers";

function getRandomImage() {
  const randomIndex = Math.floor(Math.random() * IMAGES.length);
  return IMAGES[randomIndex];
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let bg: string | undefined;
  try {
    const cookiesStore = await cookies();
    bg = cookiesStore.get('bg')?.value;
  } catch { }
  const initialBg = bg && IMAGES.includes(bg) ? bg : getRandomImage();

  return (
    <html lang="fr">
      <body
        className={`${poppins.variable} antialiased relative w-dvw h-dvh overflow-x-hidden`}
        style={{
          backgroundImage: `url('${initialBg}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
        }}
        data-bg={initialBg}
      >
        <div className="absolute inset-0 bg-black/20 -z-10" />
        {children}
      </body>
    </html>
  );
}
