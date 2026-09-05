/**
 * Extracts raw text from a PDF buffer using unpdf (a maintained, modern
 * wrapper around pdfjs-dist). We intentionally avoid the abandoned
 * `pdf-parse` package — it bundles a 2018-era pdf.js build that throws on
 * xref table variations produced by common PDF generators.
 */
interface TextItem {
  str: string;
  x: number;
  y: number;
}

/** Groups text items into visual lines by Y position, then orders each line left-to-right by X. */
function reconstructLines(items: TextItem[]): string {
  if (items.length === 0) return "";

  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: TextItem[][] = [];
  const Y_TOLERANCE = 3;

  for (const item of sorted) {
    const lastLine = lines[lines.length - 1];
    const lastItem = lastLine?.[lastLine.length - 1];
    if (lastItem && Math.abs(lastItem.y - item.y) <= Y_TOLERANCE) {
      lastLine.push(item);
    } else {
      lines.push([item]);
    }
  }

  return lines
    .map((line) => line.sort((a, b) => a.x - b.x).map((i) => i.str).join(" "))
    .join("\n");
}

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const { extractTextItems, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { items } = await extractTextItems(pdf);
  // items: TextItem[][] — one array per page
  return items.map((pageItems) => reconstructLines(pageItems as TextItem[])).join("\n\n");
}
