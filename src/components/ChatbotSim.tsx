import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, RefreshCw, User, MessageSquare, Download, Github, ExternalLink } from "lucide-react";
import { BrochureData } from "../types";

interface ChatbotSimProps {
  brochureData: BrochureData;
}

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
}

export default function ChatbotSim({ brochureData }: ChatbotSimProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "assistant",
      text: "¡Hola! Che, qué bueno que estés por acá. Soy tu asesor comercial virtual de Clientum 2026. Estoy listo para responderte cualquier duda sobre cómo automatizar tu negocio o sobre la propuesta que armamos en este brochure. ¿En qué te puedo dar una mano hoy?",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "¿Cómo funciona el bot de WhatsApp?",
    "¿Qué ventajas tiene el CRM de Clientum?",
    "¿Se puede integrar con la AFIP?",
    "¿Cuáles son los costos estimativos?",
  ];

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: "u-" + Date.now(),
      sender: "user",
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chatbotAnswer",
          payload: {
            brochureData,
            message: textToSend,
            history,
          },
        }),
      });

      const resData = await response.json();
      if (resData.error) throw new Error(resData.error);

      setMessages((prev) => [
        ...prev,
        {
          id: "a-" + Date.now(),
          sender: "assistant",
          text: resData.result || "Disculpame, se me complicó la conexión. ¿Podrías volver a preguntarme?",
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          sender: "assistant",
          text: "Che, disculpame pero tuvimos un problema al conectar con el servidor de Gemini. Verificá tu conexión y probá de nuevo, dale?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const [showExportSuccess, setShowExportSuccess] = useState(false);

  const handleExportChat = () => {
    try {
      const header = `========= EXPORTACIÓN DE CONVERSACIÓN CLIENTUM =========\nFecha: ${new Date().toLocaleDateString("es-AR")}\nAsesor: Asesor Comercial Virtual Clientum\n========================================================\n\n`;
      const body = messages
        .map((m) => {
          const roleName = m.sender === "user" ? "Cliente" : "Asesor Clientum";
          return `[${roleName}]: ${m.text}`;
        })
        .join("\n\n");
      const footer = `\n\n========================================================\nExportado exitosamente usando Chat-Export por Clientum Latam.\nGitHub: https://github.com/clientumlatam/Chat-Export\n========================================================`;
      
      const fileContent = header + body + footer;
      const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `clientum-chat-export-${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setShowExportSuccess(true);
      setTimeout(() => setShowExportSuccess(false), 8000);
    } catch (err) {
      console.error("Error al exportar chat:", err);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const handleResetChat = () => {
    if (confirm("¿Querés reiniciar el chat con el asesor comercial?")) {
      setMessages([
        {
          id: "init",
          sender: "assistant",
          text: "¡Hola de nuevo! Soy tu asesor comercial virtual de Clientum 2026. Preguntame lo que quieras sobre el brochure o cómo podemos automatizar tu operatoria comercial.",
        },
      ]);
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg flex flex-col h-[400px] text-left no-print">
      {/* Chat Header */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
            <Bot className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1">
              Asesor Comercial Clientum
              <Sparkles className="w-3 h-3 text-amber-400" />
            </h4>
            <span className="text-[9px] text-emerald-400 font-mono font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              DEMO EN VIVO • VOSEO ARG
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportChat}
            className="text-slate-400 hover:text-emerald-400 p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-bold bg-slate-900 border border-slate-800 hover:border-emerald-900 px-2.5"
            title="Exportar conversación"
          >
            <Download className="w-3 h-3 text-emerald-400" />
            <span>Chat-Export</span>
          </button>
          <button
            onClick={handleResetChat}
            className="text-slate-500 hover:text-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer"
            title="Reiniciar chat"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-slate-800">
        {showExportSuccess && (
          <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-xl p-3 text-xs text-emerald-100 flex flex-col gap-1.5 shrink-0">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                ✓ ¡Conversación exportada con éxito!
              </span>
              <button onClick={() => setShowExportSuccess(false)} className="text-emerald-500 hover:text-emerald-300 text-[10px] font-bold">Cerrar</button>
            </div>
            <p className="text-[10px] leading-relaxed text-emerald-300">
              La conversación completa se descargó en tu equipo. Este proyecto utiliza la solución <strong className="text-emerald-200 font-semibold">Chat-Export</strong> para exportar chats de forma rápida y compatible con cualquier CRM.
            </p>
            <a 
              href="https://github.com/clientumlatam/Chat-Export" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 hover:underline font-mono self-start mt-0.5"
            >
              <Github className="w-3.5 h-3.5" />
              <span>clientumlatam/Chat-Export</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 max-w-[85%] ${
              msg.sender === "user" ? "self-end flex-row-reverse" : "self-start"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${
                msg.sender === "user" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300"
              }`}
            >
              {msg.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div
              className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/40"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 max-w-[85%] self-start">
            <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 animate-spin text-blue-400" />
            </div>
            <div className="bg-slate-800 text-slate-400 rounded-xl px-3 py-2 text-xs rounded-tl-none border border-slate-700/40 animate-pulse">
              El asesor comercial está escribiendo...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      <div className="px-3 pb-2 pt-1 border-t border-slate-850 bg-slate-950/20">
        <p className="text-[10px] text-slate-500 mb-1.5 font-semibold">Preguntas rápidas de muestra:</p>
        <div className="flex flex-wrap gap-1">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={loading}
              className="text-[9px] bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-750 hover:border-slate-700 rounded-full py-1 px-2.5 transition-colors text-left disabled:opacity-50 cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleFormSubmit} className="p-2 border-t border-slate-800 bg-slate-950/40 flex gap-1.5">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Preguntale lo que quieras al asesor..."
          disabled={loading}
          className="flex-1 bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
