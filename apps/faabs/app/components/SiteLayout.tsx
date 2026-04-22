import { type ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import HeaderAuth from "./HeaderAuth";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header authSlot={<HeaderAuth />} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
