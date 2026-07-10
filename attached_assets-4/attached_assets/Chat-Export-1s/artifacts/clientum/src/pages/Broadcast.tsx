import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Send, Users, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Contact {
  phone: string;
  contactName: string | null;
  lastMessageAt: string;
}

export default function Broadcast() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const { data, isLoading } = useQuery({
    queryKey: ["broadcast-contacts"],
    queryFn: async () => {
      const r = await fetch("/api/broadcast/contacts", { headers });
      return r.json() as Promise<{ contacts: Contact[] }>;
    },
  });

  const contacts = data?.contacts ?? [];

  const toggleAll = () => {
    if (selected.size === contacts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(contacts.map(c => c.phone)));
    }
  };

  const toggleOne = (phone: string) => {
    const next = new Set(selected);
    if (next.has(phone)) next.delete(phone); else next.add(phone);
    setSelected(next);
  };

  const sendMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/broadcast/send", {
        method: "POST", headers,
        body: JSON.stringify({ message, phones: Array.from(selected) }),
      });
      if (!r.ok) throw new Error((await r.json()).error ?? "No se pudo enviar el broadcast.");
      return r.json() as Promise<{ sent: number; failed: number }>;
    },
    onSuccess: (data) => {
      setResult(data);
      toast({ title: `Broadcast completado: ${data.sent} enviados, ${data.failed} fallidos` });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Broadcast WhatsApp</h1>
        <p className="text-muted-foreground">Enviá mensajes masivos a contactos de WhatsApp</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Mensaje</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Escribí tu mensaje aquí..."
              rows={6}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="resize-none"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{selected.size} contacto{selected.size !== 1 ? "s" : ""} seleccionado{selected.size !== 1 ? "s" : ""}</span>
              <span>{message.length} caracteres</span>
            </div>
            <Button
              className="w-full"
              onClick={() => sendMutation.mutate()}
              disabled={sendMutation.isPending || !message.trim() || selected.size === 0}
            >
              {sendMutation.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Enviando...</>
                : <><Send className="w-4 h-4 mr-2" />Enviar broadcast</>
              }
            </Button>
            {result && (
              <div className="flex items-center gap-2 text-sm p-3 bg-green-50 rounded-md text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>{result.sent} mensajes enviados · {result.failed} fallidos</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4" />Contactos WhatsApp</CardTitle>
              <Button variant="ghost" size="sm" onClick={toggleAll} className="text-xs h-7">
                {selected.size === contacts.length ? "Ninguno" : "Todos"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" /></div>
            ) : contacts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">No hay contactos de WhatsApp aún</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {contacts.map(contact => (
                  <div
                    key={contact.phone}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleOne(contact.phone)}
                  >
                    <Checkbox checked={selected.has(contact.phone)} onCheckedChange={() => toggleOne(contact.phone)} />
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-700 flex-shrink-0">
                      {(contact.contactName ?? contact.phone).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{contact.contactName || contact.phone}</p>
                      {contact.contactName && <p className="text-xs text-muted-foreground">{contact.phone}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
