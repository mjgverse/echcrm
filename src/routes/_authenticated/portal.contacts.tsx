import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase' // Ensure this matches your supabase client path

export const Route = createFileRoute('/_authenticated/portal/contacts')({
  component: ContactsPage,
})

function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContacts()
  }, [])

  async function fetchContacts() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_visible', true)
        .order('first_name', { ascending: true }) // Alphabetical A-Z

      if (error) throw error
      
      setContacts(data || [])
    } catch (error) {
      console.error("Error fetching contacts:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
        <p className="text-muted-foreground">
          Directory of all registered members.
        </p>
      </div>
      
      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading contacts...</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-900">Name</th>
                <th className="px-6 py-3 font-medium text-gray-900">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-muted-foreground">
                    No active contacts found.
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {contact.first_name} {contact.last_name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {contact.email}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
