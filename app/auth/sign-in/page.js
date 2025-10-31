import Login from "@/components/auth/Login";

export const metadata = {
  title: 'Sign In',
  description: 'Access your account',
}

export default function page() {
  return (
    <div>
      <Login/>
    </div>
  )
}
