import { jsPDF } from "jspdf";
import { BrochureData } from "../types";

export function exportBrochureToPDF(
  data: BrochureData,
  contactInfo: {
    website: string;
    email: string;
    phone: string;
    address: string;
    github?: string;
  },
  colorTheme: string,
  hideChatbot: boolean = false
) {
  const totalPages = hideChatbot ? 4 : 5;
  let pageNum = 1;
  // Define colors based on theme
  let primaryColor = [26, 52, 97]; // Navy
  let secondaryColor = [37, 211, 102]; // Green
  let titleText = "Clientum 2026 — Soluciones de Automatización";

  if (colorTheme === "forest") {
    primaryColor = [6, 78, 59]; // Forest Green
    secondaryColor = [16, 185, 129];
  } else if (colorTheme === "amber") {
    primaryColor = [120, 53, 15]; // Amber
    secondaryColor = [245, 158, 11];
  } else if (colorTheme === "charcoal") {
    primaryColor = [30, 41, 59]; // Charcoal
    secondaryColor = [100, 116, 139];
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 20;
  let currentY = 25;

  // Helper: Draw footer with page numbers and website
  const drawFooter = (pageNum: number, totalPages: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    // Draw horizontal line
    doc.setDrawColor(230, 230, 230);
    doc.line(marginX, pageHeight - 15, pageWidth - marginX, pageHeight - 15);
    // Footer text
    doc.text(`Propuesta Comercial — ${contactInfo.website}`, marginX, pageHeight - 10);
    doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - marginX - 20, pageHeight - 10);
  };

  // Helper: Draw header band
  const drawHeaderBand = (sectionTitle: string) => {
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 15, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("CLIENTUM 2026", marginX, 9);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(200, 220, 255);
    doc.text(sectionTitle, pageWidth - marginX - 50, 9, { align: "right" });
  };

  // ---------------- PAGE 1: COVER ----------------
  // Background style
  doc.setFillColor(248, 250, 252); // Soft gray/slate background
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Top colored stripe
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 40, "F");

  // Cover branding
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("CLIENTUM CORPORATE", marginX, 22);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(200, 220, 255);
  doc.text("SISTEMA OPERATIVO DE VENTAS E IA", marginX, 28);

  // Large elegant logo symbol placeholder
  doc.setLineWidth(1);
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.line(marginX, 70, pageWidth - marginX, 70);

  // Main Slogan
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  const sloganLines = doc.splitTextToSize(data.cover.slogan, pageWidth - 2 * marginX);
  doc.text(sloganLines, marginX, 90);

  // Subtitle/Value Prop
  currentY = 90 + (sloganLines.length * 10) + 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(70, 80, 95);
  const subLines = doc.splitTextToSize(data.cover.sub, pageWidth - 2 * marginX);
  doc.text(subLines, marginX, currentY);

  // Feature highlight blocks (Symmetric layout)
  currentY += (subLines.length * 6) + 20;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220, 225, 230);
  doc.roundedRect(marginX, currentY, pageWidth - 2 * marginX, 40, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("PROPUESTA TECNOLÓGICA PERSONALIZADA", marginX + 10, currentY + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(100, 110, 125);
  const promoText = "Esta propuesta detalla la automatización comercial a medida para potenciar tu facturación, agilizar la atención de leads de forma autónoma mediante Inteligencia Artificial y asegurar el seguimiento riguroso de cada oportunidad.";
  const promoLines = doc.splitTextToSize(promoText, pageWidth - 2 * marginX - 20);
  doc.text(promoLines, marginX + 10, currentY + 20);

  // Footer / contact details on cover page
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("Preparado por Clientum para tu Empresa", marginX, pageHeight - 45);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 110, 125);
  doc.text(`Sitio Web: ${contactInfo.website}`, marginX, pageHeight - 38);
  doc.text(`Contacto: ${contactInfo.email} | ${contactInfo.phone}`, marginX, pageHeight - 33);
  doc.text(`Ubicación: ${contactInfo.address}`, marginX, pageHeight - 28);

  drawFooter(pageNum, totalPages);

  // ---------------- PAGE 2: CHATBOT WHATSAPP ----------------
  if (!hideChatbot) {
    doc.addPage();
    pageNum++;
    drawHeaderBand("1. CANAL DE ATENCIÓN DE WHATSAPP CON IA");
    currentY = 30;

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(data.chatbot.title, marginX, currentY);
  currentY += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 110, 125);
  doc.text("El bot calificador opera 24/7 de forma autónoma, respondiendo con el tono y la información de tu marca.", marginX, currentY);
  currentY += 15;

  // Features list
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("Funcionalidades Clave del Bot Calificador:", marginX, currentY);
  currentY += 8;

  data.chatbot.features.forEach((feat) => {
    // Green check bullet
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.circle(marginX + 2, currentY - 1, 1, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text(feat.title, marginX + 6, currentY);
    currentY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 110, 125);
    const descLines = doc.splitTextToSize(feat.desc, pageWidth - 2 * marginX - 10);
    doc.text(descLines, marginX + 6, currentY);
    currentY += (descLines.length * 4.5) + 4;
  });

  currentY += 5;
  // Flow Steps
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("Flujo de Interacción Automatizado:", marginX, currentY);
  currentY += 8;

    data.chatbot.flowSteps.forEach((step, index) => {
      // Numbered badge
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.roundedRect(marginX, currentY - 3.5, 6, 5, 1, 1, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(`${index + 1}`, marginX + 2, currentY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(50, 60, 75);
      const stepLines = doc.splitTextToSize(step, pageWidth - 2 * marginX - 12);
      doc.text(stepLines, marginX + 9, currentY);
      currentY += (stepLines.length * 4.5) + 3;
    });

    drawFooter(pageNum, totalPages);
  }

  // ---------------- PAGE 3: CRM PIPELINE ----------------
  doc.addPage();
  pageNum++;
  drawHeaderBand(hideChatbot ? "1. CRM & PIPELINE DE VENTAS INTELIGENTE" : "2. CRM & PIPELINE DE VENTAS INTELIGENTE");
  currentY = 30;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(data.crm.title, marginX, currentY);
  currentY += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 110, 125);
  doc.text("Control absoluto de tus ventas desde un tablero intuitivo. Todo tu equipo alineado y con recordatorios automatizados.", marginX, currentY);
  currentY += 15;

  // CRM Features list
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("Capacidades Esenciales del CRM:", marginX, currentY);
  currentY += 8;

  data.crm.features.forEach((feat) => {
    // Bullet
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.circle(marginX + 2, currentY - 1, 1, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text(feat.title, marginX + 6, currentY);
    currentY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 110, 125);
    const descLines = doc.splitTextToSize(feat.desc, pageWidth - 2 * marginX - 10);
    doc.text(descLines, marginX + 6, currentY);
    currentY += (descLines.length * 4.5) + 5;
  });

  // Pipeline simulation mockup illustration
  currentY += 5;
  doc.setFillColor(245, 247, 250);
  doc.setDrawColor(225, 230, 235);
  doc.roundedRect(marginX, currentY, pageWidth - 2 * marginX, 48, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("SIMULACIÓN DE PIPELINE COMERCIAL ACTIVADO", marginX + 8, currentY + 8);

  // 4 columns mockup
  const colW = (pageWidth - 2 * marginX - 16) / 4;
  const colY = currentY + 14;

  const colLabels = ["Nuevos Leads", "Contacto Bot", "Propuesta", "Cerrado Ganado"];
  const colBgs = [
    [240, 240, 240],
    [210, 240, 220],
    [210, 230, 250],
    [200, 250, 210]
  ];

  colLabels.forEach((label, i) => {
    doc.setFillColor(colBgs[i][0], colBgs[i][1], colBgs[i][2]);
    doc.roundedRect(marginX + 4 + i * (colW + 2.5), colY, colW, 26, 1.5, 1.5, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(40, 50, 60);
    doc.text(label, marginX + 6 + i * (colW + 2.5), colY + 6);

    // Mock Card 1
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(marginX + 5.5 + i * (colW + 2.5), colY + 10, colW - 3, 11, 1, 1, "F");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(80, 90, 100);
    doc.text(i === 3 ? "Distribuidora Sur" : "Cliente Activo", marginX + 7.5 + i * (colW + 2.5), colY + 14);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(30, 40, 50);
    doc.text(i === 3 ? "$179.990" : "$269.990", marginX + 7.5 + i * (colW + 2.5), colY + 18);
  });

  drawFooter(pageNum, totalPages);

  // ---------------- PAGE 4: SOLUTIONS & SERVICES ----------------
  doc.addPage();
  pageNum++;
  drawHeaderBand(hideChatbot ? "2. SERVICIOS PROFESIONALES ADAPTADOS" : "3. PROPUESTA DE SERVICIOS ADAPTADOS");
  currentY = 30;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("Plan de Soluciones Integradas para tu Crecimiento", marginX, currentY);
  currentY += 12;

  // Render services
  const servicesToRender = data.services.slice(0, 4); // top 4 to fit clean in A4
  servicesToRender.forEach((srv, idx) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`${idx + 1}. ${srv.title}`, marginX, currentY);
    currentY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(80, 90, 100);
    const descLines = doc.splitTextToSize(srv.desc, pageWidth - 2 * marginX);
    doc.text(descLines, marginX, currentY);
    currentY += (descLines.length * 4.5) + 3;

    // Render bullet list
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(110, 120, 135);
    
    const bulletsText = srv.bullets.join("   •   ");
    doc.text(`•   ${bulletsText}`, marginX + 5, currentY);
    currentY += 10;
  });

  drawFooter(pageNum, totalPages);

  // ---------------- PAGE 5: CASES & CONTACT ----------------
  doc.addPage();
  pageNum++;
  drawHeaderBand(hideChatbot ? "3. RESULTADOS, CASOS DE ÉXITO & CONTACTO" : "4. CASOS DE ÉXITO & CONTACTO");
  currentY = 30;

  // Section title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("La Voz de Nuestros Clientes en Argentina", marginX, currentY);
  currentY += 12;

  // Testimonial elegant block quotes
  doc.setFillColor(245, 247, 250);
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(marginX, currentY, pageWidth - 2 * marginX, 55, 3, 3, "F");
  // Left border bar
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(marginX, currentY, 3, 55, "F");

  doc.setFont("helvetica", "italic");
  doc.setFontSize(10.5);
  doc.setTextColor(50, 60, 75);
  const quoteLines = doc.splitTextToSize(`"${data.testimonial.text}"`, pageWidth - 2 * marginX - 15);
  doc.text(quoteLines, marginX + 8, currentY + 12);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`— ${data.testimonial.author}`, marginX + 8, currentY + 42);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110, 120, 130);
  doc.text(data.testimonial.company, marginX + 8, currentY + 47);

  currentY += 75;

  // Call to action
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("¿Empezamos Hoy a Escalar tu Facturación?", marginX, currentY);
  currentY += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 110, 125);
  doc.text("Comunicate con un asesor comercial oficial para agendar tu diagnóstico sin cargo.", marginX, currentY);
  currentY += 15;

  // Clean layout contact blocks
  const boxHeight = contactInfo.github ? 56 : 48;
  doc.setFillColor(250, 251, 253);
  doc.setDrawColor(230, 235, 240);
  doc.roundedRect(marginX, currentY, pageWidth - 2 * marginX, boxHeight, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("CLIENTUM TECNOLOGÍA PyME", marginX + 10, currentY + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(80, 90, 100);
  doc.text(`Sitio Oficial:  ${contactInfo.website}`, marginX + 10, currentY + 20);
  doc.text(`Correo Electrónico:  ${contactInfo.email}`, marginX + 10, currentY + 27);
  doc.text(`WhatsApp de Soporte:  ${contactInfo.phone}`, marginX + 10, currentY + 34);
  doc.text(`Dirección Operativa:  ${contactInfo.address}`, marginX + 10, currentY + 41);
  if (contactInfo.github) {
    doc.text(`Código / GitHub:  ${contactInfo.github}`, marginX + 10, currentY + 48);
  }

  drawFooter(pageNum, totalPages);

  // Trigger download
  const cleanIndustryName = data.testimonial.company?.replace(/[^a-zA-Z0-0]/g, "_") || "Rubro";
  doc.save(`Brochure_Clientum_2026_${cleanIndustryName}.pdf`);
}
