import Register from "@/components/auth/Register"

export const metadata = {
  title: 'Sign Up',
  description: 'Create a new account',
}


export default function page() {
  return (
    <div>
      <Register/>
    </div>
  )
}
