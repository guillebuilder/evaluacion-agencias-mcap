// ══════════════════════════════════════════════════════════════════
//  GOOGLE APPS SCRIPT — Evaluación Agencias MCAP & TGA
//  Instrucciones:
//  1. Abrí Google Sheets → Extensions → Apps Script
//  2. Borrá el código existente y pegá TODO este archivo
//  3. Clic en "Deploy" → "New deployment" → Type: "Web app"
//  4. Execute as: Me | Who has access: Anyone
//  5. Copiá la URL que te da ("Web app URL")
//  6. Pegala en el banner de configuración del Formulario y del Dashboard
// ══════════════════════════════════════════════════════════════════

const SHEET_NAME = 'Evaluaciones';

const HEADERS = [
  'Timestamp',
  'Evaluador',
  'Empresa',
  'Agencia',
  'C1_Brief',
  'C2_B2B',
  'C3_B2C',
  'C4_Creatividad',
  'C5_Canales',
  'C6_Metricas',
  'C7_Inversion',
  'C8_Equipo',
  'PuntajeTotal',
  'Recomendacion',
  'Comentarios'
];

// ── Recibe evaluaciones desde el formulario ──
function doPost(e) {
  try {
    const raw = e.postData ? e.postData.contents : '';
    const data = JSON.parse(raw);

    const sheet = getOrCreateSheet();
    sheet.appendRow([
      new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' }),
      data.evaluador    || '',
      data.empresa      || '',
      data.agencia      || '',
      data.scores[0]    || '',
      data.scores[1]    || '',
      data.scores[2]    || '',
      data.scores[3]    || '',
      data.scores[4]    || '',
      data.scores[5]    || '',
      data.scores[6]    || '',
      data.scores[7]    || '',
      data.total        || '',
      data.recomendacion|| '',
      data.comentarios  || ''
    ]);

    return jsonResponse({ ok: true, message: 'Evaluación guardada correctamente.' });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

// ── Devuelve todas las evaluaciones al dashboard ──
function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) {
      return jsonResponse({ ok: true, rows: [] });
    }

    const headers = values[0];
    const rows = values.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    });

    return jsonResponse({ ok: true, rows });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

// ── Helpers ──
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#1a3c5e');
    headerRange.setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
