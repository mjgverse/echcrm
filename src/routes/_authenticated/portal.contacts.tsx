import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Search, X, User, Mail, Shield, Clock } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/portal/contacts')({
  component: ContactsPage,
})

function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [perPage, setPerPage] = useState(20)
  
  // New state to track the active clicked contact drawer
  const [selectedContact, setSelectedContact] = useState<any | null>(null)

  useEffect(() => {
    fetchContacts()
  }, [])

  async function fetchContacts() {
    try {
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
    <div className="flex flex-col gap-6 p-6 relative min-h-screen overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
        <p className="text-muted-foreground">
          Directory of all registered members. Click a row to view full details.
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
                  <tr 
                    key={contact.id} 
                    onClick={() => setSelectedContact(contact)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
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

      {/* Slide-out Backdrop Overlay */}
      {selectedContact && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setSelectedContact(null)}
        />
      )}

      {/* Slide-out Panel Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white shadow-2xl border-l z-50 transform transition-transform duration-300 ease-in-out p-6 flex flex-col gap-6 ${
        selectedContact ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-lg font-bold text-gray-900">Contact Details</h2>
          <button 
            onClick={() => setSelectedContact(null)}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500 hover:text-black"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Content */}
        {selectedContact && (
          <div className="flex flex-col gap-6 overflow-y-auto flex-1">
            {/* Avatar Header */}
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border">
              <div className="h-14 w-14 rounded-full bg-black text-white flex items-center justify-center font-bold text-xl uppercase shadow-sm">
                {(selectedContact.first_name?.[0] || selectedContact.full_name?.[0] || 'U')}
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {`${selectedContact.first_name || ''} ${selectedContact.last_name || ''}`.trim() || selectedContact.full_name || 'Unnamed Member'}
                </h3>
                <p className="text-xs text-muted-foreground font-mono truncate max-w-[240px]">
                  ID: {selectedContact.id}
                </p>
              </div>
            </div>

            {/* Structured Details Grid */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Metadata Profile</h4>
              
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-white shadow-sm">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex flex-col text-sm">
                  <span className="text-gray-500 text-xs">Full Legal Name</span>
                  <span className="font-medium text-gray-900">
                    {selectedContact.full_name || `${selectedContact.first_name || ''} ${selectedContact.last_name || ''}`.trim() || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border bg-white shadow-sm">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex flex-col text-sm">
                  <span className="text-gray-500 text-xs">Email Address</span>
                  <span className="font-medium text-gray-900 break-all">{selectedContact.email || 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border bg-white shadow-sm">
                <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex flex-col text-sm">
                  <span className="text-gray-500 text-xs">System Visibility Status</span>
                  <span className={`inline-flex items-center gap-1.5 font-medium text-xs mt-0.5 px-2 py-0.5 rounded-full w-max ${
                    selectedContact.is_visible ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-600 border'
                  }`}>
                    {selectedContact.is_visible ? 'Active / Visible' : 'Hidden'}
                  </span>
                </div>
              </div>

              {selectedContact.updated_at && (
                <div className="flex items-start gap-3 p-3 rounded-lg border bg-white shadow-sm">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex flex-col text-sm">
                    <span className="text-gray-500 text-xs">Last Sync Profile Modification</span>
                    <span className="font-medium text-gray-900 text-xs">
                      {new Date(selectedContact.updated_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
