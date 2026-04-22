interface ExportMessage {
  role: string;
  parts: { type: string; text?: string }[];
}

function getTextFromParts(
  parts: { type: string; text?: string }[]
): string {
  return parts
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text!)
    .join("\n");
}

function formatRole(role: string): string {
  return role === "user" ? "You" : "Assistant";
}

// ── Markdown ──

export function exportAsMarkdown(
  messages: ExportMessage[],
  title?: string
): void {
  let md = title ? `# ${title}\n\n` : "";
  for (const msg of messages) {
    const text = getTextFromParts(msg.parts);
    if (!text) continue;
    md += `### ${formatRole(msg.role)}\n\n${text}\n\n---\n\n`;
  }
  downloadFile(md, `${title || "chat"}.md`, "text/markdown");
}

export function exportMessageAsMarkdown(text: string): void {
  downloadFile(text, "message.md", "text/markdown");
}

// ── DOCX ──

export async function exportAsDocx(
  messages: ExportMessage[],
  title?: string
): Promise<void> {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle } =
    await import("docx");

  const children: InstanceType<typeof Paragraph>[] = [];

  if (title) {
    children.push(
      new Paragraph({ text: title, heading: HeadingLevel.TITLE, spacing: { after: 200 } })
    );
  }

  for (const msg of messages) {
    const text = getTextFromParts(msg.parts);
    if (!text) continue;

    children.push(
      new Paragraph({
        children: [new TextRun({ text: formatRole(msg.role), bold: true, size: 24 })],
        spacing: { before: 300, after: 100 },
      })
    );

    for (const line of text.split("\n")) {
      children.push(new Paragraph({ text: line, spacing: { after: 80 } }));
    }

    children.push(
      new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } },
        spacing: { after: 200 },
      })
    );
  }

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${title || "chat"}.docx`);
}

export async function exportMessageAsDocx(text: string): Promise<void> {
  const { Document, Packer, Paragraph } = await import("docx");

  const children = text
    .split("\n")
    .map((line) => new Paragraph({ text: line, spacing: { after: 80 } }));

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, "message.docx");
}

// ── PDF ──

export async function exportAsPdf(
  messages: ExportMessage[],
  title?: string
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  const addPageIfNeeded = (needed: number) => {
    if (y + needed > doc.internal.pageSize.getHeight() - 15) {
      doc.addPage();
      y = 20;
    }
  };

  if (title) {
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin, y);
    y += 12;
  }

  for (const msg of messages) {
    const text = getTextFromParts(msg.parts);
    if (!text) continue;

    addPageIfNeeded(20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(formatRole(msg.role), margin, y);
    y += 7;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const lines = doc.splitTextToSize(text, maxWidth) as string[];
    for (const line of lines) {
      addPageIfNeeded(6);
      doc.text(line, margin, y);
      y += 5;
    }

    addPageIfNeeded(8);
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  }

  doc.save(`${title || "chat"}.pdf`);
}

export async function exportMessageAsPdf(text: string): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  for (const line of lines) {
    if (y + 6 > doc.internal.pageSize.getHeight() - 15) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, margin, y);
    y += 5;
  }

  doc.save("message.pdf");
}

// ── Helpers ──

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  downloadBlob(blob, filename);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
