import { useState } from "react";
import { Link } from "wouter";
import { useListContacts, useCreateContact, getListContactsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function Contacts() {
  const [search, setSearch] = useState("");
  const { data: contacts, isLoading } = useListContacts({ search });
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Contacts</h1>
          <p className="text-gray-500 text-sm">Manage your customers and prospects.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search contacts..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <CreateContactDialog open={isOpen} onOpenChange={setIsOpen} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                </TableCell>
              </TableRow>
            ) : contacts?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                  No contacts found.
                </TableCell>
              </TableRow>
            ) : (
              contacts?.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium text-gray-900">
                    <Link href={`/app/contacts/${contact.id}`} className="hover:underline">
                      {contact.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-600">{contact.company || "-"}</TableCell>
                  <TableCell className="text-gray-600">{contact.email}</TableCell>
                  <TableCell>
                    <Badge variant={contact.status === "active" ? "default" : "secondary"}>
                      {contact.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-gray-500">
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CreateContactDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const queryClient = useQueryClient();
  const createContact = useCreateContact();
  const [formData, setFormData] = useState({ name: "", email: "", company: "" });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createContact.mutate(
      { data: { ...formData, status: "prospect" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListContactsQueryKey() });
          onOpenChange(false);
          setFormData({ name: "", email: "", company: "" });
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button><Plus className="w-4 h-4 mr-2" /> Add Contact</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              required 
              value={formData.name} 
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              required 
              value={formData.email} 
              onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input 
              id="company" 
              value={formData.company} 
              onChange={e => setFormData(p => ({ ...p, company: e.target.value }))} 
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={createContact.isPending}>
              {createContact.isPending ? "Saving..." : "Save Contact"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
