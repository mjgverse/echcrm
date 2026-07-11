import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/_authenticated/portal/contacts')({
  component: ContactsPage,
})

function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    console.log("=== Contacts Page Mounted ===")
    console.log("Supabase client instance:", supabase)
    fetchContacts()
  }, [])

  async function fetchContacts() {
    try {
      console.log("Starting Supabase fetch from 'profiles'...")
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('id', { ascending: true }) // Simplified sort to rule out column name issues

      console.log("Supabase response received:", { data, error })

      if (error) {
        setErrorMessage(error.message)
        throw error
      }
      
      setContacts(data || [])
    } catch (error: any) {
      console.error("Caught fetch error:", error)
      setErrorMessage(error?.message || String(error))
    } finally {
      console.log("Fetch sequence finished. Setting loading to false.")
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contacts (Debug Mode)</h1>
        <p className="text-muted-foreground">Looking for database connection...</p>
      </div>
      
      <div className="border rounded-lg bg-white overflow-hidden shadow-sm p-6">
        {loading && (
          <div className="text-center text-gray-500 animate-pulse">
            Loading contacts... Check your browser console logs!
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm mb-4">
            <strong>Database Error:</strong> {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && (
          <div>
            <p className="text-green-600 font-medium mb-2">Success! Connected to profiles.</p>
            <pre className="bg-gray-50 p-4 rounded border text-xs overflow-auto max-h-60">
              {JSON.stringify(contacts, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
