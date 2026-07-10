import { useState } from "react";
import { useListCompanies, useCreateCompany, getListCompaniesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function Companies() {
  const [search, setSearch] = useState("");
  const { data: companies, isLoading } = useListCompanies({ search });
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Companies</h1>
          <p className="text-gray-500 text-sm">Manage organizations and accounts.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search companies..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <CreateCompanyDialog open={isOpen} onOpenChange={setIsOpen} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
              <TableHead>Company Name</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-right">Contacts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                </TableCell>
              </TableRow>
            ) : companies?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-gray-500">
                  No companies found.
                </TableCell>
              </TableRow>
            ) : (
              companies?.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium text-gray-900">{company.name}</TableCell>
                  <TableCell className="text-gray-600">{company.industry || "-"}</TableCell>
                  <TableCell className="text-gray-600">{company.size || "-"}</TableCell>
                  <TableCell className="text-right text-gray-500">{company.contactCount || 0}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CreateCompanyDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const queryClient = useQueryClient();
  const createCompany = useCreateCompany();
  const [formData, setFormData] = useState({ name: "", industry: "", size: "" });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCompany.mutate(
      { data: formData },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCompaniesQueryKey() });
          onOpenChange(false);
          setFormData({ name: "", industry: "", size: "" });
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button><Plus className="w-4 h-4 mr-2" /> Add Company</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Company</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name</Label>
            <Input 
              id="name" 
              required 
              value={formData.name} 
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input 
              id="industry" 
              value={formData.industry} 
              onChange={e => setFormData(p => ({ ...p, industry: e.target.value }))} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="size">Size (e.g. 1-10, 50-200)</Label>
            <Input 
              id="size" 
              value={formData.size} 
              onChange={e => setFormData(p => ({ ...p, size: e.target.value }))} 
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={createCompany.isPending}>
              {createCompany.isPending ? "Saving..." : "Save Company"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
