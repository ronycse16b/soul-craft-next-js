

import AccountPage from "@/components/AccountPage";
import Container from "@/components/Container";

export const metadata = {
    title: "Account - Soul Craft",
    description: "Your account details",
  };

export default function page() {
  return (
    <Container className="my-10 px-1">
        <AccountPage/>
    </Container>
  )
}
