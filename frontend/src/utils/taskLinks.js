export const TASK_ID_REGEX = /\b[TB]-[A-Z]+(?:-[A-Z]+)*-\d{4}\b/g;

const SKIP_TAGS_REGEX = /<(pre|code|a)\b[^>]*>[\s\S]*?<\/\1>/gi;

export function extractTaskIdFromText(text) {
  if (!text) return null;
  const match = text.match(/^[TB]-[A-Z]+(?:-[A-Z]+)*-\d{4}\b/);
  return match ? match[0] : null;
}

const escapeAttr = (value) => String(value).replace(/"/g, '&quot;');

export function wrapTaskIds(html, knownIds) {
  if (!html) return html;
  const known = knownIds instanceof Set ? knownIds : new Set(knownIds || []);

  const segments = [];
  let lastIndex = 0;
  let match;
  while ((match = SKIP_TAGS_REGEX.exec(html)) !== null) {
    if (match.index > lastIndex) segments.push({ skip: false, text: html.slice(lastIndex, match.index) });
    segments.push({ skip: true, text: match[0] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < html.length) segments.push({ skip: false, text: html.slice(lastIndex) });

  return segments.map(seg => {
    if (seg.skip) return seg.text;
    return seg.text.replace(TASK_ID_REGEX, (id) => {
      if (!known.has(id)) {
        return `<span class="task-link task-link-broken" title="Tarea no encontrada en el dataset actual">${id}</span>`;
      }
      return `<button type="button" class="task-link" data-task-id="${escapeAttr(id)}" title="Abrir ${escapeAttr(id)}">${id}</button>`;
    });
  }).join('');
}
