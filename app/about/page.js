import About from "@/components/About";
import Container from "@/components/Container";

export const metadata = {
    title: "About - Soul Craft",
    description: "About Soul Craft",
    };
export default function page() {
  return (
    <Container>
        <About/>
    </Container>
  )
}
