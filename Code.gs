// ============================================================
//  Code.gs — Google Apps Script Backend
//  Seminar HMJTI × Permikomnas — Form Registrasi
// ============================================================
//  CARA SETUP:
//  1. Buka spreadsheet Google Sheets kamu
//  2. Klik Extensions > Apps Script
//  3. Paste SELURUH kode ini, ganti SPREADSHEET_ID di bawah
//  4. Simpan (Ctrl+S), lalu Deploy sebagai Web App
// ============================================================

// Ganti dengan ID Spreadsheet kamu
// (ambil dari URL: docs.google.com/spreadsheets/d/INI_ID_NYA/edit)
var SPREADSHEET_ID = "SPREADSHEET_ID_DISINI";
var SHEET_NAME     = "Registrasi"; // nama tab sheet (bisa diganti)

// Header kolom — urutan ini harus sesuai dengan kolom di sheet
var HEADERS = ["Timestamp", "Nama Lengkap", "Instansi", "Jenis Kelamin", "Saran"];

// ------------------------------------------------------------
//  doPost — menangkap request POST dari frontend
// ------------------------------------------------------------
function doPost(e) {
  try {
    var sheet = getOrCreateSheet();

    var timestamp    = new Date().toLocaleString("id-ID", { timeZone: "Asia/Makassar" });
    var nama         = e.parameter.nama         || "";
    var instansi     = e.parameter.instansi     || "";
    var jenisKelamin = e.parameter.jenisKelamin || "";
    var saran        = e.parameter.saran        || "";

    // Validasi sederhana di sisi server
    if (!nama || !instansi || !jenisKelamin) {
      return buildResponse({ status: "error", message: "Field tidak boleh kosong." }, 400);
    }

    // Tambahkan baris baru ke sheet
    sheet.appendRow([timestamp, nama, instansi, jenisKelamin, saran]);

    return buildResponse({ status: "success", message: "Data berhasil disimpan." }, 200);

  } catch (err) {
    return buildResponse({ status: "error", message: err.toString() }, 500);
  }
}

// ------------------------------------------------------------
//  doGet — health check sederhana (opsional, untuk testing)
// ------------------------------------------------------------
function doGet(e) {
  return buildResponse({ status: "ok", message: "API aktif. Gunakan method POST untuk submit data." }, 200);
}

// ------------------------------------------------------------
//  Helper: Ambil sheet (atau buat baru jika belum ada)
// ------------------------------------------------------------
function getOrCreateSheet() {
  var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Tambahkan header di baris pertama
    sheet.appendRow(HEADERS);

    // Format header: bold, freeze, background biru muda
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight("bold")
               .setBackground("#dbeafe")
               .setFontColor("#1e40af");
    sheet.setFrozenRows(1);

    // Set lebar kolom agar rapi
    sheet.setColumnWidth(1, 160); // Timestamp
    sheet.setColumnWidth(2, 220); // Nama
    sheet.setColumnWidth(3, 200); // Instansi
    sheet.setColumnWidth(4, 120); // Jenis Kelamin
    sheet.setColumnWidth(5, 300); // Saran
  }

  return sheet;
}

// ------------------------------------------------------------
//  Helper: Build JSON response dengan header CORS
// ------------------------------------------------------------
function buildResponse(data, statusCode) {
  var output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);

  // Catatan: ContentService di GAS tidak mendukung
  // setHeader() langsung. CORS untuk fetch() dari browser
  // sudah di-handle oleh Google secara internal saat Web App
  // di-deploy dengan akses "Anyone". Tidak perlu tambahan header.

  return output;
}
