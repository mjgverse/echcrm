import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Search, X, User, Mail, Shield, Clock, Trash2, Edit3, Check, AlertTriangle } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/portal/contacts')({
  component: ContactsPage,
})

function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [perPage, setPerPage] = useState(20)
  
  // Drawer & Interaction State
  const [selectedContact, setSelectedContact] = useState<any | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [editEmail, setEditEmail] = useState('')

  // Typing Confirmation Safeguard State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [confirmInput, setConfirmInput] = useState('')

  useEffect(() => {
    fetchContacts()
  }, [])

  // Watch for contact selection changes to reset all form states
  useEffect(() => {
    if (selectedContact) {
      setEditFirstName(selectedContact.first_name || '')
      setEditLastName(selectedContact.last_name || '')
      setEditEmail(selectedContact.email || '')
      setIsEditing(false)
      setShowDeleteConfirm(false)
      setConfirmInput('')
    }
  }, [selectedContact])

async function fetchContacts() {
    try {
      // Change 'profiles' to 'contacts' here
      const { data, error } = await supabase
        .from('contacts')
        .select('*')

      if (error) throw error
      setContacts(data || [])
    } catch (error) {
      console.error("Error fetching contacts:", error)
    } finally {
      setLoading(false)
    }
  }
  // Local UI Actions (Prototype Mode)
  const handleDeleteLocal = (id: string) => {
    if (confirmInput === 'CONFIRM') {
      setContacts(prev => prev.filter(c => c.id !== id))
      setSelectedContact(null)
      setShowDeleteConfirm(false)
      setConfirmInput('')
    }
  }

  const handleSaveLocal = () => {
    if (!selectedContact) return
    
    setContacts(prev => prev.map(c => {
      if (c.id === selectedContact.id) {
        return {
          ...c,
          first_name: editFirstName,
          last_name: editLastName,
          email: editEmail,
          updated_at: new Date().toISOString()
        }
      }
      return c
    }))

    setSelectedContact(prev => ({
      ...prev,
      first_name: editFirstName,
      last_name: editLastName,
      email: editEmail,
      updated_at: new Date().toISOString()
    }))

    setIsEditing(false)
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
          Directory of all registered members. Click a row to view or modify details.
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
          <h2 className="text-lg font-bold text-gray-900">
            {showDeleteConfirm ? 'Confirm Account Removal' : isEditing ? 'Modify Contact Attributes' : 'Contact Details'}
          </h2>
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
            {/* Avatar Header Block */}
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border">
              <div className="h-14 w-14 rounded-full bg-black text-white flex items-center justify-center font-bold text-xl uppercase shadow-sm">
                {(editFirstName?.[0] || selectedContact.full_name?.[0] || 'U')}
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {showDeleteConfirm ? 'Destructive Action Pending' : isEditing ? 'Editing Mode' : (`${selectedContact.first_name || ''} ${selectedContact.last_name || ''}`.trim() || selectedContact.full_name || 'Unnamed Member')}
                </h3>
                <p className="text-xs text-muted-foreground font-mono truncate max-w-[240px]">
                  ID: {selectedContact.id}
                </p>
              </div>
            </div>

            {/* Profile Fields Details */}
            <div className="flex flex-col gap-4">
              
              {showDeleteConfirm ? (
                /* High Fidelity Security Input Mode */
                <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-red-800 font-semibold text-sm">
                    <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    Warning: Local Application Removal
                  </div>
                  <p className="text-xs text-red-700 leading-relaxed">
                    This will hide this account configuration from your dashboard viewport. Type <span className="font-mono font-bold bg-white px-1 py-0.5 rounded border border-red-300 text-red-900">CONFIRM</span> below to execute.
                  </p>
                  <input 
                    type="text"
                    placeholder="Type CONFIRM here..."
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    className="border border-red-300 rounded-md px-3 py-2 text-sm bg-white w-full focus:outline-none focus:ring-2 focus:ring-red-500 font-mono uppercase tracking-wider"
                  />
                </div>
              ) : isEditing ? (
                /* Interactive Edit Form Fields */
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Metadata Profile</h4>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">First Name</label>
                    <input 
                      type="text" 
                      value={editFirstName} 
                      onChange={(e) => setEditFirstName(e.target.value)}
                      className="border rounded-md px-3 py-2 text-sm bg-white w-full focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">Last Name</label>
                    <input 
                      type="text" 
                      value={editLastName} 
                      onChange={(e) => setEditLastName(e.target.value)}
                      className="border rounded-md px-3 py-2 text-sm bg-white w-full focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">Email Address</label>
                    <input 
                      type="email" 
                      value={editEmail} 
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="border rounded-md px-3 py-2 text-sm bg-white w-full focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
              ) : (
                /* Standard Display Cards */
                <>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Metadata Profile</h4>
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-white shadow-sm">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex flex-col text-sm">
                      <span className="text-gray-500 text-xs">Full Legal Name</span>
                      <span className="font-medium text-gray-900">
                        {`${selectedContact.first_name || ''} ${selectedContact.last_name || ''}`.trim() || selectedContact.full_name || 'N/A'}
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
                </>
              )}

              {!showDeleteConfirm && (
                <>
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
                </>
              )}
            </div>

            {/* Bottom Form Actions Control Bar */}
            <div className="border-t pt-4 mt-auto flex flex-col gap-2">
              {showDeleteConfirm ? (
                /* Confirmation Input Controls */
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeleteLocal(selectedContact.id)}
                    disabled={confirmInput !== 'CONFIRM'}
                    className={`flex-1 rounded-md text-sm font-medium py-2 px-3 flex items-center justify-center gap-1.5 transition-colors text-white ${
                      confirmInput === 'CONFIRM' 
                        ? 'bg-red-600 hover:bg-red-700 cursor-pointer shadow-sm' 
                        : 'bg-gray-300 cursor-not-allowed text-gray-500'
                    }`}
                  >
                    <Trash2 className="h-4 w-4" /> Confirm & Remove
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setConfirmInput('')
                    }}
                    className="flex-1 border border-gray-300 rounded-md text-sm font-medium py-2 px-3 hover:bg-gray-50 transition-colors text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : isEditing ? (
                /* Editing Mode Controls */
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveLocal}
                    className="flex-1 bg-black text-white rounded-md text-sm font-medium py-2 px-3 flex items-center justify-center gap-1.5 hover:bg-gray-800 transition-colors"
                  >
                    <Check className="h-4 w-4" /> Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 border rounded-md text-sm font-medium py-2 px-3 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                /* Standard State Controls */
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex-1 border border-red-200 rounded-md text-sm font-medium py-2 px-3 flex items-center justify-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 border border-gray-300 rounded-md text-sm font-medium py-2 px-3 flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors text-gray-700"
                  >
                    <Edit3 className="h-4 w-4" /> Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
