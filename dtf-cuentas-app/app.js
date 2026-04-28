const STORAGE_KEYS = {
  clients: 'dtf-cuentas-clients-v1',
  history: 'dtf-cuentas-history-v1',
};

const DEFAULT_CLIENTS = {
  Bilbao: {
    name: 'Bilbao',
    prices: { 'A3+': 5.2, 'A3': 4.5, 'A4': 3.2, 'METRO': 24 },
    shipping: { mode: 'threshold', threshold: 100, fee: 8.5 },
  },
  Madrid: {
    name: 'Madrid',
    prices: { 'A3+': 5.4, 'A3': 4.7, 'A4': 3.3, 'METRO': 25 },
    shipping: { mode: 'threshold', threshold: 100, fee: 8.5 },
  },
  Barcelona: {
    name: 'Barcelona',
    prices: { 'A3+': 5.3, 'A3': 4.6, 'A4': 3.25, 'METRO': 24.5 },
    shipping: { mode: 'threshold', threshold: 100, fee: 8.5 },
  },
};

const state = {
  clients: loadClients(),
  history: loadHistory(),
  currentClient: 'Bilbao',
  parsedLines: [],
  issues: [],
  lastOutput: '',
};

const els = mapElements();
init();

function mapElements() {
  return {
    clientSelect: document.getElementById('clientSelect'),
    deliveryDate: document.getElementById('deliveryDate'),
    defaultBlock: document.getElementById('defaultBlock'),
    manualShipping: document.getElementById('manualShipping'),
    formatPrices: document.getElementById('formatPrices'),
    shippingMode: document.getElementById('shippingMode'),
    shippingThreshold: document.getElementById('shippingThreshold'),
    shippingFee: document.getElementById('shippingFee'),
    rawInput: document.getElementById('rawInput'),
    txtFileInput: document.getElementById('txtFileInput'),
    footerNote: document.getElementById('footerNote'),
    issuesList: document.getElementById('issuesList'),
    previewTableBody: document.getElementById('previewTableBody'),
    outputText: document.getElementById('outputText'),
    historyList: document.getElementById('historyList'),
    dailySummary: document.getElementById('dailySummary'),
    summaryBadge: document.getElementById('summaryBadge'),
    totalsBadge: document.getElementById('totalsBadge'),
    generateBtn: document.getElementById('generateBtn'),
    saveRecordBtn: document.getElementById('saveRecordBtn'),
    newClientBtn: document.getElementById('newClientBtn'),
    addFormatBtn: document.getElementById('addFormatBtn'),
    copyBtn: document.getElementById('copyBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    resetBtn: document.getElementById('resetBtn'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
  };
}

function init() {
  renderClientSelect();
  fillClientConfig();
  renderHistory();
  bindEvents();
  regenerate();
}

function bindEvents() {
  els.clientSelect.addEventListener('change', () => {
    state.currentClient = els.clientSelect.value;
    fillClientConfig();
    regenerate();
  });
  els.generateBtn.addEventListener('click', regenerate);
  els.deliveryDate.addEventListener('input', regenerate);
  els.defaultBlock.addEventListener('change', regenerate);
  els.manualShipping.addEventListener('input', regenerate);
  els.footerNote.addEventListener('input', regenerate);
  els.rawInput.addEventListener('input', regenerate);
  els.copyBtn.addEventListener('click', copyOutput);
  els.downloadBtn.addEventListener('click', downloadOutput);
  els.saveRecordBtn.addEventListener('click', saveCurrentRecord);
  els.resetBtn.addEventListener('click', resetInput);
  els.newClientBtn.addEventListener('click', createClient);
  els.addFormatBtn.addEventListener('click', addFormatRow);
  els.clearHistoryBtn.addEventListener('click', clearHistory);
  els.txtFileInput.addEventListener('change', importTxtFile);
  [els.shippingMode, els.shippingThreshold, els.shippingFee].forEach((el) => {
    el.addEventListener('input', saveClientConfigAndRegenerate);
    el.addEventListener('change', saveClientConfigAndRegenerate);
  });
}

function loadClients() {
  try {
    return { ...DEFAULT_CLIENTS, ...JSON.parse(localStorage.getItem(STORAGE_KEYS.clients) || '{}') };
  } catch {
    return { ...DEFAULT_CLIENTS };
  }
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || '[]');
  } catch {
    return [];
  }
}

function persistClients() {
  localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(state.clients));
}

function persistHistory() {
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(state.history));
}

function renderClientSelect() {
  els.clientSelect.innerHTML = Object.keys(state.clients)
    .sort((a, b) => a.localeCompare(b))
    .map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)
    .join('');
  if (!state.clients[state.currentClient]) state.currentClient = Object.keys(state.clients)[0];
  els.clientSelect.value = state.currentClient;
}

function fillClientConfig() {
  const client = state.clients[state.currentClient];
  if (!client) return;
  renderPriceRows(client.prices);
  els.shippingMode.value = client.shipping.mode;
  els.shippingThreshold.value = client.shipping.threshold ?? 100;
  els.shippingFee.value = client.shipping.fee ?? 0;
}

function renderPriceRows(prices) {
  const formats = Object.entries(prices);
  els.formatPrices.innerHTML = formats
    .map(([format, price]) => `
      <div class="row-price-grid" data-format-row>
        <input class="format-name" value="${escapeAttr(format)}" placeholder="Formato" />
        <input class="format-price" type="number" step="0.01" min="0" value="${Number(price)}" placeholder="Precio" />
        <button class="btn btn-ghost remove-format-btn" type="button">Eliminar</button>
      </div>
    `)
    .join('');

  els.formatPrices.querySelectorAll('[data-format-row]').forEach((row) => {
    row.querySelector('.format-name').addEventListener('input', saveClientConfigAndRegenerate);
    row.querySelector('.format-price').addEventListener('input', saveClientConfigAndRegenerate);
    row.querySelector('.remove-format-btn').addEventListener('click', () => {
      row.remove();
      saveClientConfigAndRegenerate();
    });
  });
}

function saveClientConfigAndRegenerate() {
  const client = state.clients[state.currentClient];
  const prices = {};
  els.formatPrices.querySelectorAll('[data-format-row]').forEach((row) => {
    const name = normalizeFormat(row.querySelector('.format-name').value);
    const price = Number(row.querySelector('.format-price').value || 0);
    if (name) prices[name] = price;
  });
  client.prices = prices;
  client.shipping = {
    mode: els.shippingMode.value,
    threshold: Number(els.shippingThreshold.value || 0),
    fee: Number(els.shippingFee.value || 0),
  };
  persistClients();
  regenerate();
}

function addFormatRow() {
  const client = state.clients[state.currentClient];
  client.prices[`FORMATO_${Object.keys(client.prices).length + 1}`] = 0;
  persistClients();
  fillClientConfig();
}

function createClient() {
  const name = prompt('Nombre del nuevo cliente o zona');
  if (!name) return;
  const clean = name.trim();
  if (!clean) return;
  state.clients[clean] = {
    name: clean,
    prices: { 'A3+': 0, 'A3': 0, 'A4': 0, 'METRO': 0 },
    shipping: { mode: 'threshold', threshold: 100, fee: 8.5 },
  };
  state.currentClient = clean;
  persistClients();
  renderClientSelect();
  fillClientConfig();
  regenerate();
}

function importTxtFile(event) {
  const [file] = event.target.files || [];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    els.rawInput.value = reader.result;
    regenerate();
  };
  reader.readAsText(file, 'utf-8');
}

function resetInput() {
  els.rawInput.value = '';
  els.footerNote.value = '';
  els.manualShipping.value = '';
  state.parsedLines = [];
  regenerate();
}

function regenerate() {
  const client = state.clients[state.currentClient];
  const raw = els.rawInput.value;
  const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const { items, issues } = parseLines(lines, client.prices, els.defaultBlock.value);
  state.parsedLines = items;
  state.issues = issues;
  renderIssues(issues);
  renderPreviewTable();
  renderOutput();
}

function parseLines(lines, priceMap, defaultBlock) {
  const items = [];
  const issues = [];
  let currentBlock = defaultBlock;

  lines.forEach((line, index) => {
    if (/^(ENCARGOS|PEDIDOS|PRUEBA)\s*:?$/i.test(line)) {
      currentBlock = line.replace(':', '').toUpperCase();
      return;
    }

    const status = detectStatus(line);
    const cleanLine = line.replace(/\b(SIN CARGO|MUESTRA|PRUEBA)\b/gi, '').trim();
    const match = cleanLine.match(/^(\d+(?:[.,]\d+)?|\d+\/\d+)\s+([A-Z0-9+]+|METROS?|METRO)\s*(?:\(([^)]+)\))?\s+(.+)$/i);

    if (!match) {
      issues.push({ type: 'error', text: `Línea ${index + 1}: no se pudo interpretar -> "${line}"` });
      return;
    }

    const quantity = parseQuantity(match[1]);
    if (quantity === null) {
      issues.push({ type: 'error', text: `Línea ${index + 1}: cantidad inválida -> "${match[1]}"` });
      return;
    }

    const format = normalizeFormat(match[2]);
    const paren = match[3] || '';
    const name = match[4].trim();

    if (!name) {
      issues.push({ type: 'error', text: `Línea ${index + 1}: falta el nombre del diseño.` });
      return;
    }

    const unitPrice = status === 'NORMAL' ? priceMap[format] : 0;
    if (status === 'NORMAL' && (unitPrice === undefined || unitPrice === null || Number.isNaN(Number(unitPrice)))) {
      issues.push({ type: 'error', text: `Línea ${index + 1}: precio no configurado para formato ${format}.` });
    }

    items.push({
      id: crypto.randomUUID(),
      block: currentBlock,
      rawLine: line,
      quantity,
      quantityDisplay: match[1],
      format,
      paren,
      name,
      unitPrice: Number(unitPrice || 0),
      total: Number((quantity * Number(unitPrice || 0)).toFixed(2)),
      status,
    });
  });

  if (!items.length) issues.push({ type: 'ok', text: 'Sin líneas todavía. Pega una relación y genera la cuenta.' });
  return { items, issues };
}

function renderIssues(issues) {
  els.issuesList.innerHTML = issues.map((issue) => `<li class="${issue.type}">${escapeHtml(issue.text)}</li>`).join('');
}

function renderPreviewTable() {
  els.summaryBadge.textContent = `${state.parsedLines.length} líneas`;
  els.previewTableBody.innerHTML = state.parsedLines.map((item) => `
    <tr data-id="${item.id}">
      <td>
        <select class="line-block">
          ${['ENCARGOS','PEDIDOS','PRUEBA'].map(block => `<option value="${block}" ${item.block === block ? 'selected' : ''}>${block}</option>`).join('')}
        </select>
      </td>
      <td><input class="line-qty" value="${escapeAttr(item.quantityDisplay)}" /></td>
      <td><input class="line-format" value="${escapeAttr(item.format)}" /></td>
      <td><input class="line-paren" value="${escapeAttr(item.paren)}" /></td>
      <td><input class="line-name" value="${escapeAttr(item.name)}" /></td>
      <td><input class="line-price" type="number" step="0.01" value="${item.unitPrice}" /></td>
      <td>${formatCurrency(item.total)}</td>
      <td>
        <select class="line-status status-select">
          ${['NORMAL','SIN CARGO','MUESTRA','PRUEBA'].map(status => `<option value="${status}" ${item.status === status ? 'selected' : ''}>${status}</option>`).join('')}
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
  const id = row.dataset.id;
  const item = state.parsedLines.find((entry) => entry.id === id);
  if (!item) return;
  item.block = row.querySelector('.line-block').value;
  item.quantityDisplay = row.querySelector('.line-qty').value.trim();
  item.quantity = parseQuantity(item.quantityDisplay) ?? 0;
  item.format = normalizeFormat(row.querySelector('.line-format').value);
  item.paren = row.querySelector('.line-paren').value.trim();
  item.name = row.querySelector('.line-name').value.trim();
  item.unitPrice = Number(row.querySelector('.line-price').value || 0);
  item.status = row.querySelector('.line-status').value;
  item.total = item.status === 'NORMAL' ? Number((item.quantity * item.unitPrice).toFixed(2)) : 0;
  renderOutput();
}

function renderOutput() {
  const grouped = groupByBlock(state.parsedLines);
  const subtotal = Number(state.parsedLines.reduce((sum, item) => sum + item.total, 0).toFixed(2));
  const shipping = calculateShipping(subtotal);
  const total = Number((subtotal + shipping).toFixed(2));
  els.totalsBadge.textContent = formatCurrency(total);

  const rows = [];
  const delivery = (els.deliveryDate.value || '').trim();
  if (delivery) rows.push(`ENTREGADO ${delivery.toUpperCase()}`);
  rows.push('');

  Object.entries(grouped).forEach(([block, items]) => {
    if (!items.length) return;
    rows.push(block);
    rows.push(formatTextTable(items));
    rows.push('');
  });

  rows.push('--------------------------------------------------------------------------');
  rows.push(`${padRight('SUBTOTAL:', 58)} ${padLeft(formatCurrency(subtotal), 12)}`);
  rows.push(`${padRight('ENVÍO:', 58)} ${padLeft(formatCurrency(shipping), 12)}`);
  rows.push(`${padRight('TOTAL:', 58)} ${padLeft(formatCurrency(total), 12)}`);
  if (els.footerNote.value.trim()) {
    rows.push('');
    rows.push(`NOTA: ${els.footerNote.value.trim()}`);
  }

  state.lastOutput = rows.join('\n').trim();
  els.outputText.textContent = state.lastOutput || 'Aquí aparecerá la cuenta final.';
}

function formatTextTable(items) {
  const tableRows = items.map((item) => ({
    formato: item.format,
    cantidad: item.quantityDisplay,
    nombre: item.status === 'NORMAL' ? item.name : `${item.name} (${item.status})`,
    precio: formatCurrency(item.unitPrice),
    total: formatCurrency(item.total),
  }));

  const widths = {
    formato: Math.max('FORMATO'.length, ...tableRows.map((r) => r.formato.length)),
    cantidad: Math.max('CANTIDAD'.length, ...tableRows.map((r) => r.cantidad.length)),
    nombre: Math.max('NOMBRE'.length, ...tableRows.map((r) => r.nombre.length)),
    precio: Math.max('PRECIO UND'.length, ...tableRows.map((r) => r.precio.length)),
    total: Math.max('TOTAL'.length, ...tableRows.map((r) => r.total.length)),
  };

  const lines = [];
  lines.push([
    padRight('FORMATO', widths.formato),
    padRight('CANTIDAD', widths.cantidad),
    padRight('NOMBRE', widths.nombre),
    padLeft('PRECIO UND', widths.precio),
    padLeft('TOTAL', widths.total),
  ].join('  '));
  lines.push('-'.repeat(widths.formato + widths.cantidad + widths.nombre + widths.precio + widths.total + 8));

  tableRows.forEach((row) => {
    lines.push([
      padRight(row.formato, widths.formato),
      padRight(row.cantidad, widths.cantidad),
      padRight(row.nombre, widths.nombre),
      padLeft(row.precio, widths.precio),
      padLeft(row.total, widths.total),
    ].join('  '));
  });

  return lines.join('\n');
}

function calculateShipping(subtotal) {
  const manual = els.manualShipping.value;
  if (manual !== '') return Number(Number(manual).toFixed(2));
  const client = state.clients[state.currentClient];
  const { mode, threshold, fee } = client.shipping;
  if (mode === 'free') return 0;
  if (mode === 'fixed') return Number(Number(fee).toFixed(2));
  return subtotal > Number(threshold) ? 0 : Number(Number(fee).toFixed(2));
}

function saveCurrentRecord() {
  if (!state.lastOutput.trim()) return alert('Primero genera una cuenta.');
  const record = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    client: state.currentClient,
    deliveryDate: els.deliveryDate.value.trim(),
    total: els.totalsBadge.textContent,
    rawInput: els.rawInput.value,
    output: state.lastOutput,
  };
  state.history.unshift(record);
  persistHistory();
  renderHistory();
}

function renderHistory() {
  els.historyList.innerHTML = state.history.map((record) => `
    <div class="history-item">
      <div>
        <strong>${escapeHtml(record.client)}</strong>
        <div><small>${new Date(record.createdAt).toLocaleString('es-ES')}</small></div>
        <div><small>${escapeHtml(record.deliveryDate || 'Sin fecha')}</small></div>
      </div>
      <div>
        <strong>${escapeHtml(record.total)}</strong>
        <div class="actions-wrap">
          <button class="btn btn-secondary btn-sm" data-load="${record.id}">Cargar</button>
          <button class="btn btn-ghost btn-sm" data-delete="${record.id}">Eliminar</button>
        </div>
      </div>
    </div>
  `).join('');

  els.historyList.querySelectorAll('[data-load]').forEach((btn) => btn.addEventListener('click', () => loadRecord(btn.dataset.load)));
  els.historyList.querySelectorAll('[data-delete]').forEach((btn) => btn.addEventListener('click', () => deleteRecord(btn.dataset.delete)));
  renderDailySummary();
}

function renderDailySummary() {
  const summary = {};
  state.history.forEach((record) => {
    const day = record.createdAt.slice(0, 10);
    const amount = Number((record.total || '0').replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
    summary[day] = (summary[day] || 0) + amount;
  });
  const rows = Object.entries(summary)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([day, total]) => `${day}: ${formatCurrency(total)}`);
  els.dailySummary.textContent = rows.length ? `Resumen por días\n${rows.join('\n')}` : 'Sin cuentas guardadas todavía.';
}

function loadRecord(id) {
  const record = state.history.find((entry) => entry.id === id);
  if (!record) return;
  state.currentClient = record.client;
  renderClientSelect();
  fillClientConfig();
  els.deliveryDate.value = record.deliveryDate || '';
  els.rawInput.value = record.rawInput || '';
  regenerate();
}

function deleteRecord(id) {
  state.history = state.history.filter((entry) => entry.id !== id);
  persistHistory();
  renderHistory();
}

function clearHistory() {
  if (!confirm('¿Seguro que quieres borrar el historial guardado?')) return;
  state.history = [];
  persistHistory();
  renderHistory();
}

function copyOutput() {
  if (!state.lastOutput) return;
  navigator.clipboard.writeText(state.lastOutput);
}

function downloadOutput() {
  if (!state.lastOutput) return;
  const blob = new Blob([state.lastOutput], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cuenta-dtf-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function groupByBlock(items) {
  return items.reduce((acc, item) => {
    (acc[item.block] ||= []).push(item);
    return acc;
  }, {});
}

function detectStatus(line) {
  if (/\bSIN CARGO\b/i.test(line)) return 'SIN CARGO';
  if (/\bMUESTRA\b/i.test(line)) return 'MUESTRA';
  if (/\bPRUEBA\b/i.test(line)) return 'PRUEBA';
  return 'NORMAL';
}

function parseQuantity(raw) {
  const value = raw.replace(',', '.');
  if (value.includes('/')) {
    const [a, b] = value.split('/').map(Number);
    if (!a || !b) return null;
    return a / b;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function normalizeFormat(value) {
  return value.trim().toUpperCase().replace(/\s+/g, '').replace(/^METROS$/, 'METRO');
}

function formatCurrency(value) {
  return `${Number(value).toFixed(2)} €`;
}

function padRight(str, length) {
  return String(str).padEnd(length, ' ');
}

function padLeft(str, length) {
  return String(str).padStart(length, ' ');
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
