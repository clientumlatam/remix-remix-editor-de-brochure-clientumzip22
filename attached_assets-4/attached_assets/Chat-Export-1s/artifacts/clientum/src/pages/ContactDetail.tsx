import { useParams } from "wouter";
import { useGetContact, getGetContactQueryKey } from "@workspace/api-client-react";
import { Loader2, Mail, Building, Calendar, Phone, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityTimeline } from "@/components/ActivityTimeline";

export default function ContactDetail() {
  const params = useParams();
  const id = Number(params.id);
  const { data: contact, isLoading } = useGetContact(id, {
    query: { enabled: !!id, queryKey: getGetContactQueryKey(id) },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!contact) {
    return <div className="text-gray-500 text-sm p-8">Contacto no encontrado.</div>;
  }

  const initials = contact.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header card */}
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{contact.name}</h1>
              <Badge variant={contact.status === "active" ? "default" : "secondary"}>
                {contact.status}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-5 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" /> {contact.email}
              </span>
              {contact.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4" /> {contact.phone}
                </span>
              )}
              {contact.company && (
                <span className="flex items-center gap-1.5">
                  <Building className="w-4 h-4" /> {contact.company}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Desde{" "}
                {new Date(contact.createdAt).toLocaleDateString("es-AR")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">Actividad</TabsTrigger>
          <TabsTrigger value="notes">Notas</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="mt-4">
          <ActivityTimeline
            params={{ contactId: id }}
            newActivityDefaults={{ contactId: id }}
          />
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-gray-400" />
              <h2 className="font-semibold text-gray-800 text-sm">Notas internas</h2>
            </div>
            {contact.notes ? (
              <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">
                {contact.notes}
              </p>
            ) : (
              <p className="text-gray-400 text-sm italic">Sin notas para este contacto.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
