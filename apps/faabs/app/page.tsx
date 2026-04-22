import SiteLayout from "./components/SiteLayout";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import Philosophy from "./components/Philosophy";
import Products from "./components/Products";
import StoreInfo from "./components/StoreInfo";

export default function HomePage() {
  return (
    <SiteLayout>
      <Hero />
      <Marquee />
      <Philosophy />
      <Products />
      <StoreInfo />
    </SiteLayout>
  );
}
