import dynamic from "next/dynamic";
import Navbar from "@/components/navbar/Navbar";
import Hero from "@/components/hero/Hero";
import Standards from "@/components/standards/Standards";
import About from "@/components/about/About";
import Purpose from "@/components/purpose/Purpose";
import FeaturedJournals from "@/components/journals";
import Footer from "@/components/footer";

export const revalidate = 3600;

const EditorialBoard = dynamic(() => import("@/components/editorial"), {
  loading: () => <div className="min-h-[400px]" />,
});
const WhyUora = dynamic(() => import("@/components/why-uora"), {
  loading: () => <div className="min-h-[400px]" />,
});
const CTA = dynamic(() => import("@/components/cta"), {
  loading: () => <div className="min-h-[300px]" />,
});
const Contact = dynamic(() => import("@/components/contact"), {
  loading: () => <div className="min-h-[400px]" />,
});

export default function Home() {
  return (
    <>
      <Navbar />

      <main id="main">
        <Hero />
        <Standards />
        <About />
        <Purpose />
        <FeaturedJournals />
        <EditorialBoard />
        <WhyUora />
        <CTA />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
