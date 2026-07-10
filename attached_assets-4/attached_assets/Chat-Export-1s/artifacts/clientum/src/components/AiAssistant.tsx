import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Loader2, Minimize2, Maximize2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  time: string;
}

const SUGGESTIONS = [
  "¿Cuántos leads tengo este mes?",
  "Resumen del pipeline de deals",
  "¿Qué actividades hay pendientes?",
  "Mostrar contactos recientes",
];

function now() {
  return new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

async function callAI(messages: { role: string; content: string }[], token: string | null): Promise<string> {
  try {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) throw new Error("AI unavailable");
    const data = await res.json();
    return data.reply ?? "No pude generar una respuesta.";
  } catch {
    return generateLocalReply(messages[messages.length - 1]?.content ?? "");
  }
}

function generateLocalReply(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("lead")) return "Para ver tus leads, andá a la sección **Leads** en el menú. Podés ver el pipeline Kanban con todos los estados: Nuevo, Contactado, Calificado, Propuesta, Negociación, Ganado y Perdido.";
  if (q.includes("deal") || q.includes("negocio")) return "En la sección **Deals** podés ver todas tus oportunidades de negocio con su valor estimado y probabilidad de cierre. El pipeline muestra el valor ponderado total.";
  if (q.includes("contacto") || q.includes("cliente")) return "En **Contactos** tenés el directorio completo con filtros por estado (activo, inactivo, prospecto). Podés buscar por nombre, email o empresa.";
  if (q.includes("factura")) return "Las **Facturas** se gestionan en esa sección. Podés crear, enviar y marcar como pagadas. Próximamente integración con AFIP para factura electrónica.";
  if (q.includes("whatsapp")) return "El módulo de **WhatsApp** te permite ver y responder mensajes de clientes desde un solo lugar. Para conectarlo necesitás configurar Evolution API o la API Oficial de Meta.";
  if (q.includes("actividad") || q.includes("tarea")) return "En **Actividades** registrás llamadas, emails, reuniones y tareas. Podés filtrar por contacto o deal y marcar como completadas.";
  if (q.includes("hola") || q.includes("buenas")) return "¡Hola! Soy el asistente de Clientum. Puedo ayudarte a navegar el CRM, responder preguntas sobre tus datos y guiarte con las funcionalidades. ¿En qué te ayudo?";
  return "Podés preguntarme sobre leads, deals, contactos, facturas, actividades o WhatsApp. También puedo guiarte en cómo usar cualquier parte de Clientum.";
}

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "¡Hola! Soy el asistente de Clientum. Puedo ayudarte a gestionar tu CRM, responder preguntas sobre tus datos y guiarte. ¿En qué te puedo ayudar?",
      time: now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { token } = useAuth();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text?: string) {
    const content = text ?? input;
    if (!content.trim() || loading) return;
    setInput("");

    const userMsg: Message = { id: Date.now(), role: "user", content, time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
    const reply = await callAI(history, token);

    setMessages((prev) => [
      ...prev,
      { id: Date.now() + 1, role: "assistant", content: reply, time: now() },
    ]);
    setLoading(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
        style={{ background: "#1A3461" }}
        aria-label="Abrir asistente IA"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border flex flex-col z-50 transition-all",
        minimized ? "w-72 h-14" : "w-80 sm:w-96 h-[520px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b text-white rounded-t-2xl flex-shrink-0" style={{ background: "#1A3461" }}>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <Bot className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">Asistente Clientum</p>
          {!minimized && <p className="text-xs text-blue-200">IA integrada</p>}
        </div>
        <button onClick={() => setMinimized((v) => !v)} className="p-1 hover:bg-white/20 rounded">
          {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
        </button>
        <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/20 rounded">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-900 rounded-bl-sm"
                  )}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content.replace(/\*\*/g, "")}</p>
                  <p className={cn("text-[10px] mt-1", msg.role === "user" ? "text-blue-200 text-right" : "text-gray-400")}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-center">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t flex gap-2 flex-shrink-0">
            <Input
              placeholder="Preguntame algo..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              className="flex-1 h-9 text-sm"
            />
            <Button onClick={() => send()} disabled={!input.trim() || loading} size="icon" className="h-9 w-9 flex-shrink-0">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
