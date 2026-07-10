import React from 'react';
import { Bot, MessageCircle, Zap, ExternalLink, CheckCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const steps = [
  { num: 1, title: 'Conectar WhatsApp Business', desc: 'Escaneá el código QR desde la configuración del agente para vincular tu número de WhatsApp Business.', done: false },
  { num: 2, title: 'Probar el bot', desc: 'Enviá un mensaje al número vinculado para verificar que el bot responda correctamente.', done: false },
  { num: 3, title: 'Ajustar respuestas', desc: 'Revisá las instrucciones del agente y personalizá las respuestas según tus necesidades.', done: false },
  { num: 4, title: 'Activar en producción', desc: 'Una vez validado el bot, activalo para tus clientes reales.', done: false },
];

const menuItems = [
  { key: '1', icon: '💰', label: 'Consultar precios', desc: 'Busca por nombre o código en el catálogo' },
  { key: '2', icon: '🕐', label: 'Ver horarios', desc: 'Horarios de cada sucursal' },
  { key: '3', icon: '📍', label: 'Ubicar sucursal', desc: 'Dirección y teléfono de las 4 sucursales' },
  { key: '4', icon: '👤', label: 'Hablar con vendedor', desc: 'Derivación inteligente por especialidad' },
  { key: '5', icon: '❓', label: 'Otra consulta', desc: 'Asistencia general' },
];

const derivationRules = [
  { trigger: 'Caños, accesorios PP/SIGAS, válvulas', specialist: '🔧 Plomería' },
  { trigger: 'Cables, enchufes, térmicas, llaves de luz', specialist: '⚡ Electricidad' },
  { trigger: 'Pinturas, aerosoles, rodillos, barniz', specialist: '🎨 Pintura' },
  { trigger: 'Cemento, ladrillos, hierros, mallas', specialist: '🏗️ Construcción' },
  { trigger: 'Cerámicos, porcellanatos', specialist: '🪟 Cerámicos' },
  { trigger: 'Herramientas manuales y eléctricas', specialist: '🛠️ Herramientas' },
  { trigger: 'Consultas generales', specialist: '📋 General' },
];

export default function CrmFullBotConfig() {
  const whatsappURL = 'https://wa.me/5492994510883';

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Bot WhatsApp</h1>
          <p className="text-muted-foreground">Configuración y estado del asistente virtual GAMAN</p>
        </div>
        <a href={whatsappURL} target="_blank" rel="noopener noreferrer">
          <Button className="bg-[#25D366] hover:bg-[#1ebe5d] text-white shadow-md">
            <MessageCircle className="w-4 h-4 mr-2" />
            Conectar WhatsApp
            <ExternalLink className="w-3 h-3 ml-2 opacity-70" />
          </Button>
        </a>
      </div>

      <Card className="border-0 bg-gradient-to-r from-green-50 to-emerald-50 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Bot className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground">Asistente Virtual GAMAN</h3>
                <div className="flex items-center gap-1.5 bg-green-100 px-2.5 py-0.5 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium text-green-700">Activo 24/7</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Bot configurado para GAMAN Ferretería y Corralón · Neuquén Capital · 4 Sucursales
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Menú Interactivo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {menuItems.map(item => (
              <div key={item.key} className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                  {item.key}
                </div>
                <div>
                  <p className="text-sm font-medium">{item.icon} {item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Derivación Inteligente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {derivationRules.map((rule, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{rule.trigger}</p>
                </div>
                <Badge className="bg-primary/10 text-primary border-0 text-xs whitespace-nowrap">
                  {rule.specialist}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Pasos de Configuración
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.num} className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${step.done ? 'bg-green-500 text-white' : 'bg-primary/10 text-primary'}`}>
                  {step.done ? <CheckCircle className="w-4 h-4" /> : step.num}
                </div>
                <div>
                  <p className="font-medium text-sm">{step.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-800 font-medium mb-1">💡 Tip de configuración</p>
            <p className="text-xs text-blue-700">
              Hacé clic en "Conectar WhatsApp" para vincular el número de WhatsApp Business de GAMAN.
              Una vez conectado, el bot responderá automáticamente a todos los mensajes entrantes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
