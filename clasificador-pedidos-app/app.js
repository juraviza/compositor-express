const CATEGORY_OPTIONS = [
  'Ginebras', 'Rones', 'Whiskies', 'Vodkas y licores', 'Refrescos', 'Cervezas', 'Aguas y energéticas', 'Vinos y vermut', 'Otros'
];

const KEYWORDS = [
  { category: 'Ginebras', terms: ['puerto de indias', 'larios', 'rives', 'seagram', 'segram', 'beefeater', 'befeter', 'tanqueray', 'nordes', 'nordés', 'ginebra'] },
  { category: 'Rones', terms: ['barcelo', 'barceló', 'brugal', 'cacique', 'legendario', 'santa teresa', 'ron', 'exotica', 'exótica'] },
  { category: 'Whiskies', terms: ['ballant', 'ballantais', 'jyb', 'j&b', 'white label', 'joni', 'johnnie', 'joni rojo', 'joni negro', 'cien piper', 'macallan', 'whisky'] },
  { category: 'Vodkas y licores', terms: ['ciroc', 'cîroc', 'bailes', 'baileys', 'tequila', 'jager', 'jäger', 'maria brizard', 'maría brizar', 'anis del mono', 'anís del mono', 'vodca', 'vodka', 'licor'] },
  { category: 'Refrescos', terms: ['coca cola', 'cocacola', 'fanta', 'sprite', 'tonica', 'tónica', 'limonada', 'neste', 'nestea', 'aquarios', 'aquarius'] },
  { category: 'Cervezas', terms: ['cruzcampo', 'heineken', 'heniker', 'radler', 'aguila', 'águila', 'cerveza', 'barril'] },
  { category: 'Aguas y energéticas', terms: ['agua', 'monster', 'moster'] },
  { category: 'Vinos y vermut', terms: ['martini', 'miura', 'vermut', 'vino'] },
];

const state = {
  items: [],
  issues: [],
  lastOutput: '',
};

const els = {
  rawInput: document.getElementById('rawInput'),
  txtFileInput: document.getElementById('txtFileInput'),
  classifyBtn: document.getElementById('classifyBtn'),
  copyBtn: document.getElementById('copyBtn'),
  resetBtn: document.getElementById('resetBtn'),
  whatsBtn: document.getElementById('whatsBtn'),
  issuesList: document.getElementById('issuesList'),
  categoryCards: document.getElementById('categoryCards'),
  previewTableBody: document.getElementById('previewTableBody'),
  outputText: document.getElementById('outputText'),
  linesBadge: document.getElementById('linesBadge'),
  categoriesBadge: document.getElementById('categoriesBadge'),
  productsBadge: document.getElementById('productsBadge'),
};

bindEvents();
classify();

function bindEvents() {
  els.classifyBtn.addEventListener('click', classify);
  els.copyBtn.addEventListener('click', copyOutput);
  els.resetBtn.addEventListener('click', resetAll);
  els.whatsBtn.addEventListener('click', copyOutput);
  els.txtFileInput.addEventListener('change', importTxtFile);
}

function importTxtFile(event) {
  const [file] = event.target.files || [];
  if (!file) return;
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
  renderAll();
}

function classify() {
  const lines = String(els.rawInput.value || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

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
    .trim();
}

function detectCategory(product) {
  const p = product.toLowerCase();
  for (const group of KEYWORDS) {
    if (group.terms.some((term) => p.includes(term))) return group.category;
  }
  return 'Otros';
}

function renderAll() {
  renderIssues();
  renderCards();
  renderTable();
  renderOutput();
  renderStats();
}

function renderIssues() {
  els.issuesList.innerHTML = state.issues.map((issue) => `<li>${escapeHtml(issue)}</li>`).join('');
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

function copyOutput() {
  if (!state.lastOutput) return;
  navigator.clipboard.writeText(state.lastOutput);
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
