import Admin from "@/components/admin/Admin"
import { AuthProvider } from "@/contexts/AuthContext"

export default function AdminPage() {
  return (
    <AuthProvider>
      <Admin />
    </AuthProvider>
  )
}
