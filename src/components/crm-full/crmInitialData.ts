import { Conversation, Seller, Branch, Product } from './crmTypes';

export const initialConversations: Conversation[] = [
  { id: 'c1', customer_name: 'Ana García', customer_phone: '+54 299 555-1001', status: 'activa', query_type: 'Consulta de producto', channel: 'WhatsApp', summary: 'Consulta sobre precios de cerámicos para baño.', assigned_seller: 'Luciana Martínez', assigned_branch: 'Casa Central', budget_generated: false, budget_approved: false, visit_scheduled: false, created_date: '2024-07-01' },
  { id: 'c2', customer_name: 'Roberto Paz', customer_phone: '+54 299 555-2002', status: 'derivada', query_type: 'Presupuesto', channel: 'WhatsApp', summary: 'Presupuesto para instalación eléctrica completa.', assigned_seller: 'Carlos Rodríguez', assigned_branch: 'Sucursal Norte', budget_generated: true, budget_approved: false, visit_scheduled: true, visit_date: '2024-07-10', created_date: '2024-07-02' },
  { id: 'c3', customer_name: 'Marcela Torres', customer_phone: '+54 299 555-3003', status: 'resuelta', query_type: 'Reclamo', channel: 'WhatsApp', summary: 'Reclamo por rotura de caño PP en entrega.', assigned_seller: 'Diego Fernández', assigned_branch: 'Sucursal Sur', budget_generated: false, budget_approved: false, visit_scheduled: false, created_date: '2024-07-03' },
  { id: 'c4', customer_name: 'Juan Herrera', customer_phone: '+54 299 555-4004', status: 'activa', query_type: 'Consulta de stock', channel: 'WhatsApp', summary: 'Disponibilidad de porcellanato 60x60.', assigned_seller: 'Valeria López', assigned_branch: 'Sucursal Este', budget_generated: false, budget_approved: false, visit_scheduled: false, created_date: '2024-07-04' },
  { id: 'c5', customer_name: 'Sofía Ruiz', customer_phone: '+54 299 555-5005', status: 'cerrada', query_type: 'Presupuesto', channel: 'WhatsApp', summary: 'Presupuesto de pintura exterior aprobado y ejecutado.', assigned_seller: 'Marcelo Giménez', assigned_branch: 'Casa Central', budget_generated: true, budget_approved: true, visit_scheduled: true, visit_date: '2024-06-28', created_date: '2024-06-25' },
];

export const initialSellers: Seller[] = [
  { id: '1', name: 'Carlos Rodríguez', phone: '+54 299 415-2234', email: 'carlos@gaman.com.ar', specialty: 'plomeria', branch: 'Casa Central', active: true },
  { id: '2', name: 'Luciana Martínez', phone: '+54 299 423-9871', email: 'luciana@gaman.com.ar', specialty: 'electricidad', branch: 'Sucursal Norte', active: true },
  { id: '3', name: 'Diego Fernández', phone: '+54 299 437-1102', email: 'diego@gaman.com.ar', specialty: 'construccion', branch: 'Casa Central', active: true },
  { id: '4', name: 'Valeria López', phone: '+54 299 441-5567', email: 'valeria@gaman.com.ar', specialty: 'pintura', branch: 'Sucursal Sur', active: true },
  { id: '5', name: 'Marcelo Giménez', phone: '+54 299 452-8890', email: 'marcelo@gaman.com.ar', specialty: 'ceramicos', branch: 'Sucursal Este', active: true },
  { id: '6', name: 'Paula Herrera', phone: '+54 299 461-3341', email: 'paula@gaman.com.ar', specialty: 'herramientas', branch: 'Casa Central', active: false },
];

export const initialBranches: Branch[] = [
  { id: '1', name: 'Casa Central', address: 'Av. San Martín 1250', city: 'Neuquén Capital', phone: '+54 299 442-0001', schedule: 'Lun-Vie 8:00-18:00 | Sáb 8:00-13:00', active: true },
  { id: '2', name: 'Sucursal Norte', address: 'Ruta 22 Km 1203', city: 'Neuquén Capital', phone: '+54 299 442-0002', schedule: 'Lun-Vie 8:00-17:00 | Sáb 8:00-12:00', active: true },
  { id: '3', name: 'Sucursal Sur', address: 'Av. Argentina 890', city: 'Neuquén Capital', phone: '+54 299 442-0003', schedule: 'Lun-Vie 8:00-18:00 | Sáb 8:00-13:00', active: true },
  { id: '4', name: 'Sucursal Este', address: 'Calle Cañadón Seco 340', city: 'Neuquén Capital', phone: '+54 299 442-0004', schedule: 'Lun-Vie 9:00-18:00 | Sáb 9:00-13:00', active: true },
];

/**
 * Catálogo completo GAMAN — Ferretería, Corralón & Servicios técnicos.
 * Organizado en Categoría > Subcategoría para la vista "planilla" (sheet) del CRM.
 */
export const initialProducts: Product[] = [
  // ===================== PLOMERÍA =====================
  { id: 'p1', code: 'PLO-CAN-001', name: 'Caño PP Roscado 1/2" x 1m', price: 1850, active: true, category: 'Plomería', subcategory: 'Caños y Conexiones', unit: 'un' },
  { id: 'p2', code: 'PLO-CAN-002', name: 'Caño PP Roscado 3/4" x 1m', price: 2300, active: true, category: 'Plomería', subcategory: 'Caños y Conexiones', unit: 'un' },
  { id: 'p3', code: 'PLO-CAN-003', name: 'Caño PVC Desagüe 110mm x 3m', price: 6900, active: true, category: 'Plomería', subcategory: 'Caños y Conexiones', unit: 'un' },
  { id: 'p4', code: 'PLO-CAN-004', name: 'Codo PP 90° 1/2"', price: 480, active: true, category: 'Plomería', subcategory: 'Caños y Conexiones', unit: 'un' },
  { id: 'p5', code: 'PLO-CAN-005', name: 'Te PP 1/2"', price: 620, active: true, category: 'Plomería', subcategory: 'Caños y Conexiones', unit: 'un' },
  { id: 'p6', code: 'PLO-CAN-006', name: 'Flexible acero inoxidable 30cm', price: 1100, active: true, category: 'Plomería', subcategory: 'Caños y Conexiones', unit: 'un' },
  { id: 'p7', code: 'PLO-GRI-001', name: 'Canilla de paso 1/2" cromada', price: 3200, active: true, category: 'Plomería', subcategory: 'Grifería', unit: 'un' },
  { id: 'p8', code: 'PLO-GRI-002', name: 'Monocomando para cocina', price: 24500, active: true, category: 'Plomería', subcategory: 'Grifería', unit: 'un' },
  { id: 'p9', code: 'PLO-GRI-003', name: 'Mezcladora para ducha', price: 18900, active: true, category: 'Plomería', subcategory: 'Grifería', unit: 'un' },
  { id: 'p10', code: 'PLO-GRI-004', name: 'Canilla de jardín 3/4"', price: 2100, active: true, category: 'Plomería', subcategory: 'Grifería', unit: 'un' },
  { id: 'p11', code: 'PLO-SAN-001', name: 'Inodoro completo con mochila', price: 68000, active: true, category: 'Plomería', subcategory: 'Sanitarios', unit: 'un' },
  { id: 'p12', code: 'PLO-SAN-002', name: 'Bidet línea estándar', price: 41000, active: true, category: 'Plomería', subcategory: 'Sanitarios', unit: 'un' },
  { id: 'p13', code: 'PLO-SAN-003', name: 'Pileta de cocina bacha simple', price: 32500, active: true, category: 'Plomería', subcategory: 'Sanitarios', unit: 'un' },
  { id: 'p14', code: 'PLO-BOM-001', name: 'Bomba presurizadora 0.5HP', price: 89000, active: true, category: 'Plomería', subcategory: 'Bombas y Tanques', unit: 'un' },
  { id: 'p15', code: 'PLO-BOM-002', name: 'Tanque de agua 500L', price: 76000, active: true, category: 'Plomería', subcategory: 'Bombas y Tanques', unit: 'un' },
  { id: 'p16', code: 'PLO-BOM-003', name: 'Termotanque eléctrico 80L', price: 112000, active: true, category: 'Plomería', subcategory: 'Bombas y Tanques', unit: 'un' },

  // ===================== ELECTRICIDAD =====================
  { id: 'p17', code: 'ELE-CAB-001', name: 'Cable unipolar 2.5mm x 100m', price: 18500, active: true, category: 'Electricidad', subcategory: 'Cables y Conductores', unit: 'rollo' },
  { id: 'p18', code: 'ELE-CAB-002', name: 'Cable unipolar 4mm x 100m', price: 27800, active: true, category: 'Electricidad', subcategory: 'Cables y Conductores', unit: 'rollo' },
  { id: 'p19', code: 'ELE-CAB-003', name: 'Cable bipolar tipo taller 2x1.5mm x 100m', price: 21200, active: true, category: 'Electricidad', subcategory: 'Cables y Conductores', unit: 'rollo' },
  { id: 'p20', code: 'ELE-CAB-004', name: 'Cañería corrugada 3/4" x 25m', price: 9800, active: true, category: 'Electricidad', subcategory: 'Cables y Conductores', unit: 'rollo' },
  { id: 'p21', code: 'ELE-TER-001', name: 'Disyuntor bipolar 32A', price: 4200, active: true, category: 'Electricidad', subcategory: 'Térmicas y Protecciones', unit: 'un' },
  { id: 'p22', code: 'ELE-TER-002', name: 'Térmica bipolar 25A curva C', price: 3600, active: true, category: 'Electricidad', subcategory: 'Térmicas y Protecciones', unit: 'un' },
  { id: 'p23', code: 'ELE-TER-003', name: 'Tablero eléctrico 12 bocas', price: 8900, active: true, category: 'Electricidad', subcategory: 'Térmicas y Protecciones', unit: 'un' },
  { id: 'p24', code: 'ELE-TER-004', name: 'Protector de tensión 3 tomas', price: 5400, active: true, category: 'Electricidad', subcategory: 'Térmicas y Protecciones', unit: 'un' },
  { id: 'p25', code: 'ELE-ILU-001', name: 'Panel LED redondo 18W', price: 3100, active: true, category: 'Electricidad', subcategory: 'Iluminación', unit: 'un' },
  { id: 'p26', code: 'ELE-ILU-002', name: 'Tubo LED 120cm 20W', price: 3800, active: true, category: 'Electricidad', subcategory: 'Iluminación', unit: 'un' },
  { id: 'p27', code: 'ELE-ILU-003', name: 'Reflector LED exterior 50W', price: 9200, active: true, category: 'Electricidad', subcategory: 'Iluminación', unit: 'un' },
  { id: 'p28', code: 'ELE-ILU-004', name: 'Lámpara de emergencia LED', price: 6700, active: true, category: 'Electricidad', subcategory: 'Iluminación', unit: 'un' },
  { id: 'p29', code: 'ELE-TOM-001', name: 'Toma corriente triple con USB', price: 2800, active: true, category: 'Electricidad', subcategory: 'Tomas e Interruptores', unit: 'un' },
  { id: 'p30', code: 'ELE-TOM-002', name: 'Interruptor simple línea Espacio', price: 1450, active: true, category: 'Electricidad', subcategory: 'Tomas e Interruptores', unit: 'un' },
  { id: 'p31', code: 'ELE-TOM-003', name: 'Toma exterior con tapa IP44', price: 3300, active: true, category: 'Electricidad', subcategory: 'Tomas e Interruptores', unit: 'un' },

  // ===================== PINTURA =====================
  { id: 'p32', code: 'PIN-INT-001', name: 'Látex interior blanco 20L', price: 9600, active: true, category: 'Pintura', subcategory: 'Pintura de Interior', unit: 'balde' },
  { id: 'p33', code: 'PIN-INT-002', name: 'Látex interior color 10L', price: 6200, active: true, category: 'Pintura', subcategory: 'Pintura de Interior', unit: 'balde' },
  { id: 'p34', code: 'PIN-INT-003', name: 'Enduido plástico interior 25kg', price: 5100, active: true, category: 'Pintura', subcategory: 'Pintura de Interior', unit: 'bolsa' },
  { id: 'p35', code: 'PIN-EXT-001', name: 'Pintura exterior premium 10L', price: 7400, active: true, category: 'Pintura', subcategory: 'Pintura de Exterior', unit: 'balde' },
  { id: 'p36', code: 'PIN-EXT-002', name: 'Membrana líquida techos 20L', price: 15800, active: true, category: 'Pintura', subcategory: 'Pintura de Exterior', unit: 'balde' },
  { id: 'p37', code: 'PIN-EXT-003', name: 'Impermeabilizante para muros 10L', price: 8900, active: true, category: 'Pintura', subcategory: 'Pintura de Exterior', unit: 'balde' },
  { id: 'p38', code: 'PIN-ACC-001', name: 'Rodillo antigota 22cm', price: 650, active: true, category: 'Pintura', subcategory: 'Accesorios y Herramientas', unit: 'un' },
  { id: 'p39', code: 'PIN-ACC-002', name: 'Pincel Nº20 cerda natural', price: 1200, active: true, category: 'Pintura', subcategory: 'Accesorios y Herramientas', unit: 'un' },
  { id: 'p40', code: 'PIN-ACC-003', name: 'Cinta de papel para pintor 24mm', price: 480, active: true, category: 'Pintura', subcategory: 'Accesorios y Herramientas', unit: 'un' },
  { id: 'p41', code: 'PIN-ACC-004', name: 'Bandeja para rodillo', price: 950, active: true, category: 'Pintura', subcategory: 'Accesorios y Herramientas', unit: 'un' },

  // ===================== CONSTRUCCIÓN =====================
  { id: 'p42', code: 'CON-CEM-001', name: 'Cemento Portland 50kg', price: 3100, active: true, category: 'Construcción', subcategory: 'Cemento y Áridos', unit: 'bolsa' },
  { id: 'p43', code: 'CON-CEM-002', name: 'Cal hidratada 25kg', price: 1800, active: true, category: 'Construcción', subcategory: 'Cemento y Áridos', unit: 'bolsa' },
  { id: 'p44', code: 'CON-CEM-003', name: 'Arena fina x m³', price: 24000, active: true, category: 'Construcción', subcategory: 'Cemento y Áridos', unit: 'm³' },
  { id: 'p45', code: 'CON-CEM-004', name: 'Piedra partida x m³', price: 26500, active: true, category: 'Construcción', subcategory: 'Cemento y Áridos', unit: 'm³' },
  { id: 'p46', code: 'CON-HIE-001', name: 'Hierro redondo 8mm x 12m', price: 4800, active: true, category: 'Construcción', subcategory: 'Hierros y Estructura', unit: 'un' },
  { id: 'p47', code: 'CON-HIE-002', name: 'Hierro redondo 10mm x 12m', price: 6900, active: true, category: 'Construcción', subcategory: 'Hierros y Estructura', unit: 'un' },
  { id: 'p48', code: 'CON-HIE-003', name: 'Malla soldada 15x15 6mm', price: 13400, active: true, category: 'Construcción', subcategory: 'Hierros y Estructura', unit: 'panel' },
  { id: 'p49', code: 'CON-LAD-001', name: 'Ladrillo hueco 18x18x33 (pallet)', price: 22000, active: true, category: 'Construcción', subcategory: 'Ladrillos y Bloques', unit: 'pallet' },
  { id: 'p50', code: 'CON-LAD-002', name: 'Ladrillo común (pallet)', price: 19500, active: true, category: 'Construcción', subcategory: 'Ladrillos y Bloques', unit: 'pallet' },
  { id: 'p51', code: 'CON-LAD-003', name: 'Bloque de hormigón 20x20x40', price: 890, active: true, category: 'Construcción', subcategory: 'Ladrillos y Bloques', unit: 'un' },
  { id: 'p52', code: 'CON-AIS-001', name: 'Lana de vidrio rollo 50mm', price: 11200, active: true, category: 'Construcción', subcategory: 'Aislación', unit: 'rollo' },
  { id: 'p53', code: 'CON-AIS-002', name: 'Placa de poliestireno 2cm', price: 4600, active: true, category: 'Construcción', subcategory: 'Aislación', unit: 'placa' },
  { id: 'p54', code: 'CON-AIS-003', name: 'Film de polietileno 4x50m', price: 8700, active: true, category: 'Construcción', subcategory: 'Aislación', unit: 'rollo' },

  // ===================== CERÁMICOS =====================
  { id: 'p55', code: 'CER-PIS-001', name: 'Cerámico piso 45x45 Terrano', price: 2100, active: true, category: 'Cerámicos', subcategory: 'Pisos', unit: 'm²' },
  { id: 'p56', code: 'CER-PIS-002', name: 'Cerámico piso símil madera 20x120', price: 3400, active: true, category: 'Cerámicos', subcategory: 'Pisos', unit: 'm²' },
  { id: 'p57', code: 'CER-POR-001', name: 'Porcellanato 60x60 Gris Cemento', price: 3800, active: true, category: 'Cerámicos', subcategory: 'Porcellanato', unit: 'm²' },
  { id: 'p58', code: 'CER-POR-002', name: 'Porcellanato pulido 80x80 Blanco', price: 5600, active: true, category: 'Cerámicos', subcategory: 'Porcellanato', unit: 'm²' },
  { id: 'p59', code: 'CER-REV-001', name: 'Revestimiento baño 30x60 blanco brillante', price: 2900, active: true, category: 'Cerámicos', subcategory: 'Revestimientos', unit: 'm²' },
  { id: 'p60', code: 'CER-REV-002', name: 'Revestimiento cocina símil ladrillo', price: 3200, active: true, category: 'Cerámicos', subcategory: 'Revestimientos', unit: 'm²' },
  { id: 'p61', code: 'CER-PEG-001', name: 'Pegamento cerámico interior 30kg', price: 3900, active: true, category: 'Cerámicos', subcategory: 'Pegamentos y Pastinas', unit: 'bolsa' },
  { id: 'p62', code: 'CER-PEG-002', name: 'Pastina para junta 1kg', price: 1500, active: true, category: 'Cerámicos', subcategory: 'Pegamentos y Pastinas', unit: 'un' },
  { id: 'p63', code: 'CER-PEG-003', name: 'Nivelador de piso autonivelante 25kg', price: 6800, active: true, category: 'Cerámicos', subcategory: 'Pegamentos y Pastinas', unit: 'bolsa' },

  // ===================== HERRAMIENTAS =====================
  { id: 'p64', code: 'HER-ELE-001', name: 'Amoladora angular 115mm 800W', price: 12500, active: true, category: 'Herramientas', subcategory: 'Eléctricas', unit: 'un' },
  { id: 'p65', code: 'HER-ELE-002', name: 'Taladro percutor 550W', price: 9800, active: true, category: 'Herramientas', subcategory: 'Eléctricas', unit: 'un' },
  { id: 'p66', code: 'HER-ELE-003', name: 'Atornillador a batería 12V', price: 15400, active: true, category: 'Herramientas', subcategory: 'Eléctricas', unit: 'un' },
  { id: 'p67', code: 'HER-ELE-004', name: 'Sierra circular 1200W', price: 28900, active: true, category: 'Herramientas', subcategory: 'Eléctricas', unit: 'un' },
  { id: 'p68', code: 'HER-MAN-001', name: 'Set llaves combinadas 8 piezas', price: 3200, active: true, category: 'Herramientas', subcategory: 'Manuales', unit: 'set' },
  { id: 'p69', code: 'HER-MAN-002', name: 'Martillo carpintero 20oz', price: 2900, active: true, category: 'Herramientas', subcategory: 'Manuales', unit: 'un' },
  { id: 'p70', code: 'HER-MAN-003', name: 'Destornillador set 6 piezas', price: 2100, active: true, category: 'Herramientas', subcategory: 'Manuales', unit: 'set' },
  { id: 'p71', code: 'HER-MED-001', name: 'Cinta métrica 5m', price: 1350, active: true, category: 'Herramientas', subcategory: 'Medición', unit: 'un' },
  { id: 'p72', code: 'HER-MED-002', name: 'Nivel de burbuja 60cm', price: 3600, active: true, category: 'Herramientas', subcategory: 'Medición', unit: 'un' },
  { id: 'p73', code: 'HER-MED-003', name: 'Medidor láser de distancia', price: 21500, active: true, category: 'Herramientas', subcategory: 'Medición', unit: 'un' },
  { id: 'p74', code: 'HER-SEG-001', name: 'Casco de seguridad', price: 4200, active: true, category: 'Herramientas', subcategory: 'Seguridad', unit: 'un' },
  { id: 'p75', code: 'HER-SEG-002', name: 'Guantes de trabajo reforzados', price: 1800, active: true, category: 'Herramientas', subcategory: 'Seguridad', unit: 'par' },
  { id: 'p76', code: 'HER-SEG-003', name: 'Antiparras de seguridad', price: 950, active: true, category: 'Herramientas', subcategory: 'Seguridad', unit: 'un' },

  // ===================== SERVICIOS =====================
  { id: 'p77', code: 'SRV-INS-001', name: 'Instalación de termotanque', price: 18000, active: true, category: 'Servicios', subcategory: 'Instalaciones', unit: 'servicio' },
  { id: 'p78', code: 'SRV-INS-002', name: 'Instalación eléctrica domiciliaria (por boca)', price: 6500, active: true, category: 'Servicios', subcategory: 'Instalaciones', unit: 'servicio' },
  { id: 'p79', code: 'SRV-INS-003', name: 'Colocación de porcellanato (por m²)', price: 4200, active: true, category: 'Servicios', subcategory: 'Instalaciones', unit: 'servicio' },
  { id: 'p80', code: 'SRV-ASE-001', name: 'Asesoramiento técnico en obra', price: 12000, active: true, category: 'Servicios', subcategory: 'Asesoramiento', unit: 'visita' },
  { id: 'p81', code: 'SRV-ASE-002', name: 'Cómputo y presupuesto de materiales', price: 0, active: true, category: 'Servicios', subcategory: 'Asesoramiento', unit: 'servicio' },
  { id: 'p82', code: 'SRV-LOG-001', name: 'Flete y entrega a domicilio (zona urbana)', price: 8500, active: true, category: 'Servicios', subcategory: 'Logística', unit: 'servicio' },
  { id: 'p83', code: 'SRV-LOG-002', name: 'Flete y entrega a domicilio (zona rural)', price: 15000, active: true, category: 'Servicios', subcategory: 'Logística', unit: 'servicio' },
  { id: 'p84', code: 'SRV-POS-001', name: 'Garantía extendida por 12 meses', price: 5000, active: true, category: 'Servicios', subcategory: 'Postventa', unit: 'servicio' },
  { id: 'p85', code: 'SRV-POS-002', name: 'Service y mantenimiento de herramientas', price: 7200, active: true, category: 'Servicios', subcategory: 'Postventa', unit: 'servicio' },
];
