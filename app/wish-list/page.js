import Wishlist from "@/components/Wishlist";

export const metadata = {
  title: "Wish List - Soul Craft",
  description: "Your wish list items",
};
export default function page() {
  return (
    <div>
        <Wishlist />
    </div>
  )
}
