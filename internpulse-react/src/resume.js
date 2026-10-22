// Resume rules - the backend enforces the same ones, this just tells the student before uploading.
export const MAX_RESUME_BYTES = 2 * 1024 * 1024; // 2 MB

export function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// First bytes of the file, as numbers
function readHead(file, n = 1024) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file.slice(0, n));
  });
}

// Returns '' when the file is a real PDF, otherwise a message for the student
export async function validateResume(file) {
  if (!file) return 'Please attach your resume as a PDF file.';
  if (!/\.pdf$/i.test(file.name)) return 'Resume must be a PDF file (.pdf).';
  if (file.size === 0) return 'This file is empty.';
  if (file.size > MAX_RESUME_BYTES) return `Resume is too large (${formatSize(file.size)}). Maximum size is 2 MB.`;

  // A real PDF contains "%PDF-" at the start - this catches a .docx or image that was only renamed to .pdf
  let head;
  try { head = await readHead(file); } catch (e) { return 'Could not read this file. Try another one.'; }
  const text = String.fromCharCode(...head);
  if (!text.includes('%PDF-')) return "This doesn't look like a real PDF. Export your resume as PDF and try again.";
  return '';
}
