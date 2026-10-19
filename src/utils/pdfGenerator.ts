import { jsPDF } from "jspdf";

export const generateTestPdf = (): File => {
  const doc = new jsPDF();
  
  // Page 1
  doc.setFontSize(18);
  doc.text("Preisanfrage-K5011", 10, 20);
  doc.setFontSize(12);
  doc.text("TransnetBW GmbH, Gebäude A - Austausch NSHV", 10, 30);
  doc.text("- paralleler Aufbau der Niederspannung NF81 neu mit 7 Feldern + 1 Eckfeld", 10, 50);
  doc.text("Seite 1 von 50", 10, 280);

  // Add empty pages up to 7
  for (let i = 2; i <= 7; i++) {
    doc.addPage();
    doc.text(`Seite ${i} von 50`, 10, 280);
  }

  // Page 8
  doc.addPage();
  doc.text("Störlichtbogenschutz", 10, 20);
  doc.text("Das Sammelschienensystem ist mit Störlichtbogenbarrieren zur Begrenzung des Störlichtbogens auf das Feld auszurüsten.", 10, 40);
  doc.text("Seite 8 von 50", 10, 280);

  // Page 9
  doc.addPage();
  doc.text("Fabrikat: Siemens", 10, 20);
  doc.text("Typ: Sivacon S8 bindend ausgeschrieben.", 10, 30);
  doc.text("Seite 9 von 50", 10, 280);

  // Page 11
  doc.addPage();
  doc.text("Leistungsschalter in Einschubtechnik sind im Einschubrahmen auszuführen.", 10, 20);
  doc.text("Seite 11 von 50", 10, 280);

  // Add empty pages up to 13
  for (let i = 12; i <= 13; i++) {
    doc.addPage();
    doc.text(`Seite ${i} von 50`, 10, 280);
  }

  // Page 14
  doc.addPage();
  doc.text("Schutzart IP40", 10, 20);
  doc.text("Höhe 2000 / 2200 mm", 10, 40);
  doc.text("Tiefe: Einfront 600 mm", 10, 50);
  doc.text("Seite 14 von 50", 10, 280);

  // Add empty pages up to 16
  for (let i = 15; i <= 16; i++) {
    doc.addPage();
    doc.text(`Seite ${i} von 50`, 10, 280);
  }

  // Page 17
  doc.addPage();
  doc.text("Bemessungsbetriebsspannung Ue: 400 V/50 Hz", 10, 20);
  doc.text("Form der inneren Unterteilung der Leistungsschalterfelder: Form 4b", 10, 30);
  doc.text("Hauptsammelschienen: 2000 A", 10, 40);
  doc.text("Seite 17 von 50", 10, 280);

  // Page 18
  doc.addPage();
  doc.text("Bemessungskurzzeitstrom Icw(1 s) > 65 kA", 10, 20);
  doc.text("Höhe x Breite x Tiefe: 2200 x 600 x 600 mm", 10, 30);
  doc.text("Seite 18 von 50", 10, 280);

  const pdfBlob = doc.output('blob');
  return new File([pdfBlob], "Test-LV_K5011.pdf", { type: "application/pdf" });
};
