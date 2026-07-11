import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Search, X } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/portal/contacts')({
  component: ContactsPage,
})

function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [perPage, setPerPage] = useState(20)

  useEffect(() => {
    fetchContacts()
  }, [])

  async function fetchContacts() {
    try {
      // Fetching all records from profiles safely
      const { data, error } = await supabase
        .from('profiles')
        .select('*')

      if (error) throw error
      setContacts(data || [])
    } catch (error) {
      console.error("Error fetching contacts:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and limit display list locally
  const displayedContacts = useMemo(() => {
    let filtered = contacts

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase()
      filtered = contacts.filter(contact => {
        const firstName = contact.first_name || ''
        const lastName = contact.last_name || ''
        const fullName = `${firstName} ${lastName} ${contact.full_name || ''}`.toLowerCase()
        const email = (contact.email || '').toLowerCase()
        return fullName.includes(lowerQuery) || email.includes(lowerQuery)
      })
    }

    return filtered.slice(0, perPage)
  }, [contacts, searchQuery, perPage])

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
        <p className="text-muted-foreground">
          Directory of all registered members.
        </p>
      </div>
      
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 py-2 border rounded-md text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-black bg-white"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-gray-500 hover:text-black"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Dropdown Selection */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Show:</span>
          <select 
            value={perPage} 
            onChange={(e) => setPerPage(Number(e.target.value))}
            className="border rounded-md py-1.5 px-2 bg-white focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Loading contacts...</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-900">Name</th>
                <th className="px-6 py-3 font-medium text-gray-900">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {displayedContacts.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-muted-foreground">
                    No active contacts found.
                  </td>
                </tr>
              ) : (
                displayedContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {contact.first_name || contact.full_name ? (
                        `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || contact.full_name
                      ) : (
                        <span className="text-gray-400 italic">Unnamed Member</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {contact.email || <span className="text-gray-400 italic">No email provided</span>}
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
