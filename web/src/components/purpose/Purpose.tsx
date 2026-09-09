import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Vision from "@/components/vision/Vision";
import Mission from "@/components/mission/Mission";

export default function Purpose() {
  return (
    <Section
      id="purpose"
      tone="tint"
      size="lg"
      divider="both"
      grid
      aria-labelledby="purpose-title"
    >
      <Container width="wide">
        <SectionHeader
          id="purpose-title"
          align="center"
          size="lg"
          eyebrow="Our guiding principle"
          title={
            <>
              Built on purpose, driven by{" "}
              <span className="text-brand-700">excellence</span>
            </>
          }
          description="Every journal, publication and research initiative at UORA is guided by ethical publishing, academic integrity and measurable global impact."
        />

        <div className="mt-16 space-y-16 lg:mt-20 lg:space-y-24">
          <Vision />
          <Mission />
        </div>
      </Container>
    </Section>
  );
}
