"use client"

import dynamic from 'next/dynamic'

const AdminNavbar = dynamic(() => import('./AdminNavbar'), { ssr: false })

export default function AdminNavbarWrapper() {
  return <AdminNavbar />
}

