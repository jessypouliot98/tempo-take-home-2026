import { Geist } from "next/font/google";
import clsx from "clsx";
import dynamic from "next/dynamic";

const ClientStickyBoard = dynamic(async () => {
  const { StickyBoard } = await import("@/modules/sticky-note/components/StickyBoard/StickyBoard");
  return { default: StickyBoard };
}, { ssr: false  });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div
      className={clsx(geistSans.className, "flex min-h-screen font-sans")}
    >
      <ClientStickyBoard className="flex-1" />
    </div>
  );
}
