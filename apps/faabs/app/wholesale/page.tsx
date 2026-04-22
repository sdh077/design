import SiteLayout from "../components/SiteLayout";
import WholesaleHero from "./components/WholesaleHero";
import WholesaleFeatures from "./components/WholesaleFeatures";
import WholesaleGuide from "./components/WholesaleGuide";
import WholesalePricing from "./components/WholesalePricing";
import WholesaleContact from "./components/WholesaleContact";

export const metadata = {
  title: "납품 · Wholesale — FAABS Coffee",
  description: "파브스 커피 납품 및 도매 문의. 공학적 로스팅으로 완성된 원두를 합리적인 가격에 공급합니다.",
};

export default function WholesalePage() {
  return (
    <SiteLayout>
      <WholesaleHero />
      <WholesaleFeatures />
      <WholesaleGuide />
      <WholesalePricing />
      <WholesaleContact />
    </SiteLayout>
  );
}
