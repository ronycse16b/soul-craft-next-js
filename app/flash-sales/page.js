import Container from "@/components/Container"
import FlashSalePage from "@/components/FlashSalePage"

export const metadata = {
    title: "Flash Sales - Soul Craft",
    description: "Flash Sales",

}

export default function page() {
  return (
    <Container className='px-0'>
        <FlashSalePage/>

    </Container>
  )
}
