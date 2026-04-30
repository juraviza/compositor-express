const CATEGORY_OPTIONS = [
  'Bebidas alcohólicas', 'Cervezas', 'Refrescos', 'Cocina y despensa', 'Limpieza e higiene', 'Otros'
];

const DEFAULT_PRODUCT_MEMORY = {
  'beefeater': 'Bebidas alcohólicas',
  'larios': 'Bebidas alcohólicas',
  'larios 12': 'Bebidas alcohólicas',
  'puerto de indias': 'Bebidas alcohólicas',
  'seagrams': 'Bebidas alcohólicas',
  'seagram': 'Bebidas alcohólicas',
  'tanqueray': 'Bebidas alcohólicas',
  'gordons': 'Bebidas alcohólicas',
  'gordon': 'Bebidas alcohólicas',
  'bombay': 'Bebidas alcohólicas',
  'bombay sapphire': 'Bebidas alcohólicas',
  'martin miller': 'Bebidas alcohólicas',
  'anis dulce': 'Bebidas alcohólicas',
  'anís dulce': 'Bebidas alcohólicas',
  'barriles': 'Cervezas',
  'barril': 'Cervezas',
  'parriles': 'Cervezas',
  'parril': 'Cervezas',
  'nordes': 'Bebidas alcohólicas',
  'nordés': 'Bebidas alcohólicas',
  'rives': 'Bebidas alcohólicas',
  'barcelo': 'Bebidas alcohólicas',
  'barceló': 'Bebidas alcohólicas',
  'brugal': 'Bebidas alcohólicas',
  'legendario': 'Bebidas alcohólicas',
  'cacique': 'Bebidas alcohólicas',
  'havana club': 'Bebidas alcohólicas',
  'santa teresa': 'Bebidas alcohólicas',
  'arehucas': 'Bebidas alcohólicas',
  'bacardi': 'Bebidas alcohólicas',
  'ballantines': 'Bebidas alcohólicas',
  'ballantine': 'Bebidas alcohólicas',
  'j&b': 'Bebidas alcohólicas',
  'jb': 'Bebidas alcohólicas',
  'johnnie walker': 'Bebidas alcohólicas',
  'johnnie': 'Bebidas alcohólicas',
  'white label': 'Bebidas alcohólicas',
  'red label': 'Bebidas alcohólicas',
  'black label': 'Bebidas alcohólicas',
  'cutty sark': 'Bebidas alcohólicas',
  '100 pipers': 'Bebidas alcohólicas',
  'passport': 'Bebidas alcohólicas',
  'dyc': 'Bebidas alcohólicas',
  'jameson': 'Bebidas alcohólicas',
  'absolut': 'Bebidas alcohólicas',
  'smirnoff': 'Bebidas alcohólicas',
  'ciroc': 'Bebidas alcohólicas',
  'cîroc': 'Bebidas alcohólicas',
  'baileys': 'Bebidas alcohólicas',
  'licor 43': 'Bebidas alcohólicas',
  'jager': 'Bebidas alcohólicas',
  'jäger': 'Bebidas alcohólicas',
  'tequila': 'Bebidas alcohólicas',
  'anis del mono': 'Bebidas alcohólicas',
  'anís del mono': 'Bebidas alcohólicas',
  'martini': 'Bebidas alcohólicas',
  'vermut': 'Bebidas alcohólicas',
  'miura': 'Bebidas alcohólicas',
  'rioja': 'Bebidas alcohólicas',
  'ribera': 'Bebidas alcohólicas',
  'lambrusco': 'Bebidas alcohólicas',
  'coca cola': 'Refrescos',
  'cola': 'Refrescos',
  'cocacola': 'Refrescos',
  'coca cola zero': 'Refrescos',
  'coca cola zero zero': 'Refrescos',
  'fanta': 'Refrescos',
  'fanta naranja': 'Refrescos',
  'fanta limon': 'Refrescos',
  'fanta limón': 'Refrescos',
  'sprite': 'Refrescos',
  'nestea': 'Refrescos',
  'aquarius': 'Refrescos',
  'aquarius limon': 'Refrescos',
  'aquarius limón': 'Refrescos',
  'tonica': 'Refrescos',
  'tónica': 'Refrescos',
  'kas limon': 'Refrescos',
  'kas limón': 'Refrescos',
  'cruzcampo': 'Cervezas',
  'heineken': 'Cervezas',
  'estrella': 'Cervezas',
  'estrella galicia': 'Cervezas',
  'victoria': 'Cervezas',
  'mahou': 'Cervezas',
  'amstel': 'Cervezas',
  'radler': 'Cervezas',
  'aguila': 'Cervezas',
  'águila': 'Cervezas',
  'alhambra': 'Cervezas',
  'san miguel': 'Cervezas',
  'quinto especial': 'Cervezas',
  'agua': 'Refrescos',
  'font vella': 'Refrescos',
  'lanjaron': 'Refrescos',
  'lanjaron': 'Refrescos',
  'cabreiroa': 'Refrescos',
  'monster': 'Refrescos',
  'red bull': 'Refrescos',
  'burn': 'Refrescos',
  'aquabona': 'Refrescos',
  'tomate frito': 'Cocina y despensa',
  'tomate triturado': 'Cocina y despensa',
  'tomate pelado': 'Cocina y despensa',
  'lata de tomate': 'Cocina y despensa',
  'alcachofas': 'Cocina y despensa',
  'lata de alcachofas': 'Cocina y despensa',
  'champi laminado': 'Cocina y despensa',
  'champiñon': 'Cocina y despensa',
  'champiñón': 'Cocina y despensa',
  'champiñon laminado': 'Cocina y despensa',
  'champiñón laminado': 'Cocina y despensa',
  'esparragos': 'Cocina y despensa',
  'espárragos': 'Cocina y despensa',
  'maiz': 'Cocina y despensa',
  'maíz': 'Cocina y despensa',
  'zanahoria': 'Cocina y despensa',
  'atun': 'Cocina y despensa',
  'atún': 'Cocina y despensa',
  'aceitunas': 'Cocina y despensa',
  'pepinillos': 'Cocina y despensa',
  'pimientos del piquillo': 'Cocina y despensa',
  'espinacas': 'Cocina y despensa',
  'garbanzos': 'Cocina y despensa',
  'judias verdes': 'Cocina y despensa',
  'judías verdes': 'Cocina y despensa',
  'lentejas': 'Cocina y despensa',
  'aceite': 'Cocina y despensa',
  'aceite freir': 'Cocina y despensa',
  'aceite freír': 'Cocina y despensa',
  'vinagre': 'Cocina y despensa',
  'sal': 'Cocina y despensa',
  'azucar': 'Cocina y despensa',
  'azúcar': 'Cocina y despensa',
  'harina': 'Cocina y despensa',
  'arroz': 'Cocina y despensa',
  'pasta': 'Cocina y despensa',
  'queso barra': 'Cocina y despensa',
  'queso rallado': 'Cocina y despensa',
  'mozzarella': 'Cocina y despensa',
  'mayonesa': 'Cocina y despensa',
  'ketchup': 'Cocina y despensa',
  'mostaza': 'Cocina y despensa',
  'salsa barbacoa': 'Cocina y despensa',
  'salsa cesar': 'Cocina y despensa',
  'salsa césar': 'Cocina y despensa',
  'caldo': 'Cocina y despensa',
  'nata cocinar': 'Cocina y despensa',
  'leche evaporada': 'Cocina y despensa',
  'huevos': 'Cocina y despensa',
  'patatas fritas': 'Cocina y despensa',
  'patatas': 'Cocina y despensa',
  'lejia': 'Limpieza e higiene',
  'lejía': 'Limpieza e higiene',
  'amoniaco': 'Limpieza e higiene',
  'friegasuelos': 'Limpieza e higiene',
  'detergente': 'Limpieza e higiene',
  'lavavajillas': 'Limpieza e higiene',
  'fairy': 'Limpieza e higiene',
  'mistol': 'Limpieza e higiene',
  'desengrasante': 'Limpieza e higiene',
  'limpiacristales': 'Limpieza e higiene',
  'papel higienico': 'Limpieza e higiene',
  'papel higiénico': 'Limpieza e higiene',
  'papel cocina': 'Limpieza e higiene',
  'servilletas': 'Limpieza e higiene',
  'bayetas': 'Limpieza e higiene',
  'estropajos': 'Limpieza e higiene',
  'guantes': 'Limpieza e higiene',
  'gel de manos': 'Limpieza e higiene',
  'jabon de manos': 'Limpieza e higiene',
  'jabón de manos': 'Limpieza e higiene',
  'gel hidroalcoholico': 'Limpieza e higiene',
  'gel hidroalcohólico': 'Limpieza e higiene',
  'ambientador': 'Limpieza e higiene',
  'bobina secamanos': 'Limpieza e higiene',
  'papel secamanos': 'Limpieza e higiene'
};

const KEYWORDS = [
  { category: 'Bebidas alcohólicas', terms: ['puerto de indias', 'larios', 'rives', 'seagram', 'segram', 'beefeater', 'befeter', 'tanqueray', 'nordes', 'nordés', 'gordons', 'bombay', 'ginebra'] },
  { category: 'Bebidas alcohólicas', terms: ['barcelo', 'barceló', 'brugal', 'cacique', 'legendario', 'santa teresa', 'havana club', 'bacardi', 'arehucas', 'ron', 'exotica', 'exótica'] },
  { category: 'Bebidas alcohólicas', terms: ['ballant', 'ballantais', 'jyb', 'j&b', 'white label', 'joni', 'johnnie', 'joni rojo', 'joni negro', 'cien piper', '100 pipers', 'passport', 'dyc', 'jameson', 'macallan', 'whisky'] },
  { category: 'Bebidas alcohólicas', terms: ['absolut', 'smirnoff', 'ciroc', 'cîroc', 'bailes', 'baileys', 'tequila', 'jager', 'jäger', 'maria brizard', 'maría brizar', 'anis del mono', 'anís del mono', 'anis dulce', 'anís dulce', 'martin miller', 'licor 43', 'vodca', 'vodka', 'licor'] },
  { category: 'Refrescos', terms: ['coca cola', 'cocacola', 'cola', 'fanta', 'sprite', 'tonica', 'tónica', 'limonada', 'neste', 'nestea', 'aquarios', 'aquarius', 'kas', 'zero'] },
  { category: 'Cervezas', terms: ['cruzcampo', 'heineken', 'heniker', 'radler', 'aguila', 'águila', 'estrella', 'victoria', 'mahou', 'amstel', 'alhambra', 'san miguel', 'quinto especial', 'cerveza', 'barril', 'barriles', 'parril', 'parriles'] },
  { category: 'Refrescos', terms: ['agua', 'monster', 'moster', 'red bull', 'burn', 'font vella', 'lanjaron', 'lanjaron', 'cabreiroa', 'aquabona'] },
  { category: 'Bebidas alcohólicas', terms: ['martini', 'miura', 'vermut', 'rioja', 'ribera', 'lambrusco', 'vino'] },
  { category: 'Cocina y despensa', terms: ['tomate', 'alcachof', 'champiñ', 'champiñ', 'esparrag', 'maiz', 'maíz', 'zanahoria', 'atun', 'atún', 'aceituna', 'pepinillo', 'piquillo', 'espinaca', 'garbanzo', 'judia', 'judía', 'lenteja', 'aceite', 'vinagre', 'sal', 'azucar', 'azúcar', 'harina', 'arroz', 'pasta', 'queso', 'mozzarella', 'mayonesa', 'ketchup', 'mostaza', 'salsa', 'caldo', 'nata cocinar', 'leche evaporada', 'huevo', 'patata'] },
  { category: 'Limpieza e higiene', terms: ['lejia', 'lejía', 'amoniaco', 'friegasuelos', 'detergente', 'lavavajillas', 'fairy', 'mistol', 'desengrasante', 'limpiacristales', 'papel higienico', 'papel higiénico', 'papel cocina', 'servilleta', 'bayeta', 'estropajo', 'guante', 'gel de manos', 'jabon de manos', 'jabón de manos', 'gel hidroalcoholico', 'gel hidroalcohólico', 'ambientador', 'secamanos'] },
];

const PRODUCT_MEMORY_STORAGE_KEY = 'caniapp-product-memory-v1';
const PRODUCT_MEMORY = loadProductMemory();

const state = {
  items: [],
  issues: [],
  reviewLines: [],
  lastOutput: '',
  imageDataUrls: [],
  ocrRunning: false,
  editingMemoryKey: '',
};

const els = {
  rawInput: document.getElementById('rawInput'),
  txtFileInput: document.getElementById('txtFileInput'),
  imageInput: document.getElementById('imageInput'),
  imagePreviewWrap: document.getElementById('imagePreviewWrap'),
  imagePreview: document.getElementById('imagePreview'),
  ocrBtn: document.getElementById('ocrBtn'),
  ocrStatus: document.getElementById('ocrStatus'),
  classifyBtn: document.getElementById('classifyBtn'),
  copyBtn: document.getElementById('copyBtn'),
  resetBtn: document.getElementById('resetBtn'),
  whatsBtn: document.getElementById('whatsBtn'),
  issuesList: document.getElementById('issuesList'),
  reviewBlock: document.getElementById('reviewBlock'),
  reviewList: document.getElementById('reviewList'),
  categoryCards: document.getElementById('categoryCards'),
  previewTableBody: document.getElementById('previewTableBody'),
  outputText: document.getElementById('outputText'),
  linesBadge: document.getElementById('linesBadge'),
  categoriesBadge: document.getElementById('categoriesBadge'),
  productsBadge: document.getElementById('productsBadge'),
  memoryProductInput: document.getElementById('memoryProductInput'),
  memoryCategoryInput: document.getElementById('memoryCategoryInput'),
  toggleMemoryBtn: document.getElementById('toggleMemoryBtn'),
  memoryPanel: document.getElementById('memoryPanel'),
  saveMemoryBtn: document.getElementById('saveMemoryBtn'),
  cancelMemoryEditBtn: document.getElementById('cancelMemoryEditBtn'),
  memoryStatus: document.getElementById('memoryStatus'),
  memoryTableBody: document.getElementById('memoryTableBody'),
};

bindEvents();
setupMemoryEditor();
classify();

function bindEvents() {
  els.classifyBtn.addEventListener('click', classify);
  els.copyBtn.addEventListener('click', copyOutput);
  els.resetBtn.addEventListener('click', resetAll);
  els.whatsBtn.addEventListener('click', copyOutput);
  els.txtFileInput.addEventListener('change', importTxtFile);
  els.imageInput.addEventListener('change', handleImageSelected);
  els.ocrBtn.addEventListener('click', runOCRFromSelectedImage);
  els.saveMemoryBtn.addEventListener('click', saveMemoryProduct);
  els.cancelMemoryEditBtn.addEventListener('click', cancelMemoryEdit);
  els.toggleMemoryBtn.addEventListener('click', toggleMemoryPanel);
}

function importTxtFile(event) {
  const [file] = event.target.files || [];
  if (!file) return;

  const isTextFile = file.type === 'text/plain' || /\.txt$/i.test(file.name || '');
  if (!isTextFile) {
    els.txtFileInput.value = '';
    setOcrStatus('Ese archivo no es un .txt. Si es una foto, súbela en "Subir foto(s) del pedido".');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    els.rawInput.value = reader.result;
    classify();
  };
  reader.readAsText(file, 'utf-8');
}

function resetAll() {
  els.rawInput.value = '';
  state.items = [];
  state.issues = [];
  state.reviewLines = [];
  state.imageDataUrls = [];
  els.imageInput.value = '';
  els.imagePreview.src = '';
  els.imagePreviewWrap.hidden = true;
  setOcrStatus('Puedes subir una o varias fotos escritas a mano y la app intentará pasarlas a texto.');
  renderAll();
}

function classify() {
  const lines = preprocessRawText(els.rawInput.value || '');

  const items = [];
  const issues = [];

  lines.forEach((line, index) => {
    const match = line.match(/^(\d+)?\s*(.+)$/i);
    if (!match) {
      issues.push(`Línea ${index + 1}: no se pudo interpretar.`);
      return;
    }

    const quantity = Number(match[1] || 1);
    const product = normalizeProduct(match[2] || '');
    if (!product) {
      issues.push(`Línea ${index + 1}: producto vacío.`);
      return;
    }

    const category = detectCategory(product);
    if (category === 'Otros') {
      issues.push(`Línea ${index + 1}: "${product}" quedó en Otros.`);
    }

    items.push({ id: crypto.randomUUID(), quantity, product, category });
  });

  state.items = items;
  state.issues = issues.length ? issues : ['Pedido clasificado correctamente.'];
  renderAll();
}

function normalizeProduct(value) {
  return String(value)
    .replace(/\s+/g, ' ')
    .replace(/[|]/g, 'l')
    .replace(/[º]/g, 'o')
    .trim();
}

function preprocessRawText(raw) {
  return String(raw || '')
    .replace(/[;,]+/g, '\n')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(normalizeOcrLine)
    .filter(Boolean);
}

function normalizeOcrLine(line) {
  return String(line)
    .replace(/[“”"']/g, '')
    .replace(/[–—]+/g, '-')
    .replace(/\s*[-=:>]+\s*/g, ' ')
    .replace(/^([A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,+&/-]*?)\s+(\d+)\s*(cajas?|caja|latas?|lata|uds?|ud|unid(?:ades?)?|und|garrafas?|garrafa|botellas?|botella)?$/i, '$2 $1')
    .replace(/^(\D+?)\s+(\d+)$/i, '$2 $1')
    .replace(/\bAquarios\b/gi, 'Aquarius')
    .replace(/\bHeniker\b/gi, 'Heineken')
    .replace(/\bBefeter\b/gi, 'Beefeater')
    .replace(/\bSegram\b/gi, 'Seagram')
    .replace(/\bMoster\b/gi, 'Monster')
    .replace(/\bCola\b/gi, 'Coca Cola')
    .replace(/\bChampi\s+laminado\b/gi, 'Champiñón laminado')
    .replace(/\bund\b/gi, 'unidad')
    .replace(/\bud\b/gi, 'unidad')
    .replace(/\bunid(?:ad|ades)?\b/gi, 'unidad')
    .replace(/\bcajas\b/gi, 'caja')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function detectCategory(product) {
  const p = product.toLowerCase();

  for (const [name, category] of Object.entries(PRODUCT_MEMORY)) {
    if (p.includes(name)) return category;
  }

  for (const group of KEYWORDS) {
    if (group.terms.some((term) => p.includes(term))) return group.category;
  }
  return 'Otros';
}

function renderAll() {
  renderIssues();
  renderReview();
  renderCards();
  renderTable();
  renderOutput();
  renderStats();
  renderMemoryTable();
}

function renderIssues() {
  els.issuesList.innerHTML = state.issues.map((issue) => `<li>${escapeHtml(issue)}</li>`).join('');
}

function renderReview() {
  if (!state.reviewLines.length) {
    els.reviewBlock.hidden = true;
    els.reviewList.innerHTML = '';
    return;
  }

  els.reviewBlock.hidden = false;
  els.reviewList.innerHTML = state.reviewLines.map((line) => `<li>${escapeHtml(line)}</li>`).join('');
}

function renderCards() {
  const grouped = groupByCategory(state.items);
  els.categoryCards.innerHTML = Object.entries(grouped).map(([category, items]) => `
    <div class="category-card">
      <h3>${escapeHtml(category)} (${items.length})</h3>
      <ul>
        ${items.map((item) => `<li>${item.quantity} ${escapeHtml(item.product)}</li>`).join('')}
      </ul>
    </div>
  `).join('') || '<div class="category-card"><h3>Sin datos</h3><ul><li>Pega un pedido y pulsa clasificar.</li></ul></div>';
}

function renderTable() {
  els.previewTableBody.innerHTML = state.items.map((item) => `
    <tr data-id="${item.id}">
      <td><input class="line-qty" type="number" min="1" value="${item.quantity}" /></td>
      <td><input class="line-product" value="${escapeAttr(item.product)}" /></td>
      <td>
        <select class="line-category">
          ${CATEGORY_OPTIONS.map((option) => `<option value="${option}" ${item.category === option ? 'selected' : ''}>${option}</option>`).join('')}
        </select>
      </td>
    </tr>
  `).join('');

  els.previewTableBody.querySelectorAll('tr').forEach((row) => {
    row.querySelectorAll('input, select').forEach((field) => {
      field.addEventListener('input', () => updateItemFromRow(row));
      field.addEventListener('change', () => updateItemFromRow(row));
    });
  });
}

function updateItemFromRow(row) {
  const item = state.items.find((entry) => entry.id === row.dataset.id);
  if (!item) return;
  item.quantity = Number(row.querySelector('.line-qty').value || 1);
  item.product = normalizeProduct(row.querySelector('.line-product').value);
  item.category = row.querySelector('.line-category').value;
  renderCards();
  renderOutput();
  renderStats();
}

function renderOutput() {
  const grouped = groupByCategory(state.items);
  const lines = [];
  Object.entries(grouped).forEach(([category, items]) => {
    lines.push(category.toUpperCase());
    items.forEach((item) => lines.push(`${item.quantity} ${item.product}`));
    lines.push('');
  });
  state.lastOutput = lines.join('\n').trim();
  els.outputText.textContent = state.lastOutput || 'Aquí aparecerá el pedido clasificado.';
}

function renderStats() {
  els.linesBadge.textContent = String(state.items.length);
  els.categoriesBadge.textContent = String(new Set(state.items.map((item) => item.category)).size);
  els.productsBadge.textContent = String(state.items.reduce((sum, item) => sum + item.quantity, 0));
}

function groupByCategory(items) {
  const grouped = {};
  items.forEach((item) => {
    (grouped[item.category] ||= []).push(item);
  });
  return grouped;
}

async function handleImageSelected(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;

  const previews = await Promise.all(files.slice(0, 4).map((file) => readFileAsDataUrl(file)));
  state.imageDataUrls = previews;
  els.imagePreview.src = previews[0] || '';
  els.imagePreviewWrap.hidden = !previews[0];
  setOcrStatus(`${files.length} foto(s) cargadas. Pulsa "Leer foto(s)" para convertirlas a texto.`);
}

async function runOCRFromSelectedImage() {
  const files = Array.from(els.imageInput.files || []);
  if (!files.length) {
    setOcrStatus('Primero sube una o varias fotos del pedido.');
    return;
  }
  if (state.ocrRunning) return;
  state.ocrRunning = true;
  els.ocrBtn.disabled = true;
  setOcrStatus(`Preparando ${files.length} foto(s) en modo escáner...`);
  try {
    const scannedFiles = [];
    for (const file of files) {
      scannedFiles.push(await enhanceImageForOCR(file));
    }

    setOcrStatus(`Leyendo ${files.length} foto(s) con IA...`);
    const form = new FormData();
    scannedFiles.forEach((file) => form.append('images', file, file.name || 'scan.jpg'));
    const res = await fetch('/api/read-order', { method: 'POST', body: form });

    let data = null;
    try {
      data = await res.json();
    } catch {
      throw new Error('La lectura devolvió una respuesta vacía o rota. Prueba otra vez con la foto más centrada.');
    }

    if (!res.ok || !data?.ok) {
      throw new Error(data?.message || 'No se pudo leer la foto.');
    }
    const text = Array.isArray(data.lines) ? data.lines.join('\n') : '';
    if (!text.trim()) {
      setOcrStatus('La IA no ha podido extraer líneas útiles de las fotos.');
      return;
    }
    const previousText = String(els.rawInput.value || '').trim();
    els.rawInput.value = previousText ? `${previousText}\n${text}` : text;
    state.reviewLines = Array.isArray(data.uncertainLines) ? data.uncertainLines.filter(Boolean) : [];
    const notes = Array.isArray(data.notes) && data.notes.length ? ` Avisos: ${data.notes.join(' | ')}` : '';
    const uncertain = state.reviewLines.length
      ? ` Líneas dudosas: ${state.reviewLines.join(' | ')}`
      : '';
    setOcrStatus(`Fotos convertidas a texto correctamente.${notes}${uncertain}`);
    classify();
  } catch (error) {
    setOcrStatus(error?.message || 'Hubo un problema al leer la foto con IA.');
  } finally {
    state.ocrRunning = false;
    els.ocrBtn.disabled = false;
  }
}

function setOcrStatus(message) {
  els.ocrStatus.textContent = message;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function enhanceImageForOCR(file) {
  const dataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(dataUrl);
  const maxWidth = 1800;
  const scale = Math.min(1, maxWidth / img.width);
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    let gray = 0.299 * r + 0.587 * g + 0.114 * b;
    gray = gray > 170 ? 245 : gray < 120 ? 35 : gray;
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
  ctx.putImageData(imageData, 0, 0);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '-scan.jpg', { type: 'image/jpeg' });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function copyOutput() {
  if (!state.lastOutput) return;
  navigator.clipboard.writeText(state.lastOutput);
}

function setupMemoryEditor() {
  els.memoryCategoryInput.innerHTML = CATEGORY_OPTIONS
    .filter((option) => option !== 'Otros')
    .map((option) => `<option value="${escapeAttr(option)}">${escapeHtml(option)}</option>`)
    .join('');
  els.memoryPanel.hidden = true;
  els.toggleMemoryBtn.textContent = 'Abrir memoria';
  renderMemoryTable();
}

function saveMemoryProduct() {
  const product = normalizeProduct(els.memoryProductInput.value).toLowerCase();
  const category = els.memoryCategoryInput.value;

  if (!product) {
    els.memoryStatus.textContent = 'Escribe primero el nombre del producto.';
    return;
  }

  if (state.editingMemoryKey && state.editingMemoryKey !== product) {
    delete PRODUCT_MEMORY[state.editingMemoryKey];
  }

  PRODUCT_MEMORY[product] = category;
  persistProductMemory();
  els.memoryStatus.textContent = state.editingMemoryKey
    ? `Producto actualizado: ${product} → ${category}`
    : `Guardado: ${product} → ${category}`;
  cancelMemoryEdit(true);
  renderMemoryTable();
  classify();
}

function renderMemoryTable() {
  const entries = Object.entries(PRODUCT_MEMORY).sort((a, b) => a[0].localeCompare(b[0], 'es'));
  els.memoryTableBody.innerHTML = entries.map(([product, category]) => `
    <tr>
      <td>${escapeHtml(product)}</td>
      <td>${escapeHtml(category)}</td>
      <td>
        <div class="memory-actions">
          <button class="btn btn-secondary btn-sm memory-edit-btn" data-product="${escapeAttr(product)}">Editar</button>
          <button class="btn btn-ghost btn-sm memory-delete-btn" data-product="${escapeAttr(product)}">Borrar</button>
        </div>
      </td>
    </tr>
  `).join('');

  els.memoryTableBody.querySelectorAll('.memory-edit-btn').forEach((button) => {
    button.addEventListener('click', () => startMemoryEdit(button.dataset.product || ''));
  });

  els.memoryTableBody.querySelectorAll('.memory-delete-btn').forEach((button) => {
    button.addEventListener('click', () => deleteMemoryProduct(button.dataset.product || ''));
  });
}

function startMemoryEdit(product) {
  const category = PRODUCT_MEMORY[product];
  if (!category) return;
  state.editingMemoryKey = product;
  els.memoryPanel.hidden = false;
  els.toggleMemoryBtn.textContent = 'Ocultar memoria';
  els.memoryProductInput.value = product;
  els.memoryCategoryInput.value = category;
  els.saveMemoryBtn.textContent = 'Guardar cambios';
  els.cancelMemoryEditBtn.hidden = false;
  els.memoryStatus.textContent = `Editando: ${product}`;
}

function cancelMemoryEdit(keepStatus = false) {
  state.editingMemoryKey = '';
  els.memoryProductInput.value = '';
  els.memoryCategoryInput.selectedIndex = 0;
  els.saveMemoryBtn.textContent = 'Guardar producto en memoria';
  els.cancelMemoryEditBtn.hidden = true;
  if (!keepStatus) {
    els.memoryStatus.textContent = 'Aquí verás si el producto se ha guardado bien.';
  }
}

function deleteMemoryProduct(product) {
  if (!PRODUCT_MEMORY[product]) return;
  delete PRODUCT_MEMORY[product];
  persistProductMemory();
  if (state.editingMemoryKey === product) {
    cancelMemoryEdit(true);
  }
  els.memoryStatus.textContent = `Producto borrado: ${product}`;
  renderMemoryTable();
  classify();
}

function persistProductMemory() {
  localStorage.setItem(PRODUCT_MEMORY_STORAGE_KEY, JSON.stringify(PRODUCT_MEMORY));
}

function toggleMemoryPanel() {
  const willOpen = els.memoryPanel.hidden;
  els.memoryPanel.hidden = !willOpen;
  els.toggleMemoryBtn.textContent = willOpen ? 'Ocultar memoria' : 'Abrir memoria';
}

function loadProductMemory() {
  try {
    const saved = JSON.parse(localStorage.getItem(PRODUCT_MEMORY_STORAGE_KEY) || '{}');
    return { ...DEFAULT_PRODUCT_MEMORY, ...saved };
  } catch {
    return { ...DEFAULT_PRODUCT_MEMORY };
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/'/g, '&#39;');
}
