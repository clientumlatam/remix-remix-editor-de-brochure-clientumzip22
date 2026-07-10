import { useState } from "react";
import { useListInvoices, useCreateInvoice, getListInvoicesQueryKey, InvoiceInputStatus } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Loader2, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Invoices() {
  const { data: invoices, isLoading } = useListInvoices();
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Invoices</h1>
          <p className="text-gray-500 text-sm">Manage billing and payments.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <CreateInvoiceDialog open={isOpen} onOpenChange={setIsOpen} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                </TableCell>
              </TableRow>
            ) : invoices?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="w-10 h-10 text-gray-300 mb-2" />
                    No invoices found.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              invoices?.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium text-gray-900">{invoice.number}</TableCell>
                  <TableCell className="text-gray-600">{invoice.contactName || invoice.companyName || "Unknown Client"}</TableCell>
                  <TableCell>
                    <Badge variant={invoice.status === "paid" ? "default" : invoice.status === "overdue" ? "destructive" : "secondary"}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {invoice.dueDate ? format(new Date(invoice.dueDate), "MMM d, yyyy") : "-"}
                  </TableCell>
                  <TableCell className="text-right font-medium text-gray-900">${invoice.total.toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CreateInvoiceDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const queryClient = useQueryClient();
  const createInvoice = useCreateInvoice();
  
  // Minimal form for demo purposes
  const [formData, setFormData] = useState({ contactId: 0, amount: 0 });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInvoice.mutate(
      { 
        data: { 
          contactId: formData.contactId,
          status: InvoiceInputStatus.draft,
          items: [{ description: "Consulting Services", quantity: 1, unitPrice: formData.amount, total: formData.amount }],
          tax: 0,
        } 
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListInvoicesQueryKey() });
          onOpenChange(false);
          setFormData({ contactId: 0, amount: 0 });
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button><Plus className="w-4 h-4 mr-2" /> New Invoice</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Draft Invoice</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="contactId">Contact ID</Label>
            <Input 
              id="contactId" 
              type="number"
              required 
              value={formData.contactId || ""} 
              onChange={e => setFormData(p => ({ ...p, contactId: Number(e.target.value) }))} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input 
              id="amount" 
              type="number"
              min="0"
              required 
              value={formData.amount || ""} 
              onChange={e => setFormData(p => ({ ...p, amount: Number(e.target.value) }))} 
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={createInvoice.isPending}>
              {createInvoice.isPending ? "Creating..." : "Create Invoice"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
