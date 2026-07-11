import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/portal/contacts')({
  component: ContactsPage,
})

function ContactsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
        <p className="text-muted-foreground">
          Directory of all registered members.
        </p>
      </div>
      
      {/* We will build the data table and search here in the next steps */}
      <div className="border rounded-lg p-8 text-center text-muted-foreground bg-white">
        Loading contacts...
      </div>
    </div>
  )
}
