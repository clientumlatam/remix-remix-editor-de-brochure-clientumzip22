import { useState, useEffect } from "react";
import {
  Plus, Trash2, Pencil, Check, X, ChevronDown, ChevronRight,
  MessageSquare, GitBranch, Zap, Flag, Play, ArrowDown, ToggleLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface Props { token: string }
const API = "/api";
function authHeaders(token: string) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

type NodeType = "trigger" | "message" | "condition" | "action" | "end";

interface FlowNode {
  id: string;
  type: NodeType;
  text?: string;
  condition?: string;
  action?: string;
}

interface Flow {
  id: number;
  name: string;
  description: string;
  triggerKeywords: string;
  nodes: FlowNode[];
  isActive: boolean;
  createdAt: string;
}

const NODE_CONFIG: Record<NodeType, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  trigger: { label: "Trigger", icon: Play, color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
  message: { label: "Mensaje", icon: MessageSquare, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  condition: { label: "Condición", icon: GitBranch, color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
  action: { label: "Acción", icon: Zap, color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
  end: { label: "Fin", icon: Flag, color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" },
};

const ACTION_OPTIONS = [
  { value: "escalate", label: "Escalar a agente humano" },
  { value: "create_lead", label: "Crear lead en CRM" },
  { value: "tag_contact", label: "Etiquetar contacto" },
  { value: "webhook", label: "Llamar webhook externo" },
];

let nodeCounter = 1;
function newNodeId() { return `node_${Date.now()}_${nodeCounter++}`; }

function defaultNode(type: NodeType): FlowNode {
  const base = { id: newNodeId(), type };
  if (type === "trigger") return { ...base, text: "hola, info, precio" };
  if (type === "message") return { ...base, text: "Hola, ¿en qué puedo ayudarte?" };
  if (type === "condition") return { ...base, condition: "¿Querés saber más?" };
  if (type === "action") return { ...base, action: "escalate" };
  return base;
}

/* ─── Node Card ────────────────────────────────────────────── */
function NodeCard({
  node, onEdit, onDelete, isLast
}: { node: FlowNode; onEdit: (id: string, patch: Partial<FlowNode>) => void; onDelete: (id: string) => void; isLast: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(node);
  const cfg = NODE_CONFIG[node.type];
  const Icon = cfg.icon;

  function save() {
    onEdit(node.id, draft);
    setEditing(false);
  }

  return (
    <div className="flex flex-col items-center">
      <div className={cn("w-full max-w-sm border rounded-xl overflow-hidden shadow-sm", cfg.border)}>
        {/* Header */}
        <div className={cn("flex items-center gap-2 px-4 py-2.5", cfg.bg)}>
          <Icon className={cn("w-4 h-4", cfg.color)} />
          <span className={cn("text-xs font-bold uppercase tracking-wide", cfg.color)}>{cfg.label}</span>
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => { setDraft(node); setEditing(!editing); }}
              className="p-1 rounded hover:bg-white/50"
            >
              <Pencil className={cn("w-3 h-3", cfg.color)} />
            </button>
            {node.type !== "trigger" && node.type !== "end" && (
              <button onClick={() => onDelete(node.id)} className="p-1 rounded hover:bg-red-100">
                <Trash2 className="w-3 h-3 text-red-400" />
              </button>
            )}
          </div>
        </div>

        {/* Body — view */}
        {!editing && (
          <div className="px-4 py-3 bg-white text-sm text-gray-700">
            {node.type === "trigger" && (
              <p className="text-xs"><span className="font-medium">Palabras clave:</span> {node.text || "—"}</p>
            )}
            {node.type === "message" && <p className="whitespace-pre-wrap text-sm">{node.text || "—"}</p>}
            {node.type === "condition" && <p className="text-sm">{node.condition || "—"}</p>}
            {node.type === "action" && (
              <p className="text-xs font-medium text-orange-700">
                {ACTION_OPTIONS.find((a) => a.value === node.action)?.label ?? node.action}
              </p>
            )}
            {node.type === "end" && <p className="text-xs text-muted-foreground">El flujo termina aquí</p>}
          </div>
        )}

        {/* Body — edit */}
        {editing && (
          <div className="px-4 py-3 bg-white space-y-2">
            {(node.type === "trigger" || node.type === "message") && (
              <div>
                <Label className="text-xs mb-1">
                  {node.type === "trigger" ? "Palabras clave (separadas por coma)" : "Texto del mensaje"}
                </Label>
                <Textarea
                  value={draft.text ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
                  rows={node.type === "message" ? 3 : 2}
                  className="text-sm"
                />
              </div>
            )}
            {node.type === "condition" && (
              <div>
                <Label className="text-xs mb-1">Pregunta o condición</Label>
                <Input
                  value={draft.condition ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, condition: e.target.value }))}
                  className="text-sm"
                />
              </div>
            )}
            {node.type === "action" && (
              <div>
                <Label className="text-xs mb-1">Acción</Label>
                <select
                  value={draft.action ?? "escalate"}
                  onChange={(e) => setDraft((d) => ({ ...d, action: e.target.value }))}
                  className="w-full text-sm border rounded-md px-3 py-2 bg-white focus:outline-none"
                >
                  {ACTION_OPTIONS.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={save}><Check className="w-3.5 h-3.5 mr-1" /> OK</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}><X className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        )}
      </div>

      {/* Arrow connector */}
      {!isLast && (
        <div className="flex flex-col items-center my-1 text-gray-300">
          <div className="w-px h-4 bg-gray-200" />
          <ArrowDown className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}

/* ─── Add Node Popover ───────────────────────────────────────── */
function AddNodeButton({ onAdd }: { onAdd: (type: NodeType) => void }) {
  const [open, setOpen] = useState(false);
  const types: NodeType[] = ["message", "condition", "action"];

  return (
    <div className="relative flex flex-col items-center my-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full px-3 py-1.5 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Agregar paso
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
      {open && (
        <div className="absolute top-8 z-10 bg-white border rounded-xl shadow-lg p-2 flex gap-2">
          {types.map((type) => {
            const cfg = NODE_CONFIG[type];
            const Icon = cfg.icon;
            return (
              <button
                key={type}
                onClick={() => { onAdd(type); setOpen(false); }}
                className={cn("flex flex-col items-center gap-1 px-4 py-3 rounded-lg hover:bg-gray-50 text-xs font-medium", cfg.color)}
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", cfg.bg)}>
                  <Icon className="w-4 h-4" />
                </div>
                {cfg.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Flow Canvas ────────────────────────────────────────────── */
function FlowCanvas({ flow, onSave, token }: { flow: Flow; onSave: (updated: Flow) => void; token: string }) {
  const [nodes, setNodes] = useState<FlowNode[]>(
    (flow.nodes as FlowNode[]).length > 0
      ? (flow.nodes as FlowNode[])
      : [defaultNode("trigger"), defaultNode("message"), defaultNode("end")]
  );
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  function editNode(id: string, patch: Partial<FlowNode>) {
    setNodes((prev) => prev.map((n) => n.id === id ? { ...n, ...patch } : n));
    setDirty(true);
  }

  function deleteNode(id: string) {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setDirty(true);
  }

  function addNodeBefore(insertBeforeIndex: number, type: NodeType) {
    const newNode = defaultNode(type);
    setNodes((prev) => {
      const arr = [...prev];
      arr.splice(insertBeforeIndex, 0, newNode);
      return arr;
    });
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    try {
      const r = await fetch(`${API}/whatsapp/flows/${flow.id}`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({ nodes }),
      });
      if (r.ok) {
        const updated: Flow = await r.json();
        onSave(updated);
        setDirty(false);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-4 px-6 pt-4">
        <div>
          <p className="text-sm font-semibold">{flow.name}</p>
          <p className="text-xs text-muted-foreground">
            Trigger: <span className="font-mono bg-gray-100 px-1 rounded">{flow.triggerKeywords || "—"}</span>
          </p>
        </div>
        {dirty && (
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? "Guardando..." : "Guardar flujo"}
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="flex flex-col items-center">
          {nodes.map((node, i) => (
            <div key={node.id} className="w-full flex flex-col items-center">
              <NodeCard
                node={node}
                onEdit={editNode}
                onDelete={deleteNode}
                isLast={i === nodes.length - 1}
              />
              {/* Add button between nodes (not after the last "end" node) */}
              {i < nodes.length - 1 && (
                <AddNodeButton onAdd={(type) => addNodeBefore(i + 1, type)} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Tab ───────────────────────────────────────────────── */
export default function FlowBuilderTab({ token }: Props) {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Flow | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTrigger, setNewTrigger] = useState("");
  const [toggling, setToggling] = useState<number | null>(null);

  const headers = authHeaders(token);

  async function load() {
    const r = await fetch(`${API}/whatsapp/flows`, { headers });
    if (r.ok) {
      const data: Flow[] = await r.json();
      setFlows(data);
      if (!selected && data.length > 0) setSelected(data[0]!);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function createFlow() {
    if (!newName.trim()) return;
    const r = await fetch(`${API}/whatsapp/flows`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: newName,
        triggerKeywords: newTrigger,
        nodes: [],
      }),
    });
    if (r.ok) {
      const created: Flow = await r.json();
      setFlows((prev) => [...prev, created]);
      setSelected(created);
      setCreating(false);
      setNewName("");
      setNewTrigger("");
    }
  }

  async function toggleActive(flow: Flow) {
    setToggling(flow.id);
    const r = await fetch(`${API}/whatsapp/flows/${flow.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ isActive: !flow.isActive }),
    });
    if (r.ok) {
      const updated: Flow = await r.json();
      setFlows((prev) => prev.map((f) => f.id === updated.id ? updated : f));
      if (selected?.id === updated.id) setSelected(updated);
    }
    setToggling(null);
  }

  async function deleteFlow(id: number) {
    await fetch(`${API}/whatsapp/flows/${id}`, { method: "DELETE", headers });
    setFlows((prev) => prev.filter((f) => f.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">Cargando...</div>;

  return (
    <div className="flex gap-0 border rounded-xl overflow-hidden bg-white shadow-sm" style={{ height: "calc(100vh - 16rem)", minHeight: "480px" }}>
      {/* Left: flows list */}
      <div className="w-64 border-r flex flex-col flex-shrink-0">
        <div className="p-3 border-b flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Flujos</p>
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setCreating(true)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {creating && (
          <div className="p-3 border-b bg-blue-50 space-y-2">
            <Input
              autoFocus
              placeholder="Nombre del flujo"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="h-8 text-sm"
            />
            <Input
              placeholder="Trigger (palabras clave)"
              value={newTrigger}
              onChange={(e) => setNewTrigger(e.target.value)}
              className="h-8 text-sm"
            />
            <div className="flex gap-1">
              <Button size="sm" className="h-7 text-xs" onClick={createFlow} disabled={!newName.trim()}>
                Crear
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setCreating(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {flows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-xs text-center px-4">
              <GitBranch className="w-8 h-8 mb-2 opacity-20" />
              <p>Sin flujos todavía</p>
              <p className="mt-1 text-[10px]">Creá un flujo para automatizar respuestas</p>
            </div>
          ) : (
            flows.map((flow) => (
              <button
                key={flow.id}
                onClick={() => setSelected(flow)}
                className={cn(
                  "w-full text-left px-3 py-3 border-b hover:bg-gray-50 transition-colors",
                  selected?.id === flow.id && "bg-blue-50"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-gray-800 truncate">{flow.name}</p>
                  <Badge
                    className={cn(
                      "text-[10px] flex-shrink-0",
                      flow.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    )}
                  >
                    {flow.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                {flow.triggerKeywords && (
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate font-mono">{flow.triggerKeywords}</p>
                )}
              </button>
            ))
          )}
        </div>

        {/* Flow actions for selected */}
        {selected && (
          <div className="p-3 border-t bg-gray-50 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">
                {selected.isActive ? "Flujo activo" : "Activar flujo"}
              </Label>
              <Switch
                checked={selected.isActive}
                disabled={toggling === selected.id}
                onCheckedChange={() => toggleActive(selected)}
              />
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="w-full h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => deleteFlow(selected.id)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Eliminar flujo
            </Button>
          </div>
        )}
      </div>

      {/* Right: flow canvas */}
      {selected ? (
        <FlowCanvas
          key={selected.id}
          flow={selected}
          token={token}
          onSave={(updated) => {
            setFlows((prev) => prev.map((f) => f.id === updated.id ? updated : f));
            setSelected(updated);
          }}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Seleccioná o creá un flujo</p>
          </div>
        </div>
      )}
    </div>
  );
}
