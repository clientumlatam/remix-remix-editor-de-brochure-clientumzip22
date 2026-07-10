import { useState, useRef, useEffect } from "react";
import { useListOpenrouterConversations, useCreateOpenrouterConversation, useGetOpenrouterConversation, useDeleteOpenrouterConversation, getGetOpenrouterConversationQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Plus, Send, Trash2, Bot, User, Loader2, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

function getApiBase() {
  const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
  return base;
}

export default function AiChat() {
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const qc = useQueryClient();
  const { token } = useAuth();

  const { data: conversations = [] } = useListOpenrouterConversations();
  const { data: activeConv } = useGetOpenrouterConversation(
    activeConvId!,
    { query: { enabled: activeConvId !== null, refetchOnWindowFocus: false, queryKey: getGetOpenrouterConversationQueryKey(activeConvId!) } }
  );
  const createConv = useCreateOpenrouterConversation();
  const deleteConv = useDeleteOpenrouterConversation();

  useEffect(() => {
    if (activeConv?.messages) {
      setLocalMessages(activeConv.messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content })));
    }
  }, [activeConv?.id, activeConv?.messages?.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  async function handleNewConversation() {
    const title = newTitle.trim() || "Nueva conversación";
    try {
      const conv = await createConv.mutateAsync({ data: { title } });
      qc.invalidateQueries({ queryKey: ["/api/openrouter/conversations"] });
      setActiveConvId(conv.id);
      setLocalMessages([]);
      setNewTitle("");
    } catch {
      toast({ title: "Error al crear conversación", variant: "destructive" });
    }
  }

  async function handleDeleteConv(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await deleteConv.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: ["/api/openrouter/conversations"] });
      if (activeConvId === id) { setActiveConvId(null); setLocalMessages([]); }
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" });
    }
  }

  async function handleSend() {
    if (!input.trim() || !activeConvId || streaming) return;
    const content = input.trim();
    setInput("");
    setLocalMessages(prev => [...prev, { role: "user", content }]);
    setStreaming(true);

    const assistantIdx = localMessages.length + 1;
    setLocalMessages(prev => [...prev, { role: "assistant", content: "", streaming: true }]);

    try {
      const base = getApiBase();
      const res = await fetch(`${base}/api/openrouter/conversations/${activeConvId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!res.ok || !res.body) throw new Error("API error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.content) {
              full += parsed.content;
              setLocalMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.streaming) updated[updated.length - 1] = { ...last, content: full };
                return updated;
              });
            }
            if (parsed.error) {
              full = `❌ ${parsed.error}`;
              setLocalMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.streaming) updated[updated.length - 1] = { ...last, content: full };
                return updated;
              });
              streamDone = true;
              break;
            }
            if (parsed.done) { streamDone = true; break; }
          } catch { /* skip */ }
        }
      }

      setLocalMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.streaming) updated[updated.length - 1] = { ...last, streaming: false };
        return updated;
      });
      qc.invalidateQueries({ queryKey: ["/api/openrouter/conversations", activeConvId] });
    } catch (err) {
      setLocalMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.streaming) updated[updated.length - 1] = { role: "assistant", content: "❌ Error al obtener respuesta." };
        return updated;
      });
      toast({ title: "Error de conexión con IA", variant: "destructive" });
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Bot className="w-4 h-4 text-blue-600" />
            Asistente IA
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Powered by OpenRouter</p>
        </div>

        <div className="p-3 border-b border-gray-200">
          <div className="flex gap-2">
            <Input
              placeholder="Nombre..."
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="text-xs h-8"
              onKeyDown={e => e.key === "Enter" && handleNewConversation()}
            />
            <Button size="sm" className="h-8 px-2 shrink-0" onClick={handleNewConversation}>
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Sin conversaciones</p>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => { setActiveConvId(conv.id); setLocalMessages([]); }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm group",
                    activeConvId === conv.id
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
                  <span className="flex-1 truncate text-xs">{conv.title}</span>
                  <button
                    onClick={e => handleDeleteConv(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {!activeConvId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">Asistente CRM con IA</h3>
            <p className="text-gray-500 text-sm mt-2 max-w-sm">
              Creá una conversación y preguntame sobre gestión de clientes, propuestas, seguimiento de leads o cualquier cosa de tu negocio.
            </p>
            <Button onClick={handleNewConversation} className="mt-6 gap-2">
              <Plus className="w-4 h-4" />
              Nueva conversación
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {localMessages.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">
                  Escribí un mensaje para comenzar...
                </div>
              )}
              {localMessages.map((msg, i) => (
                <div key={i} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-900 rounded-bl-sm"
                  )}>
                    {msg.content || (msg.streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : "")}
                    {msg.streaming && msg.content && (
                      <span className="inline-block w-1 h-4 ml-0.5 bg-gray-400 animate-pulse align-middle" />
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Escribí tu mensaje... (Enter para enviar, Shift+Enter para nueva línea)"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="resize-none text-sm min-h-[44px] max-h-32"
                  rows={1}
                  disabled={streaming}
                />
                <Button onClick={handleSend} disabled={!input.trim() || streaming} className="self-end">
                  {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
