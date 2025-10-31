import AdminMessages from "@/components/admin/Message";

export const metadata = {
  title: "Admin Dashboard - Messages - Soul Craft",
  description: "Manage user messages in the admin dashboard of Soul Craft",
};

export default function page() {
  return (
    <div>
        <AdminMessages/>
    </div>
  )
}
