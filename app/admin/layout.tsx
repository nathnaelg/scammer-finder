import AdminNavbarWrapper  from "@/components/AdminNavbarWrapper"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AdminNavbarWrapper />
      <main className="container mx-auto py-4">{children}</main>
    </>
  )
}

