export const metaData ={
    title: "Admin Dashboard - Users - Soul Craft",
    description: "Manage user accounts in the admin dashboard of Soul Craft",
}

import UsersPage from "@/components/admin/UsersManage";
export default function page() {
  return (
    <div>
        <UsersPage/>
    </div>
  )
}
