// V4.155 — Ngày nghỉ + Lịch ngày bám Lịch báo giảng; giữ Hoán đổi/Phát sinh/Kho PPCT.

const TKB_SPREADSHEET_ID = '1i0-iNIQeETSy__VGcNUmsD0Rj23XV-GaMF4FkNwgu58';

const BAO_GIANG_SPREADSHEET_ID = '1PUckZOOB3SyRp3P-zWuYxvtVRgxYBXGiz-2Prt6hBNU';
const TIEN_DO_SPREADSHEET_ID = '1VCBn0YroVlXDkkwxO7rl4yOM9i-pcehxyWSZ_BuleWE';
const LICH_TUAN_SPREADSHEET_ID = '1Hzq7mouds8EiREs1VBg6a9ciTTVNe3x0dnpjvujr7Kc';
const LICH_TUAN_TEMPLATE_SHEETS = ['Goc', 'Mau'];
const DEFAULT_BAO_GIANG_SHEET_NAME = '17-22.8';

// V4.122: Thêm lịch Hôm nay / Ngày mai / Cả tuần; Cả tuần bám theo tuần Báo giảng đang chọn.
// V4.121: Lịch báo giảng là nguồn tiến độ thực tế. Sau khi người dùng xóa/sửa tiết,
// V4.149 — TKB: bỏ tiết chữ trắng hoặc bị gạch ngang; chữ đỏ/lịch điều chỉnh vẫn được đọc bình thường.
// V4.148 — PPCT Parser V2 tổng quát (PPCT trực tiếp / Bài-Chủ đề × Số tiết / ghi chú dạy sau kiểm tra).
// V4.135 — TKB tự nhận tiết CĐ; PPCT chính khóa và CĐ chạy độc lập; Google Docs đọc cả Chuyên đề lựa chọn.
// chức năng Cập nhật PPCT sẽ dồn lại PPCT theo từng lớp và ghi ngược vào chính Báo giảng.
// Nguồn PPCT là cấu hình ít dùng, chỉ để tra tên bài theo số PPCT.
// Hỗ trợ Google Sheets hoặc Google Docs (bảng có cột PPCT + Tên bài/Nội dung + Khối/Lớp).
const PPCT_SOURCE_DEFAULT = '';
// V4.154 — Hoàn thiện Cổng giáo viên, chuẩn hóa tổ/BGH và sửa Kho PPCT lần mở đầu.
const PPCT_SOURCE_PROPERTY = 'PPCT_SOURCE_URL';

// V4.143 — Một bộ mã dùng chung cho nhiều giáo viên. Mỗi giáo viên mở bằng ?gv=<slug>.
const FIXED_TEACHER_KEY = 'T.Tuấn'; // fallback khi link không có/không hợp lệ
const TEACHER_PROFILES = {
  'Phương': {fullName:'Lê Thị Lan Phương', slug:'phuong'},
  'T.Tuấn': {fullName:'Nguyễn Thanh Tuấn', slug:'t-tuan'},
  'V.Diệp': {fullName:'Vi Thị Diệp', slug:'v-diep'},
  'Hường': {fullName:'Lâm Thị Thu Hường', slug:'huong'},
  'Phong': {fullName:'Nguyễn Thế Phong', slug:'phong'},
  'Hà Oanh': {fullName:'Hà Thị Thu Oanh', slug:'ha-oanh'},
  'L.Tuấn': {fullName:'Lưu Công Tuấn', slug:'l-tuan'},
  'N.Ngọc': {fullName:'Nông Thị Bích Ngọc', slug:'n-ngoc'},
  'T.Ngọc': {fullName:'Trương Thị Mỹ Ngọc', slug:'t-ngoc'},
  'Chi': {fullName:'Vũ Huyền Chi', slug:'chi'},
  'Na': {fullName:'Nguyễn Thị Na', slug:'na'},
  'Quyên': {fullName:'Nguyễn Hồng Quyên', slug:'quyen'},
  'Huệ': {fullName:'Nông Thị Huệ', slug:'hue'},
  'M.Anh': {fullName:'Ma Thị Anh', slug:'m-anh'},
  'Lanh': {fullName:'Nông Hồng Lanh', slug:'lanh'},
  'Đ.Diệp': {fullName:'Đàm Thị Diệp', slug:'d-diep'},
  'K.Diệp': {fullName:'Hoàng Khánh Diệp', slug:'k-diep'},
  'V.Anh': {fullName:'Trần Thị Vân Anh', slug:'v-anh'},
  'Hiền': {fullName:'Lý Thu Hiền', slug:'hien'},
  'Bằng': {fullName:'Nông Thị Thu Bằng', slug:'bang'},
  'Thoa': {fullName:'Lê Kim Thoa', slug:'thoa'},
  'Ng.Liễu': {fullName:'Nguyễn Thị Liễu', slug:'ng-lieu'},
  'L.Thủy': {fullName:'Lương Thị Thanh Thủy', slug:'l-thuy'},
  'T.Oanh': {fullName:'Trần Thị Kim Oanh', slug:'t-oanh'},
  'Hà': {fullName:'Hoàng Thị Ngọc Hà', slug:'ha'},
  'Mai': {fullName:'Lê Thị Mai', slug:'mai'},
  'Dung': {fullName:'Hà Thị Phương Dung', slug:'dung'},
  'Vân': {fullName:'Hoàng Thị Thanh Vân', slug:'van'},
  'Đàn': {fullName:'Triệu Thị Đàn', slug:'dan'},
  'Liễu': {fullName:'Nguyễn Thị Ngọc Liễu', slug:'lieu'},
  'Thắng': {fullName:'Trần Chiến Thắng', slug:'thang'},
  'Hiếu': {fullName:'Nông Trung Hiếu', slug:'hieu'},
  'Long': {fullName:'Lương Vũ Long', slug:'long'}
};
const TEACHER_MAP = Object.keys(TEACHER_PROFILES).reduce((m,k)=>(m[k]=TEACHER_PROFILES[k].fullName,m),{});
const TEAM_LEADERS = {'KHTN': 'Nguyễn Hồng Quyên','KHXH': 'Lương Thị Thanh Thủy'};

function teacherSlug_(value){
  let s=String(value||'').trim().toLowerCase();
  try{s=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');}catch(e){}
  return s.replace(/đ/g,'d').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}
function resolveTeacherKey_(ref){
  const raw=String(ref||'').trim();
  if(!raw)return FIXED_TEACHER_KEY;
  if(TEACHER_PROFILES[raw])return raw;
  const target=teacherSlug_(raw);
  const hit=Object.keys(TEACHER_PROFILES).find(k=>{
    const p=TEACHER_PROFILES[k]||{};
    return target===teacherSlug_(p.slug)||target===teacherSlug_(k)||target===teacherSlug_(p.fullName);
  });
  return hit||FIXED_TEACHER_KEY;
}


// V4.124 — Danh mục giáo viên tích hợp sẵn để nhận diện tổ tức thì, không cần quét Sheet khi mở app.
// Nguồn đối chiếu: danh sách đội ngũ của trường (Họ tên, Tổ CM/CN, Môn).
const TEACHER_DIRECTORY = {
  'Lê Thị Lan Phương': {org:'BGH', team:'KHXH', subject:'GDĐP', role:'Hiệu trưởng'},
  'Nguyễn Thế Phong': {org:'BGH', team:'KHTN', subject:'Toán', role:'Phó Hiệu trưởng'},
  'Hà Thị Thu Oanh': {org:'BGH', team:'KHTN', subject:'Toán', role:'Phó Hiệu trưởng'},
  'Lưu Công Tuấn': {org:'KHTN', team:'KHTN', subject:'Vật lí'},
  'Hoàng Thị Lan': {org:'KHTN', team:'KHTN', subject:'Toán'},
  'Đàm Thị Diệp': {org:'KHXH', team:'KHXH', subject:'Ngữ văn'},
  'Triệu Thị Đàn': {org:'KHXH', team:'KHXH', subject:'Tiếng Anh'},
  'Nguyễn Thị Ngọc Liễu': {org:'KHXH', team:'KHXH', subject:'GDTC'},
  'Hoàng Khánh Diệp': {org:'KHXH', team:'KHXH', subject:'Ngữ văn'},
  'Hoàng Thị Ngọc Hà': {org:'KHXH', team:'KHXH', subject:'GDKTPL'},
  'Nông Thị Thu Bằng': {org:'KHXH', team:'KHXH', subject:'Ngữ văn'},
  'Lương Thị Thanh Thủy': {org:'KHXH', team:'KHXH', subject:'Địa lí'},
  'Trần Thị Vân Anh': {org:'KHXH', team:'KHXH', subject:'Ngữ văn'},
  'Hà Thị Phương Dung': {org:'KHXH', team:'KHXH', subject:'Tiếng Anh'},
  'Nguyễn Hồng Quyên': {org:'KHTN', team:'KHTN', subject:'Sinh học'},
  'Ma Thị Anh': {org:'KHTN', team:'KHTN', subject:'Tin học'},
  'Nông Thị Huệ': {org:'KHTN', team:'KHTN', subject:'Sinh học'},
  'Nông Thị Bích Ngọc': {org:'KHTN', team:'KHTN', subject:'Vật lí'},
  'Nông Hồng Lanh': {org:'KHTN', team:'KHTN', subject:'Tin học'},
  'Trương Thị Mỹ Ngọc': {org:'KHTN', team:'KHTN', subject:'Vật lí'},
  'Vi Thị Diệp': {org:'KHTN', team:'KHTN', subject:'Toán'},
  'Nguyễn Thanh Tuấn': {org:'KHTN', team:'KHTN', subject:'Toán'},
  'Nông Trung Hiếu': {org:'KHXH', team:'KHXH', subject:'GDQPAN'},
  'Trần Chiến Thắng': {org:'KHXH', team:'KHXH', subject:'GDTC'},
  'Nguyễn Thị Na': {org:'KHTN', team:'KHTN', subject:'Hoá học'},
  'Vũ Huyền Chi': {org:'KHTN', team:'KHTN', subject:'Hoá học'},
  'Lê Kim Thoa': {org:'KHXH', team:'KHXH', subject:'Lịch sử'},
  'Lý Thu Hiền': {org:'KHXH', team:'KHXH', subject:'Ngữ văn'},
  'Lê Thị Mai': {org:'KHXH', team:'KHXH', subject:'Tiếng Anh'},
  'Hoàng Lệ Thủy': {org:'QLHS', team:'', subject:'Âm nhạc'},
  'Lương Vũ Long': {org:'QLHS', team:'KHTN', subject:'Công nghệ'}, // Báo giảng đang dùng KHTN
  'Lâm Thị Thu Hường': {org:'KHTN', team:'KHTN', subject:'Toán'},
  'Trần Thị Kim Oanh': {org:'KHXH', team:'KHXH', subject:'Địa lí'},
  'Hoàng Thị Thanh Vân': {org:'KHXH', team:'KHXH', subject:'Tiếng Anh'},
  'Nguyễn Thị Liễu': {org:'KHXH', team:'KHXH', subject:'Lịch sử'}
};

function normalizeTeacherNameKey_(value){
  let s=String(value||'').replace(/\s+/g,' ').trim().toLowerCase();
  try{s=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');}catch(e){}
  return s.replace(/đ/g,'d');
}
function getTeacherDirectoryInfo_(teacherKeyOrName){
  const fullName=TEACHER_MAP[teacherKeyOrName]||String(teacherKeyOrName||'').trim();
  const target=normalizeTeacherNameKey_(fullName);
  const name=Object.keys(TEACHER_DIRECTORY).find(n=>normalizeTeacherNameKey_(n)===target);
  if(!name)return {name:fullName,org:'',team:'',subject:'',leader:''};
  const info=TEACHER_DIRECTORY[name]||{};
  const team=info.team||'';
  return {name:name,org:info.org||'',team:team,subject:info.subject||'',role:info.role||'',leader:TEAM_LEADERS[team]||''};
}
function getTeacherTeam_(teacherKeyOrName){return getTeacherDirectoryInfo_(teacherKeyOrName).team||'';}

// V4.101: chỉ chọn đúng phiên bản TKB; app tự suy ra tuần Báo giảng theo khoảng ngày.
// Mỗi tuần có thể có nhiều phiên bản TKB (ví dụ TKB 24-29.8, TKB(GV) 24-29.8).
// Server luôn khóa sheet Báo giảng theo token ngày của TKB để không thể ghi nhầm tuần.
function extractWeekToken_(name) {
  const txt=String(name||'').trim();
  let m=txt.match(/(\d{1,2})(?:\.(\d{1,2}))?\s*[-–]\s*(\d{1,2})\.(\d{1,2})/);
  if(m){const d1=Number(m[1]),m1=Number(m[2]||m[4]),d2=Number(m[3]),m2=Number(m[4]);return d1+'.'+m1+'-'+d2+'.'+m2;}
  m=txt.match(/(\d{1,2})\s*[-–]\s*(\d{1,2})\.(\d{1,2})/);
  if(m){const d1=Number(m[1]),d2=Number(m[2]),mm=Number(m[3]);return d1+'.'+mm+'-'+d2+'.'+mm;}
  return '';
}
function compactWeekLabel_(token){const m=String(token||'').match(/(\d+)\.(\d+)-(\d+)\.(\d+)/);if(!m)return token||'';return Number(m[2])===Number(m[4])?(Number(m[1])+'-'+Number(m[3])+'.'+Number(m[4])):(Number(m[1])+'.'+Number(m[2])+'-'+Number(m[3])+'.'+Number(m[4]));}
function inferMondayFromWeekToken_(token){const m=String(token||'').match(/(\d+)\.(\d+)-(\d+)\.(\d+)/);if(!m)return '';const d=new Date(2026,Number(m[2])-1,Number(m[1]),12,0,0);return Utilities.formatDate(d,'Asia/Ho_Chi_Minh','yyyy-MM-dd');}
function listWeekSheets_(){const ss=SpreadsheetApp.openById(BAO_GIANG_SPREADSHEET_ID);return ss.getSheets().map(sh=>sh.getName()).map(name=>({name:name,token:extractWeekToken_(name)})).filter(x=>x.token&&!/^(mau|vi\s*tri|vị\s*trí)/i.test(x.name)).map(x=>({name:x.name,token:x.token,label:'Tuần '+compactWeekLabel_(x.token),monday:inferMondayFromWeekToken_(x.token)}));}
function listTkbWeekSheets_(){
  const ss=SpreadsheetApp.openById(TKB_SPREADSHEET_ID);
  const rows=ss.getSheets().map((sh,order)=>{
    const name=sh.getName();
    const token=extractWeekToken_(name);
    return {name:name,token:token,order:order};
  }).filter(x=>x.token);
  const counts={};
  rows.forEach(x=>counts[x.token]=(counts[x.token]||0)+1);
  return rows.map(x=>({
    name:x.name,
    token:x.token,
    label:x.name,
    weekLabel:'Tuần '+compactWeekLabel_(x.token),
    variantCount:counts[x.token],
    order:x.order
  }));
}
function findReportSheetForToken_(token){return listWeekSheets_().find(x=>x.token===token)||null;}
function getSelectedReportSheetName_(payload){
  const explicit=normalizeText_(payload&&payload.reportSheet);
  const tkbName=normalizeText_(payload&&payload.tkbSheet);
  const token=extractWeekToken_(tkbName);
  // Có TKB được chọn => TKB là nguồn quyết định duy nhất của tuần Báo giảng.
  // Không bao giờ tin một reportSheet khác tuần do giao diện cũ/cache gửi lên.
  if(token){
    const hit=findReportSheetForToken_(token);
    if(hit)return hit.name;
    throw new Error('Chưa có Báo giảng tuần '+compactWeekLabel_(token)+'.');
  }
  // Chỉ giữ fallback này cho các hàm cũ không truyền tkbSheet.
  if(explicit){
    const ss=SpreadsheetApp.openById(BAO_GIANG_SPREADSHEET_ID);
    if(ss.getSheetByName(explicit))return explicit;
  }
  throw new Error('Chưa chọn Thời khóa biểu.');
}
function getSelectedTkbSheetName_(payloadOrName){const name=normalizeText_(typeof payloadOrName==='string'?payloadOrName:(payloadOrName&&payloadOrName.tkbSheet));if(!name)throw new Error('Hãy chọn Thời khóa biểu trước.');const ss=SpreadsheetApp.openById(TKB_SPREADSHEET_ID);if(!ss.getSheetByName(name))throw new Error('Không tìm thấy sheet TKB: '+name);return name;}

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    // Apps Script ignores <meta name="viewport"> written directly in Index.html.
    // Add it to HtmlOutput so mobile browsers use the real device width.
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .setTitle('Lịch Báo Giảng – DTNT Cao Bằng')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getInitialData(teacherRef) {
  const weekSheets=listWeekSheets_();
  const tkbSheets=listTkbWeekSheets_();
  const firstTkb=tkbSheets.length?tkbSheets[0]:null;
  const matched=firstTkb?findReportSheetForToken_(firstTkb.token):null;
  const first=matched||(weekSheets.length?weekSheets[0]:{name:DEFAULT_BAO_GIANG_SHEET_NAME,monday:'2026-08-17',token:'17.8-22.8'});
  const activeTeacherKey=resolveTeacherKey_(teacherRef);
  const fixedTeacherInfo=getTeacherDirectoryInfo_(activeTeacherKey);
  const profile=TEACHER_PROFILES[activeTeacherKey]||{fullName:TEACHER_MAP[activeTeacherKey]||activeTeacherKey,slug:teacherSlug_(activeTeacherKey)};
  return {teachers:[{key:activeTeacherKey,fullName:profile.fullName,directory:fixedTeacherInfo,slug:profile.slug}],activeTeacherKey:activeTeacherKey,activeTeacherSlug:profile.slug,week:1,monday:first.monday||'2026-08-17',teams:Object.keys(TEAM_LEADERS).map(k=>({key:k,leader:TEAM_LEADERS[k]})),recognizedTeam:fixedTeacherInfo.team||'',teacherDirectoryInfo:fixedTeacherInfo,weekSheets:weekSheets,tkbSheets:tkbSheets,tkbSheet:firstTkb?firstTkb.name:'',reportSheet:first.name,weekToken:firstTkb?firstTkb.token:first.token,tkbVariantCount:firstTkb?firstTkb.variantCount:0,reportUrl:'https://docs.google.com/spreadsheets/d/'+BAO_GIANG_SPREADSHEET_ID+'/edit',progressUrl:'https://docs.google.com/spreadsheets/d/'+TIEN_DO_SPREADSHEET_ID+'/edit'};
}

function normalizeText_(s) {
  return String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
}

function parseTeacherMathLine_(cell, teacherKey) {
  const lines = String(cell == null ? '' : cell).split(/\r?\n/).map(x => normalizeText_(x)).filter(Boolean);
  const target = 'toán - ' + teacherKey.toLowerCase();
  return lines.some(line => line.toLowerCase() === target);
}

function readMathSchedule_(teacherKey, tkbSheetName) {
  if(!TEACHER_MAP[teacherKey]) throw new Error('Giáo viên không hợp lệ.');
  const ss=SpreadsheetApp.openById(TKB_SPREADSHEET_ID); const sh=ss.getSheetByName(getSelectedTkbSheetName_(tkbSheetName));
  const lastCol=Math.min(Math.max(sh.getLastColumn(),18),40); const values=sh.getRange(1,1,Math.min(sh.getLastRow(),160),lastCol).getDisplayValues();
  const headers=values[0].slice(3).map(h=>String(h).split('\n')[0].trim()); let currentDay='',currentSession=''; const records=[];
  for(let r=1;r<values.length;r++){const row=values[r];if(row[0])currentDay=String(row[0]).trim();if(row[1])currentSession=normalizeText_(row[1]);if(currentSession!=='Sáng'&&currentSession!=='Chiều')continue;const period=Number(row[2]);if(!period||period<1||period>5)continue;const dm=String(currentDay).match(/(?:Thứ\s*)?([2-7])\b/i);const dayToken=dm?dm[1]:String(currentDay).split(/\s|\n/)[0].trim();if(!/^[2-7]$/.test(dayToken))continue;for(let c=3;c<row.length;c++){if(parseTeacherMathLine_(row[c],teacherKey))records.push({dayNum:Number(dayToken),dayLabel:'Thứ '+dayToken,dateLabel:'',session:currentSession,period:period,subject:'Toán',className:headers[c-3]||''});}}
  records.sort((a,b)=>(a.dayNum-b.dayNum)||((a.session==='Sáng'?0:1)-(b.session==='Sáng'?0:1))||(a.period-b.period)||a.className.localeCompare(b.className)); return records;
}

function getDateForDay_(dayNum) {
  const dates = {2:'17/08/2026',3:'18/08/2026',4:'19/08/2026',5:'20/08/2026',6:'21/08/2026',7:'22/08/2026'};
  return dates[dayNum] || '';
}

// ===== V4.129: BỔ SUNG QUYỀN DOCS + LỖI NGUỒN PPCT THÂN THIỆN =====
// ===== V4.117: NGUỒN PPCT/KẾ HOẠCH DẠY HỌC CHUẨN =====
function getPpctSourceUrl_() {
  try {
    return normalizeText_(PropertiesService.getScriptProperties().getProperty(PPCT_SOURCE_PROPERTY) || PPCT_SOURCE_DEFAULT);
  } catch (e) {
    return normalizeText_(PPCT_SOURCE_DEFAULT);
  }
}

function extractDriveFileId_(value) {
  const txt = normalizeText_(value);
  if (!txt) return '';
  const m = txt.match(/\/d\/([A-Za-z0-9_-]{20,})/) || txt.match(/^([A-Za-z0-9_-]{20,})$/);
  return m ? m[1] : '';
}

function keyText_(s) {
  let t = normalizeText_(s).toLowerCase();
  try { t = t.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); } catch (e) {}
  return t.replace(/đ/g, 'd');
}

function parseGrade_(value) {
  const m = normalizeText_(value).match(/(?:^|\D)(10|11|12)(?:\D|$)/);
  return m ? Number(m[1]) : null;
}

function parsePpctNumbers_(value) {
  // V4.134: hỗ trợ các cách ghi thực tế trong Kế hoạch dạy học:
  // 1-4, 1- 6, 6 - 10, 4, 5, 33,34,\n35,36, 46,47\n48 ...
  const txt = normalizeText_(value)
    .replace(/ppct/ig, '')
    .replace(/ti[eế]t/ig, '')
    .replace(/[–—−]/g, '-');
  if (!txt) return [];

  const out = [];
  const seen = {};
  const re = /(\d{1,3})\s*-\s*(\d{1,3})|(\d{1,3})/g;
  let m;
  while ((m = re.exec(txt)) !== null) {
    if (m[1] && m[2]) {
      const a = Number(m[1]), b = Number(m[2]);
      if (a > 0 && b >= a && b < 300 && b - a <= 60) {
        for (let n = a; n <= b; n++) {
          if (!seen[n]) { seen[n] = true; out.push(n); }
        }
      }
    } else if (m[3]) {
      const n = Number(m[3]);
      if (n > 0 && n < 300 && !seen[n]) { seen[n] = true; out.push(n); }
    }
  }
  return out;
}

function addCurriculumMatrix_(matrix, sourceName, target, options) {
  if (!matrix || !matrix.length) return 0;
  options = options || {};
  const allowTt = !!options.allowTt;
  const forcedGrade = Number(options.grade) || null;
  const scanRows = Math.min(matrix.length, 30);
  let headerRow = -1, ppctCol = -1, lessonCol = -1, gradeCol = -1;
  for (let r = 0; r < scanRows; r++) {
    let p = -1, l = -1, g = -1;
    for (let c = 0; c < (matrix[r] || []).length; c++) {
      const k = keyText_(matrix[r][c]);
      if (!k) continue;
      if (p < 0 && (/(^|\b)ppct(\b|$)/.test(k) || /tiet\s*(ppct|chuong trinh)/.test(k) || (allowTt && /^(tt|stt)$/.test(k)))) p = c;
      if (l < 0 && /(ten bai|noi dung|bai hoc|noi dung bai|chu de)/.test(k)) l = c;
      if (g < 0 && /(^|\b)(khoi|lop)(\b|$)/.test(k)) g = c;
    }
    if (p >= 0 && l >= 0) { headerRow = r; ppctCol = p; lessonCol = l; gradeCol = g; break; }
  }
  if (headerRow < 0) return 0;

  const sheetGrade = parseGrade_(sourceName);
  let added = 0;
  for (let r = headerRow + 1; r < matrix.length; r++) {
    const row = matrix[r] || [];
    const lesson = normalizeText_(row[lessonCol]).replace(/\s+/g, ' ').trim();
    if (!lesson) continue;
    const grade = forcedGrade || (gradeCol >= 0 ? parseGrade_(row[gradeCol]) : null) || sheetGrade;
    if (!grade) continue;
    const nums = parsePpctNumbers_(row[ppctCol]);
    if (!nums.length) continue;
    target[grade] = target[grade] || {};
    nums.forEach(n => {
      // First occurrence wins: tài liệu thực tế có thể lặp toàn bộ KHDH ở phần sau.
      if (!target[grade][n]) { target[grade][n] = lesson; added++; }
    });
  }
  return added;
}

function v4134GradeCounts_(map) {
  const out = {};
  [10, 11, 12].forEach(g => {
    const count = Object.keys((map && map[g]) || {}).length;
    if (count) out[g] = count;
  });
  return out;
}

function v4134ReadGoogleDocCurriculum_(doc, target) {
  // Google Docs KHDH thường không có cột tên “PPCT”. Mẫu trường đang dùng là:
  // TT | Bài học | Số tiết | Ghi chú. Trong đó TT chính là số/dải PPCT.
  // Duyệt Body theo thứ tự để gắn mỗi bảng với Lớp 10/11/12 gần nhất và chỉ lấy
  // phần “Phân phối chương trình”, tuyệt đối bỏ “Chuyên đề lựa chọn” vì số tiết
  // chuyên đề khởi động lại từ 1 và sẽ gây trùng PPCT chính khóa.
  const body = doc.getBody();
  let currentGrade = null;
  let section = '';
  let entries = 0;
  let matchedTables = 0;

  for (let i = 0; i < body.getNumChildren(); i++) {
    const child = body.getChild(i);
    const type = child.getType();

    if (type === DocumentApp.ElementType.PARAGRAPH || type === DocumentApp.ElementType.LIST_ITEM) {
      let text = '';
      try { text = normalizeText_(child.getText()); } catch (e) { text = ''; }
      const k = keyText_(text);
      const gm = text.match(/(?:^|\s)(?:\d+\.\s*)?L[oớ]p\s*(10|11|12)(?:\D|$)/i);
      if (gm) {
        currentGrade = Number(gm[1]);
        section = ''; // đợi dòng “Phân phối chương trình” của khối mới
      }
      if (/chuyen de lua chon/.test(k)) section = 'elective';
      else if (/phan phoi chuong trinh/.test(k)) section = 'regular';
      continue;
    }

    if (type !== DocumentApp.ElementType.TABLE || !currentGrade || section !== 'regular') continue;

    const table = child.asTable();
    const matrix = [];
    for (let r = 0; r < table.getNumRows(); r++) {
      const tr = table.getRow(r), row = [];
      for (let c = 0; c < tr.getNumCells(); c++) row.push(tr.getCell(c).getText());
      matrix.push(row);
    }
    const added = addCurriculumMatrix_(matrix, doc.getName() + ' Lớp ' + currentGrade, target, {
      allowTt: true,
      grade: currentGrade
    });
    if (added > 0) {
      entries += added;
      matchedTables++;
    }
  }

  return {entries:entries, matchedTables:matchedTables, gradeCounts:v4134GradeCounts_(target)};
}

function v4133InspectPpctFile_(id) {
  try {
    const file = DriveApp.getFileById(id);
    const mime = normalizeText_(file.getMimeType());
    const name = normalizeText_(file.getName());
    const GOOGLE_SHEET = 'application/vnd.google-apps.spreadsheet';
    const GOOGLE_DOC = 'application/vnd.google-apps.document';
    const WORD_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const WORD_DOC = 'application/msword';

    if (mime === GOOGLE_SHEET) return {kind:'Google Sheets', mime:mime, name:name, native:true};
    if (mime === GOOGLE_DOC) return {kind:'Google Docs', mime:mime, name:name, native:true};
    if (mime === WORD_DOCX || mime === WORD_DOC || /wordprocessingml|msword/i.test(mime)) {
      return {kind:'Microsoft Word', mime:mime, name:name, native:false, office:true};
    }
    return {kind:'Tệp khác', mime:mime, name:name, native:false};
  } catch (e) {
    const msg = e && e.message ? String(e.message) : String(e || '');
    const low = msg.toLowerCase();
    if (/authorization|permission|access denied|not have permission|không có quyền|insufficient/i.test(low)) {
      throw new Error('Ứng dụng chưa được cấp quyền kiểm tra loại file trên Google Drive, hoặc tài khoản chạy app chưa có quyền xem file này. Hãy cấp quyền/kiểm tra chia sẻ rồi thử lại.');
    }
    if (/not found|không tìm thấy/i.test(low)) {
      throw new Error('Không tìm thấy file PPCT. Hãy kiểm tra lại link hoặc quyền chia sẻ của file.');
    }
    throw new Error('Không kiểm tra được file PPCT trên Google Drive. Hãy kiểm tra link và quyền chia sẻ rồi thử lại.');
  }
}

function friendlyPpctSourceError_(spreadsheetErr, docErr) {
  const sheetMsg = spreadsheetErr && spreadsheetErr.message ? String(spreadsheetErr.message) : '';
  const docMsg = docErr && docErr.message ? String(docErr.message) : '';
  const all = (sheetMsg + ' ' + docMsg).toLowerCase();

  if (all.indexOf('documentapp.openbyid') >= 0 ||
      all.indexOf('googleapis.com/auth/documents') >= 0 ||
      (all.indexOf('permission') >= 0 && all.indexOf('document') >= 0) ||
      (all.indexOf('quyền') >= 0 && all.indexOf('document') >= 0)) {
    return 'Ứng dụng chưa được cấp quyền đọc Google Docs. Hãy cấp quyền cho ứng dụng rồi bấm Lưu nguồn lại.';
  }
  if (all.indexOf('access denied') >= 0 || all.indexOf('permission denied') >= 0 ||
      all.indexOf('không có quyền') >= 0 || all.indexOf('you do not have permission') >= 0) {
    return 'Tài khoản đang chạy app chưa có quyền xem file PPCT này. Hãy chia sẻ file cho đúng tài khoản rồi thử lại.';
  }
  if (all.indexOf('not found') >= 0 || all.indexOf('không tìm thấy') >= 0) {
    return 'Không tìm thấy file PPCT. Hãy kiểm tra lại link hoặc quyền chia sẻ của file.';
  }
  return 'Không mở được nguồn PPCT. Hãy dùng Google Sheets hoặc Google Docs gốc mà tài khoản chạy app có quyền xem.';
}

function v4135AddSheetCurriculum_(matrix, sourceName, regularTarget, electiveTarget) {
  if (!matrix || !matrix.length) return {regular:0,elective:0};
  const scanRows = Math.min(matrix.length, 30);
  let headerRow=-1, ppctCol=-1, lessonCol=-1, gradeCol=-1;
  for (let r=0;r<scanRows;r++) {
    let p=-1,l=-1,g=-1;
    for (let c=0;c<(matrix[r]||[]).length;c++) {
      const k=keyText_(matrix[r][c]); if(!k)continue;
      if(p<0 && (/(^|\b)ppct(\b|$)/.test(k)||/tiet\s*(ppct|chuong trinh)/.test(k)||/^(tt|stt)$/.test(k)))p=c;
      if(l<0 && /(ten bai|noi dung|bai hoc|noi dung bai|chu de)/.test(k))l=c;
      if(g<0 && /(^|\b)(khoi|lop)(\b|$)/.test(k))g=c;
    }
    if(p>=0&&l>=0){headerRow=r;ppctCol=p;lessonCol=l;gradeCol=g;break;}
  }
  if(headerRow<0)return {regular:0,elective:0};
  const sheetGrade=parseGrade_(sourceName);
  const sheetElective=/chuyen de|\bcd\b/.test(keyText_(sourceName));
  let regular=0,elective=0;
  for(let r=headerRow+1;r<matrix.length;r++){
    const row=matrix[r]||[];
    const lesson=normalizeText_(row[lessonCol]); if(!lesson)continue;
    const grade=(gradeCol>=0?parseGrade_(row[gradeCol]):null)||sheetGrade; if(!grade)continue;
    const raw=normalizeText_(row[ppctCol]);
    const isElective=sheetElective||/^(?:CĐ|CD)\s*\d/i.test(raw)||/chuyên\s*đề|chuyen\s*de/i.test(raw);
    const nums=parsePpctNumbers_(raw); if(!nums.length)continue;
    const target=isElective?electiveTarget:regularTarget;
    target[grade]=target[grade]||{};
    nums.forEach(n=>{if(!target[grade][n]){target[grade][n]=lesson;if(isElective)elective++;else regular++;}});
  }
  return {regular:regular,elective:elective};
}

function readPpctSourceById_(id) {
  const info = v4133InspectPpctFile_(id);
  const map = {};
  let entries = 0, kind = info.kind || '', title = info.name || '';

  if (info.office) {
    throw new Error('Đây là file Microsoft Word' + (title ? ' “' + title + '”' : '') + ', chưa phải Google Docs gốc. Hãy mở file → Tệp → Lưu dưới dạng Google Tài liệu, sau đó dán link Google Docs mới vào Nguồn PPCT.');
  }
  if (!info.native) {
    throw new Error('File PPCT này không phải Google Sheets hoặc Google Docs gốc' + (info.mime ? ' (' + info.mime + ')' : '') + '. Hãy chuyển file sang Google Sheets/Google Docs rồi thử lại.');
  }

  if (info.kind === 'Google Sheets') {
    try {
      const ss = SpreadsheetApp.openById(id);
      title = ss.getName();
      ss.getSheets().forEach(sh => {
        const lr = Math.min(Math.max(sh.getLastRow(), 1), 3000);
        const lc = Math.min(Math.max(sh.getLastColumn(), 1), 40);
        const vals = sh.getRange(1, 1, lr, lc).getDisplayValues();
        entries += addCurriculumMatrix_(vals, sh.getName(), map);
      });
    } catch (e) {
      throw new Error(friendlyPpctSourceError_(e, null));
    }
  } else if (info.kind === 'Google Docs') {
    try {
      const doc = DocumentApp.openById(id);
      title = doc.getName();
      const parsed = v4134ReadGoogleDocCurriculum_(doc, map);
      entries += parsed.entries || 0;
    } catch (e) {
      throw new Error(friendlyPpctSourceError_(null, e));
    }
  }
  return {
    map:map,
    entries:entries,
    kind:kind,
    title:title,
    mime:info.mime||'',
    gradeCounts:v4134GradeCounts_(map),
    format:(info.kind === 'Google Docs' && entries > 0) ? 'Kế hoạch dạy học · TT → Bài học' : ''
  };
}

function loadPpctCurriculum_() {
  const url = getPpctSourceUrl_();
  const id = extractDriveFileId_(url);
  if (!id) return {map:{}, configured:false, entries:0, kind:'', title:'Chưa khai báo Nguồn PPCT', error:''};
  const cache = CacheService.getScriptCache();
  const key = 'ppct_v4117_' + id;
  const cached = cache.get(key);
  if (cached) {
    try { return JSON.parse(cached); } catch (e) {}
  }
  try {
    const data = readPpctSourceById_(id);
    const res = {map:data.map||{}, configured:true, entries:data.entries||0, kind:data.kind||'', title:data.title||'', error:''};
    cache.put(key, JSON.stringify(res), 600);
    return res;
  } catch (e) {
    return {map:{}, configured:true, entries:0, kind:'', title:'', error:e.message||String(e)};
  }
}

function getPpctSourceConfig() {
  const url = getPpctSourceUrl_();
  const data = loadPpctCurriculum_();
  return {url:url, configured:!!url, entries:data.entries||0, kind:data.kind||'', title:data.title||'', error:data.error||''};
}

function savePpctSourceConfig(url) {
  const clean = normalizeText_(url);
  const props = PropertiesService.getScriptProperties();
  if (!clean) {
    props.deleteProperty(PPCT_SOURCE_PROPERTY);
    return getPpctSourceConfig();
  }
  const id = extractDriveFileId_(clean);
  if (!id) throw new Error('Link nguồn PPCT không hợp lệ. Hãy dùng link Google Sheets hoặc Google Docs.');
  const test = readPpctSourceById_(id);
  if (!test.entries) throw new Error('Đã mở được file nhưng chưa nhận diện được dữ liệu PPCT. Cần có cột PPCT và Tên bài/Nội dung; khối có thể nằm ở cột Khối/Lớp hoặc trong tên sheet.');
  props.setProperty(PPCT_SOURCE_PROPERTY, clean);
  CacheService.getScriptCache().remove('ppct_v4117_' + id);
  return getPpctSourceConfig();
}

function externalLessonFor_(curriculum, grade, ppct) {
  const byGrade = curriculum && curriculum.map && curriculum.map[String(grade)];
  return byGrade && byGrade[String(Number(ppct))] ? normalizeText_(byGrade[String(Number(ppct))]) : '';
}

// V4.131 — Không còn dữ liệu PPCT dự phòng nội bộ. Tên bài chỉ lấy từ Nguồn PPCT đã khai báo.
function lessonFor_(grade, ppct, curriculum) {
  ppct = Number(ppct);
  return externalLessonFor_(curriculum, grade, ppct) || '';
}

function buildPreview_(teacherKey, starts, mondayYmd, tkbSheetName) {
  const schedule = readMathSchedule_(teacherKey, tkbSheetName);
  const curriculum = loadPpctCurriculum_();
  const counters = {};
  const out = [];

  schedule.forEach(rec => {
    const cls = rec.className;
    if (counters[cls] == null) {
      const custom = starts && starts[cls] != null ? Number(starts[cls]) : 1;
      counters[cls] = isFinite(custom) && custom > 0 ? custom : 1;
    } else {
      counters[cls] += 1;
    }

    const grade = Number(String(cls).slice(0,2));
    out.push(Object.assign({}, rec, {
      dateLabel: dateLabelForDay_(mondayYmd, rec.dayNum),
      ppct: counters[cls],
      lesson: lessonFor_(grade, counters[cls], curriculum),
      lessonSource: externalLessonFor_(curriculum, grade, counters[cls]) ? 'PPCT chuẩn' : 'Chưa có tên bài từ Nguồn PPCT'
    }));
  });

  return out;
}


function getPreviousWeekSheetName_(currentSheetName) {
  const weeks = listWeekSheets_();
  const currentToken = extractWeekToken_(currentSheetName);
  const currentMonday = currentToken ? inferMondayFromWeekToken_(currentToken) : '';
  if (currentMonday) {
    const currentTime = parseYmd_(currentMonday).getTime();
    const candidates = weeks.map(x => ({name:x.name,monday:x.monday||inferMondayFromWeekToken_(x.token)}))
      .filter(x => x.monday)
      .map(x => ({name:x.name,time:parseYmd_(x.monday).getTime()}))
      .filter(x => x.time < currentTime)
      .sort((a,b) => b.time - a.time);
    if (candidates.length) return candidates[0].name;
  }
  const idx = weeks.findIndex(x => x.name === currentSheetName);
  return idx > 0 ? weeks[idx - 1].name : '';
}

function readLastPpctByClass_(teacherKey, previousSheetName) {
  const result = {};
  if (!previousSheetName || !TEACHER_MAP[teacherKey]) return result;
  const ss = SpreadsheetApp.openById(BAO_GIANG_SPREADSHEET_ID);
  const sh = ss.getSheetByName(previousSheetName);
  if (!sh) return result;
  let rows = [];
  try {
    const token = extractWeekToken_(previousSheetName);
    const monday = token ? inferMondayFromWeekToken_(token) : '';
    rows = readTeacherLessonRows_(sh, teacherKey, monday);
  } catch (e) { return result; }

  // Lấy PPCT cuối theo thời gian thực tế trong tuần: ngày -> sáng/chiều -> tiết.
  rows.sort((a,b) => (Number(a.dayNum||9)-Number(b.dayNum||9)) ||
    ((a.session==='Sáng'?0:1)-(b.session==='Sáng'?0:1)) ||
    (Number(a.period||0)-Number(b.period||0)) || (a.row-b.row));
  rows.forEach(r => {
    if (r.oldPpct && r.oldPpct > 0) result[r.className] = r.oldPpct;
  });
  return result;
}

// ===== V4.121: ĐỌC TIẾN ĐỘ THỰC TẾ TỪ TOÀN BỘ BÁO GIẢNG TRƯỚC ĐÓ =====
function orderedWeekSheets_() {
  return listWeekSheets_().map(x => {
    const monday = x.monday || inferMondayFromWeekToken_(x.token);
    let time = 0;
    try { time = monday ? parseYmd_(monday).getTime() : 0; } catch (e) { time = 0; }
    return Object.assign({}, x, {monday:monday, time:time});
  }).filter(x => x.time).sort((a,b) => a.time - b.time);
}

function readLastPpctBeforeSheet_(teacherKey, currentSheetName) {
  const ordered = orderedWeekSheets_();
  const current = ordered.find(x => x.name === currentSheetName);
  if (!current) return {};
  const result = {};
  ordered.filter(x => x.time < current.time).forEach(w => {
    const one = readLastPpctByClass_(teacherKey, w.name);
    Object.keys(one).forEach(cls => {
      const n = Number(one[cls]);
      if (Number.isFinite(n) && n > 0) result[cls] = n;
    });
  });
  return result;
}

function readTeacherLessonRows_(sheet, teacherKey, mondayYmd) {
  const fullName = TEACHER_MAP[teacherKey];
  if (!fullName) throw new Error('Giáo viên không hợp lệ.');
  const blockStartZero = findTeacherBlockStart_(sheet, fullName);
  const startCol1 = blockStartZero + 1;
  const lastRow = Math.max(sheet.getLastRow(), 1);
  const vals = sheet.getRange(1, startCol1, lastRow, 7).getDisplayValues();
  const rows = [];
  let currentDay = null;
  let currentSession = '';
  for (let r = 0; r < vals.length; r++) {
    const row = vals[r];
    const rowText = row.map(normalizeText_).join(' | ').toUpperCase();
    if (rowText.indexOf('BUỔI SÁNG') >= 0) { currentSession = 'Sáng'; currentDay = null; }
    if (rowText.indexOf('BUỔI CHIỀU') >= 0) { currentSession = 'Chiều'; currentDay = null; }

    const dayCell = normalizeText_(row[0]);
    const dm = dayCell.match(/^([2-7])(?:\s|\(|$)/);
    if (dm) currentDay = Number(dm[1]);

    const period = Number(String(row[1]).replace(',', '.'));
    const cls = normalizeText_(row[3]);
    if (!/^(10|11|12)[A-Za-z0-9]+$/i.test(cls)) continue;
    if (!Number.isFinite(period) || period < 1 || period > 5) continue;

    const rawPpct = normalizeText_(row[4]);
    const oldPpct = rawPpct === '' ? null : Number(rawPpct.replace(',', '.'));
    let dateShort = '';
    if (mondayYmd && currentDay) {
      try { dateShort = fmtDM_(addDays_(parseYmd_(mondayYmd), currentDay - 2)); } catch (e) {}
    }
    rows.push({
      row: r + 1,
      blockStartZero: blockStartZero,
      startCol1: startCol1,
      ppctCol: startCol1 + 4,
      lessonCol: startCol1 + 5,
      className: cls,
      grade: Number(String(cls).slice(0,2)),
      oldPpct: Number.isFinite(oldPpct) && oldPpct > 0 ? oldPpct : null,
      oldLesson: normalizeText_(row[5]),
      dayNum: currentDay,
      dateShort: dateShort,
      session: currentSession,
      period: period
    });
  }
  return rows;
}

function buildPpctRebalancePlan_(payload) {
  if (!payload || !payload.teacherKey || !TEACHER_MAP[payload.teacherKey]) throw new Error('Thiếu hoặc sai giáo viên.');
  const teacherKey = payload.teacherKey;
  const selectedSheet = getSelectedReportSheetName_(payload);
  const ordered = orderedWeekSheets_();
  const selected = ordered.find(x => x.name === selectedSheet);
  if (!selected) throw new Error('Không xác định được tuần Báo giảng đang chọn.');

  const ss = SpreadsheetApp.openById(BAO_GIANG_SPREADSHEET_ID);
  const targetWeeks = ordered.filter(x => x.time >= selected.time);
  const priorLast = readLastPpctBeforeSheet_(teacherKey, selectedSheet);
  const curriculum = loadPpctCurriculum_();
  const allRows = [];
  const skippedSheets = [];

  targetWeeks.forEach(w => {
    const sh = ss.getSheetByName(w.name);
    if (!sh) return;
    try {
      readTeacherLessonRows_(sh, teacherKey, w.monday).forEach(row => {
        allRows.push(Object.assign({}, row, {sheet:w.name, monday:w.monday, sheetTime:w.time}));
      });
    } catch (e) {
      skippedSheets.push(w.name);
    }
  });

  allRows.sort((a,b) => (a.sheetTime-b.sheetTime) || (a.row-b.row));
  const byClass = {};
  allRows.forEach(r => (byClass[r.className] || (byClass[r.className] = [])).push(r));

  const changes = [];
  let unknownLessonCount = 0;
  Object.keys(byClass).sort().forEach(cls => {
    const rows = byClass[cls];
    let counter = Number(priorLast[cls] || 0);
    // Khi chưa có lịch sử trước tuần đang chọn, giữ PPCT đầu tiên hiện có làm mốc.
    if (!(counter > 0)) {
      const first = rows.find(x => x.oldPpct && x.oldPpct > 0);
      counter = first ? first.oldPpct - 1 : 0;
    }
    rows.forEach(row => {
      counter += 1;
      const newPpct = counter;
      if (row.oldPpct === newPpct) return;
      const candidateLesson = lessonFor_(row.grade, newPpct, curriculum);
      const lessonKnown = candidateLesson && candidateLesson.indexOf('Chưa khai báo tên bài cho PPCT') !== 0;
      if (!lessonKnown) unknownLessonCount += 1;
      changes.push({
        sheet: row.sheet,
        row: row.row,
        ppctCol: row.ppctCol,
        lessonCol: row.lessonCol,
        className: row.className,
        dayNum: row.dayNum,
        dateShort: row.dateShort,
        session: row.session,
        period: row.period,
        oldPpct: row.oldPpct,
        newPpct: newPpct,
        oldLesson: row.oldLesson,
        newLesson: lessonKnown ? candidateLesson : row.oldLesson,
        lessonKnown: !!lessonKnown
      });
    });
  });

  const affectedClasses = Array.from(new Set(changes.map(x => x.className))).sort();
  const affectedSheets = Array.from(new Set(changes.map(x => x.sheet)));
  return {
    ok: true,
    selectedSheet: selectedSheet,
    scannedSheets: targetWeeks.map(x => x.name),
    affectedSheets: affectedSheets,
    affectedClasses: affectedClasses,
    changes: changes,
    unknownLessonCount: unknownLessonCount,
    skippedSheets: skippedSheets,
    curriculumSource: {
      configured: !!curriculum.configured,
      entries: curriculum.entries || 0,
      kind: curriculum.kind || '',
      title: curriculum.title || '',
      error: curriculum.error || ''
    }
  };
}

function previewPpctRebalance(payload) {
  return buildPpctRebalancePlan_(payload);
}

const V4121_REBALANCE_UNDO_PREFIX = 'V4121_REBALANCE_UNDO_';

function applyPpctRebalance(payload) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Hệ thống đang có thao tác ghi khác. Vui lòng thử lại sau ít giây.');
  try {
    const plan = buildPpctRebalancePlan_(payload);
    if (!plan.changes.length) return Object.assign({}, plan, {written:0, undoToken:''});

    const ss = SpreadsheetApp.openById(BAO_GIANG_SPREADSHEET_ID);
    const token = Utilities.getUuid();
    const snapshot = [];
    const sheetCache = {};

    plan.changes.forEach(ch => {
      const sh = sheetCache[ch.sheet] || (sheetCache[ch.sheet] = ss.getSheetByName(ch.sheet));
      if (!sh) throw new Error('Không tìm thấy sheet Báo giảng: ' + ch.sheet);
      const rg = sh.getRange(ch.row, ch.ppctCol, 1, 2);
      snapshot.push({sheet:ch.sheet,row:ch.row,col:ch.ppctCol,values:rg.getValues()});
      rg.setValues([[ch.newPpct, ch.newLesson]]);
    });

    SpreadsheetApp.flush();
    CacheService.getScriptCache().put(V4121_REBALANCE_UNDO_PREFIX + token, JSON.stringify({items:snapshot}), 21600);
    return Object.assign({}, plan, {written:plan.changes.length, undoToken:token});
  } finally {
    lock.releaseLock();
  }
}

function undoPpctRebalance(token) {
  token = normalizeText_(token);
  if (!token) throw new Error('Không có dữ liệu hoàn tác.');
  const cache = CacheService.getScriptCache();
  const raw = cache.get(V4121_REBALANCE_UNDO_PREFIX + token);
  if (!raw) throw new Error('Bản hoàn tác đã hết hạn hoặc không còn tồn tại.');
  const snap = JSON.parse(raw);
  const ss = SpreadsheetApp.openById(BAO_GIANG_SPREADSHEET_ID);
  const sheets = {};
  (snap.items || []).forEach(x => {
    const sh = sheets[x.sheet] || (sheets[x.sheet] = ss.getSheetByName(x.sheet));
    if (sh) sh.getRange(x.row, x.col, 1, 2).setValues(x.values);
  });
  SpreadsheetApp.flush();
  cache.remove(V4121_REBALANCE_UNDO_PREFIX + token);
  return {ok:true, restored:(snap.items || []).length};
}

function getClassPpctSuggestions(teacherKey, reportSheetName, tkbSheetName) {
  if (!TEACHER_MAP[teacherKey]) throw new Error('Giáo viên không hợp lệ.');

  const schedule = readMathSchedule_(teacherKey, tkbSheetName);
  const currentCounts = {};
  schedule.forEach(r => {
    currentCounts[r.className] = (currentCounts[r.className] || 0) + 1;
  });

  const previousSheet = getPreviousWeekSheetName_(reportSheetName);
  const lastByClass = readLastPpctBeforeSheet_(teacherKey, reportSheetName);

  const classes = Object.keys(currentCounts).sort().map(cls => {
    const last = lastByClass[cls] || 0;
    const suggestedStart = last > 0 ? last + 1 : 1;
    return {
      className: cls,
      count: currentCounts[cls],
      previousLast: last || null,
      suggestedStart: suggestedStart,
      suggestedEnd: suggestedStart + Math.max(currentCounts[cls] - 1, 0)
    };
  });

  const curriculum = loadPpctCurriculum_();
  return {
    previousSheet: previousSheet,
    classes: classes,
    curriculumSource: {
      configured: !!curriculum.configured,
      entries: curriculum.entries || 0,
      kind: curriculum.kind || '',
      title: curriculum.title || '',
      error: curriculum.error || ''
    }
  };
}

function previewBaoGiang(payload) {
  if (!payload || !payload.teacherKey) throw new Error('Thiếu giáo viên.');
  const teacherKey = payload.teacherKey;
  const records = buildPreview_(teacherKey, payload.starts || {}, payload.monday || '', payload.tkbSheet);
  const classes = {};
  records.forEach(r => {
    if (!classes[r.className]) classes[r.className] = {count:0, first:r.ppct, last:r.ppct};
    classes[r.className].count++;
    classes[r.className].last = r.ppct;
  });
  return { teacherKey, fullName: TEACHER_MAP[teacherKey], records, classes };
}

function findTeacherBlockStart_(sheet, fullName) {
  const maxCol = sheet.getLastColumn();
  const names = sheet.getRange(2, 1, 1, maxCol).getDisplayValues()[0];
  for (let i = 0; i < names.length; i++) {
    if (normalizeText_(names[i]).toLowerCase() === normalizeText_(fullName).toLowerCase()) {
      // Hàng 2 có cấu trúc: [Họ tên:] [Tên giáo viên] ...
      // Khối báo giảng bắt đầu ở cột ngay TRƯỚC ô tên giáo viên.
      if (i < 1) throw new Error('Cấu trúc khối giáo viên không hợp lệ.');
      return i - 1; // zero-based cột "Họ tên:" = cột bắt đầu khối
    }
  }
  throw new Error('Không tìm thấy khối báo giảng của giáo viên: ' + fullName);
}

function buildTargetRowMap_(sheet, blockStartZero) {
  // Dòng 5-34 = 6 ngày x 5 tiết sáng.
  const startRow = 5;
  const rowCount = 30;
  const firstCol = blockStartZero + 1; // Apps Script 1-based
  const dayPeriod = sheet.getRange(startRow, firstCol, rowCount, 2).getDisplayValues();

  const map = {};
  let currentDay = null;
  for (let i = 0; i < dayPeriod.length; i++) {
    const dayCell = normalizeText_(dayPeriod[i][0]);
    if (dayCell) {
      const m = dayCell.match(/^([2-7])/);
      if (m) currentDay = Number(m[1]);
    }
    const period = Number(dayPeriod[i][1]);
    if (currentDay && period) map[currentDay + '_' + period] = startRow + i;
  }
  return map;
}


function parseYmd_(ymd) {
  const m = String(ymd || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) throw new Error('Ngày đầu tuần không hợp lệ.');
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0);
}

function addDays_(d, n) {
  const x = new Date(d.getTime());
  x.setDate(x.getDate() + n);
  return x;
}

function fmtDMY_(d) {
  return Utilities.formatDate(d, 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy');
}

function fmtDM_(d) {
  return Utilities.formatDate(d, 'Asia/Ho_Chi_Minh', 'd/M');
}

// V4.139: Khôi phục hàm tạo nhãn ngày cho các bản xem trước/ghi Báo giảng.
// dayNum dùng quy ước TKB: Thứ 2 = 2 ... Thứ 7 = 7.
function dateLabelForDay_(mondayYmd, dayNum) {
  const n = Number(dayNum);
  if (!Number.isFinite(n) || n < 2 || n > 7) return '';
  const monday = parseYmd_(mondayYmd);
  return fmtDMY_(addDays_(monday, n - 2));
}

function buildWeekMeta_(payload) {
  const week = Number(payload.week || 1);
  if (!Number.isFinite(week) || week < 1 || week > 53) throw new Error('Tuần học không hợp lệ.');
  const monday = parseYmd_(payload.monday);
  // JS: Sunday=0, Monday=1
  if (monday.getDay() !== 1) throw new Error('Ngày đầu tuần phải là Thứ 2.');
  const teacherKey = String((payload&&payload.teacherKey) || FIXED_TEACHER_KEY);
  const autoTeam = getTeacherTeam_(teacherKey);
  const team = autoTeam || String(payload.team || '');
  const leader = TEAM_LEADERS[team];
  if (!leader) throw new Error('Chưa nhận diện được tổ KHTN/KHXH của giáo viên.');

  const days = {};
  for (let dayNum = 2; dayNum <= 7; dayNum++) {
    days[dayNum] = addDays_(monday, dayNum - 2);
  }

  return {
    week,
    monday,
    saturday: addDays_(monday, 5),
    team,
    leader,
    days
  };
}

function findTeacherSectionRows_(sheet, blockStartZero) {
  const startCol1 = blockStartZero + 1;
  const vals = sheet.getRange(1, startCol1, Math.min(sheet.getLastRow(), 120), 7).getDisplayValues();
  const result = { morning: null, afternoon: null, leaderRows: [] };

  for (let r = 0; r < vals.length; r++) {
    const rowText = vals[r].map(normalizeText_).join(' | ').toUpperCase();
    if (rowText.indexOf('BUỔI SÁNG') >= 0) result.morning = r + 1;
    if (rowText.indexOf('BUỔI CHIỀU') >= 0) result.afternoon = r + 1;

    for (let c = 0; c < vals[r].length; c++) {
      if (normalizeText_(vals[r][c]).toLowerCase() === 'tổ trưởng chuyên môn') {
        result.leaderRows.push(r + 1);
      }
    }
  }

  if (!result.morning) throw new Error('Không tìm thấy khối BUỔI SÁNG.');
  if (!result.afternoon) throw new Error('Không tìm thấy khối BUỔI CHIỀU.');
  return result;
}

function updateSectionMeta_(sheet, blockStartZero, titleRow, meta) {
  const startCol1 = blockStartZero + 1;
  const weekRow = titleRow - 1;
  const tableHeaderRow = titleRow + 2;
  const firstDataRow = tableHeaderRow + 1;

  // Tuần học luôn ở ô đầu khối.
  sheet.getRange(weekRow, startCol1).setValue('Tuần học thứ: ' + meta.week);

  // Tìm đúng ô "(Từ ngày ...)" và "Tổ: ..." theo nội dung mẫu,
  // tránh lệch cột giữa BUỔI SÁNG và BUỔI CHIỀU.
  const metaRow = sheet.getRange(weekRow, startCol1, 1, 7).getDisplayValues()[0];
  let dateOffset = -1;
  let teamOffset = -1;
  for (let i = 0; i < metaRow.length; i++) {
    const txt = normalizeText_(metaRow[i]).toLowerCase();
    if (txt.indexOf('từ ngày') >= 0) dateOffset = i;
    if (txt.indexOf('tổ:') === 0) teamOffset = i;
  }
  if (dateOffset < 0) dateOffset = 5;
  if (teamOffset < 0) teamOffset = 6;

  sheet.getRange(weekRow, startCol1 + dateOffset).setValue(
    '(Từ ngày ' + fmtDM_(meta.monday) + ' đến ngày ' + fmtDM_(meta.saturday) + '/' +
    Utilities.formatDate(meta.saturday, 'Asia/Ho_Chi_Minh', 'yyyy') + ' )'
  );
  sheet.getRange(weekRow, startCol1 + teamOffset).setValue('Tổ: ' + meta.team);

  // 6 ngày x 5 tiết; điền ngày ở ô đầu mỗi ngày.
  for (let dayNum = 2; dayNum <= 7; dayNum++) {
    const row = firstDataRow + (dayNum - 2) * 5;
    sheet.getRange(row, startCol1).setValue(dayNum + '\n(' + fmtDM_(meta.days[dayNum]) + ')');
  }
}

function updateLeader_(sheet, blockStartZero, leaderLabelRow, leader) {
  const startCol1 = blockStartZero + 1;
  const rowVals = sheet.getRange(leaderLabelRow, startCol1, 1, 7).getDisplayValues()[0];

  let labelOffset = -1;
  for (let i = 0; i < rowVals.length; i++) {
    if (normalizeText_(rowVals[i]).toLowerCase() === 'tổ trưởng chuyên môn') {
      labelOffset = i;
      break;
    }
  }
  if (labelOffset < 0) return;

  const col = startCol1 + labelOffset;
  const below = sheet.getRange(leaderLabelRow + 1, col, 8, 1).getDisplayValues();
  let targetRow = -1;

  // Ưu tiên ô đang có tên tổ trưởng trong mẫu.
  for (let i = 0; i < below.length; i++) {
    const v = normalizeText_(below[i][0]);
    if (v) {
      targetRow = leaderLabelRow + 1 + i;
      break;
    }
  }
  if (targetRow < 0) targetRow = leaderLabelRow + 4;
  sheet.getRange(targetRow, col).setValue(leader);

  // Nếu mẫu có tên lặp ngay dòng kế tiếp thì cập nhật luôn để không còn tên cũ.
  const next = normalizeText_(sheet.getRange(targetRow + 1, col).getDisplayValue());
  if (next) sheet.getRange(targetRow + 1, col).setValue(leader);
}

// V4.126 — Sheet Báo giảng đã có sẵn Tuần học thứ và khoảng ngày.
// App chỉ được phép điền Tổ và Tổ trưởng chuyên môn; tuyệt đối không ghi đè tuần/ngày.
function updateSectionTeamOnly_(sheet, blockStartZero, titleRow, team) {
  const startCol1 = blockStartZero + 1;
  const weekRow = titleRow - 1;
  const metaRow = sheet.getRange(weekRow, startCol1, 1, 7).getDisplayValues()[0];
  let teamOffset = -1;
  for (let i = 0; i < metaRow.length; i++) {
    const txt = normalizeText_(metaRow[i]).toLowerCase();
    if (txt.indexOf('tổ:') === 0) { teamOffset = i; break; }
  }
  if (teamOffset < 0) teamOffset = 6;
  sheet.getRange(weekRow, startCol1 + teamOffset)
    .setValue('Tổ: ' + team)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
}

// V4.141 — Một số khối giáo viên trong mẫu bị thiếu sẵn nhãn/dòng ký của Tổ trưởng.
// Không còn phụ thuộc việc ô phải có sẵn chữ “Tổ trưởng chuyên môn”.
// Xác định vùng ký theo dòng “Ngày ... năm ...” của từng buổi rồi tự phục hồi nhãn + tên.
function v4141EnsureLeaderForSection_(sheet, blockStartZero, titleRow, leader) {
  leader = normalizeText_(leader);
  if (!leader) return;

  const startCol1 = blockStartZero + 1;
  const signCol = startCol1 + 6; // cột cuối trong khối 7 cột của giáo viên
  const searchStart = titleRow + 30;
  const searchCount = Math.min(15, Math.max(1, sheet.getMaxRows() - searchStart + 1));
  const vals = sheet.getRange(searchStart, signCol, searchCount, 1).getDisplayValues();
  let dateRow = -1;

  for (let i = 0; i < vals.length; i++) {
    const txt = normalizeText_(vals[i][0]).toLowerCase();
    if (txt.indexOf('ngày') >= 0 && txt.indexOf('năm') >= 0) {
      dateRow = searchStart + i;
      break;
    }
  }
  // Bố cục chuẩn của mẫu: dòng ngày ký cách tiêu đề buổi 35 dòng.
  if (dateRow < 0) dateRow = titleRow + 35;

  const labelRow = dateRow + 1;
  const nameRow = dateRow + 4;

  sheet.getRange(labelRow, signCol)
    .setValue('Tổ trưởng chuyên môn')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setFontFamily('Times New Roman')
    .setFontSize(10)
    .setFontWeight('bold');

  sheet.getRange(nameRow, signCol)
    .setValue(leader)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setFontFamily('Times New Roman')
    .setFontSize(10)
    .setFontWeight('bold');
}

function updateReportMetadata_(sheet, blockStartZero, payload) {
  const meta = buildWeekMeta_(payload);
  const sections = findTeacherSectionRows_(sheet, blockStartZero);

  // Chỉ điền Tổ cho cả khối sáng và chiều; không ghi đè tuần/ngày.
  updateSectionTeamOnly_(sheet, blockStartZero, sections.morning, meta.team);
  updateSectionTeamOnly_(sheet, blockStartZero, sections.afternoon, meta.team);

  // Điền/khôi phục vùng ký Tổ trưởng cho từng buổi, kể cả khi mẫu bị thiếu nhãn.
  v4141EnsureLeaderForSection_(sheet, blockStartZero, sections.morning, meta.leader);
  v4141EnsureLeaderForSection_(sheet, blockStartZero, sections.afternoon, meta.leader);

  // Căn lại cả dữ liệu đã ghi trước đó ở hai buổi, không chỉ các dòng ghi mới.
  v4141NormalizeSectionDataAlignment_(sheet, blockStartZero, sections.morning);
  v4141NormalizeSectionDataAlignment_(sheet, blockStartZero, sections.afternoon);

  return {
    week: meta.week,
    from: fmtDMY_(meta.monday),
    to: fmtDMY_(meta.saturday),
    team: meta.team,
    leader: meta.leader
  };
}

// V4.142 — Chuẩn hóa căn lề dữ liệu do app ghi vào Báo giảng.
// Tiết (TKB), Môn, Lớp, PPCT căn giữa cả ngang + dọc; tên bài giữ căn trái, giữa dọc.
function v4141FormatWrittenRow_(sheet, blockStartZero, row) {
  const startCol1 = blockStartZero + 1;
  sheet.getRange(row, startCol1 + 1, 1, 4)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.getRange(row, startCol1 + 5, 1, 1)
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle');
}


// Chuẩn hóa luôn các dòng đã có dữ liệu từ trước, để chỉ cần mở Báo giảng là thấy căn đúng.
function v4141NormalizeSectionDataAlignment_(sheet, blockStartZero, titleRow) {
  const startCol1 = blockStartZero + 1;
  const firstDataRow = titleRow + 3;
  const rowCount = 30; // 6 ngày x 5 tiết
  sheet.getRange(firstDataRow, startCol1 + 1, rowCount, 4)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.getRange(firstDataRow, startCol1 + 5, rowCount, 1)
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle');
}



// V4.126 — Khi mở Báo giảng chỉ tự điền Tổ và Tổ trưởng chuyên môn.
// Tuần học thứ và khoảng ngày đã có sẵn trong Sheet nên app không ghi đè.
function prepareBaoGiangForOpen(payload) {
  payload = payload || {};
  const teacherKey = String(payload.teacherKey || FIXED_TEACHER_KEY);
  const fullName = TEACHER_MAP[teacherKey] || getTeacherDirectoryInfo_(teacherKey).name;
  if (!fullName) throw new Error('Không xác định được giáo viên.');

  const ss = SpreadsheetApp.openById(BAO_GIANG_SPREADSHEET_ID);
  const reportSheetName = getSelectedReportSheetName_(payload);
  const sh = ss.getSheetByName(reportSheetName);
  if (!sh) throw new Error('Không tìm thấy sheet Báo giảng: ' + reportSheetName);

  const blockStartZero = findTeacherBlockStart_(sh, fullName);
  const meta = updateReportMetadata_(sh, blockStartZero, Object.assign({}, payload, {teacherKey: teacherKey}));
  SpreadsheetApp.flush();

  return {
    ok: true,
    teacher: fullName,
    sheet: reportSheetName,
    team: meta.team,
    leader: meta.leader,
    url: 'https://docs.google.com/spreadsheets/d/' + BAO_GIANG_SPREADSHEET_ID + '/edit?gid=' + sh.getSheetId() + '#gid=' + sh.getSheetId()
  };
}

function getTkbClassCheck(payload) {
  if (!payload || !payload.teacherKey) throw new Error('Thiếu giáo viên.');
  const teacherKey = payload.teacherKey;

  // Lấy TKB thực tế tuần hiện tại theo giáo viên.
  const schedule = readMathSchedule_(teacherKey, payload.tkbSheet);
  const counts = {};
  schedule.forEach(r => {
    counts[r.className] = (counts[r.className] || 0) + 1;
  });

  // Lấy danh sách lớp đã biết của giáo viên từ tuần trước (nếu có),
  // để phát hiện lớp từng dạy nhưng tuần này không xuất hiện trong TKB.
  const previousSheet = getPreviousWeekSheetName_(payload.reportSheet || '');
  const previousLast = readLastPpctByClass_(teacherKey, previousSheet);

  const classSet = {};
  Object.keys(counts).forEach(c => classSet[c] = true);
  Object.keys(previousLast).forEach(c => classSet[c] = true);

  const classes = Object.keys(classSet).sort().map(cls => {
    const count = counts[cls] || 0;
    const start = payload.starts && payload.starts[cls] != null ? Number(payload.starts[cls]) : null;
    const end = (start && count > 0) ? start + count - 1 : null;

    let status = 'ok';
    let message = 'Có dữ liệu';
    if (count === 0) {
      status = 'warn';
      message = 'Không có tiết trong TKB tuần này';
    }

    return {
      className: cls,
      count: count,
      ppctStart: start,
      ppctEnd: end,
      status: status,
      message: message
    };
  });

  return {
    teacher: TEACHER_MAP[teacherKey] || teacherKey,
    previousSheet: previousSheet,
    totalClasses: classes.filter(x => x.count > 0).length,
    totalPeriods: classes.reduce((s,x) => s + x.count, 0),
    warnings: classes.filter(x => x.status !== 'ok'),
    classes: classes
  };
}



// ===== V4.32: GHI LỊCH LÀM VIỆC TUẦN =====
function openWeeklyPlanSpreadsheet_() {
  try {
    return SpreadsheetApp.openById(LICH_TUAN_SPREADSHEET_ID);
  } catch (e) {
    throw new Error('Không mở được file Lịch làm việc tuần. Hãy bảo đảm file đích là Google Sheets (không phải Excel .xlsx chưa chuyển đổi).');
  }
}

function weeklyPlanSheetName_(payload) {
  const report = normalizeText_(payload && payload.reportSheet).replace(/^Tuan\s+/i, '');
  if (report) return report;
  const monday = parseYmd_(payload && payload.monday);
  if (!monday) throw new Error('Thiếu ngày Thứ 2 của tuần.');
  const sat = addDays_(monday, 5);
  return monday.getDate() + '-' + sat.getDate() + '.' + (monday.getMonth() + 1);
}

function updateWeeklyPlanDates_(sheet, mondayYmd) {
  const monday = parseYmd_(mondayYmd);
  if (!monday) return;
  const top = sheet.getRange(1, 1, Math.min(5, sheet.getMaxRows()), Math.min(30, sheet.getMaxColumns())).getDisplayValues();
  // Mẫu Goc/17-22.8: hàng chứa Thứ 2... và hàng dưới có Ngày/tháng + ngày + tháng.
  for (let r = 0; r < top.length; r++) {
    for (let c = 0; c < top[r].length; c++) {
      const m = normalizeText_(top[r][c]).match(/^Thứ\s*([2-7])\b/i);
      if (!m) continue;
      const dayNum = Number(m[1]);
      const d = addDays_(monday, dayNum - 2);
      // Nếu hàng ngay dưới có cấu trúc Ngày/tháng | ngày | tháng.
      if (r + 1 < top.length && /Ngày\/tháng/i.test(normalizeText_(top[r + 1][c]))) {
        sheet.getRange(r + 2, c + 2).setValue(d.getDate());
        sheet.getRange(r + 2, c + 3).setValue(d.getMonth() + 1);
      } else if (/\(ngày/i.test(normalizeText_(top[r][c]))) {
        sheet.getRange(r + 1, c + 1).setValue('Thứ ' + dayNum + ' (ngày ' + Utilities.formatDate(d, 'Asia/Ho_Chi_Minh', 'dd/MM') + ')');
      }
    }
  }
}

function ensureWeeklyPlanSheet_(ss, payload) {
  const name = weeklyPlanSheetName_(payload);
  let sh = ss.getSheetByName(name);
  if (sh) return sh;
  let template = null;
  for (let i = 0; i < LICH_TUAN_TEMPLATE_SHEETS.length; i++) {
    template = ss.getSheetByName(LICH_TUAN_TEMPLATE_SHEETS[i]);
    if (template) break;
  }
  if (!template) throw new Error('Chưa có sheet tuần ' + name + ' và không tìm thấy sheet mẫu Goc/Mau.');
  sh = template.copyTo(ss).setName(name);
  updateWeeklyPlanDates_(sh, payload && payload.monday);
  return sh;
}

function findWeeklyTeacherRow_(sheet, fullName) {
  const last = Math.max(sheet.getLastRow(), 4);
  const vals = sheet.getRange(1, 2, last, 1).getDisplayValues();
  const target = normalizeText_(fullName).toLowerCase();
  for (let r = 0; r < vals.length; r++) {
    if (normalizeText_(vals[r][0]).toLowerCase() === target) return r + 1;
  }
  throw new Error('Không tìm thấy giáo viên "' + fullName + '" trong file Lịch làm việc tuần.');
}

function weeklyPlanColumnMap_(sheet) {
  const maxCols = Math.min(Math.max(sheet.getLastColumn(), 24), 35);
  const top = sheet.getRange(1, 1, Math.min(6, sheet.getMaxRows()), maxCols).getDisplayValues();
  const result = {};
  for (let r = 0; r < top.length; r++) {
    for (let c = 0; c < maxCols; c++) {
      const m = normalizeText_(top[r][c]).match(/^Thứ\s*([2-7])\b/i);
      if (!m) continue;
      const day = Number(m[1]);
      result[day] = result[day] || {};
      for (let rr = r + 1; rr < top.length; rr++) {
        for (let cc = c; cc <= Math.min(c + 2, maxCols - 1); cc++) {
          const v = normalizeText_(top[rr][cc]).toLowerCase();
          if (v === 'sáng') result[day].sang = cc + 1;
          if (v === 'chiều') result[day].chieu = cc + 1;
        }
      }
    }
  }
  return result;
}

function readTeacherScheduleAll_(teacherKey, tkbSheetName) {
  return readMathSchedule_(teacherKey, tkbSheetName).map(x=>({dayNum:x.dayNum,session:x.session,period:x.period,className:x.className}));
}

function previewWeeklyPlan(payload) {
  if (!payload || !payload.teacherKey) throw new Error('Hãy chọn giáo viên.');
  const fullName = TEACHER_MAP[payload.teacherKey];
  const schedule = readTeacherScheduleAll_(payload.teacherKey, payload.tkbSheet);
  const has = {};
  schedule.forEach(x => { has[x.dayNum + '_' + (x.session === 'Sáng' ? 'sang' : 'chieu')] = true; });
  const sheetName = weeklyPlanSheetName_(payload);
  const entries = {};
  let existing = {};
  try {
    const ss = openWeeklyPlanSpreadsheet_();
    const sh = ss.getSheetByName(sheetName);
    if (sh) {
      const row = findWeeklyTeacherRow_(sh, fullName);
      const map = weeklyPlanColumnMap_(sh);
      for (let d = 2; d <= 7; d++) {
        ['sang','chieu'].forEach(sess => {
          const key = d + '_' + sess;
          const col = map[d] && map[d][sess];
          if (col) existing[key] = normalizeText_(sh.getRange(row, col).getDisplayValue());
        });
      }
    }
  } catch (e) {
    // Vẫn cho xem trước từ TKB; lỗi mở file sẽ được báo khi ghi.
  }
  for (let d = 2; d <= 7; d++) {
    ['sang','chieu'].forEach(sess => {
      const key = d + '_' + sess;
      entries[key] = existing[key] || (has[key] ? 'Lên lớp' : '');
    });
  }
  return {teacher:fullName, sheetName:sheetName, entries:entries, existing:existing};
}

function writeWeeklyPlan(payload) {
  if (!payload || !payload.teacherKey) throw new Error('Hãy chọn giáo viên.');
  const fullName = TEACHER_MAP[payload.teacherKey];
  const ss = openWeeklyPlanSpreadsheet_();
  const sh = ensureWeeklyPlanSheet_(ss, payload);
  const row = findWeeklyTeacherRow_(sh, fullName);
  const map = weeklyPlanColumnMap_(sh);
  const entries = payload.entries || {};
  const overwrite = !!payload.overwrite;
  const written = [], skipped = [];
  for (let d = 2; d <= 7; d++) {
    ['sang','chieu'].forEach(sess => {
      const key = d + '_' + sess;
      const text = normalizeText_(entries[key]);
      if (!text) return;
      const col = map[d] && map[d][sess];
      if (!col) return;
      const cell = sh.getRange(row, col);
      const old = normalizeText_(cell.getDisplayValue());
      if (old && old !== text && !overwrite) {
        skipped.push({day:d, session:sess, old:old, value:text});
        return;
      }
      cell.setValue(text);
      written.push({day:d, session:sess, value:text});
    });
  }
  return {ok:true, sheetName:sh.getName(), teacher:fullName, written:written.length, skipped:skipped};
}

function preflightBaoGiang(payload) {
  if (!payload || !payload.teacherKey) throw new Error('Thiếu giáo viên.');
  const weekMeta = buildWeekMeta_(payload);
  const teacherKey = payload.teacherKey;
  const fullName = TEACHER_MAP[teacherKey];
  if (!fullName) throw new Error('Giáo viên không hợp lệ.');

  const records = buildPreview_(teacherKey, payload.starts || {}, payload.monday || '', payload.tkbSheet);
  if (!records.length) throw new Error('Không có tiết dạy nào của giáo viên trong TKB để ghi.');

  const missing = records.filter(r => !normalizeText_(r.lesson) || r.lessonMissing);
  if (missing.length) {
    const reasons = [];
    missing.forEach(r => {
      const reason = normalizeText_(r.lessonMissingReason) || ('Thiếu tên bài: ' + r.className + ' · ' + r.subject + ' · PPCT ' + r.ppct);
      if (reasons.indexOf(reason) < 0) reasons.push(reason);
    });
    throw new Error('NGUỒN_PPCT_THIẾU: ' + reasons.slice(0, 8).join(' • ') + (reasons.length > 8 ? ' • …' : '') + '. App chưa ghi để tránh điền sai tên bài.');
  }

  const ss = SpreadsheetApp.openById(BAO_GIANG_SPREADSHEET_ID);
  const reportSheetName = getSelectedReportSheetName_(payload);
  const sh = ss.getSheetByName(reportSheetName);
  if (!sh) throw new Error('Không tìm thấy sheet báo giảng: ' + reportSheetName);

  const blockStartZero = findTeacherBlockStart_(sh, fullName);
  const rowMap = buildTargetRowMap_(sh, blockStartZero);
  const startCol1 = blockStartZero + 1;

  const targets = [];
  const skipped = [];

  records.forEach(rec => {
    const row = rowMap[rec.dayNum + '_' + rec.period];
    if (!row) {
      skipped.push(rec.dayLabel + ' tiết ' + rec.period);
      return;
    }

    // Môn, Lớp, PPCT, Tên bài
    const rangeA1 = sh.getRange(row, startCol1 + 2, 1, 4).getA1Notation();
    targets.push({
      row: row,
      range: rangeA1,
      dayLabel: rec.dayLabel,
      dateLabel: rec.dateLabel,
      period: rec.period,
      subject: rec.subject,
      className: rec.className,
      ppct: rec.ppct,
      lesson: rec.lesson
    });
  });

  if (!targets.length) {
    throw new Error('Không tìm được ô đích nào trong sheet báo giảng.');
  }

  return {
    ok: true,
    teacherKey: teacherKey,
    teacher: fullName,
    sheet: reportSheetName,
    targetCount: targets.length,
    skipped: skipped,
    targets: targets,
    reportUrl: 'https://docs.google.com/spreadsheets/d/' + BAO_GIANG_SPREADSHEET_ID + '/edit?gid=533049391#gid=533049391',
    weekInfo: {
      week: weekMeta.week,
      from: fmtDMY_(weekMeta.monday),
      to: fmtDMY_(weekMeta.saturday),
      team: weekMeta.team,
      leader: weekMeta.leader
    }
  };
}


function progressSheetNameForClass_(className) {
  const grade = String(className).slice(0, 2);
  if (grade === '10') return 'Lop 10';
  if (grade === '11') return 'Lop 11';
  if (grade === '12') return 'Lop 12';
  throw new Error('Không xác định được khối của lớp: ' + className);
}

function updateProgressReport_(payload, records) {
  const startedAt = Date.now();
  const week = Number(payload.week || 1);
  if (!Number.isFinite(week) || week < 1) throw new Error('Tuần không hợp lệ để cập nhật tiến độ.');

  // Đếm số tiết theo lớp trong tuần.
  const counts = {};
  (records || []).forEach(r => {
    const cls = String(r.className || '').trim();
    if (cls) counts[cls] = (counts[cls] || 0) + 1;
  });

  const classes = Object.keys(counts).sort();
  if (!classes.length) return [];

  const ss = SpreadsheetApp.openById(TIEN_DO_SPREADSHEET_ID);
  const details = [];

  // V4.79: gom theo sheet khối. Mỗi sheet chỉ đọc A:E đúng MỘT LẦN.
  // Bản cũ đọc lại toàn bộ sheet cho từng lớp và gọi SpreadsheetApp.flush(),
  // có thể rất chậm khi file Tiến độ có nhiều công thức.
  const groups = {};
  classes.forEach(cls => {
    const sheetName = progressSheetNameForClass_(cls);
    (groups[sheetName] || (groups[sheetName] = [])).push(cls);
  });

  Object.keys(groups).forEach(sheetName => {
    const sh = ss.getSheetByName(sheetName);
    if (!sh) throw new Error('Không tìm thấy sheet tiến độ: ' + sheetName);

    const lastRow = Math.min(Math.max(sh.getLastRow(), 3), 300);
    const vals = sh.getRange(1, 1, lastRow, 5).getDisplayValues();

    // Tạo bản đồ "tuần|lớp" -> dòng chỉ bằng một lượt quét.
    const rowMap = {};
    let currentWeek = null;
    for (let r = 2; r < vals.length; r++) {
      const weekCell = normalizeText_(vals[r][0]);
      if (weekCell) {
        const mw = weekCell.match(/Tuần\s*(\d+)/i);
        if (mw) currentWeek = Number(mw[1]);
      }
      const classCell = normalizeText_(vals[r][2]);
      if (currentWeek && classCell) {
        rowMap[currentWeek + '|' + classCell.toLowerCase()] = r + 1;
      }
    }

    groups[sheetName].forEach(cls => {
      const targetRow = rowMap[week + '|' + cls.toLowerCase()];
      if (!targetRow) {
        throw new Error('Không tìm thấy dòng Tuần ' + week + ' - ' + cls + ' trong ' + sheetName);
      }

      const range = sh.getRange(targetRow, 5);
      range.setValue(counts[cls]);
      details.push({
        sheet: sheetName,
        className: cls,
        week: week,
        count: counts[cls],
        range: range.getA1Notation()
      });
    });
  });

  // Không gọi SpreadsheetApp.flush() tại đây.
  // Apps Script tự commit khi hàm kết thúc; tránh buộc file nặng tính toán lại
  // trước khi trả kết quả về giao diện.
  console.log('updateProgressReport_ completed in ' + (Date.now() - startedAt) + ' ms; classes=' + details.length);
  return details;
}

function ghiBaoGiang(payload) {
  const check = preflightBaoGiang(payload);
  const undoToken = createUndoSnapshot_(payload, check);

  const ss = SpreadsheetApp.openById(BAO_GIANG_SPREADSHEET_ID);
  const sh = ss.getSheetByName(check.sheet);
  if (!sh) throw new Error('Không tìm thấy sheet báo giảng: ' + check.sheet);

  const blockStartZero = findTeacherBlockStart_(sh, check.teacher);
  const metaResult = updateReportMetadata_(sh, blockStartZero, payload);

  const writtenDetails = [];
  check.targets.forEach(t => {
    sh.getRange(t.range).setValues([[
      t.subject,
      t.className,
      t.ppct,
      t.lesson
    ]]);
    v4141FormatWrittenRow_(sh, blockStartZero, t.row);
    writtenDetails.push({
      range: t.range,
      dayLabel: t.dayLabel,
      period: t.period,
      className: t.className,
      ppct: t.ppct,
      lesson: t.lesson
    });
  });

  SpreadsheetApp.flush();

  // Chỉ cập nhật tiến độ sau khi báo giảng đã ghi thành công.
  let progressDetails = [];
  let progressError = '';
  try {
    const records = buildPreview_(payload.teacherKey, payload.starts || {}, payload.monday || '', payload.tkbSheet);
    progressDetails = updateProgressReport_(payload, records);
  } catch (e) {
    progressError = e && e.message ? e.message : String(e);
  }

  return {
    ok: true,
    undoToken: undoToken,
    teacher: check.teacher,
    written: writtenDetails.length,
    skipped: check.skipped,
    details: writtenDetails,
    sheet: check.sheet,
    reportUrl: check.reportUrl,
    weekInfo: metaResult,
    progress: {
      ok: !progressError,
      error: progressError,
      details: progressDetails,
      spreadsheetId: TIEN_DO_SPREADSHEET_ID
    }
  };
}


const V420_UNDO_PREFIX='V420_UNDO_';
function checkExistingWrite(payload){
 const check=preflightBaoGiang(payload),ss=SpreadsheetApp.openById(BAO_GIANG_SPREADSHEET_ID),sh=ss.getSheetByName(check.sheet);
 let count=0,ranges=[];check.targets.forEach(t=>{const v=sh.getRange(t.range).getDisplayValues()[0];if(v.some(x=>String(x).trim()!=='')){count++;ranges.push(t.range)}});
 return {ok:true,hasExisting:count>0,count:count,ranges:ranges};
}
function createUndoSnapshot_(payload,check){
 const token=Utilities.getUuid(),snap={reportSheet:check.sheet,report:[],progress:[]};
 const ss=SpreadsheetApp.openById(BAO_GIANG_SPREADSHEET_ID),sh=ss.getSheetByName(check.sheet);
 check.targets.forEach(t=>snap.report.push({range:t.range,values:sh.getRange(t.range).getValues()}));
 const records=buildPreview_(payload.teacherKey,payload.starts||{},payload.monday||'',payload.tkbSheet),counts={};
 records.forEach(r=>counts[r.className]=(counts[r.className]||0)+1);
 const pss=SpreadsheetApp.openById(TIEN_DO_SPREADSHEET_ID),week=Number(payload.week||1);
 Object.keys(counts).forEach(cls=>{const sn=progressSheetNameForClass_(cls),psh=pss.getSheetByName(sn);if(!psh)return;const lr=Math.min(psh.getLastRow(),300),vals=psh.getRange(1,1,lr,5).getDisplayValues();let cw=null,tr=-1;for(let r=2;r<vals.length;r++){const wc=normalizeText_(vals[r][0]);if(wc){const mw=wc.match(/Tuần\s*(\d+)/i);if(mw)cw=Number(mw[1])}if(cw===week&&normalizeText_(vals[r][2]).toLowerCase()===cls.toLowerCase()){tr=r+1;break}}if(tr>0){const rg=psh.getRange(tr,5);snap.progress.push({sheet:sn,range:rg.getA1Notation(),values:rg.getValues()})}});
 CacheService.getScriptCache().put(V420_UNDO_PREFIX+token,JSON.stringify(snap),21600);return token;
}
function undoLastWrite(token){
 const cache=CacheService.getScriptCache(),raw=cache.get(V420_UNDO_PREFIX+token);if(!raw)throw new Error('Bản hoàn tác đã hết hạn hoặc không tồn tại.');
 const snap=JSON.parse(raw),ss=SpreadsheetApp.openById(BAO_GIANG_SPREADSHEET_ID),sh=ss.getSheetByName(snap.reportSheet);if(!sh)throw new Error('Không tìm thấy sheet Báo giảng.');
 (snap.report||[]).forEach(x=>sh.getRange(x.range).setValues(x.values));
 const pss=SpreadsheetApp.openById(TIEN_DO_SPREADSHEET_ID);(snap.progress||[]).forEach(x=>{const psh=pss.getSheetByName(x.sheet);if(psh)psh.getRange(x.range).setValues(x.values)});
 SpreadsheetApp.flush();cache.remove(V420_UNDO_PREFIX+token);return {ok:true};
}


/* ===== V4.20.1 CLEAR TWO-STEP WRITE ===== */
function ghiBaoGiangStep1(payload) {
  const check = preflightBaoGiang(payload);
  const undoToken = createUndoSnapshot_(payload, check);

  const ss = SpreadsheetApp.openById(BAO_GIANG_SPREADSHEET_ID);
  const sh = ss.getSheetByName(check.sheet);
  if (!sh) throw new Error('Không tìm thấy sheet báo giảng: ' + check.sheet);

  const blockStartZero = findTeacherBlockStart_(sh, check.teacher);
  const metaResult = updateReportMetadata_(sh, blockStartZero, payload);

  const writtenDetails = [];
  check.targets.forEach(t => {
    sh.getRange(t.range).setValues([[
      t.subject,
      t.className,
      t.ppct,
      t.lesson
    ]]);
    v4141FormatWrittenRow_(sh, blockStartZero, t.row);
    writtenDetails.push({
      range: t.range,
      dayLabel: t.dayLabel,
      period: t.period,
      className: t.className,
      ppct: t.ppct,
      lesson: t.lesson
    });
  });

  SpreadsheetApp.flush();

  return {
    ok: true,
    undoToken: undoToken,
    teacher: check.teacher,
    written: writtenDetails.length,
    skipped: check.skipped,
    details: writtenDetails,
    sheet: check.sheet,
    reportUrl: check.reportUrl,
    weekInfo: metaResult
  };
}

function capNhatTienDoStep2(payload) {
  try {
    const records = buildPreview_(payload.teacherKey, payload.starts || {}, payload.monday || '', payload.tkbSheet);
    const progressDetails = updateProgressReport_(payload, records);
    return {
      ok: true,
      error: '',
      details: progressDetails,
      spreadsheetId: TIEN_DO_SPREADSHEET_ID
    };
  } catch (e) {
    return {
      ok: false,
      error: e && e.message ? e.message : String(e),
      details: [],
      spreadsheetId: TIEN_DO_SPREADSHEET_ID
    };
  }
}


/* ===== V4.62 PRINT / EXPORT REPORT ===== */
function getPrintableBaoGiang(payload) {
  if (!payload || !payload.teacherKey) throw new Error('Thiếu giáo viên.');
  const teacher = TEACHER_MAP[payload.teacherKey];
  if (!teacher) throw new Error('Giáo viên không hợp lệ.');

  const meta = buildWeekMeta_(payload);
  const ss = SpreadsheetApp.openById(BAO_GIANG_SPREADSHEET_ID);
  const sheetName = getSelectedReportSheetName_(payload);
  const sh = ss.getSheetByName(sheetName);
  if (!sh) throw new Error('Không tìm thấy sheet báo giảng: ' + sheetName);

  const blockStartZero = findTeacherBlockStart_(sh, teacher);
  const sections = findTeacherSectionRows_(sh, blockStartZero);
  const startCol1 = blockStartZero + 1;

  function readSection_(titleRow) {
    const headerRow = titleRow + 2;
    const firstDataRow = headerRow + 1;
    const vals = sh.getRange(firstDataRow, startCol1, 30, 7).getDisplayValues();
    const rows = [];
    let currentDay = 2;
    for (let i = 0; i < vals.length; i++) {
      const p = (i % 5) + 1;
      currentDay = 2 + Math.floor(i / 5);
      const row = vals[i];
      rows.push({
        dayNum: currentDay,
        dateShort: fmtDM_(meta.days[currentDay]),
        period: p,
        subject: normalizeText_(row[2]),
        className: normalizeText_(row[3]),
        ppct: normalizeText_(row[4]),
        lesson: normalizeText_(row[5]),
        note: normalizeText_(row[6])
      });
    }
    return rows;
  }

  return {
    ok: true,
    teacher: teacher,
    week: meta.week,
    team: meta.team,
    leader: meta.leader,
    from: fmtDMY_(meta.monday),
    to: fmtDMY_(meta.saturday),
    fromShort: fmtDM_(meta.monday),
    toShort: fmtDM_(meta.saturday) + '/' + Utilities.formatDate(meta.saturday, 'Asia/Ho_Chi_Minh', 'yyyy'),
    year: Utilities.formatDate(meta.saturday, 'Asia/Ho_Chi_Minh', 'yyyy'),
    sheetName: sheetName,
    sections: {
      morning: readSection_(sections.morning),
      afternoon: readSection_(sections.afternoon)
    }
  };
}


/* ===== V4.80 VERIFY PROGRESS WRITE ===== */
function kiemTraTienDoDaCapNhat(payload) {
  try {
    const week = Number(payload && payload.week || 1);
    const records = buildPreview_(payload.teacherKey, payload.starts || {}, payload.monday || '', payload.tkbSheet);
    const counts = {};
    (records || []).forEach(r => {
      const cls = String(r.className || '').trim();
      if (cls) counts[cls] = (counts[cls] || 0) + 1;
    });
    const classes = Object.keys(counts);
    if (!classes.length) return {ok:true, done:true, classes:0};

    const ss = SpreadsheetApp.openById(TIEN_DO_SPREADSHEET_ID);
    const groups = {};
    classes.forEach(cls => {
      const sn = progressSheetNameForClass_(cls);
      (groups[sn] || (groups[sn] = [])).push(cls);
    });

    let matched = 0;
    for (const sheetName in groups) {
      const sh = ss.getSheetByName(sheetName);
      if (!sh) return {ok:false, done:false, classes:matched, error:'Không tìm thấy '+sheetName};
      const lastRow = Math.min(Math.max(sh.getLastRow(),3),300);
      const vals = sh.getRange(1,1,lastRow,5).getDisplayValues();
      const rowMap = {};
      let currentWeek = null;
      for (let r=2;r<vals.length;r++) {
        const wc = normalizeText_(vals[r][0]);
        if (wc) { const m=wc.match(/Tuần\s*(\d+)/i); if(m) currentWeek=Number(m[1]); }
        const cc = normalizeText_(vals[r][2]);
        if (currentWeek && cc) rowMap[currentWeek+'|'+cc.toLowerCase()] = r;
      }
      for (const cls of groups[sheetName]) {
        const idx = rowMap[week+'|'+cls.toLowerCase()];
        if (idx == null) return {ok:true, done:false, classes:matched};
        const actual = Number(String(vals[idx][4]).replace(/[^0-9.-]/g,''));
        if (actual !== Number(counts[cls])) return {ok:true, done:false, classes:matched};
        matched++;
      }
    }
    return {ok:true, done:matched===classes.length, classes:matched};
  } catch(e) {
    return {ok:false, done:false, classes:0, error:e && e.message ? e.message : String(e)};
  }
}

// V4.116 — Dashboard Hôm nay / Ngày mai: ưu tiên dữ liệu đã ghi trong Lịch báo giảng.
// TKB chỉ được dùng làm dự phòng khi ngày đó chưa có dữ liệu Báo giảng.
function dateOnly_(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
}

function weekEntryForDate_(targetDate) {
  const target = dateOnly_(targetDate);
  const weeks = listWeekSheets_();
  for (let i = 0; i < weeks.length; i++) {
    if (!weeks[i].monday) continue;
    const monday = parseYmd_(weeks[i].monday);
    const saturday = addDays_(monday, 5);
    if (target >= dateOnly_(monday) && target <= dateOnly_(saturday)) return weeks[i];
  }
  return null;
}

function tkbSheetForDate_(targetDate, preferredName) {
  const target = dateOnly_(targetDate);
  const rows = listTkbWeekSheets_();
  const preferred = normalizeText_(preferredName);
  let matches = [];
  for (let i = 0; i < rows.length; i++) {
    const mondayYmd = inferMondayFromWeekToken_(rows[i].token);
    if (!mondayYmd) continue;
    const monday = parseYmd_(mondayYmd);
    const saturday = addDays_(monday, 5);
    if (target >= dateOnly_(monday) && target <= dateOnly_(saturday)) matches.push(rows[i]);
  }
  if (!matches.length) return '';
  const exact = matches.find(x => x.name === preferred);
  if (exact) return exact.name;
  const gv = matches.find(x => /\(GV\)/i.test(x.name));
  return (gv || matches[0]).name;
}

function dashboardTimes_() {
  return {
    'Sáng': {1:'07:00 – 07:45',2:'07:55 – 08:40',3:'08:55 – 09:40',4:'09:50 – 10:35',5:'10:45 – 11:30'},
    'Chiều': {1:'14:00 – 14:45',2:'14:55 – 15:40',3:'15:50 – 16:35'}
  };
}

function readBaoGiangDashboardForDate_(teacherKey, targetDate) {
  const teacher = TEACHER_MAP[teacherKey];
  if (!teacher) throw new Error('Giáo viên không hợp lệ.');
  const jsDay = targetDate.getDay();
  const dayNum = jsDay === 0 ? 8 : jsDay + 1;
  const empty = {sessions:{Sáng:[],Chiều:[]}, sheetName:'', foundSheet:false};
  if (dayNum < 2 || dayNum > 7) return empty;

  const weekEntry = weekEntryForDate_(targetDate);
  if (!weekEntry) return empty;

  const ss = SpreadsheetApp.openById(BAO_GIANG_SPREADSHEET_ID);
  const sh = ss.getSheetByName(weekEntry.name);
  if (!sh) return empty;

  const blockStartZero = findTeacherBlockStart_(sh, teacher);
  const sections = findTeacherSectionRows_(sh, blockStartZero);
  const startCol1 = blockStartZero + 1;
  const times = dashboardTimes_();
  const sessions = {Sáng:[], Chiều:[]};

  function readSection(titleRow, sessionName) {
    const headerRow = titleRow + 2;
    const firstDataRow = headerRow + 1;
    const rowStart = firstDataRow + (dayNum - 2) * 5;
    const vals = sh.getRange(rowStart, startCol1, 5, 7).getDisplayValues();
    vals.forEach((row, idx) => {
      const periodFromSheet = Number(normalizeText_(row[1]));
      const period = periodFromSheet || (idx + 1);
      const subject = normalizeText_(row[2]);
      const className = normalizeText_(row[3]);
      const ppct = normalizeText_(row[4]);
      const lesson = normalizeText_(row[5]);
      const note = normalizeText_(row[6]);
      if (!subject && !className && !ppct && !lesson && !note) return;
      sessions[sessionName].push({
        session: sessionName,
        period: period,
        subject: subject,
        className: className,
        ppct: ppct,
        lesson: lesson,
        note: note,
        time: (times[sessionName] && times[sessionName][period]) || ''
      });
    });
  }

  readSection(sections.morning, 'Sáng');
  readSection(sections.afternoon, 'Chiều');
  return {sessions:sessions, sheetName:weekEntry.name, foundSheet:true};
}

function readTkbDashboardForDate_(teacherKey, targetDate, tkbSheetName, starts) {
  const jsDay = targetDate.getDay();
  const dayNum = jsDay === 0 ? 8 : jsDay + 1;
  const sessions = {Sáng:[], Chiều:[]};
  if (dayNum < 2 || dayNum > 7) return {sessions:sessions, sheetName:''};

  const sheetName = tkbSheetForDate_(targetDate, tkbSheetName);
  if (!sheetName) return {sessions:sessions, sheetName:''};
  const schedule = readTeacherScheduleAll_(teacherKey, sheetName).slice().sort((a,b)=>
    (a.dayNum-b.dayNum) || ((a.session==='Sáng'?0:1)-(b.session==='Sáng'?0:1)) || (a.period-b.period) || String(a.className).localeCompare(String(b.className))
  );
  const counters = {};
  const times = dashboardTimes_();
  schedule.forEach(rec => {
    const cls = rec.className;
    if (counters[cls] == null) {
      const custom = starts && starts[cls] != null ? Number(starts[cls]) : 1;
      counters[cls] = isFinite(custom) && custom > 0 ? custom : 1;
    } else counters[cls] += 1;
    if (rec.dayNum !== dayNum || !sessions[rec.session]) return;
    const grade = Number(String(cls).slice(0,2));
    sessions[rec.session].push({
      session:rec.session,
      period:rec.period,
      className:cls,
      ppct:counters[cls],
      subject:rec.subject || '',
      lesson:lessonFor_(grade,counters[cls]),
      time:(times[rec.session] && times[rec.session][Number(rec.period)]) || ''
    });
  });
  return {sessions:sessions, sheetName:sheetName};
}

function dashboardTotal_(sessions) {
  return ((sessions && sessions['Sáng']) || []).length + ((sessions && sessions['Chiều']) || []).length;
}

function getDayDashboard(payload, offsetDays) {
  if (!payload || !payload.teacherKey) throw new Error('Thiếu giáo viên.');
  const offset = Number(offsetDays || 0);
  const targetDate = addDays_(new Date(), isFinite(offset) ? offset : 0);
  const extraSheet = tkbSheetForDate_(targetDate, payload.tkbSheet);
  if (extraSheet && v4150HasExtraPlan_(payload.teacherKey, extraSheet)) {
    const plan = readTkbDashboardForDate_(payload.teacherKey, targetDate, extraSheet, payload.starts || {});
    return {
      outsideWeek:false, source:'schedule_extra', sourceLabel:'Lịch báo giảng + Điều chỉnh', sheetName:plan.sheetName,
      targetYmd:Utilities.formatDate(targetDate,'Asia/Ho_Chi_Minh','yyyy-MM-dd'), sessions:plan.sessions
    };
  }

  // 1) Nguồn chính: Lịch báo giảng đã ghi.
  const report = readBaoGiangDashboardForDate_(payload.teacherKey, targetDate);
  if (dashboardTotal_(report.sessions) > 0) {
    return {outsideWeek:false,source:'bao_giang',sourceLabel:'Lịch báo giảng',sheetName:report.sheetName,
      targetYmd:Utilities.formatDate(targetDate,'Asia/Ho_Chi_Minh','yyyy-MM-dd'),sessions:report.sessions};
  }

  // 2) Dự phòng: TKB của đúng tuần/ngày, chỉ khi Báo giảng chưa có dữ liệu.
  const tkb = readTkbDashboardForDate_(payload.teacherKey, targetDate, payload.tkbSheet, payload.starts || {});
  if (dashboardTotal_(tkb.sessions) > 0) {
    return {outsideWeek:false,source:'tkb_fallback',sourceLabel:'TKB dự phòng',sheetName:tkb.sheetName,
      targetYmd:Utilities.formatDate(targetDate,'Asia/Ho_Chi_Minh','yyyy-MM-dd'),sessions:tkb.sessions};
  }
  return {outsideWeek:false,source:report.foundSheet?'bao_giang_empty':'none',sourceLabel:report.foundSheet?'Lịch báo giảng':'',
    sheetName:report.sheetName||tkb.sheetName||'',targetYmd:Utilities.formatDate(targetDate,'Asia/Ho_Chi_Minh','yyyy-MM-dd'),sessions:{Sáng:[],Chiều:[]}};
}

function getTodayDashboard(payload) {
  return getDayDashboard(payload, 0);
}

function getTomorrowDashboard(payload) {
  return getDayDashboard(payload, 1);
}

// ===== V4.122: LỊCH DẠY CẢ TUẦN (Thứ 2 → Thứ 7) =====
function getWeekDashboard(payload) {
  if (!payload || !payload.teacherKey) throw new Error('Thiếu giáo viên.');
  let monday = parseYmd_(payload.monday);
  if (!monday) {
    const now = new Date(); const jsDay = now.getDay(); const diff = jsDay === 0 ? -6 : 1 - jsDay; monday = addDays_(now, diff);
  }
  const names = ['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'];
  const days = [];
  let planSheet = '';
  try { planSheet = getSelectedTkbSheetName_(payload.tkbSheet); } catch (e) { planSheet = normalizeText_(payload.tkbSheet); }
  const hasExtraPlan = !!(planSheet && v4150HasExtraPlan_(payload.teacherKey, planSheet));
  for (let i = 0; i < 6; i++) {
    const targetDate = addDays_(monday, i);
    let sessions={Sáng:[],Chiều:[]}, source='', sourceLabel='', sheetName='';
    if (hasExtraPlan) {
      const tkb = readTkbDashboardForDate_(payload.teacherKey, targetDate, planSheet, payload.starts || {});
      sessions = tkb.sessions; source='schedule_extra'; sourceLabel='Lịch báo giảng + Phát sinh'; sheetName=tkb.sheetName||planSheet;
    } else {
      const report = readBaoGiangDashboardForDate_(payload.teacherKey, targetDate);
      sessions = report.sessions;
      source = dashboardTotal_(sessions) > 0 ? 'bao_giang' : (report.foundSheet ? 'bao_giang_empty' : 'none');
      sourceLabel = report.foundSheet ? 'Lịch báo giảng' : ''; sheetName = report.sheetName || '';
      if (dashboardTotal_(sessions) === 0) {
        const tkb = readTkbDashboardForDate_(payload.teacherKey, targetDate, payload.tkbSheet, payload.starts || {});
        if (dashboardTotal_(tkb.sessions) > 0) { sessions=tkb.sessions;source='tkb_fallback';sourceLabel='TKB dự phòng';sheetName=tkb.sheetName||sheetName; }
      }
    }
    days.push({dayNum:i+2,label:names[i],targetYmd:Utilities.formatDate(targetDate,'Asia/Ho_Chi_Minh','yyyy-MM-dd'),source:source,sourceLabel:sourceLabel,sheetName:sheetName,sessions:sessions||{Sáng:[],Chiều:[]}});
  }
  return {mondayYmd:Utilities.formatDate(monday,'Asia/Ho_Chi_Minh','yyyy-MM-dd'),saturdayYmd:Utilities.formatDate(addDays_(monday,5),'Asia/Ho_Chi_Minh','yyyy-MM-dd'),hasExtraPlan:hasExtraPlan,days:days};
}


// ============================================================================
// V4.127 — HỖ TRỢ GIÁO VIÊN DẠY NHIỀU MÔN
// - Đọc TKB theo giáo viên, không khóa cứng môn Toán.
// - PPCT chạy độc lập theo cặp Lớp + Môn.
// - Mỗi môn có thể có một nguồn PPCT riêng.
// - Giữ tương thích với cấu hình một nguồn PPCT của các bản cũ.
// ============================================================================
const V4127_PPCT_SOURCE_MAP_PROPERTY = 'PPCT_SOURCE_URLS_V4127';

function v4127SubjectKey_(subject) {
  return keyText_(subject || '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'mon';
}

function v4127PairKey_(className, subject) {
  return keyText_(className || '').replace(/[^a-z0-9]+/g, '') + '||' + v4127SubjectKey_(subject);
}

function v4127DisplaySubject_(subject) {
  const s = normalizeText_(subject);
  return s || 'Chưa xác định môn';
}

function v4127IsMathSubject_(subject) {
  const k = v4127SubjectKey_(subject);
  return k === 'toan' || k === 'toan_hoc' || k.indexOf('toan') === 0;
}

function v4127TeacherTokens_(teacherKey) {
  const tokens = [];
  const add = v => {
    const n = normalizeTeacherNameKey_(v);
    if (n && tokens.indexOf(n) < 0) tokens.push(n);
  };
  add(teacherKey);
  add(TEACHER_MAP[teacherKey]);
  return tokens;
}

function v4127SubjectsFromCell_(cell, teacherKey) {
  const teacherTokens = v4127TeacherTokens_(teacherKey);
  const lines = String(cell == null ? '' : cell).split(/\r?\n/).map(normalizeText_).filter(Boolean);
  const found = [];
  lines.forEach(line => {
    // Lấy dấu phân cách cuối cùng: "Môn - T.Tuấn", vẫn hỗ trợ tên môn có dấu gạch nối.
    const m = line.match(/^(.*)\s*[-–—:]\s*([^\-–—:]+)$/);
    if (!m) return;
    const subject = normalizeText_(m[1]);
    const teacherPart = normalizeTeacherNameKey_(m[2]);
    if (!subject || teacherTokens.indexOf(teacherPart) < 0) return;
    if (!found.some(x => keyText_(x) === keyText_(subject))) found.push(subject);
  });
  return found;
}

// V4.146 — Chỉ nhận cột lớp thật trong TKB (10A1...12A5).
// Tránh đọc nhầm vùng thống kê bên phải như “GDĐP - Hà”, gây className không phải lớp và khối = NaN.
function v4146ClassGrade_(className) {
  const raw = normalizeText_(className).replace(/\s+/g, '');
  const m = raw.match(/^(10|11|12)[A-Za-zĐđ]+\d+$/i);
  return m ? Number(m[1]) : null;
}

// V4.149 — Quy ước trạng thái ô TKB:
// - chữ trắng: lịch cũ đã hủy/ẩn => bỏ qua;
// - chữ gạch ngang: tiết đã hủy => bỏ qua;
// - chữ đỏ hoặc chữ bình thường: vẫn là lịch có hiệu lực => đọc bình thường.
function v4149IsInactiveTkbCell_(fontColor, fontLine) {
  const color = String(fontColor == null ? '' : fontColor).trim().toLowerCase().replace(/\s+/g, '');
  const isWhite = color === '#ffffff' || color === '#fff' || color === 'white' ||
    color === 'rgb(255,255,255)' || color === 'rgba(255,255,255,1)';
  const line = String(fontLine == null ? '' : fontLine).trim().toLowerCase();
  const isStrike = line === 'line-through' || line.indexOf('line-through') >= 0 ||
    line.indexOf('strikethrough') >= 0 || line.indexOf('strike-through') >= 0;
  return isWhite || isStrike;
}

// Ghi đè hàm cũ: tên hàm được giữ để toàn bộ phần còn lại của app tiếp tục hoạt động.
function readMathSchedule_(teacherKey, tkbSheetName) {
  if (!TEACHER_MAP[teacherKey]) throw new Error('Giáo viên không hợp lệ.');
  const ss = SpreadsheetApp.openById(TKB_SPREADSHEET_ID);
  const sh = ss.getSheetByName(getSelectedTkbSheetName_(tkbSheetName));
  if (!sh) throw new Error('Không tìm thấy Thời khóa biểu đã chọn.');

  const lastCol = Math.min(Math.max(sh.getLastColumn(), 18), 80);
  const rowCount = Math.min(sh.getLastRow(), 220);
  const grid = sh.getRange(1, 1, rowCount, lastCol);
  const values = grid.getDisplayValues();
  // Đọc định dạng theo cả vùng một lần để tránh gọi API từng ô, giữ tốc độ tốt.
  const fontColors = grid.getFontColors();
  const fontLines = grid.getFontLines();
  const headers = values[0].slice(3).map(h => String(h || '').split('\n')[0].trim());
  let currentDay = '', currentSession = '';
  const records = [];

  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    if (row[0]) currentDay = String(row[0]).trim();
    if (row[1]) currentSession = normalizeText_(row[1]);
    if (currentSession !== 'Sáng' && currentSession !== 'Chiều') continue;

    const period = Number(row[2]);
    if (!period || period < 1 || period > 5) continue;
    const dm = String(currentDay).match(/(?:Thứ\s*)?([2-7])\b/i);
    const dayToken = dm ? dm[1] : String(currentDay).split(/\s|\n/)[0].trim();
    if (!/^[2-7]$/.test(dayToken)) continue;

    for (let c = 3; c < row.length; c++) {
      const className = headers[c - 3] || '';
      // Chỉ các cột có tiêu đề là lớp thật mới được coi là TKB lớp.
      // Các cột thống kê/ý kiến phía bên phải bị bỏ qua hoàn toàn.
      if (!v4146ClassGrade_(className)) continue;

      // Nhà trường có thể giữ nội dung lịch cũ nhưng đổi chữ sang trắng,
      // hoặc gạch ngang để thể hiện tiết đã hủy. App coi cả hai là ô trống.
      const fontColor = fontColors[r] && fontColors[r][c];
      const fontLine = fontLines[r] && fontLines[r][c];
      if (v4149IsInactiveTkbCell_(fontColor, fontLine)) continue;

      const subjects = v4127SubjectsFromCell_(row[c], teacherKey);
      subjects.forEach(subject => {
        records.push({
          dayNum: Number(dayToken),
          dayLabel: 'Thứ ' + dayToken,
          dateLabel: '',
          session: currentSession,
          period: period,
          subject: v4127DisplaySubject_(subject),
          className: className
        });
      });
    }
  }

  records.sort((a, b) =>
    (a.dayNum - b.dayNum) ||
    ((a.session === 'Sáng' ? 0 : 1) - (b.session === 'Sáng' ? 0 : 1)) ||
    (a.period - b.period) ||
    String(a.className).localeCompare(String(b.className)) ||
    String(a.subject).localeCompare(String(b.subject))
  );
  return records;
}

function readTeacherScheduleAll_(teacherKey, tkbSheetName) {
  return readMathSchedule_(teacherKey, tkbSheetName).map(x => ({
    dayNum: x.dayNum,
    session: x.session,
    period: x.period,
    className: x.className,
    subject: x.subject
  }));
}

function v4127ReadSourceMap_() {
  let out = {};
  try {
    const raw = PropertiesService.getScriptProperties().getProperty(V4127_PPCT_SOURCE_MAP_PROPERTY) || '';
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') out = parsed;
    }
  } catch (e) { out = {}; }
  return out;
}

function v4127WriteSourceMap_(map) {
  PropertiesService.getScriptProperties().setProperty(V4127_PPCT_SOURCE_MAP_PROPERTY, JSON.stringify(map || {}));
}

function v4127FindSourceEntry_(map, subject) {
  const target = v4127SubjectKey_(subject);
  const keys = Object.keys(map || {});
  const hit = keys.find(k => v4127SubjectKey_(k) === target);
  return hit ? {key: hit, url: normalizeText_(map[hit])} : null;
}

function getPpctSourceUrl_(subject) {
  const map = v4127ReadSourceMap_();
  if (subject) {
    const hit = v4127FindSourceEntry_(map, subject);
    if (hit && hit.url) return hit.url;

    // Tương thích bản cũ: nguồn đơn được coi là nguồn của môn chính của giáo viên.
    const primary = getTeacherDirectoryInfo_(FIXED_TEACHER_KEY).subject || '';
    if (primary && v4127SubjectKey_(primary) === v4127SubjectKey_(subject)) {
      try {
        return normalizeText_(PropertiesService.getScriptProperties().getProperty(PPCT_SOURCE_PROPERTY) || PPCT_SOURCE_DEFAULT);
      } catch (e) {
        return normalizeText_(PPCT_SOURCE_DEFAULT);
      }
    }
    return '';
  }

  // Gọi không truyền môn: trả nguồn môn chính/nguồn đầu tiên để tương thích hàm cũ.
  const primary = getTeacherDirectoryInfo_(FIXED_TEACHER_KEY).subject || '';
  const hit = primary ? v4127FindSourceEntry_(map, primary) : null;
  if (hit && hit.url) return hit.url;
  const firstKey = Object.keys(map).find(k => normalizeText_(map[k]));
  if (firstKey) return normalizeText_(map[firstKey]);
  try {
    return normalizeText_(PropertiesService.getScriptProperties().getProperty(PPCT_SOURCE_PROPERTY) || PPCT_SOURCE_DEFAULT);
  } catch (e) {
    return normalizeText_(PPCT_SOURCE_DEFAULT);
  }
}

function loadPpctCurriculum_(subject) {
  const url = getPpctSourceUrl_(subject);
  const id = extractDriveFileId_(url);
  if (!id) {
    return {
      map: {}, configured: false, entries: 0, kind: '',
      title: 'Chưa khai báo Nguồn PPCT cho ' + v4127DisplaySubject_(subject),
      error: '', subject: v4127DisplaySubject_(subject), gradeCounts:{}, format:''
    };
  }

  const cache = CacheService.getScriptCache();
  const key = 'ppct_v4134_' + v4127SubjectKey_(subject) + '_' + id;
  const cached = cache.get(key);
  if (cached) {
    try { return JSON.parse(cached); } catch (e) {}
  }
  try {
    const data = readPpctSourceById_(id);
    const res = {
      map: data.map || {}, configured: true, entries: data.entries || 0,
      kind: data.kind || '', title: data.title || '', error: '',
      subject: v4127DisplaySubject_(subject),
      gradeCounts: data.gradeCounts || v4134GradeCounts_(data.map || {}),
      format: data.format || ''
    };
    cache.put(key, JSON.stringify(res), 600);
    return res;
  } catch (e) {
    return {
      map: {}, configured: true, entries: 0, kind: '', title: '',
      error: e.message || String(e), subject: v4127DisplaySubject_(subject),
      gradeCounts:{}, format:''
    };
  }
}

function lessonFor_(grade, ppct, curriculum, subject) {
  ppct = Number(ppct);
  // V4.131: tuyệt đối không dùng tên bài dự phòng nội bộ.
  // Có tên trong nguồn đã khai báo thì dùng; không có thì để trống để bước kiểm tra chặn ghi.
  return externalLessonFor_(curriculum, grade, ppct) || '';
}

function v4127StoredSourceConfig_(subject) {
  const url = getPpctSourceUrl_(subject);
  return {
    subject: v4127DisplaySubject_(subject),
    url: url,
    configured: !!url
  };
}

function getPpctSourceConfig(subject) {
  subject = normalizeText_(subject) || getTeacherDirectoryInfo_(FIXED_TEACHER_KEY).subject || 'Toán';
  const url = getPpctSourceUrl_(subject);
  const data = loadPpctCurriculum_(subject);
  return {
    subject: subject,
    url: url,
    configured: !!url,
    entries: data.entries || 0,
    kind: data.kind || '',
    title: data.title || '',
    error: data.error || '',
    gradeCounts: data.gradeCounts || {},
    format: data.format || ''
  };
}

function getPpctSourceConfigs(teacherKey, tkbSheetName) {
  teacherKey = teacherKey || FIXED_TEACHER_KEY;
  let subjects = [];
  try {
    subjects = readMathSchedule_(teacherKey, tkbSheetName).map(r => normalizeText_(r.subject)).filter(Boolean);
  } catch (e) {}
  const directory = getTeacherDirectoryInfo_(teacherKey);
  if (!subjects.length && directory.subject) subjects.push(directory.subject);
  subjects = subjects.filter((s, i, arr) => arr.findIndex(x => v4127SubjectKey_(x) === v4127SubjectKey_(s)) === i);
  if (!subjects.length) subjects = ['Toán'];
  return {
    teacher: TEACHER_MAP[teacherKey] || teacherKey,
    subjects: subjects,
    sources: subjects.map(s => getPpctSourceConfig(s))
  };
}


// V4.132 — Cho phép giao diện kiểm tra và mở luồng cấp quyền Google Docs trực tiếp.
function getPpctAuthorizationInfo() {
  try {
    const info = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
    const status = info.getAuthorizationStatus();
    const required = status === ScriptApp.AuthorizationStatus.REQUIRED;
    return {
      required: required,
      status: String(status),
      url: required ? (info.getAuthorizationUrl() || '') : ''
    };
  } catch (e) {
    return {required:false, status:'UNKNOWN', url:'', error:e && e.message ? e.message : String(e)};
  }
}

function savePpctSubjectSourceConfig(subject, url) {
  subject = normalizeText_(subject);
  if (!subject) throw new Error('Chưa xác định môn cần lưu nguồn PPCT.');
  const clean = normalizeText_(url);
  const map = v4127ReadSourceMap_();
  const old = v4127FindSourceEntry_(map, subject);
  if (old) delete map[old.key];

  if (!clean) {
    v4127WriteSourceMap_(map);
    return getPpctSourceConfig(subject);
  }

  const id = extractDriveFileId_(clean);
  if (!id) throw new Error('Link nguồn PPCT không hợp lệ. Hãy dùng link Google Sheets hoặc Google Docs.');
  const test = readPpctSourceById_(id);
  if (!test.entries) {
    throw new Error('Đã mở được file nhưng chưa nhận diện được dữ liệu PPCT của môn ' + subject + '. Hỗ trợ: cột PPCT/TT/STT + Tên bài/Nội dung/Bài học; app tự dò Lớp/Khối 10-11-12 và các bảng Kế hoạch dạy học/Phân phối chương trình.');
  }
  map[subject] = clean;
  v4127WriteSourceMap_(map);
  CacheService.getScriptCache().remove('ppct_v4147_' + v4127SubjectKey_(subject) + '_' + id);
  return getPpctSourceConfig(subject);
}

// Tương thích nút lưu nguồn đơn của bản cũ: lưu cho môn chính.
function savePpctSourceConfig(url) {
  const subject = getTeacherDirectoryInfo_(FIXED_TEACHER_KEY).subject || 'Toán';
  const res = savePpctSubjectSourceConfig(subject, url);
  const props = PropertiesService.getScriptProperties();
  if (normalizeText_(url)) props.setProperty(PPCT_SOURCE_PROPERTY, normalizeText_(url));
  else props.deleteProperty(PPCT_SOURCE_PROPERTY);
  return res;
}

function buildPreview_(teacherKey, starts, mondayYmd, tkbSheetName) {
  const schedule = readMathSchedule_(teacherKey, tkbSheetName);
  const counters = {};
  const curriculums = {};
  const out = [];

  schedule.forEach(rec => {
    const subject = v4127DisplaySubject_(rec.subject);
    const pairKey = v4127PairKey_(rec.className, subject);
    if (counters[pairKey] == null) {
      const raw = starts && starts[pairKey] != null ? starts[pairKey] : (starts && starts[rec.className] != null ? starts[rec.className] : 1);
      const custom = Number(raw);
      counters[pairKey] = isFinite(custom) && custom > 0 ? custom : 1;
    } else {
      counters[pairKey] += 1;
    }

    const grade = v4146ClassGrade_(rec.className);
    const sk = v4127SubjectKey_(subject);
    if (!curriculums[sk]) curriculums[sk] = loadPpctCurriculum_(subject);
    const curriculum = curriculums[sk];
    const ppct = counters[pairKey];
    const ext = externalLessonFor_(curriculum, grade, ppct);
    const hasSource = !!(curriculum && curriculum.configured);
    out.push(Object.assign({}, rec, {
      subject: subject,
      pairKey: pairKey,
      dateLabel: dateLabelForDay_(mondayYmd, rec.dayNum),
      ppct: ppct,
      lesson: ext || '',
      lessonMissing: !ext,
      lessonMissingReason: ext ? '' : (
        curriculum && curriculum.error ? ('Nguồn PPCT ' + subject + ' đang lỗi: ' + curriculum.error) :
        (hasSource ? ('Nguồn PPCT ' + subject + ' chưa có PPCT ' + ppct + ' cho khối ' + (grade || '?')) : ('Chưa khai báo Nguồn PPCT cho ' + subject))
      ),
      lessonSource: ext ? ('PPCT chuẩn · ' + subject) : (curriculum && curriculum.error ? ('Lỗi Nguồn PPCT · ' + subject) : (hasSource ? ('Thiếu PPCT trong nguồn · ' + subject) : ('Chưa có nguồn PPCT · ' + subject)))
    }));
  });
  return out;
}

function readTeacherLessonRows_(sheet, teacherKey, mondayYmd) {
  const fullName = TEACHER_MAP[teacherKey];
  if (!fullName) throw new Error('Giáo viên không hợp lệ.');
  const blockStartZero = findTeacherBlockStart_(sheet, fullName);
  const startCol1 = blockStartZero + 1;
  const lastRow = Math.max(sheet.getLastRow(), 1);
  const vals = sheet.getRange(1, startCol1, lastRow, 7).getDisplayValues();
  const rows = [];
  let currentDay = null;
  let currentSession = '';
  const primarySubject = getTeacherDirectoryInfo_(teacherKey).subject || '';

  for (let r = 0; r < vals.length; r++) {
    const row = vals[r];
    const rowText = row.map(normalizeText_).join(' | ').toUpperCase();
    if (rowText.indexOf('BUỔI SÁNG') >= 0) { currentSession = 'Sáng'; currentDay = null; }
    if (rowText.indexOf('BUỔI CHIỀU') >= 0) { currentSession = 'Chiều'; currentDay = null; }

    const dayCell = normalizeText_(row[0]);
    const dm = dayCell.match(/^([2-7])(?:\s|\(|$)/);
    if (dm) currentDay = Number(dm[1]);

    const period = Number(String(row[1]).replace(',', '.'));
    const subject = normalizeText_(row[2]) || primarySubject;
    const cls = normalizeText_(row[3]);
    if (!/^(10|11|12)[A-Za-z0-9]+$/i.test(cls)) continue;
    if (!Number.isFinite(period) || period < 1 || period > 5) continue;

    const rawPpct = normalizeText_(row[4]);
    const oldPpct = rawPpct === '' ? null : Number(rawPpct.replace(',', '.'));
    let dateShort = '';
    if (mondayYmd && currentDay) {
      try { dateShort = fmtDM_(addDays_(parseYmd_(mondayYmd), currentDay - 2)); } catch (e) {}
    }
    rows.push({
      row: r + 1,
      blockStartZero: blockStartZero,
      startCol1: startCol1,
      ppctCol: startCol1 + 4,
      lessonCol: startCol1 + 5,
      className: cls,
      subject: subject,
      pairKey: v4127PairKey_(cls, subject),
      grade: Number(String(cls).slice(0, 2)),
      oldPpct: Number.isFinite(oldPpct) && oldPpct > 0 ? oldPpct : null,
      oldLesson: normalizeText_(row[5]),
      dayNum: currentDay,
      dateShort: dateShort,
      session: currentSession,
      period: period
    });
  }
  return rows;
}

function readLastPpctByClass_(teacherKey, previousSheetName) {
  const result = {};
  if (!previousSheetName || !TEACHER_MAP[teacherKey]) return result;
  const ss = SpreadsheetApp.openById(BAO_GIANG_SPREADSHEET_ID);
  const sh = ss.getSheetByName(previousSheetName);
  if (!sh) return result;
  let rows = [];
  try {
    const token = extractWeekToken_(previousSheetName);
    const monday = token ? inferMondayFromWeekToken_(token) : '';
    rows = readTeacherLessonRows_(sh, teacherKey, monday);
  } catch (e) { return result; }

  rows.sort((a, b) =>
    (Number(a.dayNum || 9) - Number(b.dayNum || 9)) ||
    ((a.session === 'Sáng' ? 0 : 1) - (b.session === 'Sáng' ? 0 : 1)) ||
    (Number(a.period || 0) - Number(b.period || 0)) || (a.row - b.row)
  );
  rows.forEach(r => {
    if (r.oldPpct && r.oldPpct > 0) result[r.pairKey] = r.oldPpct;
  });
  return result;
}

function readLastPpctBeforeSheet_(teacherKey, currentSheetName) {
  const ordered = orderedWeekSheets_();
  const current = ordered.find(x => x.name === currentSheetName);
  if (!current) return {};
  const result = {};
  ordered.filter(x => x.time < current.time).forEach(w => {
    const one = readLastPpctByClass_(teacherKey, w.name);
    Object.keys(one).forEach(pairKey => {
      const n = Number(one[pairKey]);
      if (Number.isFinite(n) && n > 0) result[pairKey] = n;
    });
  });
  return result;
}

function getClassPpctSuggestions(teacherKey, reportSheetName, tkbSheetName) {
  if (!TEACHER_MAP[teacherKey]) throw new Error('Giáo viên không hợp lệ.');
  const schedule = readMathSchedule_(teacherKey, tkbSheetName);
  const counts = {};
  const meta = {};
  schedule.forEach(r => {
    const subject = v4127DisplaySubject_(r.subject);
    const key = v4127PairKey_(r.className, subject);
    counts[key] = (counts[key] || 0) + 1;
    meta[key] = {className: r.className, subject: subject, key: key};
  });

  const previousSheet = getPreviousWeekSheetName_(reportSheetName);
  const lastByPair = readLastPpctBeforeSheet_(teacherKey, reportSheetName);
  const classes = Object.keys(counts).sort((a, b) => {
    const A = meta[a], B = meta[b];
    return String(A.className).localeCompare(String(B.className)) || String(A.subject).localeCompare(String(B.subject));
  }).map(key => {
    const last = lastByPair[key] || 0;
    const suggestedStart = last > 0 ? last + 1 : 1;
    return {
      key: key,
      className: meta[key].className,
      subject: meta[key].subject,
      count: counts[key],
      previousLast: last || null,
      suggestedStart: suggestedStart,
      suggestedEnd: suggestedStart + Math.max(counts[key] - 1, 0)
    };
  });

  const subjects = classes.map(x => x.subject).filter((s, i, arr) => arr.findIndex(x => v4127SubjectKey_(x) === v4127SubjectKey_(s)) === i);
  const curriculumSources = subjects.map(s => v4127StoredSourceConfig_(s));
  return {
    previousSheet: previousSheet,
    classes: classes,
    subjects: subjects,
    curriculumSources: curriculumSources,
    // Trường cũ để giao diện cũ không lỗi.
    curriculumSource: curriculumSources[0] || {configured:false, entries:0, kind:'', title:'', error:''}
  };
}

function previewBaoGiang(payload) {
  if (!payload || !payload.teacherKey) throw new Error('Thiếu giáo viên.');
  const teacherKey = payload.teacherKey;
  const records = buildPreview_(teacherKey, payload.starts || {}, payload.monday || '', payload.tkbSheet);
  const classes = {};
  records.forEach(r => {
    const key = r.pairKey || v4127PairKey_(r.className, r.subject);
    if (!classes[key]) classes[key] = {className:r.className, subject:r.subject, count:0, first:r.ppct, last:r.ppct};
    classes[key].count++;
    classes[key].last = r.ppct;
  });
  return {teacherKey:teacherKey, fullName:TEACHER_MAP[teacherKey], records:records, classes:classes};
}

function getTkbClassCheck(payload) {
  if (!payload || !payload.teacherKey) throw new Error('Thiếu giáo viên.');
  const teacherKey = payload.teacherKey;
  const schedule = readMathSchedule_(teacherKey, payload.tkbSheet);
  const counts = {}, meta = {};
  schedule.forEach(r => {
    const subject = v4127DisplaySubject_(r.subject);
    const key = v4127PairKey_(r.className, subject);
    counts[key] = (counts[key] || 0) + 1;
    meta[key] = {className:r.className, subject:subject};
  });

  const previousSheet = getPreviousWeekSheetName_(payload.reportSheet || '');
  const previousLast = readLastPpctByClass_(teacherKey, previousSheet);
  const pairSet = {};
  Object.keys(counts).forEach(k => pairSet[k] = true);
  Object.keys(previousLast).forEach(k => pairSet[k] = true);

  // Bổ sung metadata của cặp chỉ xuất hiện ở lịch sử.
  if (previousSheet) {
    try {
      const ss = SpreadsheetApp.openById(BAO_GIANG_SPREADSHEET_ID);
      const sh = ss.getSheetByName(previousSheet);
      const token = extractWeekToken_(previousSheet);
      const monday = token ? inferMondayFromWeekToken_(token) : '';
      readTeacherLessonRows_(sh, teacherKey, monday).forEach(r => {
        if (!meta[r.pairKey]) meta[r.pairKey] = {className:r.className, subject:r.subject};
      });
    } catch (e) {}
  }

  const classes = Object.keys(pairSet).sort().map(key => {
    const m = meta[key] || {className:key.split('||')[0], subject:''};
    const count = counts[key] || 0;
    const rawStart = payload.starts && payload.starts[key] != null ? payload.starts[key] : null;
    const start = rawStart != null ? Number(rawStart) : null;
    const end = (start && count > 0) ? start + count - 1 : null;
    return {
      key:key, className:m.className, subject:m.subject, count:count,
      ppctStart:start, ppctEnd:end,
      status:count === 0 ? 'warn' : 'ok',
      message:count === 0 ? ('Không có tiết ' + (m.subject ? m.subject + ' ' : '') + 'trong TKB tuần này') : 'Có dữ liệu'
    };
  });
  return {
    teacher:TEACHER_MAP[teacherKey] || teacherKey,
    previousSheet:previousSheet,
    totalClasses:classes.filter(x => x.count > 0).length,
    totalPeriods:classes.reduce((s,x) => s + x.count,0),
    warnings:classes.filter(x => x.status !== 'ok'),
    classes:classes
  };
}

function buildPpctRebalancePlan_(payload) {
  if (!payload || !payload.teacherKey || !TEACHER_MAP[payload.teacherKey]) throw new Error('Thiếu hoặc sai giáo viên.');
  const teacherKey = payload.teacherKey;
  const selectedSheet = getSelectedReportSheetName_(payload);
  const ordered = orderedWeekSheets_();
  const selected = ordered.find(x => x.name === selectedSheet);
  if (!selected) throw new Error('Không xác định được tuần Báo giảng đang chọn.');

  const ss = SpreadsheetApp.openById(BAO_GIANG_SPREADSHEET_ID);
  const targetWeeks = ordered.filter(x => x.time >= selected.time);
  const priorLast = readLastPpctBeforeSheet_(teacherKey, selectedSheet);
  const allRows = [], skippedSheets = [], curriculums = {};

  targetWeeks.forEach(w => {
    const sh = ss.getSheetByName(w.name);
    if (!sh) return;
    try {
      readTeacherLessonRows_(sh, teacherKey, w.monday).forEach(row => {
        allRows.push(Object.assign({}, row, {sheet:w.name, monday:w.monday, sheetTime:w.time}));
      });
    } catch (e) { skippedSheets.push(w.name); }
  });

  allRows.sort((a,b) => (a.sheetTime-b.sheetTime) || (a.row-b.row));
  const byPair = {};
  allRows.forEach(r => (byPair[r.pairKey] || (byPair[r.pairKey] = [])).push(r));

  const changes = [];
  let unknownLessonCount = 0;
  Object.keys(byPair).sort().forEach(pairKey => {
    const rows = byPair[pairKey];
    let counter = Number(priorLast[pairKey] || 0);
    if (!(counter > 0)) {
      const first = rows.find(x => x.oldPpct && x.oldPpct > 0);
      counter = first ? first.oldPpct - 1 : 0;
    }
    rows.forEach(row => {
      counter += 1;
      const newPpct = counter;
      if (row.oldPpct === newPpct) return;
      const sk = v4127SubjectKey_(row.subject);
      if (!curriculums[sk]) curriculums[sk] = loadPpctCurriculum_(row.subject);
      const candidateLesson = lessonFor_(row.grade, newPpct, curriculums[sk], row.subject);
      const lessonKnown = !!normalizeText_(candidateLesson);
      if (!lessonKnown) unknownLessonCount += 1;
      changes.push({
        sheet:row.sheet, row:row.row, ppctCol:row.ppctCol, lessonCol:row.lessonCol,
        className:row.className, subject:row.subject, pairKey:row.pairKey,
        dayNum:row.dayNum, dateShort:row.dateShort, session:row.session, period:row.period,
        oldPpct:row.oldPpct, newPpct:newPpct, oldLesson:row.oldLesson,
        newLesson:lessonKnown ? candidateLesson : row.oldLesson,
        lessonKnown:!!lessonKnown
      });
    });
  });

  const affectedClasses = Array.from(new Set(changes.map(x => x.className + (x.subject ? ' · ' + x.subject : '')))).sort();
  const affectedSheets = Array.from(new Set(changes.map(x => x.sheet)));
  return {
    ok:true,
    selectedSheet:selectedSheet,
    scannedSheets:targetWeeks.map(x => x.name),
    affectedSheets:affectedSheets,
    affectedClasses:affectedClasses,
    changes:changes,
    unknownLessonCount:unknownLessonCount,
    skippedSheets:skippedSheets,
    curriculumSources:Object.keys(curriculums).map(k => ({subject:curriculums[k].subject, configured:!!curriculums[k].configured, entries:curriculums[k].entries||0, title:curriculums[k].title||'', error:curriculums[k].error||''}))
  };
}

function readTkbDashboardForDate_(teacherKey, targetDate, tkbSheetName, starts) {
  const jsDay = targetDate.getDay();
  const dayNum = jsDay === 0 ? 8 : jsDay + 1;
  const sessions = {Sáng:[], Chiều:[]};
  if (dayNum < 2 || dayNum > 7) return {sessions:sessions, sheetName:''};

  const sheetName = tkbSheetForDate_(targetDate, tkbSheetName);
  if (!sheetName) return {sessions:sessions, sheetName:''};
  const schedule = readTeacherScheduleAll_(teacherKey, sheetName).slice().sort((a,b) =>
    (a.dayNum-b.dayNum) || ((a.session==='Sáng'?0:1)-(b.session==='Sáng'?0:1)) ||
    (a.period-b.period) || String(a.className).localeCompare(String(b.className)) || String(a.subject).localeCompare(String(b.subject))
  );
  const counters = {}, curriculums = {}, times = dashboardTimes_();
  schedule.forEach(rec => {
    const subject = v4127DisplaySubject_(rec.subject);
    const pairKey = v4127PairKey_(rec.className, subject);
    if (counters[pairKey] == null) {
      const raw = starts && starts[pairKey] != null ? starts[pairKey] : (starts && starts[rec.className] != null ? starts[rec.className] : 1);
      const custom = Number(raw);
      counters[pairKey] = isFinite(custom) && custom > 0 ? custom : 1;
    } else counters[pairKey] += 1;

    if (rec.dayNum !== dayNum || !sessions[rec.session]) return;
    const grade = v4146ClassGrade_(rec.className);
    const sk = v4127SubjectKey_(subject);
    if (!curriculums[sk]) curriculums[sk] = loadPpctCurriculum_(subject);
    sessions[rec.session].push({
      session:rec.session,
      period:rec.period,
      className:rec.className,
      ppct:counters[pairKey],
      subject:subject,
      lesson:lessonFor_(grade,counters[pairKey],curriculums[sk],subject) || 'Chưa có tên bài từ Nguồn PPCT',
      time:(times[rec.session] && times[rec.session][Number(rec.period)]) || ''
    });
  });
  return {sessions:sessions, sheetName:sheetName};
}

// ============================================================================
// V4.135 — TỰ NHẬN DIỆN TIẾT CHUYÊN ĐỀ TỪ TKB
// - TKB ghi "Toán CĐ - T.Tuấn" => tự hiểu môn gốc Toán, luồng Chuyên đề.
// - PPCT chính khóa: 1,2,3... ; Chuyên đề: CĐ1,CĐ2,CĐ3...
// - Hai luồng tiến độ độc lập theo Lớp + Môn + Loại tiết.
// - Dùng CHUNG một Nguồn PPCT của môn; Google Docs đọc cả
//   "Phân phối chương trình" và "Chuyên đề lựa chọn".
// ============================================================================

function v4135SubjectTrackInfo_(subject) {
  const raw = normalizeText_(subject);
  let base = raw;
  let track = 'regular';
  // Các cách TKB thường ghi: Toán CĐ, Toán CD, Toán Chuyên đề.
  if (/\s+(?:CĐ|CD|CHUYÊN\s*ĐỀ|CHUYEN\s*DE)\s*$/i.test(base)) {
    track = 'elective';
    base = normalizeText_(base.replace(/\s+(?:CĐ|CD|CHUYÊN\s*ĐỀ|CHUYEN\s*DE)\s*$/i, ''));
  }
  if (!base) base = raw || 'Chưa xác định môn';
  return {
    raw: raw,
    baseSubject: base,
    track: track,
    isElective: track === 'elective',
    displaySubject: track === 'elective' ? (base + ' CĐ') : base,
    prefix: track === 'elective' ? 'CĐ' : ''
  };
}

function v4135TrackFromPpct_(value) {
  const txt = normalizeText_(value).toUpperCase().replace(/\s+/g, '');
  return /^(?:CĐ|CD)\d+$/.test(txt) ? 'elective' : 'regular';
}

function v4135PpctNumber_(value) {
  if (typeof value === 'number') return (Number.isFinite(value) && value > 0) ? Math.floor(value) : null;
  const txt = normalizeText_(value).toUpperCase().replace(/\s+/g, '');
  const m = txt.match(/^(?:CĐ|CD)?(\d{1,3})$/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function v4135PpctLabel_(n, track) {
  n = Number(n);
  if (!Number.isFinite(n) || n < 1) return '';
  return track === 'elective' ? ('CĐ' + Math.floor(n)) : Math.floor(n);
}

function v4135CanonicalPpctLabel_(value, track) {
  const n = v4135PpctNumber_(value);
  return n ? String(v4135PpctLabel_(n, track || v4135TrackFromPpct_(value))) : normalizeText_(value);
}

// Nguồn PPCT dùng môn gốc: "Toán CĐ" vẫn dùng nguồn "Toán".
function v4127SubjectKey_(subject) {
  const info = v4135SubjectTrackInfo_(subject);
  return keyText_(info.baseSubject || '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'mon';
}

// Giữ nguyên key lịch sử của chính khóa; chuyên đề thêm hậu tố ||cd.
function v4127PairKey_(className, subject, track) {
  const info = v4135SubjectTrackInfo_(subject);
  const actualTrack = track || info.track;
  const clsKey = keyText_(className || '').replace(/[^a-z0-9]+/g, '');
  const baseKey = v4127SubjectKey_(info.baseSubject);
  return clsKey + '||' + baseKey + (actualTrack === 'elective' ? '||cd' : '');
}

function v4127DisplaySubject_(subject) {
  return v4135SubjectTrackInfo_(subject).displaySubject;
}

function getPpctSourceUrl_(subject) {
  const baseSubject = subject ? v4135SubjectTrackInfo_(subject).baseSubject : '';
  const map = v4127ReadSourceMap_();
  if (baseSubject) {
    const hit = v4127FindSourceEntry_(map, baseSubject);
    if (hit && hit.url) return hit.url;
    const primary = getTeacherDirectoryInfo_(FIXED_TEACHER_KEY).subject || '';
    if (primary && v4127SubjectKey_(primary) === v4127SubjectKey_(baseSubject)) {
      try {
        return normalizeText_(PropertiesService.getScriptProperties().getProperty(PPCT_SOURCE_PROPERTY) || PPCT_SOURCE_DEFAULT);
      } catch (e) { return normalizeText_(PPCT_SOURCE_DEFAULT); }
    }
    return '';
  }
  const primary = getTeacherDirectoryInfo_(FIXED_TEACHER_KEY).subject || '';
  const hit = primary ? v4127FindSourceEntry_(map, primary) : null;
  if (hit && hit.url) return hit.url;
  const firstKey = Object.keys(map).find(k => normalizeText_(map[k]));
  if (firstKey) return normalizeText_(map[firstKey]);
  try {
    return normalizeText_(PropertiesService.getScriptProperties().getProperty(PPCT_SOURCE_PROPERTY) || PPCT_SOURCE_DEFAULT);
  } catch (e) { return normalizeText_(PPCT_SOURCE_DEFAULT); }
}

function v4135GradeCounts_(map) {
  const out = {};
  [10,11,12].forEach(g => {
    const count = Object.keys((map && map[g]) || {}).length;
    if (count) out[g] = count;
  });
  return out;
}

function v4147GradeFromContext_(text) {
  const raw = normalizeText_(text);
  if (!raw) return null;
  const k = keyText_(raw);
  let m = k.match(/(?:^|\b)(?:lop|khoi)\s*[:\-]?\s*(10|11|12)(?:\b|$)/);
  if (m) return Number(m[1]);
  // Nhiều KHDH ghi "Môn Công nghệ 10" / "Kế hoạch dạy học môn ... 11"
  // mà không có từ Lớp/Khối.
  if (/(ke hoach day hoc|phan phoi chuong trinh|chuong trinh|mon\s+)/.test(k)) {
    m = k.match(/(?:^|\D)(10|11|12)(?:\D|$)/);
    if (m) return Number(m[1]);
  }
  return null;
}

function v4147SectionFromText_(text) {
  const k = keyText_(text);
  if (!k) return '';
  if (/(chuyen de lua chon|chuyen de hoc tap|noi dung chuyen de)/.test(k)) return 'elective';
  if (/(phan phoi chuong trinh|ke hoach day hoc|noi dung day hoc|chuong trinh mon|phan phoi tiet)/.test(k)) return 'regular';
  return '';
}

function v4147TableMatrix_(table) {
  const matrix = [];
  for (let r = 0; r < table.getNumRows(); r++) {
    const tr = table.getRow(r), row = [];
    for (let c = 0; c < tr.getNumCells(); c++) row.push(tr.getCell(c).getText());
    matrix.push(row);
  }
  return matrix;
}

function v4147InferGradeFromMatrix_(matrix) {
  const rows = (matrix || []).slice(0, 8);
  for (let r = 0; r < rows.length; r++) {
    const g = v4147GradeFromContext_((rows[r] || []).join(' '));
    if (g) return g;
  }
  return null;
}

// Fallback cho các mẫu KHDH không ghi đúng "Phân phối chương trình" nhưng vẫn
// có bảng TT/STT + Bài học/Nội dung. Chỉ dùng khi bộ đọc chuẩn chưa lấy được gì.
function v4147AddFlexibleTable_(matrix, sourceName, target, options) {
  options = options || {};
  const grade = Number(options.grade) || v4147InferGradeFromMatrix_(matrix) || parseGrade_(sourceName);
  return addCurriculumMatrix_(matrix, sourceName, target, {
    allowTt:true,
    grade:grade || null
  });
}

function v4147ReadBodyCurriculum_(body, docName, regularTarget, electiveTarget) {
  let currentGrade = null;
  let section = '';
  let regularEntries = 0, electiveEntries = 0;
  let regularTables = 0, electiveTables = 0;

  for (let i = 0; i < body.getNumChildren(); i++) {
    const child = body.getChild(i);
    const type = child.getType();
    if (type === DocumentApp.ElementType.PARAGRAPH || type === DocumentApp.ElementType.LIST_ITEM) {
      let text = '';
      try { text = normalizeText_(child.getText()); } catch (e) { text = ''; }
      const g = v4147GradeFromContext_(text);
      if (g) {
        currentGrade = g;
        // Không buộc tài liệu phải có một dòng riêng "Phân phối chương trình".
        // Nếu đang ở chuyên đề thì khối mới quay về trạng thái chưa xác định.
        if (section === 'elective') section = '';
      }
      const sec = v4147SectionFromText_(text);
      if (sec) section = sec;
      continue;
    }
    if (type !== DocumentApp.ElementType.TABLE) continue;

    const matrix = v4147TableMatrix_(child.asTable());
    const tableGrade = currentGrade || v4147InferGradeFromMatrix_(matrix);
    const tableText = matrix.slice(0, 5).map(r => (r || []).join(' ')).join(' ');
    const tableSection = v4147SectionFromText_(tableText) || section;

    // Chuyên đề chỉ ghi vào map chuyên đề khi có tín hiệu rõ ràng.
    if (tableSection === 'elective') {
      const added = v4147AddFlexibleTable_(matrix, docName + (tableGrade ? (' Lớp ' + tableGrade) : ''), electiveTarget, {grade:tableGrade});
      if (added > 0) { electiveEntries += added; electiveTables++; }
      continue;
    }

    // Chính khóa: cho phép bảng hợp lệ ngay cả khi tài liệu không có đúng cụm
    // "Phân phối chương trình". addCurriculumMatrix_ vẫn yêu cầu header PPCT/TT
    // + Bài học/Nội dung nên không hút nhầm các bảng hành chính khác.
    const added = v4147AddFlexibleTable_(matrix, docName + (tableGrade ? (' Lớp ' + tableGrade) : ''), regularTarget, {grade:tableGrade});
    if (added > 0) { regularEntries += added; regularTables++; }
  }

  return {regularEntries, electiveEntries, regularTables, electiveTables};
}

function v4147DocumentBodies_(doc) {
  const out = [];
  const seen = {};
  function addBody(body) {
    if (!body) return;
    let key = '';
    try { key = String(body.getParent && body.getParent().getId ? body.getParent().getId() : ''); } catch (e) {}
    key = key || ('body_' + out.length);
    if (!seen[key]) { seen[key] = true; out.push(body); }
  }
  function walkTab(tab) {
    if (!tab) return;
    try {
      if (tab.asDocumentTab) addBody(tab.asDocumentTab().getBody());
    } catch (e) {}
    try {
      if (tab.getChildTabs) (tab.getChildTabs() || []).forEach(walkTab);
    } catch (e) {}
  }
  try {
    if (doc.getTabs) (doc.getTabs() || []).forEach(walkTab);
  } catch (e) {}
  if (!out.length) {
    try { addBody(doc.getBody()); } catch (e) {}
  }
  return out;
}

function v4135ReadGoogleDocCurriculum_(doc, regularTarget, electiveTarget) {
  let regularEntries = 0, electiveEntries = 0;
  let regularTables = 0, electiveTables = 0;
  const bodies = v4147DocumentBodies_(doc);
  bodies.forEach(body => {
    const part = v4147ReadBodyCurriculum_(body, doc.getName(), regularTarget, electiveTarget);
    regularEntries += part.regularEntries || 0;
    electiveEntries += part.electiveEntries || 0;
    regularTables += part.regularTables || 0;
    electiveTables += part.electiveTables || 0;
  });
  return {
    regularEntries:regularEntries,
    electiveEntries:electiveEntries,
    regularTables:regularTables,
    electiveTables:electiveTables,
    gradeCounts:v4135GradeCounts_(regularTarget),
    electiveGradeCounts:v4135GradeCounts_(electiveTarget)
  };
}

// Ghi đè bộ đọc nguồn để lưu riêng map chính khóa và map chuyên đề.
function readPpctSourceById_(id) {
  const info = v4133InspectPpctFile_(id);
  const map = {}, electiveMap = {};
  let regularEntries = 0, electiveEntries = 0;
  let kind = info.kind || '', title = info.name || '';

  if (info.office) {
    throw new Error('Đây là file Microsoft Word' + (title ? ' “' + title + '”' : '') + ', chưa phải Google Docs gốc. Hãy mở file → Tệp → Lưu dưới dạng Google Tài liệu, sau đó dán link Google Docs mới vào Nguồn PPCT.');
  }
  if (!info.native) {
    throw new Error('File PPCT này không phải Google Sheets hoặc Google Docs gốc' + (info.mime ? ' (' + info.mime + ')' : '') + '. Hãy chuyển file sang Google Sheets/Google Docs rồi thử lại.');
  }

  if (info.kind === 'Google Sheets') {
    try {
      const ss = SpreadsheetApp.openById(id);
      title = ss.getName();
      ss.getSheets().forEach(sh => {
        const lr = Math.min(Math.max(sh.getLastRow(), 1), 3000);
        const lc = Math.min(Math.max(sh.getLastColumn(), 1), 40);
        const vals = sh.getRange(1, 1, lr, lc).getDisplayValues();
        const added = v4135AddSheetCurriculum_(vals, sh.getName(), map, electiveMap);
        regularEntries += added.regular || 0;
        electiveEntries += added.elective || 0;
      });
    } catch (e) { throw new Error(friendlyPpctSourceError_(e, null)); }
  } else if (info.kind === 'Google Docs') {
    try {
      const doc = DocumentApp.openById(id);
      title = doc.getName();
      const parsed = v4135ReadGoogleDocCurriculum_(doc, map, electiveMap);
      regularEntries += parsed.regularEntries || 0;
      electiveEntries += parsed.electiveEntries || 0;
    } catch (e) { throw new Error(friendlyPpctSourceError_(null, e)); }
  }

  return {
    map:map,
    electiveMap:electiveMap,
    regularEntries:regularEntries,
    electiveEntries:electiveEntries,
    entries:regularEntries + electiveEntries,
    kind:kind,
    title:title,
    mime:info.mime || '',
    gradeCounts:v4135GradeCounts_(map),
    electiveGradeCounts:v4135GradeCounts_(electiveMap),
    format:(info.kind === 'Google Docs' && (regularEntries + electiveEntries) > 0) ? 'Kế hoạch dạy học · TT → Bài học · có Chuyên đề' : ''
  };
}

function loadPpctCurriculum_(subject) {
  const baseSubject = v4135SubjectTrackInfo_(subject).baseSubject;
  const url = getPpctSourceUrl_(baseSubject);
  const id = extractDriveFileId_(url);
  if (!id) {
    return {map:{}, electiveMap:{}, configured:false, entries:0, regularEntries:0, electiveEntries:0, kind:'', title:'Chưa khai báo Nguồn PPCT cho ' + baseSubject, error:'', subject:baseSubject, gradeCounts:{}, electiveGradeCounts:{}, format:''};
  }
  const cache = CacheService.getScriptCache();
  const key = 'ppct_v4147_' + v4127SubjectKey_(baseSubject) + '_' + id;
  const cached = cache.get(key);
  if (cached) { try { return JSON.parse(cached); } catch (e) {} }
  try {
    const data = readPpctSourceById_(id);
    const res = {
      map:data.map || {}, electiveMap:data.electiveMap || {}, configured:true,
      entries:data.entries || 0, regularEntries:data.regularEntries || 0, electiveEntries:data.electiveEntries || 0,
      kind:data.kind || '', title:data.title || '', error:'', subject:baseSubject,
      gradeCounts:data.gradeCounts || v4135GradeCounts_(data.map || {}),
      electiveGradeCounts:data.electiveGradeCounts || v4135GradeCounts_(data.electiveMap || {}),
      format:data.format || ''
    };
    cache.put(key, JSON.stringify(res), 600);
    return res;
  } catch (e) {
    return {map:{}, electiveMap:{}, configured:true, entries:0, regularEntries:0, electiveEntries:0, kind:'', title:'', error:e.message || String(e), subject:baseSubject, gradeCounts:{}, electiveGradeCounts:{}, format:''};
  }
}

function externalLessonFor_(curriculum, grade, ppct, track) {
  const actualTrack = track || v4135TrackFromPpct_(ppct);
  const n = v4135PpctNumber_(ppct);
  if (!n) return '';
  const root = actualTrack === 'elective' ? (curriculum && curriculum.electiveMap) : (curriculum && curriculum.map);
  const byGrade = root && root[String(grade)];
  return byGrade && byGrade[String(n)] ? normalizeText_(byGrade[String(n)]) : '';
}

function lessonFor_(grade, ppct, curriculum, subject, track) {
  return externalLessonFor_(curriculum, grade, ppct, track) || '';
}

function getPpctSourceConfig(subject) {
  const baseSubject = v4135SubjectTrackInfo_(normalizeText_(subject) || getTeacherDirectoryInfo_(FIXED_TEACHER_KEY).subject || 'Toán').baseSubject;
  const url = getPpctSourceUrl_(baseSubject);
  const data = loadPpctCurriculum_(baseSubject);
  return {
    subject:baseSubject, url:url, configured:!!url,
    entries:data.entries || 0, regularEntries:data.regularEntries || 0, electiveEntries:data.electiveEntries || 0,
    kind:data.kind || '', title:data.title || '', error:data.error || '',
    gradeCounts:data.gradeCounts || {}, electiveGradeCounts:data.electiveGradeCounts || {}, format:data.format || ''
  };
}

function getPpctSourceConfigs(teacherKey, tkbSheetName) {
  teacherKey = teacherKey || FIXED_TEACHER_KEY;
  let subjects = [];
  try {
    subjects = readMathSchedule_(teacherKey, tkbSheetName).map(r => v4135SubjectTrackInfo_(r.subject).baseSubject).filter(Boolean);
  } catch (e) {}
  const directory = getTeacherDirectoryInfo_(teacherKey);
  if (!subjects.length && directory.subject) subjects.push(directory.subject);
  subjects = subjects.filter((s, i, arr) => arr.findIndex(x => v4127SubjectKey_(x) === v4127SubjectKey_(s)) === i);
  if (!subjects.length) subjects = ['Toán'];
  return {teacher:TEACHER_MAP[teacherKey] || teacherKey, subjects:subjects, sources:subjects.map(s => getPpctSourceConfig(s))};
}

function savePpctSubjectSourceConfig(subject, url) {
  const baseSubject = v4135SubjectTrackInfo_(subject).baseSubject;
  if (!baseSubject) throw new Error('Chưa xác định môn cần lưu nguồn PPCT.');
  const clean = normalizeText_(url);
  const map = v4127ReadSourceMap_();
  const old = v4127FindSourceEntry_(map, baseSubject);
  if (old) delete map[old.key];
  if (!clean) { v4127WriteSourceMap_(map); return getPpctSourceConfig(baseSubject); }

  const id = extractDriveFileId_(clean);
  if (!id) throw new Error('Link nguồn PPCT không hợp lệ. Hãy dùng link Google Sheets hoặc Google Docs.');
  const test = readPpctSourceById_(id);
  if (!test.entries) throw new Error('Đã mở được file nhưng chưa nhận diện được dữ liệu PPCT của môn ' + baseSubject + '. Hỗ trợ mẫu Kế hoạch dạy học có TT + Bài học dưới Lớp 10/11/12.');
  map[baseSubject] = clean;
  v4127WriteSourceMap_(map);
  CacheService.getScriptCache().remove('ppct_v4135_' + v4127SubjectKey_(baseSubject) + '_' + id);
  return getPpctSourceConfig(baseSubject);
}

function buildPreview_(teacherKey, starts, mondayYmd, tkbSheetName) {
  const schedule = readMathSchedule_(teacherKey, tkbSheetName);
  const counters = {}, curriculums = {}, out = [];

  schedule.forEach(rec => {
    const info = v4135SubjectTrackInfo_(rec.subject);
    const subject = info.displaySubject;
    const baseSubject = info.baseSubject;
    const track = info.track;
    const pairKey = v4127PairKey_(rec.className, subject, track);
    if (counters[pairKey] == null) {
      let raw = starts && starts[pairKey] != null ? starts[pairKey] : null;
      if (raw == null && track === 'regular' && starts && starts[rec.className] != null) raw = starts[rec.className];
      const custom = Number(raw);
      counters[pairKey] = isFinite(custom) && custom > 0 ? custom : 1;
    } else counters[pairKey] += 1;

    const grade = v4146ClassGrade_(rec.className);
    const sk = v4127SubjectKey_(baseSubject);
    if (!curriculums[sk]) curriculums[sk] = loadPpctCurriculum_(baseSubject);
    const curriculum = curriculums[sk];
    const ppctNumber = counters[pairKey];
    const ppct = v4135PpctLabel_(ppctNumber, track);
    const ext = externalLessonFor_(curriculum, grade, ppctNumber, track);
    const hasSource = !!(curriculum && curriculum.configured);
    const ppctText = track === 'elective' ? ('CĐ' + ppctNumber) : String(ppctNumber);

    out.push(Object.assign({}, rec, {
      subject:subject, baseSubject:baseSubject, track:track, isElective:track === 'elective', pairKey:pairKey,
      dateLabel:dateLabelForDay_(mondayYmd, rec.dayNum), ppctNumber:ppctNumber, ppct:ppct,
      lesson:ext || '', lessonMissing:!ext,
      lessonMissingReason: ext ? '' : (
        curriculum && curriculum.error ? ('Nguồn PPCT ' + baseSubject + ' đang lỗi: ' + curriculum.error) :
        (hasSource ? ('Nguồn PPCT ' + baseSubject + ' chưa có ' + ppctText + ' cho khối ' + (grade || '?')) : ('Chưa khai báo Nguồn PPCT cho ' + baseSubject))
      ),
      lessonSource:ext ? ('PPCT chuẩn · ' + baseSubject + (track === 'elective' ? ' · Chuyên đề' : '')) : (curriculum && curriculum.error ? ('Lỗi Nguồn PPCT · ' + baseSubject) : (hasSource ? ('Thiếu ' + ppctText + ' trong nguồn · ' + baseSubject) : ('Chưa có nguồn PPCT · ' + baseSubject)))
    }));
  });
  return out;
}

function readTeacherLessonRows_(sheet, teacherKey, mondayYmd) {
  const fullName = TEACHER_MAP[teacherKey];
  if (!fullName) throw new Error('Giáo viên không hợp lệ.');
  const blockStartZero = findTeacherBlockStart_(sheet, fullName);
  const startCol1 = blockStartZero + 1;
  const lastRow = Math.max(sheet.getLastRow(), 1);
  const vals = sheet.getRange(1, startCol1, lastRow, 7).getDisplayValues();
  const rows = [];
  let currentDay = null, currentSession = '';
  const primarySubject = getTeacherDirectoryInfo_(teacherKey).subject || '';

  for (let r = 0; r < vals.length; r++) {
    const row = vals[r];
    const rowText = row.map(normalizeText_).join(' | ').toUpperCase();
    if (rowText.indexOf('BUỔI SÁNG') >= 0) { currentSession = 'Sáng'; currentDay = null; }
    if (rowText.indexOf('BUỔI CHIỀU') >= 0) { currentSession = 'Chiều'; currentDay = null; }
    const dayCell = normalizeText_(row[0]);
    const dm = dayCell.match(/^([2-7])(?:\s|\(|$)/);
    if (dm) currentDay = Number(dm[1]);

    const period = Number(String(row[1]).replace(',', '.'));
    const rawSubject = normalizeText_(row[2]) || primarySubject;
    const rawPpct = normalizeText_(row[4]);
    const subjectInfo = v4135SubjectTrackInfo_(rawSubject);
    const ppctTrack = v4135TrackFromPpct_(rawPpct);
    const track = (subjectInfo.track === 'elective' || ppctTrack === 'elective') ? 'elective' : 'regular';
    const baseSubject = subjectInfo.baseSubject;
    const subject = track === 'elective' ? (baseSubject + ' CĐ') : baseSubject;
    const cls = normalizeText_(row[3]);
    if (!/^(10|11|12)[A-Za-z0-9]+$/i.test(cls)) continue;
    if (!Number.isFinite(period) || period < 1 || period > 5) continue;

    const oldPpct = v4135PpctNumber_(rawPpct);
    let dateShort = '';
    if (mondayYmd && currentDay) { try { dateShort = fmtDM_(addDays_(parseYmd_(mondayYmd), currentDay - 2)); } catch (e) {} }
    rows.push({
      row:r + 1, blockStartZero:blockStartZero, startCol1:startCol1,
      ppctCol:startCol1 + 4, lessonCol:startCol1 + 5,
      className:cls, subject:subject, baseSubject:baseSubject, track:track, isElective:track === 'elective',
      pairKey:v4127PairKey_(cls, subject, track), grade:Number(String(cls).slice(0, 2)),
      oldPpct:oldPpct, oldPpctLabel:rawPpct, oldLesson:normalizeText_(row[5]),
      dayNum:currentDay, dateShort:dateShort, session:currentSession, period:period
    });
  }
  return rows;
}

function getClassPpctSuggestions(teacherKey, reportSheetName, tkbSheetName) {
  if (!TEACHER_MAP[teacherKey]) throw new Error('Giáo viên không hợp lệ.');
  const schedule = readMathSchedule_(teacherKey, tkbSheetName);
  const counts = {}, meta = {};
  schedule.forEach(r => {
    const info = v4135SubjectTrackInfo_(r.subject);
    const subject = info.displaySubject;
    const key = v4127PairKey_(r.className, subject, info.track);
    counts[key] = (counts[key] || 0) + 1;
    meta[key] = {className:r.className, subject:subject, baseSubject:info.baseSubject, track:info.track, key:key};
  });
  const previousSheet = getPreviousWeekSheetName_(reportSheetName);
  const lastByPair = readLastPpctBeforeSheet_(teacherKey, reportSheetName);
  const classes = Object.keys(counts).sort((a,b) => {
    const A=meta[a], B=meta[b];
    return String(A.className).localeCompare(String(B.className)) || String(A.subject).localeCompare(String(B.subject));
  }).map(key => {
    const last = lastByPair[key] || 0;
    const suggestedStart = last > 0 ? last + 1 : 1;
    return {
      key:key, className:meta[key].className, subject:meta[key].subject, baseSubject:meta[key].baseSubject,
      track:meta[key].track, isElective:meta[key].track === 'elective', ppctPrefix:meta[key].track === 'elective' ? 'CĐ' : '',
      count:counts[key], previousLast:last || null, suggestedStart:suggestedStart,
      suggestedEnd:suggestedStart + Math.max(counts[key] - 1, 0)
    };
  });
  const subjects = classes.map(x => x.baseSubject).filter((s,i,arr) => arr.findIndex(x => v4127SubjectKey_(x) === v4127SubjectKey_(s)) === i);
  const curriculumSources = subjects.map(s => v4127StoredSourceConfig_(s));
  return {
    previousSheet:previousSheet, classes:classes, subjects:subjects, curriculumSources:curriculumSources,
    curriculumSource:curriculumSources[0] || {configured:false, entries:0, kind:'', title:'', error:''}
  };
}

function buildPpctRebalancePlan_(payload) {
  if (!payload || !payload.teacherKey || !TEACHER_MAP[payload.teacherKey]) throw new Error('Thiếu hoặc sai giáo viên.');
  const teacherKey = payload.teacherKey;
  const selectedSheet = getSelectedReportSheetName_(payload);
  const ordered = orderedWeekSheets_();
  const selected = ordered.find(x => x.name === selectedSheet);
  if (!selected) throw new Error('Không xác định được tuần Báo giảng đang chọn.');

  const ss = SpreadsheetApp.openById(BAO_GIANG_SPREADSHEET_ID);
  const targetWeeks = ordered.filter(x => x.time >= selected.time);
  const priorLast = readLastPpctBeforeSheet_(teacherKey, selectedSheet);
  const allRows = [], skippedSheets = [], curriculums = {};
  targetWeeks.forEach(w => {
    const sh = ss.getSheetByName(w.name); if (!sh) return;
    try { readTeacherLessonRows_(sh, teacherKey, w.monday).forEach(row => allRows.push(Object.assign({}, row, {sheet:w.name, monday:w.monday, sheetTime:w.time}))); }
    catch (e) { skippedSheets.push(w.name); }
  });
  allRows.sort((a,b) => (a.sheetTime-b.sheetTime) || (a.row-b.row));
  const byPair = {};
  allRows.forEach(r => (byPair[r.pairKey] || (byPair[r.pairKey] = [])).push(r));

  const changes = []; let unknownLessonCount = 0;
  Object.keys(byPair).sort().forEach(pairKey => {
    const rows = byPair[pairKey];
    let counter = Number(priorLast[pairKey] || 0);
    if (!(counter > 0)) {
      const first = rows.find(x => x.oldPpct && x.oldPpct > 0);
      counter = first ? first.oldPpct - 1 : 0;
    }
    rows.forEach(row => {
      counter += 1;
      const newNum = counter;
      const newPpct = v4135PpctLabel_(newNum, row.track);
      const sameNum = row.oldPpct === newNum;
      const sameLabel = row.track !== 'elective' || v4135CanonicalPpctLabel_(row.oldPpctLabel, 'elective') === String(newPpct);
      if (sameNum && sameLabel) return;

      const sk = v4127SubjectKey_(row.baseSubject || row.subject);
      if (!curriculums[sk]) curriculums[sk] = loadPpctCurriculum_(row.baseSubject || row.subject);
      const candidateLesson = lessonFor_(row.grade, newNum, curriculums[sk], row.baseSubject || row.subject, row.track);
      const lessonKnown = !!normalizeText_(candidateLesson);
      if (!lessonKnown) unknownLessonCount += 1;
      changes.push({
        sheet:row.sheet, row:row.row, ppctCol:row.ppctCol, lessonCol:row.lessonCol,
        className:row.className, subject:row.subject, baseSubject:row.baseSubject, track:row.track, pairKey:row.pairKey,
        dayNum:row.dayNum, dateShort:row.dateShort, session:row.session, period:row.period,
        oldPpct:row.oldPpctLabel || row.oldPpct, newPpct:newPpct, oldLesson:row.oldLesson,
        newLesson:lessonKnown ? candidateLesson : row.oldLesson, lessonKnown:lessonKnown
      });
    });
  });
  const affectedClasses = Array.from(new Set(changes.map(x => x.className + (x.subject ? ' · ' + x.subject : '')))).sort();
  const affectedSheets = Array.from(new Set(changes.map(x => x.sheet)));
  return {
    ok:true, selectedSheet:selectedSheet, scannedSheets:targetWeeks.map(x => x.name), affectedSheets:affectedSheets,
    affectedClasses:affectedClasses, changes:changes, unknownLessonCount:unknownLessonCount, skippedSheets:skippedSheets,
    curriculumSources:Object.keys(curriculums).map(k => ({subject:curriculums[k].subject, configured:!!curriculums[k].configured, entries:curriculums[k].entries||0, regularEntries:curriculums[k].regularEntries||0, electiveEntries:curriculums[k].electiveEntries||0, title:curriculums[k].title||'', error:curriculums[k].error||''}))
  };
}

function readTkbDashboardForDate_(teacherKey, targetDate, tkbSheetName, starts) {
  const jsDay = targetDate.getDay();
  const dayNum = jsDay === 0 ? 8 : jsDay + 1;
  const sessions = {Sáng:[], Chiều:[]};
  if (dayNum < 2 || dayNum > 7) return {sessions:sessions, sheetName:''};
  const sheetName = tkbSheetForDate_(targetDate, tkbSheetName);
  if (!sheetName) return {sessions:sessions, sheetName:''};
  const schedule = readTeacherScheduleAll_(teacherKey, sheetName).slice().sort((a,b) =>
    (a.dayNum-b.dayNum) || ((a.session==='Sáng'?0:1)-(b.session==='Sáng'?0:1)) ||
    (a.period-b.period) || String(a.className).localeCompare(String(b.className)) || String(a.subject).localeCompare(String(b.subject))
  );
  const counters = {}, curriculums = {}, times = dashboardTimes_();
  schedule.forEach(rec => {
    const info = v4135SubjectTrackInfo_(rec.subject);
    const subject = info.displaySubject, baseSubject = info.baseSubject, track = info.track;
    const pairKey = v4127PairKey_(rec.className, subject, track);
    if (counters[pairKey] == null) {
      let raw = starts && starts[pairKey] != null ? starts[pairKey] : null;
      if (raw == null && track === 'regular' && starts && starts[rec.className] != null) raw = starts[rec.className];
      const custom = Number(raw);
      counters[pairKey] = isFinite(custom) && custom > 0 ? custom : 1;
    } else counters[pairKey] += 1;

    if (rec.dayNum !== dayNum || !sessions[rec.session]) return;
    const grade = v4146ClassGrade_(rec.className);
    const sk = v4127SubjectKey_(baseSubject);
    if (!curriculums[sk]) curriculums[sk] = loadPpctCurriculum_(baseSubject);
    const ppctNum = counters[pairKey];
    sessions[rec.session].push({
      session:rec.session, period:rec.period, className:rec.className,
      ppct:v4135PpctLabel_(ppctNum, track), ppctNumber:ppctNum,
      subject:subject, baseSubject:baseSubject, track:track, isElective:track === 'elective',
      lesson:lessonFor_(grade, ppctNum, curriculums[sk], baseSubject, track) || 'Chưa có tên bài từ Nguồn PPCT',
      isExtra:!!rec.isExtra, extraId:rec.extraId||'', note:rec.extraNote||'',
      time:(times[rec.session] && times[rec.session][Number(rec.period)]) || ''
    });
  });
  return {sessions:sessions, sheetName:sheetName};
}

// ============================================================================
// V4.136 — DẠY BÙ / ĐỔI TKB THEO TUẦN
// Nguyên tắc: TKB gốc -> điều chỉnh dạy bù của tuần -> Báo giảng thực tế.
// Ví dụ: Chiều Thứ 3 <- Sáng Thứ 5. Các tiết nguồn bị loại khỏi ngày gốc,
// chuyển sang thời điểm thực dạy rồi PPCT/Chuyên đề được đánh lại theo thứ tự mới.
// ============================================================================
const V4136_MAKEUP_PREFIX = 'V4136_MAKEUP_';

function v4136MakeupStorageKey_(teacherKey, tkbSheetName) {
  const token = extractWeekToken_(tkbSheetName) || normalizeText_(tkbSheetName) || 'week';
  const t = v4127SubjectKey_(teacherKey || FIXED_TEACHER_KEY);
  const w = keyText_(token).replace(/[^a-z0-9]+/g, '_');
  return V4136_MAKEUP_PREFIX + t + '_' + w;
}

function v4136MaxPeriods_(session) {
  // Khung Lịch báo giảng có đủ 5 dòng tiết cho cả Sáng và Chiều.
  // TKB chiều thường có thể chỉ xếp 3 tiết, nhưng dạy bù được phép dùng đến Tiết 5.
  return 5;
}

function v4136NormalizeRule_(raw, idx) {
  raw = raw || {};
  const sourceDay = Number(raw.sourceDay);
  const targetDay = Number(raw.targetDay);
  const sourceSession = normalizeText_(raw.sourceSession) === 'Chiều' ? 'Chiều' : 'Sáng';
  const targetSession = normalizeText_(raw.targetSession) === 'Chiều' ? 'Chiều' : 'Sáng';
  let targetStartPeriod = Number(raw.targetStartPeriod || 1);
  if (!Number.isFinite(sourceDay) || sourceDay < 2 || sourceDay > 7) throw new Error('Ngày nguồn dạy bù không hợp lệ.');
  if (!Number.isFinite(targetDay) || targetDay < 2 || targetDay > 7) throw new Error('Ngày thực dạy bù không hợp lệ.');
  if (sourceDay === targetDay && sourceSession === targetSession) throw new Error('Buổi nguồn và buổi thực dạy không được trùng nhau.');
  const max = v4136MaxPeriods_(targetSession);
  if (!Number.isFinite(targetStartPeriod) || targetStartPeriod < 1) targetStartPeriod = 1;
  if (targetStartPeriod > max) throw new Error('Buổi ' + targetSession.toLowerCase() + ' chỉ hỗ trợ đến tiết ' + max + '.');
  return {
    id: normalizeText_(raw.id) || ('rule_' + (idx + 1)),
    sourceDay: sourceDay,
    sourceSession: sourceSession,
    targetDay: targetDay,
    targetSession: targetSession,
    targetStartPeriod: Math.floor(targetStartPeriod)
  };
}

function v4136LoadMakeupRules_(teacherKey, tkbSheetName) {
  try {
    const raw = PropertiesService.getScriptProperties().getProperty(v4136MakeupStorageKey_(teacherKey, tkbSheetName)) || '';
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((r, i) => v4136NormalizeRule_(r, i));
  } catch (e) {
    return [];
  }
}

function v4136RuleText_(r) {
  return r.targetSession + ' Thứ ' + r.targetDay + ' ← ' + r.sourceSession + ' Thứ ' + r.sourceDay + ' · bắt đầu tiết ' + r.targetStartPeriod;
}

function v4136ApplyMakeupRules_(schedule, rules, strict) {
  const original = (schedule || []).map(r => Object.assign({}, r));
  let out = original.map(r => Object.assign({}, r, {isMakeup:false}));
  const normalized = (rules || []).map((r, i) => v4136NormalizeRule_(r, i));
  const sourceSeen = {};

  normalized.forEach((rule, idx) => {
    const srcKey = rule.sourceDay + '|' + rule.sourceSession;
    if (sourceSeen[srcKey]) throw new Error('Một buổi TKB nguồn chỉ được dùng cho một lịch dạy bù.');
    sourceSeen[srcKey] = true;

    const sourceRows = original.filter(r => Number(r.dayNum) === rule.sourceDay && normalizeText_(r.session) === rule.sourceSession)
      .sort((a,b) => (Number(a.period)-Number(b.period)) || String(a.className).localeCompare(String(b.className)) || String(a.subject).localeCompare(String(b.subject)));
    if (!sourceRows.length) {
      if (strict) throw new Error('Không có tiết của giáo viên ở ' + rule.sourceSession + ' Thứ ' + rule.sourceDay + ' để chuyển dạy bù.');
      return;
    }

    // Chỉ xóa các tiết gốc tại buổi nguồn; không xóa tiết đã được chuyển từ rule khác vào đây.
    out = out.filter(r => !(Number(r.dayNum) === rule.sourceDay && normalizeText_(r.session) === rule.sourceSession && !r.isMakeup));

    const maxPeriod = v4136MaxPeriods_(rule.targetSession);
    const used = {};
    out.forEach(r => {
      if (Number(r.dayNum) === rule.targetDay && normalizeText_(r.session) === rule.targetSession) used[Number(r.period)] = true;
    });

    let p = rule.targetStartPeriod;
    sourceRows.forEach(src => {
      while (p <= maxPeriod && used[p]) p++;
      if (p > maxPeriod) {
        throw new Error('Không đủ tiết trống ở ' + rule.targetSession + ' Thứ ' + rule.targetDay + ' để xếp dạy bù. Hãy đổi tiết bắt đầu hoặc buổi đích.');
      }
      out.push(Object.assign({}, src, {
        originalDayNum: src.dayNum,
        originalSession: src.session,
        originalPeriod: src.period,
        dayNum: rule.targetDay,
        dayLabel: 'Thứ ' + rule.targetDay,
        session: rule.targetSession,
        period: p,
        isMakeup: true,
        makeupRuleId: rule.id,
        makeupSource: rule.sourceSession + ' Thứ ' + rule.sourceDay,
        makeupTarget: rule.targetSession + ' Thứ ' + rule.targetDay
      }));
      used[p] = true;
      p++;
    });
  });

  out.sort((a,b) =>
    (Number(a.dayNum)-Number(b.dayNum)) ||
    ((a.session === 'Sáng' ? 0 : 1) - (b.session === 'Sáng' ? 0 : 1)) ||
    (Number(a.period)-Number(b.period)) ||
    String(a.className).localeCompare(String(b.className)) ||
    String(a.subject).localeCompare(String(b.subject))
  );
  return out;
}

function v4136ReadEffectiveSchedule_(teacherKey, tkbSheetName) {
  const base = readMathSchedule_(teacherKey, tkbSheetName);
  const rules = v4136LoadMakeupRules_(teacherKey, tkbSheetName);
  const adjusted = v4136ApplyMakeupRules_(base, rules, true);
  const extras = v4150LoadExtraLessons_(teacherKey, tkbSheetName);
  return v4150ApplyExtraLessons_(adjusted, extras, true);
}

function getMakeupScheduleConfig(payload) {
  payload = payload || {};
  const teacherKey = payload.teacherKey || FIXED_TEACHER_KEY;
  const tkbSheetName = getSelectedTkbSheetName_(payload.tkbSheet);
  const token = extractWeekToken_(tkbSheetName);
  const rules = v4136LoadMakeupRules_(teacherKey, tkbSheetName);
  const base = readMathSchedule_(teacherKey, tkbSheetName);
  let effective = base;
  let error = '';
  try { effective = v4136ApplyMakeupRules_(base, rules, true); } catch (e) { error = e.message || String(e); }
  const enriched = rules.map(r => ({
    id:r.id, sourceDay:r.sourceDay, sourceSession:r.sourceSession, targetDay:r.targetDay, targetSession:r.targetSession,
    targetStartPeriod:r.targetStartPeriod, label:v4136RuleText_(r),
    sourceCount:base.filter(x => Number(x.dayNum)===r.sourceDay && x.session===r.sourceSession).length
  }));
  const moved = effective.filter(x => x.isMakeup).map(x => ({
    dayNum:x.dayNum, session:x.session, period:x.period, className:x.className, subject:x.subject,
    sourceDay:x.originalDayNum, sourceSession:x.originalSession, sourcePeriod:x.originalPeriod
  }));
  return {
    teacher:TEACHER_MAP[teacherKey] || teacherKey,
    tkbSheet:tkbSheetName,
    weekToken:token,
    weekLabel:token ? compactWeekLabel_(token) : tkbSheetName,
    rules:enriched,
    baseCount:base.length,
    effectiveCount:effective.length,
    moved:moved,
    error:error
  };
}

function saveMakeupScheduleConfig(payload, rules) {
  payload = payload || {};
  const teacherKey = payload.teacherKey || FIXED_TEACHER_KEY;
  const tkbSheetName = getSelectedTkbSheetName_(payload.tkbSheet);
  const clean = (Array.isArray(rules) ? rules : []).map((r,i) => v4136NormalizeRule_(r,i));
  const base = readMathSchedule_(teacherKey, tkbSheetName);
  // Validate trước khi lưu để không thể tạo cấu hình gây sai Báo giảng.
  v4136ApplyMakeupRules_(base, clean, true);
  const key = v4136MakeupStorageKey_(teacherKey, tkbSheetName);
  const props = PropertiesService.getScriptProperties();
  if (clean.length) props.setProperty(key, JSON.stringify(clean)); else props.deleteProperty(key);
  return getMakeupScheduleConfig({teacherKey:teacherKey, tkbSheet:tkbSheetName});
}

function clearMakeupScheduleConfig(payload) {
  payload = payload || {};
  const teacherKey = payload.teacherKey || FIXED_TEACHER_KEY;
  const tkbSheetName = getSelectedTkbSheetName_(payload.tkbSheet);
  PropertiesService.getScriptProperties().deleteProperty(v4136MakeupStorageKey_(teacherKey, tkbSheetName));
  return getMakeupScheduleConfig({teacherKey:teacherKey, tkbSheet:tkbSheetName});
}


// ============================================================================
// V4.150 — TIẾT PHÁT SINH THEO TUẦN
// - Thêm 1 tiết riêng lẻ vào bất kỳ ngày Thứ 2 → Thứ 7 mà không sửa TKB gốc.
// - Chèn vào lịch theo thời gian thực dạy; PPCT của đúng Lớp + Môn + loại tiết
//   tự tăng từ vị trí phát sinh trở đi.
// - Lưu độc lập theo Giáo viên + Tuần; có Sửa/Xóa; chống trùng ô tiết.
// ============================================================================
const V4150_EXTRA_PREFIX = 'V4150_EXTRA_';

function v4150ExtraStorageKey_(teacherKey, tkbSheetName) {
  const token = extractWeekToken_(tkbSheetName) || normalizeText_(tkbSheetName) || 'week';
  const t = v4127SubjectKey_(teacherKey || FIXED_TEACHER_KEY);
  const w = keyText_(token).replace(/[^a-z0-9]+/g, '_');
  return V4150_EXTRA_PREFIX + t + '_' + w;
}

function v4150NormalizeExtra_(raw, idx) {
  raw = raw || {};
  const dayNum = Number(raw.dayNum);
  const session = normalizeText_(raw.session) === 'Chiều' ? 'Chiều' : 'Sáng';
  const period = Math.floor(Number(raw.period));
  const className = normalizeText_(raw.className).replace(/\s+/g, '');
  const track = normalizeText_(raw.track).toLowerCase() === 'elective' ? 'elective' : 'regular';
  const subjectInfo = v4135SubjectTrackInfo_(normalizeText_(raw.subject));
  const baseSubject = subjectInfo.baseSubject;
  const subject = track === 'elective' ? (baseSubject + ' CĐ') : baseSubject;
  const note = normalizeText_(raw.note).slice(0, 300);
  if (!Number.isFinite(dayNum) || dayNum < 2 || dayNum > 7) throw new Error('Ngày dạy tiết phát sinh phải từ Thứ 2 đến Thứ 7.');
  const maxPeriod = session === 'Chiều' ? 3 : 5;
  if (!Number.isFinite(period) || period < 1 || period > maxPeriod) throw new Error('Buổi ' + session.toLowerCase() + ' chỉ hỗ trợ đến tiết ' + maxPeriod + '.');
  if (!v4146ClassGrade_(className)) throw new Error('Lớp tiết phát sinh không hợp lệ.');
  if (!baseSubject) throw new Error('Chưa chọn môn cho tiết phát sinh.');
  return {
    id: normalizeText_(raw.id) || ('extra_' + Utilities.getUuid()),
    dayNum: dayNum,
    dayLabel: 'Thứ ' + dayNum,
    session: session,
    period: period,
    className: className,
    subject: subject,
    baseSubject: baseSubject,
    track: track,
    note: note,
    createdAt: normalizeText_(raw.createdAt) || new Date().toISOString()
  };
}

function v4150LoadExtraLessons_(teacherKey, tkbSheetName) {
  try {
    const raw = PropertiesService.getScriptProperties().getProperty(v4150ExtraStorageKey_(teacherKey, tkbSheetName)) || '';
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.map((x, i) => v4150NormalizeExtra_(x, i));
  } catch (e) { return []; }
}

function v4150SortSchedule_(arr) {
  return (arr || []).sort((a,b) =>
    (Number(a.dayNum)-Number(b.dayNum)) ||
    ((a.session === 'Sáng' ? 0 : 1) - (b.session === 'Sáng' ? 0 : 1)) ||
    (Number(a.period)-Number(b.period)) ||
    String(a.className).localeCompare(String(b.className)) ||
    String(a.subject).localeCompare(String(b.subject))
  );
}

function v4150ApplyExtraLessons_(schedule, extras, strict) {
  const out = (schedule || []).map(r => Object.assign({}, r));
  (extras || []).forEach((raw, i) => {
    const x = v4150NormalizeExtra_(raw, i);
    const conflict = out.find(r => Number(r.dayNum) === x.dayNum && normalizeText_(r.session) === x.session && Number(r.period) === x.period);
    if (conflict) {
      if (strict) throw new Error('Tiết ' + x.period + ' · ' + x.session + ' · Thứ ' + x.dayNum + ' đã có ' + conflict.className + '. Hãy chọn tiết trống khác.');
      return;
    }
    out.push({
      dayNum:x.dayNum, dayLabel:x.dayLabel, dateLabel:'', session:x.session, period:x.period,
      subject:x.subject, className:x.className,
      isExtra:true, extraId:x.id, extraNote:x.note || '', extraCreatedAt:x.createdAt || ''
    });
  });
  return v4150SortSchedule_(out);
}

function v4150BaseAdjustedSchedule_(teacherKey, tkbSheetName) {
  const base = readMathSchedule_(teacherKey, tkbSheetName);
  return v4136ApplyMakeupRules_(base, v4136LoadMakeupRules_(teacherKey, tkbSheetName), true);
}

function v4150CandidateMeta_(teacherKey, tkbSheetName) {
  const rows = v4150BaseAdjustedSchedule_(teacherKey, tkbSheetName);
  const classes = [], subjects = [];
  rows.forEach(r => {
    const cls = normalizeText_(r.className).replace(/\s+/g,'');
    const base = v4135SubjectTrackInfo_(r.subject).baseSubject;
    if (cls && classes.indexOf(cls) < 0) classes.push(cls);
    if (base && subjects.findIndex(s => v4127SubjectKey_(s) === v4127SubjectKey_(base)) < 0) subjects.push(base);
  });
  const dir = getTeacherDirectoryInfo_(teacherKey);
  const dirSubjects = String((dir && dir.subject) || '').split(/[;,/]+/).map(normalizeText_).filter(Boolean);
  dirSubjects.forEach(s => { if (subjects.findIndex(x => v4127SubjectKey_(x) === v4127SubjectKey_(s)) < 0) subjects.push(s); });
  classes.sort((a,b)=>a.localeCompare(b,'vi',{numeric:true}));
  subjects.sort((a,b)=>a.localeCompare(b,'vi'));
  return {rows:rows, classes:classes, subjects:subjects};
}

function v4150HypotheticalPreview_(payload, rawItem) {
  payload = payload || {};
  const teacherKey = payload.teacherKey || FIXED_TEACHER_KEY;
  const tkbSheetName = getSelectedTkbSheetName_(payload.tkbSheet);
  const x = v4150NormalizeExtra_(rawItem || {}, 0);
  const dayOff = (typeof v4155LoadDayOffs_ === 'function' ? v4155LoadDayOffs_() : []).find(h => v4155DayOffMatchesRecord_(h, x, tkbSheetName));
  if (dayOff) throw new Error('Không thể thêm Tiết phát sinh vào '+v4155ScopeLabel_(dayOff).toLowerCase()+' đang nghỉ: '+dayOff.reason+'.');
  const meta = v4150CandidateMeta_(teacherKey, tkbSheetName);
  if (meta.classes.indexOf(x.className) < 0) throw new Error('Lớp ' + x.className + ' chưa thuộc lịch dạy của giáo viên trong tuần này.');
  if (meta.subjects.length && meta.subjects.findIndex(s => v4127SubjectKey_(s) === v4127SubjectKey_(x.baseSubject)) < 0) throw new Error('Môn ' + x.baseSubject + ' chưa thuộc giáo viên trong tuần này.');
  const current = v4150LoadExtraLessons_(teacherKey, tkbSheetName).filter(z => z.id !== x.id);
  let schedule = v4150ApplyExtraLessons_(meta.rows, current, true);
  schedule = v4150ApplyExtraLessons_(schedule, [x], true);
  const preview = v4150BuildPreviewFromSchedule_(schedule, teacherKey, payload.starts || {}, payload.monday || '');
  const row = preview.find(r => r.isExtra && r.extraId === x.id);
  if (!row) throw new Error('Không tính được PPCT cho tiết phát sinh.');
  return Object.assign({}, x, {
    ppct:row.ppct, ppctNumber:row.ppctNumber, lesson:row.lesson || '', lessonMissing:!!row.lessonMissing,
    lessonMissingReason:row.lessonMissingReason || '', lessonSource:row.lessonSource || '', dateLabel:row.dateLabel || ''
  });
}

function previewExtraLesson(payload, item) {
  return {ok:true, item:v4150HypotheticalPreview_(payload, item)};
}

function getExtraLessonConfig(payload) {
  payload = payload || {};
  const teacherKey = payload.teacherKey || FIXED_TEACHER_KEY;
  const tkbSheetName = getSelectedTkbSheetName_(payload.tkbSheet);
  const meta = v4150CandidateMeta_(teacherKey, tkbSheetName);
  const items = v4150LoadExtraLessons_(teacherKey, tkbSheetName);
  const previewRows = v4150BuildPreviewFromSchedule_(v4150ApplyExtraLessons_(meta.rows, items, true), teacherKey, payload.starts || {}, payload.monday || '');
  const byId = {};
  previewRows.filter(r => r.isExtra).forEach(r => byId[r.extraId] = r);
  const enriched = items.map(x => {
    const r = byId[x.id] || {};
    return Object.assign({}, x, {ppct:r.ppct || '', ppctNumber:r.ppctNumber || null, lesson:r.lesson || '', lessonMissing:!!r.lessonMissing, lessonMissingReason:r.lessonMissingReason || '', dateLabel:r.dateLabel || ''});
  });
  return {
    ok:true, teacher:TEACHER_MAP[teacherKey] || teacherKey, tkbSheet:tkbSheetName,
    weekToken:extractWeekToken_(tkbSheetName), classOptions:meta.classes, subjectOptions:meta.subjects,
    items:enriched, count:enriched.length
  };
}

function saveExtraLesson(payload, item) {
  payload = payload || {};
  const teacherKey = payload.teacherKey || FIXED_TEACHER_KEY;
  const tkbSheetName = getSelectedTkbSheetName_(payload.tkbSheet);
  const preview = v4150HypotheticalPreview_(payload, item);
  if (preview.lessonMissing || !normalizeText_(preview.lesson)) {
    throw new Error(preview.lessonMissingReason || ('Chưa có tên bài PPCT cho ' + preview.className + ' · ' + preview.baseSubject + '.'));
  }
  const props = PropertiesService.getScriptProperties();
  const key = v4150ExtraStorageKey_(teacherKey, tkbSheetName);
  const arr = v4150LoadExtraLessons_(teacherKey, tkbSheetName).filter(x => x.id !== preview.id);
  arr.push(v4150NormalizeExtra_(preview, arr.length));
  v4150SortSchedule_(arr);
  props.setProperty(key, JSON.stringify(arr));
  return getExtraLessonConfig(payload);
}

function deleteExtraLesson(payload, id) {
  payload = payload || {};
  const teacherKey = payload.teacherKey || FIXED_TEACHER_KEY;
  const tkbSheetName = getSelectedTkbSheetName_(payload.tkbSheet);
  const key = v4150ExtraStorageKey_(teacherKey, tkbSheetName);
  const before = v4150LoadExtraLessons_(teacherKey, tkbSheetName);
  const after = before.filter(x => x.id !== normalizeText_(id));
  if (after.length === before.length) throw new Error('Không tìm thấy tiết phát sinh cần xóa.');
  const props = PropertiesService.getScriptProperties();
  if (after.length) props.setProperty(key, JSON.stringify(after)); else props.deleteProperty(key);
  return getExtraLessonConfig(payload);
}

function clearExtraLessons(payload) {
  payload = payload || {};
  const teacherKey = payload.teacherKey || FIXED_TEACHER_KEY;
  const tkbSheetName = getSelectedTkbSheetName_(payload.tkbSheet);
  PropertiesService.getScriptProperties().deleteProperty(v4150ExtraStorageKey_(teacherKey, tkbSheetName));
  return getExtraLessonConfig(payload);
}

function v4150HasExtraPlan_(teacherKey, tkbSheetName) {
  try { return v4150LoadExtraLessons_(teacherKey, tkbSheetName).length > 0; } catch (e) { return false; }
}

// Từ V4.136, mọi chức năng dùng TKB cho công việc thực tế đều nhận lịch đã điều chỉnh.
function readTeacherScheduleAll_(teacherKey, tkbSheetName) {
  return v4136ReadEffectiveSchedule_(teacherKey, tkbSheetName).map(x => ({
    dayNum:x.dayNum, session:x.session, period:x.period, className:x.className, subject:x.subject,
    isMakeup:!!x.isMakeup, makeupSource:x.makeupSource||'', originalDayNum:x.originalDayNum||null,
    originalSession:x.originalSession||'', originalPeriod:x.originalPeriod||null
  }));
}

function v4150BuildPreviewFromSchedule_(schedule, teacherKey, starts, mondayYmd) {
  const counters = {}, curriculums = {}, out = [];

  schedule.forEach(rec => {
    const info = v4135SubjectTrackInfo_(rec.subject);
    const subject = info.displaySubject;
    const baseSubject = info.baseSubject;
    const track = info.track;
    const pairKey = v4127PairKey_(rec.className, subject, track);
    if (counters[pairKey] == null) {
      let raw = starts && starts[pairKey] != null ? starts[pairKey] : null;
      if (raw == null && track === 'regular' && starts && starts[rec.className] != null) raw = starts[rec.className];
      const custom = Number(raw);
      counters[pairKey] = isFinite(custom) && custom > 0 ? custom : 1;
    } else counters[pairKey] += 1;

    const grade = v4146ClassGrade_(rec.className);
    const sk = v4127SubjectKey_(baseSubject);
    if (!curriculums[sk]) curriculums[sk] = loadPpctCurriculum_(baseSubject);
    const curriculum = curriculums[sk];
    const ppctNumber = counters[pairKey];
    const ppct = v4135PpctLabel_(ppctNumber, track);
    const ext = externalLessonFor_(curriculum, grade, ppctNumber, track);
    const hasSource = !!(curriculum && curriculum.configured);
    const ppctText = track === 'elective' ? ('CĐ' + ppctNumber) : String(ppctNumber);

    out.push(Object.assign({}, rec, {
      subject:subject, baseSubject:baseSubject, track:track, isElective:track === 'elective', pairKey:pairKey,
      dateLabel:dateLabelForDay_(mondayYmd, rec.dayNum), ppctNumber:ppctNumber, ppct:ppct,
      lesson:ext || '', lessonMissing:!ext,
      lessonMissingReason: ext ? '' : (
        curriculum && curriculum.error ? ('Nguồn PPCT ' + baseSubject + ' đang lỗi: ' + curriculum.error) :
        (hasSource ? ('Nguồn PPCT ' + baseSubject + ' chưa có ' + ppctText + ' cho khối ' + (grade || '?')) : ('Chưa khai báo Nguồn PPCT cho ' + baseSubject))
      ),
      lessonSource:ext ? ('PPCT chuẩn · ' + baseSubject + (track === 'elective' ? ' · Chuyên đề' : '')) : (curriculum && curriculum.error ? ('Lỗi Nguồn PPCT · ' + baseSubject) : (hasSource ? ('Thiếu ' + ppctText + ' trong nguồn · ' + baseSubject) : ('Chưa có nguồn PPCT · ' + baseSubject)))
    }));
  });
  return out;

}

function buildPreview_(teacherKey, starts, mondayYmd, tkbSheetName) {
  return v4150BuildPreviewFromSchedule_(v4136ReadEffectiveSchedule_(teacherKey, tkbSheetName), teacherKey, starts, mondayYmd);
}

function getClassPpctSuggestions(teacherKey, reportSheetName, tkbSheetName) {
  if (!TEACHER_MAP[teacherKey]) throw new Error('Giáo viên không hợp lệ.');
  const schedule = v4136ReadEffectiveSchedule_(teacherKey, tkbSheetName);
  const counts = {}, meta = {};
  schedule.forEach(r => {
    const info = v4135SubjectTrackInfo_(r.subject);
    const subject = info.displaySubject;
    const key = v4127PairKey_(r.className, subject, info.track);
    counts[key] = (counts[key] || 0) + 1;
    meta[key] = {className:r.className, subject:subject, baseSubject:info.baseSubject, track:info.track, key:key};
  });
  const previousSheet = getPreviousWeekSheetName_(reportSheetName);
  const lastByPair = readLastPpctBeforeSheet_(teacherKey, reportSheetName);
  const classes = Object.keys(counts).sort((a,b) => {
    const A=meta[a], B=meta[b];
    return String(A.className).localeCompare(String(B.className)) || String(A.subject).localeCompare(String(B.subject));
  }).map(key => {
    const last = lastByPair[key] || 0;
    const suggestedStart = last > 0 ? last + 1 : 1;
    return {
      key:key, className:meta[key].className, subject:meta[key].subject, baseSubject:meta[key].baseSubject,
      track:meta[key].track, isElective:meta[key].track === 'elective', ppctPrefix:meta[key].track === 'elective' ? 'CĐ' : '',
      count:counts[key], previousLast:last || null, suggestedStart:suggestedStart,
      suggestedEnd:suggestedStart + Math.max(counts[key] - 1, 0)
    };
  });
  const subjects = classes.map(x => x.baseSubject).filter((s,i,arr) => arr.findIndex(x => v4127SubjectKey_(x) === v4127SubjectKey_(s)) === i);
  const curriculumSources = subjects.map(s => v4127StoredSourceConfig_(s));
  return {previousSheet:previousSheet, classes:classes, subjects:subjects, curriculumSources:curriculumSources,
    curriculumSource:curriculumSources[0] || {configured:false, entries:0, kind:'', title:'', error:''}};
}

function getTkbClassCheck(payload) {
  if (!payload || !payload.teacherKey) throw new Error('Thiếu giáo viên.');
  const teacherKey = payload.teacherKey;
  const schedule = v4136ReadEffectiveSchedule_(teacherKey, payload.tkbSheet);
  const counts = {}, meta = {};
  schedule.forEach(r => {
    const info = v4135SubjectTrackInfo_(r.subject);
    const subject = info.displaySubject;
    const key = v4127PairKey_(r.className, subject, info.track);
    counts[key] = (counts[key] || 0) + 1;
    meta[key] = {className:r.className, subject:subject};
  });
  const classes = Object.keys(counts).sort().map(key => {
    const m = meta[key];
    const rawStart = payload.starts && payload.starts[key] != null ? payload.starts[key] : null;
    const start = rawStart != null ? Number(rawStart) : null;
    const count = counts[key] || 0;
    return {key:key,className:m.className,subject:m.subject,count:count,ppctStart:start,ppctEnd:(start&&count>0)?start+count-1:null,status:'ok',message:'Có dữ liệu'};
  });
  const rules = v4136LoadMakeupRules_(teacherKey, payload.tkbSheet);
  return {
    teacher:TEACHER_MAP[teacherKey] || teacherKey,
    previousSheet:getPreviousWeekSheetName_(payload.reportSheet || ''),
    totalClasses:classes.length,
    totalPeriods:classes.reduce((s,x)=>s+x.count,0),
    warnings:[], classes:classes,
    makeupRules:rules.map(v4136RuleText_)
  };
}

function v4136BuildTargetRowMap_(sheet, blockStartZero) {
  const sections = findTeacherSectionRows_(sheet, blockStartZero);
  const startCol1 = blockStartZero + 1;
  const map = {};
  [['Sáng', sections.morning], ['Chiều', sections.afternoon]].forEach(pair => {
    const session = pair[0], titleRow = pair[1];
    const firstDataRow = titleRow + 3;
    const vals = sheet.getRange(firstDataRow, startCol1, 30, 2).getDisplayValues();
    let currentDay = null;
    vals.forEach((row, i) => {
      const dc = normalizeText_(row[0]);
      if (dc) { const m = dc.match(/^([2-7])/); if (m) currentDay = Number(m[1]); }
      const period = Number(normalizeText_(row[1]));
      if (currentDay && period) map[session + '_' + currentDay + '_' + period] = firstDataRow + i;
    });
  });
  return map;
}

function preflightBaoGiang(payload) {
  if (!payload || !payload.teacherKey) throw new Error('Thiếu giáo viên.');
  const weekMeta = buildWeekMeta_(payload);
  const teacherKey = payload.teacherKey;
  const fullName = TEACHER_MAP[teacherKey];
  if (!fullName) throw new Error('Giáo viên không hợp lệ.');

  const records = buildPreview_(teacherKey, payload.starts || {}, payload.monday || '', payload.tkbSheet);
  if (!records.length) throw new Error('Không có tiết dạy nào của giáo viên trong TKB để ghi.');
  const missing = records.filter(r => !normalizeText_(r.lesson) || r.lessonMissing);
  if (missing.length) {
    const reasons = [];
    missing.forEach(r => {
      const reason = normalizeText_(r.lessonMissingReason) || ('Thiếu tên bài: ' + r.className + ' · ' + r.subject + ' · PPCT ' + r.ppct);
      if (reasons.indexOf(reason) < 0) reasons.push(reason);
    });
    throw new Error('NGUỒN_PPCT_THIẾU: ' + reasons.slice(0,8).join(' • ') + (reasons.length>8?' • …':'') + '. App chưa ghi để tránh điền sai tên bài.');
  }

  const ss = SpreadsheetApp.openById(BAO_GIANG_SPREADSHEET_ID);
  const reportSheetName = getSelectedReportSheetName_(payload);
  const sh = ss.getSheetByName(reportSheetName);
  if (!sh) throw new Error('Không tìm thấy sheet báo giảng: ' + reportSheetName);
  const blockStartZero = findTeacherBlockStart_(sh, fullName);
  const rowMap = v4136BuildTargetRowMap_(sh, blockStartZero);
  const startCol1 = blockStartZero + 1;
  const targets = [], skipped = [];

  records.forEach(rec => {
    const row = rowMap[rec.session + '_' + rec.dayNum + '_' + rec.period];
    if (!row) { skipped.push(rec.dayLabel + ' ' + rec.session + ' tiết ' + rec.period); return; }
    const rangeA1 = sh.getRange(row, startCol1 + 2, 1, 4).getA1Notation();
    targets.push({
      row:row, range:rangeA1, dayLabel:rec.dayLabel, dateLabel:rec.dateLabel, session:rec.session, period:rec.period,
      subject:rec.subject, className:rec.className, ppct:rec.ppct, lesson:rec.lesson,
      isMakeup:!!rec.isMakeup, makeupSource:rec.makeupSource||'', isExtra:!!rec.isExtra, extraId:rec.extraId||''
    });
  });
  if (!targets.length) throw new Error('Không tìm được ô đích nào trong sheet báo giảng.');
  return {
    ok:true, teacherKey:teacherKey, teacher:fullName, sheet:reportSheetName, targetCount:targets.length, skipped:skipped, targets:targets,
    reportUrl:'https://docs.google.com/spreadsheets/d/'+BAO_GIANG_SPREADSHEET_ID+'/edit?gid=533049391#gid=533049391',
    weekInfo:{week:weekMeta.week,from:fmtDMY_(weekMeta.monday),to:fmtDMY_(weekMeta.saturday),team:weekMeta.team,leader:weekMeta.leader},
    makeupRules:v4136LoadMakeupRules_(teacherKey,payload.tkbSheet).map(v4136RuleText_)
  };
}


// ===== V4.137: ĐỌC NGUỒN PPCT TRỰC TIẾP, KHÔNG PHỤ THUỘC DriveApp =====
// Lý do: DriveApp.getFileById() có thể đòi thêm quyền Drive và làm hỏng luồng
// dù chính Google Docs/Sheets vẫn đọc được. Từ bản này thử mở trực tiếp bằng
// SpreadsheetApp rồi DocumentApp; chỉ khi cả hai đều thất bại mới báo lỗi.
function readPpctSourceById_(id) {
  const map = {}, electiveMap = {};
  let regularEntries = 0, electiveEntries = 0;
  let sheetErr = null, docErr = null;

  try {
    const ss = SpreadsheetApp.openById(id);
    const title = ss.getName();
    ss.getSheets().forEach(sh => {
      const lr = Math.min(Math.max(sh.getLastRow(), 1), 3000);
      const lc = Math.min(Math.max(sh.getLastColumn(), 1), 40);
      const vals = sh.getRange(1, 1, lr, lc).getDisplayValues();
      const added = v4135AddSheetCurriculum_(vals, sh.getName(), map, electiveMap);
      regularEntries += added.regular || 0;
      electiveEntries += added.elective || 0;
    });
    return {
      map:map,
      electiveMap:electiveMap,
      regularEntries:regularEntries,
      electiveEntries:electiveEntries,
      entries:regularEntries + electiveEntries,
      kind:'Google Sheets',
      title:title,
      mime:'application/vnd.google-apps.spreadsheet',
      gradeCounts:v4135GradeCounts_(map),
      electiveGradeCounts:v4135GradeCounts_(electiveMap),
      format:''
    };
  } catch (e) {
    sheetErr = e;
  }

  try {
    const doc = DocumentApp.openById(id);
    const title = doc.getName();
    const parsed = v4135ReadGoogleDocCurriculum_(doc, map, electiveMap);
    regularEntries += parsed.regularEntries || 0;
    electiveEntries += parsed.electiveEntries || 0;
    return {
      map:map,
      electiveMap:electiveMap,
      regularEntries:regularEntries,
      electiveEntries:electiveEntries,
      entries:regularEntries + electiveEntries,
      kind:'Google Docs',
      title:title,
      mime:'application/vnd.google-apps.document',
      gradeCounts:v4135GradeCounts_(map),
      electiveGradeCounts:v4135GradeCounts_(electiveMap),
      format:(regularEntries + electiveEntries) > 0 ? 'Kế hoạch dạy học · TT → Bài học · có Chuyên đề' : ''
    };
  } catch (e) {
    docErr = e;
  }

  const friendly = friendlyPpctSourceError_(sheetErr, docErr);
  throw new Error(friendly + ' Nếu đây là file Word (.doc/.docx), hãy chuyển sang Google Tài liệu trước khi dùng làm Nguồn PPCT.');
}

// ============================================================================
// V4.148 — PPCT PARSER V2 TỔNG QUÁT
// Được xây từ các mẫu thực tế: GDKTPL, Công nghệ, GDĐP, Vật lí, Hóa học,
// Sinh học, Ngữ văn.
//
// Ba chiến lược:
// 1) PPCT ghi trực tiếp: "2-3", "1,2,3", "3 (31,32,33)", CĐHT 1-5...
// 2) Bài học + Số tiết: tự đánh PPCT theo thứ tự dòng.
// 3) Chủ đề + Số tiết: tương tự (2), giữ nguyên thứ tự chủ đề.
//
// An toàn:
// - Không dùng TT/STT làm PPCT ở mẫu "Số tiết".
// - Bỏ dòng Chương/Chuyên đề chỉ là tiêu đề nhóm.
// - Không tự đoán khi một nội dung thật bị thiếu Số tiết; dừng từ điểm thiếu để
//   tránh làm lệch toàn bộ PPCT phía sau.
// - Chống đọc trùng bảng cùng khối/loại tiết.
// - Đọc ghi chú kiểu "Tiết 3,4 dạy sau kiểm tra..." và chuyển phần tiết đó
//   tới sau mốc kiểm tra tương ứng.
// ============================================================================

function v4148HeaderKey_(value) {
  return keyText_(normalizeText_(value)).replace(/\s+/g, ' ').trim();
}

function v4148ParseNumberList_(value) {
  return parsePpctNumbers_(normalizeText_(value));
}

// Với ô kiểu "3 (31,32,33)", dãy trong ngoặc mới là PPCT; số 3 chỉ là số tiết.
function v4148ParseDirectPpct_(value) {
  let raw = normalizeText_(value).replace(/[–—−]/g, '-');
  if (!raw) return [];
  const paren = raw.match(/\(([^()]*)\)/);
  if (paren && /\d/.test(paren[1] || '')) {
    const nums = v4148ParseNumberList_(paren[1]);
    if (nums.length) return nums;
  }
  raw = raw
    .replace(/\bCĐHT\b/ig, '')
    .replace(/\bCDHT\b/ig, '')
    .replace(/\bCĐ\b/ig, '')
    .replace(/\bCD\b/ig, '')
    .replace(/PPCT/ig, '')
    .replace(/\bTIẾT\b/ig, '')
    .replace(/\bTIET\b/ig, '');
  return v4148ParseNumberList_(raw);
}

function v4148ParseDuration_(value) {
  const raw = normalizeText_(value).replace(/^0+(?=\d)/, '');
  if (!raw) return null;
  // Ở các bảng Ngữ văn có thể là "2 (9,10)"; khi cần duration thì lấy số đầu.
  const m = raw.match(/(?:^|\D)(\d{1,3})(?:\D|$)/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 && n <= 30 ? n : null;
}

function v4148LooksDirectMeasure_(value) {
  const raw = normalizeText_(value).replace(/[–—−]/g, '-');
  if (!raw) return false;
  if (/\(\s*\d[\d\s,;\-]*\)/.test(raw)) return true;
  if (/^(?:CĐHT|CDHT|CĐ|CD)\s*\d/i.test(raw)) return true;
  if (/\d\s*-\s*\d/.test(raw)) return true;
  if (/\d\s*[,;]\s*\d/.test(raw)) return true;
  return false;
}

function v4148MeasureLooksLikeSummary_(value) {
  const raw = normalizeText_(value);
  if (!raw) return false;
  // "10 tiết" / "15 tiết" ở dòng tiêu đề chuyên đề là tổng số tiết, không phải PPCT.
  return /\bti[eế]t\b/i.test(raw) && !/\([^)]*\d[^)]*\)/.test(raw) && !/^(?:CĐHT|CDHT|CĐ|CD)\s*\d/i.test(raw);
}

function v4148IsGroupLesson_(lesson) {
  const k = v4148HeaderKey_(lesson);
  if (!k) return false;
  return /^(?:chuong\b|chuyen de\b|hoc ky\b|hoc ki\b|phan\s+phoi\s+chuong\s+trinh\b|tong\s+so\s+tiet\b)/.test(k);
}

function v4148TextDensity_(matrix, startRow, col) {
  let nonEmpty = 0, textual = 0;
  const end = Math.min((matrix || []).length, startRow + 15);
  for (let r = startRow; r < end; r++) {
    const raw = normalizeText_(((matrix[r] || [])[col]));
    if (!raw) continue;
    nonEmpty++;
    if (/[A-Za-zÀ-ỹĐđ]/.test(raw)) textual++;
  }
  return {nonEmpty:nonEmpty, textual:textual};
}

function v4148FindSchema_(matrix) {
  if (!matrix || !matrix.length) return null;
  const scanRows = Math.min(matrix.length, 12);
  let best = null;

  for (let r = 0; r < scanRows; r++) {
    const row = matrix[r] || [];
    let explicitPpct = -1, duration = -1, genericTiet = -1, lesson = -1, grade = -1, note = -1, tt = -1;
    for (let c = 0; c < row.length; c++) {
      const k = v4148HeaderKey_(row[c]);
      if (!k) continue;
      if (explicitPpct < 0 && (/(^|\b)ppct(\b|$)/.test(k) || /so\s*tt\s*tiet\s*theo\s*ppct/.test(k) || /tiet\s*ppct/.test(k))) explicitPpct = c;
      if (duration < 0 && (/^so\s*tiet(?:\s*\([^)]*\))?$/.test(k) || /^so\s*tiet\b/.test(k))) duration = c;
      if (genericTiet < 0 && /^tiet$/.test(k)) genericTiet = c;
      if (lesson < 0 && /(ten\s*bai(?:\s*hoc)?|noi\s*dung\s*bai(?:\s*hoc)?|bai\s*hoc|chu\s*de|noi\s*dung)/.test(k)) lesson = c;
      if (grade < 0 && /(^|\b)(khoi|lop)(\b|$)/.test(k)) grade = c;
      if (note < 0 && /(ghi\s*chu|noi\s*dung\s*tich\s*hop)/.test(k)) note = c;
      if (tt < 0 && /^(tt|stt)$/.test(k)) tt = c;
    }

    let measure = explicitPpct >= 0 ? explicitPpct : duration;
    if (measure < 0 && genericTiet >= 0) {
      let looks = 0;
      for (let rr = r + 1; rr < Math.min(matrix.length, r + 12); rr++) {
        if (v4148LooksDirectMeasure_(((matrix[rr] || [])[genericTiet]))) looks++;
      }
      if (looks >= 2) measure = genericTiet;
    }
    if (measure < 0 || lesson < 0) continue;

    let directEvidence = explicitPpct >= 0 ? 3 : 0;
    let sampled = 0;
    for (let rr = r + 1; rr < Math.min(matrix.length, r + 14); rr++) {
      const raw = normalizeText_(((matrix[rr] || [])[measure]));
      if (!raw) continue;
      sampled++;
      if (v4148LooksDirectMeasure_(raw)) directEvidence++;
    }
    const mode = (explicitPpct >= 0 || directEvidence >= 2) ? 'direct' : 'sequential';

    // Ngữ văn thường có: TT | Bài học (tên bài lớn) | [cột trống tiêu đề nhưng
    // chứa nội dung thực dạy] | Số tiết (PPCT). Ưu tiên cột sát bên trái PPCT
    // nếu tiêu đề cột đó trống và dữ liệu bên dưới có chữ.
    let contentCol = lesson;
    if (measure > 0) {
      const leftHeader = normalizeText_(row[measure - 1]);
      const density = v4148TextDensity_(matrix, r + 1, measure - 1);
      if (!leftHeader && density.textual >= 2) contentCol = measure - 1;
    }

    best = {
      headerRow:r,
      mode:mode,
      measureCol:measure,
      lessonCol:lesson,
      contentCol:contentCol,
      gradeCol:grade,
      noteCol:note,
      ttCol:tt,
      explicitPpct:explicitPpct >= 0,
      sampled:sampled
    };
    break;
  }
  return best;
}

function v4148RowLesson_(row, schema) {
  let lesson = normalizeText_((row || [])[schema.contentCol]);
  if (!lesson && schema.contentCol !== schema.lessonCol) lesson = normalizeText_((row || [])[schema.lessonCol]);
  return lesson.replace(/\s+/g, ' ').trim();
}

function v4148FindGrade_(row, schema, forcedGrade, sourceName) {
  return Number(forcedGrade) || (schema.gradeCol >= 0 ? parseGrade_((row || [])[schema.gradeCol]) : null) || parseGrade_(sourceName);
}

function v4148ParseDeferredNote_(note, duration) {
  const raw = normalizeText_(note);
  const k = keyText_(raw);
  if (!raw || !/(?:day|hoc)\s+sau/.test(k) || !/kiem\s*tra/.test(k)) return null;
  const m = k.match(/tiet\s+([0-9,\s]+?)\s+(?:day|hoc)\s+sau/);
  if (!m) return null;
  const nums = (m[1].match(/\d+/g) || []).map(Number).filter(n => n >= 1 && n <= duration);
  if (!nums.length) return null;
  const checkpoint = /giua\s*(?:hoc\s*)?k[iy]/.test(k) ? 'mid' : (/cuoi\s*(?:hoc\s*)?k[iy]/.test(k) ? 'final' : '');
  if (!checkpoint) return null;
  return {count:nums.length, checkpoint:checkpoint, periods:nums};
}

function v4148CheckpointMatches_(lesson, checkpoint) {
  const k = keyText_(lesson);
  if (!/kiem\s*tra/.test(k)) return false;
  if (checkpoint === 'mid') return /giua\s*(?:hoc\s*)?k[iy]/.test(k);
  if (checkpoint === 'final') return /cuoi\s*(?:hoc\s*)?k[iy]/.test(k);
  return false;
}

function v4148Fingerprint_(records) {
  return (records || []).map(r => [keyText_(r.lesson), Number(r.duration) || 0, keyText_(r.note || '')].join('~')).join('||');
}

function v4148PushWarning_(state, text) {
  if (!state) return;
  state.warnings = state.warnings || [];
  if (state.warnings.length < 30 && state.warnings.indexOf(text) < 0) state.warnings.push(text);
}

function v4148EnsureState_(state) {
  state = state || {};
  state.next = state.next || {regular:{}, elective:{}};
  state.seen = state.seen || {};
  state.tableProfiles = state.tableProfiles || {};
  state.warnings = state.warnings || [];
  state.modes = state.modes || {};
  return state;
}

function v4148AddDirectTable_(matrix, sourceName, target, options, state) {
  options = options || {};
  state = v4148EnsureState_(state);
  const schema = options.schema || v4148FindSchema_(matrix);
  if (!schema || schema.mode !== 'direct') return 0;
  const forcedGrade = Number(options.grade) || null;
  let added = 0;

  for (let r = schema.headerRow + 1; r < matrix.length; r++) {
    const row = matrix[r] || [];
    const lesson = v4148RowLesson_(row, schema);
    const rawMeasure = normalizeText_(row[schema.measureCol]);
    if (!lesson || !rawMeasure) continue;
    if (v4148MeasureLooksLikeSummary_(rawMeasure)) continue;
    const grade = v4148FindGrade_(row, schema, forcedGrade, sourceName);
    if (!grade) continue;
    const nums = v4148ParseDirectPpct_(rawMeasure);
    if (!nums.length) continue;
    target[grade] = target[grade] || {};
    nums.forEach(n => {
      if (!target[grade][n]) { target[grade][n] = lesson; added++; }
    });
  }
  if (added) state.modes.direct = true;
  return added;
}

function v4148CollectSequentialRecords_(matrix, schema, sourceName, options, state) {
  const forcedGrade = Number(options.grade) || null;
  const recordsByGrade = {};
  for (let r = schema.headerRow + 1; r < matrix.length; r++) {
    const row = matrix[r] || [];
    const lesson = v4148RowLesson_(row, schema);
    if (!lesson) continue;
    const grade = v4148FindGrade_(row, schema, forcedGrade, sourceName);
    if (!grade) continue;
    const duration = v4148ParseDuration_(row[schema.measureCol]);
    const note = schema.noteCol >= 0 ? normalizeText_(row[schema.noteCol]) : '';
    if (!duration) {
      if (v4148IsGroupLesson_(lesson)) continue;
      // Đây là nội dung thật nhưng nguồn thiếu Số tiết: không được tự đoán.
      v4148PushWarning_(state, 'Lớp ' + grade + ': “' + lesson + '” thiếu Số tiết; parser dừng từ dòng này để tránh lệch PPCT.');
      recordsByGrade[grade] = recordsByGrade[grade] || [];
      recordsByGrade[grade].push({lesson:lesson, duration:null, note:note, gap:true, row:r});
      continue;
    }
    recordsByGrade[grade] = recordsByGrade[grade] || [];
    recordsByGrade[grade].push({lesson:lesson, duration:duration, note:note, gap:false, row:r});
  }
  return recordsByGrade;
}

function v4148AddSequentialTable_(matrix, sourceName, target, options, state) {
  options = options || {};
  state = v4148EnsureState_(state);
  const schema = options.schema || v4148FindSchema_(matrix);
  if (!schema || schema.mode !== 'sequential') return 0;
  const track = options.track === 'elective' ? 'elective' : 'regular';
  const recordsByGrade = v4148CollectSequentialRecords_(matrix, schema, sourceName, options, state);
  let added = 0;

  Object.keys(recordsByGrade).forEach(gKey => {
    const grade = Number(gKey);
    const records = recordsByGrade[gKey] || [];
    if (!records.length) return;

    // Chống bảng trùng/gần trùng. Một số hồ sơ có hai phiên bản PPCT cùng khối
    // đặt liên tiếp (ví dụ Sinh học lớp 12), có thể khác vài dòng/số tiết. Nếu
    // nối cả hai sẽ thành 140 tiết. Giữ bảng xuất hiện trước và cảnh báo nguồn.
    const cleanRecords = records.filter(x => !x.gap);
    const fingerprint = v4148Fingerprint_(cleanRecords);
    const baseKey = track + '|' + grade;
    const seenKey = baseKey + '|' + fingerprint;
    if (fingerprint && state.seen[seenKey]) return;

    const lessonKeys = cleanRecords.map(x => keyText_(x.lesson)).filter(Boolean);
    const profiles = state.tableProfiles[baseKey] || [];
    let nearDuplicate = null;
    for (let pi = 0; pi < profiles.length; pi++) {
      const prev = profiles[pi];
      const prevSet = {}; (prev.lessons || []).forEach(x => prevSet[x] = true);
      const curSet = {}; lessonKeys.forEach(x => curSet[x] = true);
      let intersection = 0; Object.keys(curSet).forEach(x => { if (prevSet[x]) intersection++; });
      const denom = Math.max(1, Math.min(Object.keys(curSet).length, Object.keys(prevSet).length));
      const similarity = intersection / denom;
      const sizeRatio = Math.min(lessonKeys.length, (prev.lessons || []).length) / Math.max(1, Math.max(lessonKeys.length, (prev.lessons || []).length));
      if (similarity >= 0.75 && sizeRatio >= 0.75) { nearDuplicate = {similarity:similarity}; break; }
    }
    if (nearDuplicate) {
      v4148PushWarning_(state, 'Lớp ' + grade + (track === 'elective' ? ' Chuyên đề' : '') + ': phát hiện hai bảng PPCT gần trùng nhau; giữ bảng xuất hiện trước để tránh nhân đôi tiến độ.');
      return;
    }
    if (fingerprint) state.seen[seenKey] = true;
    profiles.push({lessons:lessonKeys});
    state.tableProfiles[baseKey] = profiles;

    target[grade] = target[grade] || {};
    if (!state.next[track][grade]) {
      const existing = Object.keys(target[grade]).map(Number).filter(n => Number.isFinite(n) && n > 0);
      state.next[track][grade] = existing.length ? (Math.max.apply(null, existing) + 1) : 1;
    }

    const after = {};
    const effective = records.map(x => ({lesson:x.lesson, duration:x.duration, note:x.note, gap:x.gap, row:x.row}));
    let gapIndex = -1;
    for (let i = 0; i < effective.length; i++) {
      if (effective[i].gap) { gapIndex = i; break; }
      const def = v4148ParseDeferredNote_(effective[i].note, effective[i].duration);
      if (!def) continue;
      let targetIndex = -1;
      for (let j = i + 1; j < effective.length; j++) {
        if (effective[j].gap) break;
        if (v4148CheckpointMatches_(effective[j].lesson, def.checkpoint)) { targetIndex = j; break; }
      }
      if (targetIndex < 0) {
        v4148PushWarning_(state, 'Không tìm thấy mốc kiểm tra cho ghi chú “' + effective[i].note + '” của “' + effective[i].lesson + '”. Giữ nguyên thứ tự nguồn.');
        continue;
      }
      const deferredCount = Math.min(def.count, effective[i].duration);
      const beforeCount = effective[i].duration - deferredCount;
      effective[i].duration = beforeCount;
      after[targetIndex] = after[targetIndex] || [];
      after[targetIndex].push({lesson:effective[i].lesson, duration:deferredCount, note:effective[i].note});
    }

    const limit = gapIndex >= 0 ? gapIndex : effective.length;
    for (let i = 0; i < limit; i++) {
      const events = [];
      if (effective[i].duration > 0) events.push(effective[i]);
      (after[i] || []).forEach(x => events.push(x));
      events.forEach(ev => {
        for (let k = 0; k < ev.duration; k++) {
          const n = state.next[track][grade]++;
          if (!target[grade][n]) { target[grade][n] = ev.lesson; added++; }
        }
      });
    }
  });

  if (added) state.modes.sequential = true;
  return added;
}

function v4148AddTable_(matrix, sourceName, target, options, state) {
  const schema = v4148FindSchema_(matrix);
  if (!schema) return 0;
  options = options || {};
  options.schema = schema;
  if (schema.mode === 'direct') return v4148AddDirectTable_(matrix, sourceName, target, options, state);
  return v4148AddSequentialTable_(matrix, sourceName, target, options, state);
}

function v4148ParserFormat_(state, hasElective) {
  state = v4148EnsureState_(state);
  const parts = [];
  if (state.modes.direct) parts.push('PPCT trực tiếp');
  if (state.modes.sequential) parts.push('Bài/Chủ đề × Số tiết');
  let out = 'Parser V2' + (parts.length ? (' · ' + parts.join(' + ')) : '');
  if (hasElective) out += ' · có Chuyên đề';
  if (state.warnings && state.warnings.length) out += ' · ⚠ ' + state.warnings.length + ' cảnh báo nguồn';
  return out;
}

// Google Sheets cũng dùng cùng parser V2.
function v4135AddSheetCurriculum_(matrix, sourceName, regularTarget, electiveTarget) {
  if (!matrix || !matrix.length) return {regular:0,elective:0};
  const state = v4148EnsureState_({});
  const sourceKey = keyText_(sourceName);
  const sheetElective = /chuyen\s*de|(?:^|\b)cd(?:\b|$)|(?:^|\b)cđ(?:\b|$)/.test(sourceKey);
  const target = sheetElective ? electiveTarget : regularTarget;
  const added = v4148AddTable_(matrix, sourceName, target, {track:sheetElective?'elective':'regular'}, state);
  return {regular:sheetElective?0:added, elective:sheetElective?added:0, warnings:state.warnings||[], modes:state.modes||{}};
}

function v4135ReadGoogleDocCurriculum_(doc, regularTarget, electiveTarget) {
  let regularEntries = 0, electiveEntries = 0, regularTables = 0, electiveTables = 0;
  const state = v4148EnsureState_({});
  const bodies = v4147DocumentBodies_(doc);

  bodies.forEach(body => {
    let currentGrade = null;
    let section = '';
    for (let i = 0; i < body.getNumChildren(); i++) {
      const child = body.getChild(i);
      const type = child.getType();
      if (type === DocumentApp.ElementType.PARAGRAPH || type === DocumentApp.ElementType.LIST_ITEM) {
        let text = '';
        try { text = normalizeText_(child.getText()); } catch (e) { text = ''; }
        const g = v4147GradeFromContext_(text);
        if (g) { currentGrade = g; if (section === 'elective') section = ''; }
        const sec = v4147SectionFromText_(text);
        if (sec) section = sec;
        continue;
      }
      if (type !== DocumentApp.ElementType.TABLE) continue;

      const matrix = v4147TableMatrix_(child.asTable());
      const tableGrade = currentGrade || v4147InferGradeFromMatrix_(matrix);
      const tableText = matrix.slice(0, 5).map(r => (r || []).join(' ')).join(' ');
      const tableSection = v4147SectionFromText_(tableText) || section || 'regular';
      const isElective = tableSection === 'elective';
      const target = isElective ? electiveTarget : regularTarget;
      const added = v4148AddTable_(matrix, doc.getName() + (tableGrade ? (' Lớp ' + tableGrade) : ''), target, {
        grade:tableGrade,
        track:isElective ? 'elective' : 'regular'
      }, state);
      if (added > 0) {
        if (isElective) { electiveEntries += added; electiveTables++; }
        else { regularEntries += added; regularTables++; }
      }
    }
  });

  return {
    regularEntries:regularEntries,
    electiveEntries:electiveEntries,
    regularTables:regularTables,
    electiveTables:electiveTables,
    gradeCounts:v4135GradeCounts_(regularTarget),
    electiveGradeCounts:v4135GradeCounts_(electiveTarget),
    warnings:state.warnings || [],
    warningCount:(state.warnings || []).length,
    parserModes:state.modes || {},
    format:v4148ParserFormat_(state, electiveEntries > 0)
  };
}

// Ghi đè lần cuối bộ đọc nguồn: thử Sheets trước, Docs sau; parser V2 cho Docs.
function readPpctSourceById_(id) {
  const map = {}, electiveMap = {};
  let regularEntries = 0, electiveEntries = 0;
  let sheetErr = null, docErr = null;

  try {
    const ss = SpreadsheetApp.openById(id);
    const title = ss.getName();
    let warnings = [], modes = {};
    ss.getSheets().forEach(sh => {
      const lr = Math.min(Math.max(sh.getLastRow(), 1), 3000);
      const lc = Math.min(Math.max(sh.getLastColumn(), 1), 40);
      const vals = sh.getRange(1, 1, lr, lc).getDisplayValues();
      const added = v4135AddSheetCurriculum_(vals, sh.getName(), map, electiveMap);
      regularEntries += added.regular || 0;
      electiveEntries += added.elective || 0;
      (added.warnings || []).forEach(w => { if (warnings.indexOf(w) < 0) warnings.push(w); });
      Object.keys(added.modes || {}).forEach(k => modes[k] = true);
    });
    const state = {warnings:warnings, modes:modes, next:{regular:{},elective:{}}, seen:{}};
    return {
      map:map, electiveMap:electiveMap,
      regularEntries:regularEntries, electiveEntries:electiveEntries, entries:regularEntries + electiveEntries,
      kind:'Google Sheets', title:title, mime:'application/vnd.google-apps.spreadsheet',
      gradeCounts:v4135GradeCounts_(map), electiveGradeCounts:v4135GradeCounts_(electiveMap),
      warnings:warnings, warningCount:warnings.length,
      format:v4148ParserFormat_(state, electiveEntries > 0)
    };
  } catch (e) { sheetErr = e; }

  try {
    const doc = DocumentApp.openById(id);
    const title = doc.getName();
    const parsed = v4135ReadGoogleDocCurriculum_(doc, map, electiveMap);
    regularEntries += parsed.regularEntries || 0;
    electiveEntries += parsed.electiveEntries || 0;
    return {
      map:map, electiveMap:electiveMap,
      regularEntries:regularEntries, electiveEntries:electiveEntries, entries:regularEntries + electiveEntries,
      kind:'Google Docs', title:title, mime:'application/vnd.google-apps.document',
      gradeCounts:v4135GradeCounts_(map), electiveGradeCounts:v4135GradeCounts_(electiveMap),
      warnings:parsed.warnings || [], warningCount:parsed.warningCount || 0,
      format:parsed.format || v4148ParserFormat_({warnings:parsed.warnings||[],modes:parsed.parserModes||{},next:{regular:{},elective:{}},seen:{}}, electiveEntries > 0)
    };
  } catch (e) { docErr = e; }

  const friendly = friendlyPpctSourceError_(sheetErr, docErr);
  throw new Error(friendly + ' Nếu đây là file Word (.doc/.docx), hãy chuyển sang Google Tài liệu trước khi dùng làm Nguồn PPCT.');
}

function loadPpctCurriculum_(subject) {
  const baseSubject = v4135SubjectTrackInfo_(subject).baseSubject;
  const url = getPpctSourceUrl_(baseSubject);
  const id = extractDriveFileId_(url);
  if (!id) {
    return {map:{}, electiveMap:{}, configured:false, entries:0, regularEntries:0, electiveEntries:0, kind:'', title:'Chưa khai báo Nguồn PPCT cho ' + baseSubject, error:'', subject:baseSubject, gradeCounts:{}, electiveGradeCounts:{}, format:'', warnings:[], warningCount:0};
  }
  const cache = CacheService.getScriptCache();
  const key = 'ppct_v4148_' + v4127SubjectKey_(baseSubject) + '_' + id;
  const cached = cache.get(key);
  if (cached) { try { return JSON.parse(cached); } catch (e) {} }
  try {
    const data = readPpctSourceById_(id);
    const res = {
      map:data.map || {}, electiveMap:data.electiveMap || {}, configured:true,
      entries:data.entries || 0, regularEntries:data.regularEntries || 0, electiveEntries:data.electiveEntries || 0,
      kind:data.kind || '', title:data.title || '', error:'', subject:baseSubject,
      gradeCounts:data.gradeCounts || v4135GradeCounts_(data.map || {}),
      electiveGradeCounts:data.electiveGradeCounts || v4135GradeCounts_(data.electiveMap || {}),
      format:data.format || '', warnings:data.warnings || [], warningCount:data.warningCount || 0
    };
    cache.put(key, JSON.stringify(res), 600);
    return res;
  } catch (e) {
    return {map:{}, electiveMap:{}, configured:true, entries:0, regularEntries:0, electiveEntries:0, kind:'', title:'', error:e.message || String(e), subject:baseSubject, gradeCounts:{}, electiveGradeCounts:{}, format:'', warnings:[], warningCount:0};
  }
}

function getPpctSourceConfig(subject) {
  const baseSubject = v4135SubjectTrackInfo_(normalizeText_(subject) || getTeacherDirectoryInfo_(FIXED_TEACHER_KEY).subject || 'Toán').baseSubject;
  const url = getPpctSourceUrl_(baseSubject);
  const data = loadPpctCurriculum_(baseSubject);
  return {
    subject:baseSubject, url:url, configured:!!url,
    entries:data.entries || 0, regularEntries:data.regularEntries || 0, electiveEntries:data.electiveEntries || 0,
    kind:data.kind || '', title:data.title || '', error:data.error || '',
    gradeCounts:data.gradeCounts || {}, electiveGradeCounts:data.electiveGradeCounts || {}, format:data.format || '',
    warnings:data.warnings || [], warningCount:data.warningCount || 0
  };
}

function savePpctSubjectSourceConfig(subject, url) {
  const baseSubject = v4135SubjectTrackInfo_(subject).baseSubject;
  if (!baseSubject) throw new Error('Chưa xác định môn cần lưu nguồn PPCT.');
  const clean = normalizeText_(url);
  const map = v4127ReadSourceMap_();
  const old = v4127FindSourceEntry_(map, baseSubject);
  if (old) delete map[old.key];
  if (!clean) { v4127WriteSourceMap_(map); return getPpctSourceConfig(baseSubject); }

  const id = extractDriveFileId_(clean);
  if (!id) throw new Error('Link nguồn PPCT không hợp lệ. Hãy dùng link Google Sheets hoặc Google Docs.');
  const test = readPpctSourceById_(id);
  if (!test.entries) {
    throw new Error('Đã mở được file nhưng Parser V2 chưa nhận diện được PPCT của môn ' + baseSubject + '. Hỗ trợ: PPCT ghi trực tiếp; Bài học + Số tiết; Chủ đề + Số tiết; chính khóa và Chuyên đề.');
  }
  map[baseSubject] = clean;
  v4127WriteSourceMap_(map);
  const cache = CacheService.getScriptCache();
  ['ppct_v4135_','ppct_v4147_','ppct_v4148_'].forEach(prefix => cache.remove(prefix + v4127SubjectKey_(baseSubject) + '_' + id));
  return getPpctSourceConfig(baseSubject);
}


// Trạng thái nhẹ dùng ngay khi mở app: chỉ kiểm tra đã LƯU link hay chưa,
// không mở file PPCT nên không làm chậm giao diện và không phát sinh quyền Drive.
function v4137GetPpctSourceStatus(teacherKey, tkbSheetName) {
  teacherKey = teacherKey || FIXED_TEACHER_KEY;
  let subjects = [];
  try {
    subjects = readMathSchedule_(teacherKey, tkbSheetName)
      .map(r => v4135SubjectTrackInfo_(r.subject).baseSubject)
      .filter(Boolean);
  } catch (e) {}
  const directory = getTeacherDirectoryInfo_(teacherKey);
  if (!subjects.length && directory.subject) subjects.push(directory.subject);
  subjects = subjects.filter((s, i, arr) => arr.findIndex(x => v4127SubjectKey_(x) === v4127SubjectKey_(s)) === i);
  if (!subjects.length) subjects = ['Toán'];
  const sources = subjects.map(subject => ({subject:subject, configured:!!getPpctSourceUrl_(subject)}));
  return {
    subjects:subjects,
    sources:sources,
    missing:sources.filter(x => !x.configured).map(x => x.subject)
  };
}



// ============================================================================
// V4.151 — KHO PPCT CHUẨN TOÀN TRƯỜNG
// - 15 nguồn Kế hoạch dạy học được tích hợp sẵn trong Code.gs.
// - Tự chuẩn hóa tên môn từ TKB (Văn/Sử/Anh/TD/QPAN/Lý/Hóa/Sinh/CNghệ...).
// - Mặc định dùng nguồn chuẩn của trường, KHÔNG cần nhập link.
// - Giáo viên chỉ dùng "Thay nguồn" khi muốn nguồn Google Docs/Sheets cá nhân.
// - Nguồn cá nhân V4.151 lưu riêng, không tự kế thừa các link cũ để tránh vô tình
//   ghi đè kho chuẩn của trường.
// ============================================================================
const V4151_PPCT_PERSONAL_MAP_PROPERTY = 'V4151_PPCT_PERSONAL_MAP';
const V4151_PPCT_WAREHOUSE_VERSION = '2026-08-24';
const V4151_PPCT_WAREHOUSE = {"Ngữ văn":{"subject":"Ngữ văn","title":"Phu luc I - 18.9.2025. Ke hoach day hoc - Ngu van (x).docx","kind":"Kho PPCT tích hợp","format":"Dữ liệu chuẩn của trường từ Kế hoạch dạy học 2026–2027","map":{"10":{"1":"Tri thức Ngữ văn Truyện về các vị thần sáng tạo thế giới (Thần thoại Việt Nam)","2":"Tri thức Ngữ văn Truyện về các vị thần sáng tạo thế giới (Thần thoại Việt Nam)","3":"Tản Viên từ Phán sự lục (Chuyên chức Phán sự đền Tản Viên – Nguyễn Dữ)","4":"Tản Viên từ Phán sự lục (Chuyên chức Phán sự đền Tản Viên – Nguyễn Dữ)","5":"Chữ người tử tù (Nguyễn Tuân)","6":"Chữ người tử tù (Nguyễn Tuân)","7":"Chữ người tử tù (Nguyễn Tuân)","8":"Thực hành tiếng Việt: Sử dụng từ Hán Việt","9":"Viết văn bản nghị luận phân tích, đánh giá một tác phẩm truyện","10":"Viết văn bản nghị luận phân tích, đánh giá một tác phẩm truyện","11":"Nói và nghe: Giới thiệu, đánh giá về nội dung và nghệ thuật của một tác phẩm truyện","12":"Tri thức Ngữ văn Chùm thơ hai-cư (haiku) Nhật Bản","13":"Tri thức Ngữ văn Chùm thơ hai-cư (haiku) Nhật Bản","14":"Thu hứng (Cảm xúc mùa thu – Đỗ Phủ)","15":"Thu hứng (Cảm xúc mùa thu – Đỗ Phủ)","16":"Mùa xuân chín (Hàn Mặc Tử)","17":"Bản hoà âm ngôn từ trong Tiếng thu của Lưu Trọng Lư","18":"Thực hành tiếng Việt","19":"Viết văn bản nghị luận phân tích, đánh giá một tác phẩm thơ","20":"Viết văn bản nghị luận phân tích, đánh giá một tác phẩm thơ","21":"Nói và nghe: Giới thiệu, đánh giá về nội dung và nghệ thuật của một tác phẩm thơ","22":"Tri thức Ngữ văn Hiền tài là nguyên khí của quốc gia (Trích -Thân Nhân Trung)","23":"Tri thức Ngữ văn Hiền tài là nguyên khí của quốc gia (Trích -Thân Nhân Trung)","24":"Yêu và đồng cảm (Trích – Phong Tử Khải","25":"Yêu và đồng cảm (Trích – Phong Tử Khải","26":"Kiểm tra giữa kỳ I","27":"Kiểm tra giữa kỳ I","28":"Chữ bầu lên nhà thơ (Trích – Lê Đạt)","29":"Chữ bầu lên nhà thơ (Trích – Lê Đạt)","30":"Thực hành tiếng Việt","31":"Viết bài luận thuyết phục người khác từ bỏ một thói quen hay một quan niệm","32":"Viết bài luận thuyết phục người khác từ bỏ một thói quen hay một quan niệm","33":"Viết bài luận thuyết phục người khác từ bỏ một thói quen hay một quan niệm","34":"Nói và nghe: Thảo luận về một vấn đề đời sống có ý kiến khác nhau","35":"Tri thức Ngữ văn Héc-to từ biệt Ăng-đrô-mác (Trích I-li-át – Hô-me-rơ – Hómèros)","36":"Tri thức Ngữ văn Héc-to từ biệt Ăng-đrô-mác (Trích I-li-át – Hô-me-rơ – Hómèros)","37":"Tri thức Ngữ văn Héc-to từ biệt Ăng-đrô-mác (Trích I-li-át – Hô-me-rơ – Hómèros)","38":"Đăm Săn đi bắt Nữ Thần Mặt Trời (Trích Đăm Săn – Sử thi Ê-đê)","39":"Đăm Săn đi bắt Nữ Thần Mặt Trời (Trích Đăm Săn – Sử thi Ê-đê)","40":"Thực hành TV","41":"Viết báo cáo nghiên cứu về một vấn đề","42":"Viết báo cáo nghiên cứu về một vấn đề","43":"Nói và nghe: Trình bày báo cáo kết quả nghiên cứu về một vấn đề","44":"Tri thức Ngữ văn Xuý Vân giả dại (Trích chèo Kim Nham)","45":"Tri thức Ngữ văn Xuý Vân giả dại (Trích chèo Kim Nham)","46":"Huyện đường (Trích tuồng Nghêu, Sò, Ốc, Hến)","47":"Huyện đường (Trích tuồng Nghêu, Sò, Ốc, Hến)","48":"Múa rối nước hiện địa soi bóng tiền nhân (Phạm Thùy Dung)","49":"Viết báo cáo nghiên cứu Về một vấn đề văn hoá truyền thống Việt Nam","50":"Viết báo cáo nghiên cứu Về một vấn đề văn hoá truyền thống Việt Nam","51":"Nói và nghe: Lắng nghe và phản hồi về một bài thuyết trình kết quả nghiên cứu","52":"Ôn tập KT","53":"Kiểm tra cuối kỳ","54":"Kiểm tra cuối kỳ","55":"Tác gia Nguyễn Trãi","56":"Bình Ngô đại cáo (Đại cáo bình Ngô – Nguyễn Trãi)","57":"Bình Ngô đại cáo (Đại cáo bình Ngô – Nguyễn Trãi)","58":"Bình Ngô đại cáo (Đại cáo bình Ngô – Nguyễn Trãi)","59":"Bảo kính cảnh giới, bài 43 (Gương báu răn mình, bài 43 – Nguyễn Trãi)","60":"Bảo kính cảnh giới, bài 43 (Gương báu răn mình, bài 43 – Nguyễn Trãi)","61":"Dục Thuý sơn (Núi Dục Thuý – Nguyễn Trãi)","62":"Dục Thuý sơn (Núi Dục Thuý – Nguyễn Trãi)","63":"Thực hành TV","64":"Viết văn bản nghị luận về một vấn đề xã hội","65":"Viết văn bản nghị luận về một vấn đề xã hội","66":"Nói và nghe: Thảo luận về một vấn đề xã hội có ý kiến khác nhau","67":"Tri thức Ngữ văn Người cầm quyền khôi phục uy quyền (Trích Những người khốn khổ - Vích-to Huy-gô)","68":"Tri thức Ngữ văn Người cầm quyền khôi phục uy quyền (Trích Những người khốn khổ - Vích-to Huy-gô)","69":"Tri thức Ngữ văn Người cầm quyền khôi phục uy quyền (Trích Những người khốn khổ - Vích-to Huy-gô)","70":"Dưới bóng hoàng lan (Thạch Lam)","71":"Dưới bóng hoàng lan (Thạch Lam)","72":"Một chuyện đùa nho nhỏ (An-tôn Sê-khốp – Anton Chekhov)","73":"Một chuyện đùa nho nhỏ (An-tôn Sê-khốp – Anton Chekhov)","74":"Thực hành tiếng Việt","75":"Viết bài văn nghị luận phân tích, đánh giá một tác phẩm văn học (Chủ đề và nhân vật trong tác phẩm truyện)","76":"Viết bài văn nghị luận phân tích, đánh giá một tác phẩm văn học (Chủ đề và nhân vật trong tác phẩm truyện)","77":"Nói và nghe: Thảo luận về một vấn đề văn học có ý kiến khác nhau","78":"Kiểm tra giữa kỳ","79":"Kiểm tra giữa kỳ","80":"Tri thức Ngữ văn Sự sống và cái chết (Trích Từ điển yêu thích bầu trời và các vì sao – Trịnh Xuân Thuận)","81":"Tri thức Ngữ văn Sự sống và cái chết (Trích Từ điển yêu thích bầu trời và các vì sao – Trịnh Xuân Thuận)","82":"Nghệ thuật truyền thống của người Việt (Trích Văn minh Việt Nam – Nguyễn Văn Huyên","83":"Nghệ thuật truyền thống của người Việt (Trích Văn minh Việt Nam – Nguyễn Văn Huyên","84":"Phục hồi tầng ozone: Thành công hiếm hoi của nỗ lực toàn cầu (Lê My)","85":"Phục hồi tầng ozone: Thành công hiếm hoi của nỗ lực toàn cầu (Lê My)","86":"Thực hành TV","87":"Viết một văn bản nội quy hoặc văn bản hướng dẫn nơi công cộng","88":"Viết một văn bản nội quy hoặc văn bản hướng dẫn nơi công cộng","89":"Viết một văn bản nội quy hoặc văn bản hướng dẫn nơi công cộng","90":"Nói và nghe: Thảo luận về văn bản nội quy hoặc văn bản hướng dẫn nơi công cộng","91":"Nói và nghe: Thảo luận về văn bản nội quy hoặc văn bản hướng dẫn nơi công cộng","92":"Về chính chúng ta (Trích 7 bài học hay nhất về vật lí – Các-lô Rô-ve-li – Carlo Rovelli)","93":"Về chính chúng ta (Trích 7 bài học hay nhất về vật lí – Các-lô Rô-ve-li – Carlo Rovelli)","94":"Con đường không chọn (Rô-bớt Phờ-rót – Robert Frost)","95":"Con đường không chọn (Rô-bớt Phờ-rót – Robert Frost)","96":"Một đời như kẻ tìm đường (Trích – Phan Văn Trường)","97":"Một đời như kẻ tìm đường (Trích – Phan Văn Trường)","98":"Thực hành TV","99":"Viết bài luận về bản thân","100":"Viết bài luận về bản thân","101":"Nói và nghe: Thuyết trình về một vấn đề xã hội có sử dụng kết hợp phương tiện ngôn ngữ và phương tiện phi ngôn ngữ","102":"Ôn tập KT CK","103":"Ôn tập KT CK","104":"Kiểm tra cuối kỳ","105":"Kiểm tra cuối kỳ"},"11":{"1":"Tri thức Ngữ văn Đọc: VB1: Vợ nhặt (Trích)","2":"Tri thức Ngữ văn Đọc: VB1: Vợ nhặt (Trích)","3":"Tri thức Ngữ văn Đọc: VB1: Vợ nhặt (Trích)","4":"Tri thức Ngữ văn Đọc: VB1: Vợ nhặt (Trích)","5":"Đọc: VB 2: Chí Phèo (Trích )","6":"Đọc: VB 2: Chí Phèo (Trích )","7":"Đọc: VB 2: Chí Phèo (Trích )","8":"Thực hành tiếng Việt: Đặc điểm cơ bản của ngôn ngữ nói và ngôn ngữ viết","9":"Viết: Viết văn bản nghị luận về một tác phẩm truyện (Những đặc điểm trong cách kể của tác giả) - Hướng dẫn viết, HS làm bài tại lớp","10":"Viết: Viết văn bản nghị luận về một tác phẩm truyện (Những đặc điểm trong cách kể của tác giả) - Hướng dẫn viết, HS làm bài tại lớp","11":"Nói và nghe: Thuyết trình về nghệ thuật kể chuyện trong một tác phẩm truyện","12":"Tri thức Ngữ văn Đọc: VB 1: Nhớ đồng","13":"Tri thức Ngữ văn Đọc: VB 1: Nhớ đồng","14":"Tri thức Ngữ văn Đọc: VB 1: Nhớ đồng","15":"Đọc: VB 2: Tràng giang","16":"Đọc: VB 2: Tràng giang","17":"Đọc: VB 3: Con đường mùa đông","18":"Đọc: VB 3: Con đường mùa đông","19":"Thực hành tiếng Việt: Một số hiện tượng phá vỡ những quy tắc ngôn ngữ thông thường: đặc điểm và tác dụng","20":"Viết: Viết VB nghị luận về một tác phẩm thơ (tìm hiểu cấu tứ và hình ảnh trong tác phẩm) - Hướng dẫn viết, HS làm bài ở nhà","21":"Viết: Viết VB nghị luận về một tác phẩm thơ (tìm hiểu cấu tứ và hình ảnh trong tác phẩm) - Hướng dẫn viết, HS làm bài ở nhà","22":"Nói và nghe: Giới thiệu một tác phẩm nghệ thuật","23":"Kiểm tra giữa kỳ I","24":"Kiểm tra giữa kỳ I","25":"Đọc: VB 1: Chiếu cầu hiền (Cầu hiền chiếu)","26":"Đọc: VB 2: Tôi có một ước mơ (Trích Bước đến tự do, Câu chuyện Mon-ga-mơ-ri, Mác-tin Lu-thơ Kinh)","27":"Đọc: VB 2: Tôi có một ước mơ (Trích Bước đến tự do, Câu chuyện Mon-ga-mơ-ri, Mác-tin Lu-thơ Kinh)","28":"Đọc: VB 3: Một thời đại trong thi ca (Trích Thi nhân Việt Nam - Hoài Thanh)","29":"Đọc: VB 3: Một thời đại trong thi ca (Trích Thi nhân Việt Nam - Hoài Thanh)","30":"Thực hành tiếng Việt: Đặc điểm cơ bản của ngôn ngữ nói và ngôn ngữ viết (tiếp theo)","31":"Viết: Viết bài văn nghị luận về một vấn đề xã hội - Hướng dẫn viết, HS làm bài ở nhà","32":"Viết: Viết bài văn nghị luận về một vấn đề xã hội - Hướng dẫn viết, HS làm bài ở nhà","33":"Nói và nghe: Trình bày ý kiến đánh giá, bình luận về một vấn đề xã hội","34":"Đọc: VB 1: Lời tiễn dặn","35":"Đọc: VB 1: Lời tiễn dặn","36":"Đọc: VB 2: Dương phụ hành (Bài hành về người thiếu phụ phương Tây – Cao Bá Quát)","37":"Đọc: VB 3: Thuyền và biển (Xuân Quỳnh)","38":"Đọc: VB 3: Thuyền và biển (Xuân Quỳnh)","39":"Thực hành tiếng Việt: Lỗi về thành phần câu và cách sửa","40":"Viết: Viết bài văn nghị luận về một vấn đề xã hội","41":"Viết: Viết bài văn nghị luận về một vấn đề xã hội","42":"Nói và nghe: Thảo luận về một vấn đề trong đời sống","43":"Đọc: VB 1: Sống, hay không sống - đó là vấn đề (Trích Hăm-lét)","44":"Đọc: VB 1: Sống, hay không sống - đó là vấn đề (Trích Hăm-lét)","45":"Đọc: VB 2: Vĩnh biệt Cửu Trùng Đài","46":"Đọc: VB 2: Vĩnh biệt Cửu Trùng Đài","47":"Đọc: VB 2: Vĩnh biệt Cửu Trùng Đài","48":"Viết: Viết báo cáo nghiên cứu về một vấn đề tự nhiên, xã hội - Hướng dẫn viết, HS thực hiện báo cáo nghiên cứu ở nhà","49":"Viết: Viết báo cáo nghiên cứu về một vấn đề tự nhiên, xã hội - Hướng dẫn viết, HS thực hiện báo cáo nghiên cứu ở nhà","50":"Nói và nghe: Trình bày báo cáo kết quả nghiên cứu (Kết hợp phương tiện ngôn ngữ và phi ngôn ngữ)","51":"Ôn tập","52":"Ôn tập","53":"Kiểm tra cuối kỳ I","54":"Kiểm tra cuối kỳ I","55":"Đọc: VB 1: Tác gia Nguyễn Du","56":"Đọc: VB 1: Tác gia Nguyễn Du","57":"Đọc: VB 2: Trao duyên (Trích Truyện Kiều - Nguyễn Du)","58":"Đọc: VB 2: Trao duyên (Trích Truyện Kiều - Nguyễn Du)","59":"Đọc: VB 2: Trao duyên (Trích Truyện Kiều - Nguyễn Du)","60":"Đọc: VB 3: Độc Tiểu Thanh kí (Đọc truyện Tiểu Thanh )","61":"Đọc: VB 3: Độc Tiểu Thanh kí (Đọc truyện Tiểu Thanh )","62":"Thực hành tiếng Việt: Biện pháp tu từ lặp cấu trúc, biện pháp tu từ đối","63":"Viết: Viết văn bản thuyết minh về một tác phẩm văn học - Hướng dẫn viết, HS làm bài tại lớp","64":"Viết: Viết văn bản thuyết minh về một tác phẩm văn học - Hướng dẫn viết, HS làm bài tại lớp","65":"Viết: Viết văn bản thuyết minh về một tác phẩm văn học - Hướng dẫn viết, HS làm bài tại lớp","66":"Nói và nghe: Giới thiệu một tác phẩm văn học","67":"Đọc: VB 1: Ai đã đặt tên cho dòng sông? (Trích -HPNT)","68":"Đọc: VB 1: Ai đã đặt tên cho dòng sông? (Trích -HPNT)","69":"Đọc: VB 1: Ai đã đặt tên cho dòng sông? (Trích -HPNT)","70":"Đọc: VB 2: “Và tôi vẫn muốn mẹ…” (Trích Những nhân chứng cuối cùng - Solo cho giọng trẻ em - Xvét-la-na A-lếch-xi-ê-vích)","71":"Đọc: VB 2: “Và tôi vẫn muốn mẹ…” (Trích Những nhân chứng cuối cùng - Solo cho giọng trẻ em - Xvét-la-na A-lếch-xi-ê-vích)","72":"Đọc VB 3: Cà Mau quê xứ (Trích Uống cà phê trên đường của Vũ – Trần Tuấn)","73":"Đọc VB 3: Cà Mau quê xứ (Trích Uống cà phê trên đường của Vũ – Trần Tuấn)","74":"Thực hành tiếng Việt: Một số hiện tượng phá vỡ những quy tắc ngôn ngữ thông thường: đặc điểm và tác dụng (tiếp theo)","75":"Viết: Viết văn bản thuyết minh về một sự vật, hiện tượng trong đời sống xã hội - Hướng dẫn viết, HS làm bài ở lớp","76":"Viết: Viết văn bản thuyết minh về một sự vật, hiện tượng trong đời sống xã hội - Hướng dẫn viết, HS làm bài ở lớp","77":"Nói và nghe: Thảo luận, tranh luận về một vấn đề trong đời sống","78":"Đọc: VB 1: Nữ phóng viên đầu tiên (Trần Nhật Vy)","79":"Đọc: VB 1: Nữ phóng viên đầu tiên (Trần Nhật Vy)","80":"Kiểm tra giữa kỳ II","81":"Kiểm tra giữa kỳ II","82":"Đọc: VB 2: Trí thông minh nhân tạo (Trích 50 ý ưởng về tương lai)","83":"Đọc: VB 2: Trí thông minh nhân tạo (Trích 50 ý ưởng về tương lai)","84":"Đọc: VB 3: Pa-ra-lim-pích: Một lịch sử chữa lành những vết thương (Huy Đăng)","85":"Đọc: VB 3: Pa-ra-lim-pích: Một lịch sử chữa lành những vết thương (Huy Đăng)","86":"Thực hành tiếng Việt: Sử dụng phương tiện phi ngôn ngữ","87":"Viết: Viết văn bản thuyết minh về một sự vật, hiện tượng trong tự nhiên","88":"Viết: Viết văn bản thuyết minh về một sự vật, hiện tượng trong tự nhiên","89":"Viết: Viết văn bản thuyết minh về một sự vật, hiện tượng trong tự nhiên","90":"Nói và nghe: Tranh biện về một vấn đề trong đời sống","91":"Đọc: VB 1: Bài ca ngất ngưởng","92":"Đọc: VB 1: Bài ca ngất ngưởng","93":"Đọc: VB 2: Văn tế nghĩa sĩ Cần Giuộc (Nguyễn Đình Chiểu)","94":"Đọc: VB 2: Văn tế nghĩa sĩ Cần Giuộc (Nguyễn Đình Chiểu)","95":"Đọc: VB 2: Văn tế nghĩa sĩ Cần Giuộc (Nguyễn Đình Chiểu)","96":"Đọc: VB 3: Cộng đồng và cá thể (Trích Thế giới như tôi thấy )","97":"Đọc: VB 3: Cộng đồng và cá thể (Trích Thế giới như tôi thấy )","98":"Thực hành tiếng Việt: Cách giải thích nghĩa của từ","99":"Viết: Viết văn bản nghị luận về một tác phẩm nghệ thuật - Hướng dẫn viết, HS làm bài ở nhà","100":"Viết: Viết văn bản nghị luận về một tác phẩm nghệ thuật - Hướng dẫn viết, HS làm bài ở nhà","101":"Nói và nghe: Giới thiệu về một tác phẩm nghệ thuật (tiếp theo)","102":"Ôn tập","103":"Ôn tập","104":"Kiểm tra cuối kỳ II","105":"Kiểm tra cuối kỳ II"},"12":{"1":"Tri thức Ngữ văn, Đọc: Xuân Tóc Đỏ cứu quốc","2":"Tri thức Ngữ văn, Đọc: Xuân Tóc Đỏ cứu quốc","3":"Tri thức Ngữ văn, Đọc: Xuân Tóc Đỏ cứu quốc","4":"Đọc: Mùa lá rụng trong vườn","5":"Đọc: Mùa lá rụng trong vườn","6":"Đọc: Mùa lá rụng trong vườn","7":"THTV: Biện pháp tu từ nói mỉa, nghịch ngữ. Đặc điểm và tác dụng.","8":"Viết: Viết văn bản nghị luận so sánh, đánh giá hai tác phẩm truyện.","9":"Viết: Viết văn bản nghị luận so sánh, đánh giá hai tác phẩm truyện.","10":"Viết: Viết văn bản nghị luận so sánh, đánh giá hai tác phẩm truyện.","11":"Nói và nghe:Trình bày kết quả so sánh, đánh giá hai tác phẩm truyện.","12":"Tri thức Ngữ văn Đọc: Cảm hoài","13":"Tri thức Ngữ văn Đọc: Cảm hoài","14":"Tri thức Ngữ văn Đọc: Cảm hoài","15":"Đọc: Tây Tiến","16":"Đọc: Tây Tiến","17":"Đọc: Đàn ghi ta của Lor-ca","18":"Đọc: Đàn ghi ta của Lor-ca","19":"THTV: Tác dụng của một số biện pháp tu từ trong thơ.","20":"Viết:Viết bài văn nghị luận so sánh, đánh giá hai tác phẩm thơ.","21":"Viết:Viết bài văn nghị luận so sánh, đánh giá hai tác phẩm thơ.","22":"Nói và nghe: Trình bày kết quả so sánh, đánh giá hai tác phẩm thơ","23":"Tri thức Ngữ văn Đọc: Nhìn về vốn văn hóa dân tộc","24":"Tri thức Ngữ văn Đọc: Nhìn về vốn văn hóa dân tộc","25":"Đọc: Năng lực sáng tạo","26":"Đọc: Năng lực sáng tạo","27":"Đọc: Mấy ý nghĩ về thơ","28":"Đọc: Mấy ý nghĩ về thơ","29":"THTV: Lỗi logic, lỗi câu mơ hồ và cách sửa","30":"Viết: Viết bài văn nghị luận về một vấn đề liên quan đến tuổi trẻ (những hoài bão ước mơ).","31":"Viết: Viết bài văn nghị luận về một vấn đề liên quan đến tuổi trẻ (những hoài bão ước mơ).","32":"Kiểm tra giữa kỳ I","33":"Kiểm tra giữa kỳ I","34":"Nói và nghe: Thuyết minh về một vấn đề liên quan đến tuổi trẻ.","35":"Tri thức Ngữ văn Đọc: Hải khẩu linh từ","36":"Tri thức Ngữ văn Đọc: Hải khẩu linh từ","37":"Tri thức Ngữ văn Đọc: Hải khẩu linh từ","38":"Đọc: Muối của rừng","39":"Đọc: Muối của rừng","40":"Thực hành Tiếng Việt: Nghệ thuật sử dụng điển cố trong tác phẩm văn học","41":"Viết: Viết bài văn nghị luận về việc vay mượn - cải biến - sáng tạo trong một tác phẩm văn học","42":"Viết: Viết bài văn nghị luận về việc vay mượn - cải biến - sáng tạo trong một tác phẩm văn học","43":"Nói và nghe: Trình bày việc vay mượn - cải biến - sáng tạo trong một tác phẩm văn học","44":"Tri thức Ngữ văn Đọc: Nhân vật quan trọng","45":"Tri thức Ngữ văn Đọc: Nhân vật quan trọng","46":"Tri thức Ngữ văn Đọc: Nhân vật quan trọng","47":"Đọc: Giấu của","48":"Đọc: Giấu của","49":"Viết: Viết báo cáo nghiên cứu về một vấn đề tự nhiên, xã hội.","50":"Viết: Viết báo cáo nghiên cứu về một vấn đề tự nhiên, xã hội.","51":"Nói và nghe:Trình bày kết quả báo cáo nghiên cứu về một vấn đề tự nhiên, xã hội.","52":"Ôn tập KT","53":"Kiểm tra CK","54":"Kiểm tra CK","55":"Tri thức Ngữ văn Đọc: Tác gia Hồ Chí Minh","56":"Tri thức Ngữ văn Đọc: Tác gia Hồ Chí Minh","57":"Đọc: Tuyên ngôn độc lập","58":"Đọc: Tuyên ngôn độc lập","59":"Đọc: Mộ","60":"Đọc: Nguyên tiêu","61":"Đọc: Những trò lố hay là Va-ren và Pha Bội Châu","62":"Đọc: Những trò lố hay là Va-ren và Pha Bội Châu","63":"THTV: Một số biện pháp làm tăng tính khẳng định, phủ định trong văn bản nghị luận.","64":"Viết: Viết báo cáo kết quả của bài tập dự án.","65":"Viết: Viết báo cáo kết quả của bài tập dự án.","66":"Nói và nghe: Trình bày kết quả của bài tập dự án.","67":"Tri thức Ngữ văn Đọc: Nghệ thuật băm thịt gà","68":"Tri thức Ngữ văn Đọc: Nghệ thuật băm thịt gà","69":"Tri thức Ngữ văn Đọc: Nghệ thuật băm thịt gà","70":"Đọc: Bước vào đời","71":"Đọc: Bước vào đời","72":"Đọc: Bước vào đời","73":"Thực hành tiếng Việt: Ngôn ngữ trang trọng và ngôn ngữ thân mật","74":"Viết: Viết bài văn nghị luận về một vấn đề liên quan đến tuổi trẻ (Cách ứng xử về các mối quan hệ gia đình, xã hội).","75":"Viết: Viết bài văn nghị luận về một vấn đề liên quan đến tuổi trẻ (Cách ứng xử về các mối quan hệ gia đình, xã hội).","76":"Viết: Viết bài văn nghị luận về một vấn đề liên quan đến tuổi trẻ (Cách ứng xử về các mối quan hệ gia đình, xã hội).","77":"Nói và nghe: Trình bày một vấn đề liên quan đến tuổi trẻ (Cách ứng xử về các mối quan hệ gia đình, xã hội).","78":"Nói và nghe: Trình bày một vấn đề liên quan đến tuổi trẻ (Cách ứng xử về các mối quan hệ gia đình, xã hội).","79":"Kiểm tra giữa kỳ","80":"Kiểm tra giữa kỳ","81":"Tri thức Ngữ văn Đọc: Pa-ra-na (Parana)","82":"Tri thức Ngữ văn Đọc: Pa-ra-na (Parana)","83":"Đọc: Giáo dục khái phóng ở Việt Nam nhìn từ Đông Kinh Nghĩa Thục","84":"Đọc: Giáo dục khái phóng ở Việt Nam nhìn từ Đông Kinh Nghĩa Thục","85":"Đọc: Đời Muối","86":"Đọc: Đời Muối","87":"Viết: Viết thư trao đổi về công việc hoặc một vấn đề đáng quan tâm","88":"Viết: Viết thư trao đổi về công việc hoặc một vấn đề đáng quan tâm","89":"Viết: Viết thư trao đổi về công việc hoặc một vấn đề đáng quan tâm","90":"Nói và nghe: Tranh biện về một vấn đề trong đời sống","91":"Tri thức Ngữ văn Đọc: Xuân Diệu","92":"Tri thức Ngữ văn Đọc: Xuân Diệu","93":"Tri thức Ngữ văn Đọc: Xuân Diệu","94":"Đọc: Trở về","95":"Đọc: Trở về","96":"Đọc: Hồn Trương Ba, da hàng thịt","97":"Đọc: Hồn Trương Ba, da hàng thịt","98":"Thực hành TV: Giữ gìn và phát triển tiếng Việt","99":"Viết: Viết bài phát biểu trong lễ phát động một phong trào hoặc một hoạt động xã hội","100":"Viết: Viết bài phát biểu trong lễ phát động một phong trào hoặc một hoạt động xã hội","101":"Nói và nghe: Thuyết trình về một vấn đề xã hội có sử dụng kết hợp phương tiện ngôn ngữ và phương tiện phi ngôn ngữ","102":"Ôn tập KT CK","103":"Ôn tập KT CK","104":"Kiểm tra CK","105":"Kiểm tra CK"}},"electiveMap":{"10":{"1":"Tìm hiểu tri thức tổng quát về nghiên cứu một vấn đề VHDG.","2":"Thực hành nghiên cứu: + Chọn đề tài, vấn đề nghiên cứu. + Xác định mục tiêu, ND nghiên cứu. + Lập kế hoạch nghiên cứu.","3":"Thực hành nghiên cứu: + Chọn đề tài, vấn đề nghiên cứu. + Xác định mục tiêu, ND nghiên cứu. + Lập kế hoạch nghiên cứu.","4":"- Tìm hiểu việc viết báo cáo về một vấn đề VHDG: + Hình tượng người anh hùng trong truyện cổ dân gian VN. + Hình tượng con cò trong ca dao, dân ca VN.","5":"- Tìm hiểu việc viết báo cáo về một vấn đề VHDG: + Hình tượng người anh hùng trong truyện cổ dân gian VN. + Hình tượng con cò trong ca dao, dân ca VN.","6":"- Tìm hiểu việc viết báo cáo về một vấn đề VHDG: + Hình tượng người anh hùng trong truyện cổ dân gian VN. + Hình tượng con cò trong ca dao, dân ca VN.","7":"- Thực hành viết báo cáo nghiên cứu về một vấn đề VHDG. + Khai thác đề tài nghiên cứu.","8":"- Thực hành viết báo cáo nghiên cứu về một vấn đề VHDG. + Khai thác đề tài nghiên cứu.","9":"+ Hướng dẫn viết báo cáo nghiên cứu và thuyết trình kết quả nghiên cứu. + GV chỉnh sửa, đánh giá bài nghiên cứu cho HS.","10":"+ Hướng dẫn viết báo cáo nghiên cứu và thuyết trình kết quả nghiên cứu. + GV chỉnh sửa, đánh giá bài nghiên cứu cho HS.","11":"+ Hướng dẫn viết báo cáo nghiên cứu và thuyết trình kết quả nghiên cứu. + GV chỉnh sửa, đánh giá bài nghiên cứu cho HS.","12":"+ Hướng dẫn viết báo cáo nghiên cứu và thuyết trình kết quả nghiên cứu. + GV chỉnh sửa, đánh giá bài nghiên cứu cho HS.","13":"+ Hướng dẫn viết báo cáo nghiên cứu và thuyết trình kết quả nghiên cứu. + GV chỉnh sửa, đánh giá bài nghiên cứu cho HS.","14":"+ Hướng dẫn viết báo cáo nghiên cứu và thuyết trình kết quả nghiên cứu. + GV chỉnh sửa, đánh giá bài nghiên cứu cho HS.","15":"+ Hướng dẫn tự học: Vb1: Đặc tính mở của văn bản tác phẩm văn học dân gian.","16":"Tác phẩm văn học và sân khấu hóa tác phẩm văn học","17":"Quy trình tiến hành sân khấu hóa một tác phẩm văn học","18":"Kịch bản sân khấu và sự khác biệt giữa ngôn ngữ trong văn bản văn học với ngôn ngữ trong văn bản sân khấu","19":"Cách nhập vai, diễn xuất, thực hành sân khấu khóa tác phẩm văn học","20":"Cách nhập vai, diễn xuất, thực hành sân khấu khóa tác phẩm văn học","21":"Cách nhập vai, diễn xuất, thực hành sân khấu khóa tác phẩm văn học","22":"Biểu diễn","23":"Biểu diễn","24":"Biểu diễn","25":"Biểu diễn","26":"Phương pháp đọc một tập thơ và Phương pháp đọc một tập truyện ngắn","27":"Phương pháp đọc một tập thơ và Phương pháp đọc một tập truyện ngắn","28":"Đọc tập thơ: Quốc âm thi tập","29":"Đọc tập thơ: Quốc âm thi tập","30":"Đọc tập truyện ngắn Nắng trong vườn","31":"Đọc tập truyện ngắn Nắng trong vườn","32":"Cách viết bài giới thiệu một tập thơ","33":"Cách viết bài giới thiệu một tập truyện ngắn","34":"Yêu cầu, Trình bày, giới thiệu tập thơ Quốc âm thi tập","35":"Yêu cầu, Trình bày, giới thiệu tập truyện ngắn Nắng trong vườn"},"11":{"1":"Phần 1: Tập nghiên cứu về một vấn đề văn học trung đại Việt Nam","2":"Phần 1: Tập nghiên cứu về một vấn đề văn học trung đại Việt Nam","3":"Phần 1: Tập nghiên cứu về một vấn đề văn học trung đại Việt Nam","4":"Phần 1: Tập nghiên cứu về một vấn đề văn học trung đại Việt Nam","5":"Phần 1: Tập nghiên cứu về một vấn đề văn học trung đại Việt Nam","6":"Phần 2: Viết báo cáo về một vấn đề văn học trung đại Việt Nam","7":"Phần 2: Viết báo cáo về một vấn đề văn học trung đại Việt Nam","8":"Phần 2: Viết báo cáo về một vấn đề văn học trung đại Việt Nam","9":"Phần 2: Viết báo cáo về một vấn đề văn học trung đại Việt Nam","10":"Phần 2: Viết báo cáo về một vấn đề văn học trung đại Việt Nam","11":"Phần 1: Bản chất xã hội – văn hóa của ngôn ngữ","12":"Phần 1: Bản chất xã hội – văn hóa của ngôn ngữ","13":"Phần 1: Bản chất xã hội – văn hóa của ngôn ngữ","14":"Phần 1: Bản chất xã hội – văn hóa của ngôn ngữ","15":"Phần 1: Bản chất xã hội – văn hóa của ngôn ngữ","16":"Phần 2: Sự phát triển của ngôn ngữ trong đời sống xã hội","17":"Phần 2: Sự phát triển của ngôn ngữ trong đời sống xã hội","18":"Phần 2: Sự phát triển của ngôn ngữ trong đời sống xã hội","19":"Phần 2: Sự phát triển của ngôn ngữ trong đời sống xã hội","20":"Phần 2: Sự phát triển của ngôn ngữ trong đời sống xã hội","21":"Phần 3: Vận dụng các yếu tố mới của ngôn ngữ trong giao tiếp","22":"Phần 3: Vận dụng các yếu tố mới của ngôn ngữ trong giao tiếp","23":"Phần 3: Vận dụng các yếu tố mới của ngôn ngữ trong giao tiếp","24":"Phần 3: Vận dụng các yếu tố mới của ngôn ngữ trong giao tiếp","25":"Phần 3: Vận dụng các yếu tố mới của ngôn ngữ trong giao tiếp","26":"Phần 1: Đọc về một tác giả văn học","27":"Phần 1: Đọc về một tác giả văn học","28":"Phần 1: Đọc về một tác giả văn học","29":"Phần 2: Viết về một tác giả văn học","30":"Phần 2: Viết về một tác giả văn học","31":"Phần 2: Viết về một tác giả văn học","32":"Phần 2: Viết về một tác giả văn học","33":"Phần 3: Thuyết trình về một tác giả văn học","34":"Phần 3: Thuyết trình về một tác giả văn học","35":"Phần 3: Thuyết trình về một tác giả văn học"},"12":{"1":"- Tìm hiểu tri thức tổng quát - Phần 1: Tìm hiểu một số hưởng nghiên cứu văn học hiện đại.","2":"- Tìm hiểu tri thức tổng quát - Phần 1: Tìm hiểu một số hưởng nghiên cứu văn học hiện đại.","3":"- Tìm hiểu tri thức tổng quát - Phần 1: Tìm hiểu một số hưởng nghiên cứu văn học hiện đại.","4":"Phần 2: Viết báo cáo nghiên cứu về một vấn đề văn học hiện đại","5":"Phần 2: Viết báo cáo nghiên cứu về một vấn đề văn học hiện đại","6":"Phần 2: Viết báo cáo nghiên cứu về một vấn đề văn học hiện đại","7":"Phần 2: Viết báo cáo nghiên cứu về một vấn đề văn học hiện đại","8":"Phần 2: Viết báo cáo nghiên cứu về một vấn đề văn học hiện đại","9":"Phần 3. Thuyết trình về kết quả của báo cáo nghiên cứu","10":"Phần 3. Thuyết trình về kết quả của báo cáo nghiên cứu","11":"- Tìm hiểu tri thức tổng quát - Phần 1. Thưởng thức một tác phẩm nghệ thuật được chuyển thể từ văn học","12":"- Tìm hiểu tri thức tổng quát - Phần 1. Thưởng thức một tác phẩm nghệ thuật được chuyển thể từ văn học","13":"- Tìm hiểu tri thức tổng quát - Phần 1. Thưởng thức một tác phẩm nghệ thuật được chuyển thể từ văn học","14":"- Tìm hiểu tri thức tổng quát - Phần 1. Thưởng thức một tác phẩm nghệ thuật được chuyển thể từ văn học","15":"- Tìm hiểu tri thức tổng quát - Phần 1. Thưởng thức một tác phẩm nghệ thuật được chuyển thể từ văn học","16":"Phần 2. Viết bài phân tích, giới thiệu và thuyết trình về một tác phẩm nghệ thuật được chuyển thể từ văn học","17":"Phần 2. Viết bài phân tích, giới thiệu và thuyết trình về một tác phẩm nghệ thuật được chuyển thể từ văn học","18":"Phần 2. Viết bài phân tích, giới thiệu và thuyết trình về một tác phẩm nghệ thuật được chuyển thể từ văn học","19":"Phần 2. Viết bài phân tích, giới thiệu và thuyết trình về một tác phẩm nghệ thuật được chuyển thể từ văn học","20":"Phần 3. Thực hành chuyển thể tác phẩm văn học","21":"Phần 3. Thực hành chuyển thể tác phẩm văn học","22":"Phần 3. Thực hành chuyển thể tác phẩm văn học","23":"Phần 3. Thực hành chuyển thể tác phẩm văn học","24":"Phần 3. Thực hành chuyển thể tác phẩm văn học","25":"Phần 3. Thực hành chuyển thể tác phẩm văn học","26":"Tri thức tổng quát Phần 1: Tìm hiểu cách nghiên cứu phong cách sáng tác của một trường phải văn học","27":"Tri thức tổng quát Phần 1: Tìm hiểu cách nghiên cứu phong cách sáng tác của một trường phải văn học","28":"Tri thức tổng quát Phần 1: Tìm hiểu cách nghiên cứu phong cách sáng tác của một trường phải văn học","29":"Phần 2: Viết bài giới thiệu về phong cách sáng tác của một trường phải văn học được thể hiện qua những tác phẩm cụ thể","30":"Phần 2: Viết bài giới thiệu về phong cách sáng tác của một trường phải văn học được thể hiện qua những tác phẩm cụ thể","31":"Phần 2: Viết bài giới thiệu về phong cách sáng tác của một trường phải văn học được thể hiện qua những tác phẩm cụ thể","32":"Phần 3: Phần 3. Thuyết trình về phong cách sáng tác của một trường phái văn học","33":"Phần 3: Phần 3. Thuyết trình về phong cách sáng tác của một trường phái văn học","34":"Phần 3: Phần 3. Thuyết trình về phong cách sáng tác của một trường phái văn học","35":"Phần 3: Phần 3. Thuyết trình về phong cách sáng tác của một trường phái văn học"}},"warnings":[],"gradeCounts":{"10":105,"11":105,"12":105},"electiveGradeCounts":{"10":35,"11":35,"12":35},"regularEntries":315,"electiveEntries":105,"entries":420,"warningCount":0,"modes":["direct","duration"],"criticalWarningCount":0,"partial":false,"criticalWarnings":[]},"Lịch sử":{"subject":"Lịch sử","title":"Phụ lục I - Ke hoach day hoc - Lich su (x).docx","kind":"Kho PPCT tích hợp","format":"Dữ liệu chuẩn của trường từ Kế hoạch dạy học 2026–2027","map":{"10":{"1":"Bài 1: Hiện thực lịch sử và lịch sử được con người nhận thức","2":"Bài 1: Hiện thực lịch sử và lịch sử được con người nhận thức","3":"Bài 2: Tri thức Lịch sử và cuộc sống","4":"Thực hành chủ đề 1","5":"Bài 3. Vai trò của sử học","6":"Bài 3. Vai trò của sử học","7":"Thực hành CĐ 2","8":"Bài 4: Khái niệm văn minh. Một số nền văn minh phương Đông thời cổ-trung đại","9":"Bài 4: Khái niệm văn minh. Một số nền văn minh phương Đông thời cổ-trung đại","10":"Bài 4: Khái niệm văn minh. Một số nền văn minh phương Đông thời cổ-trung đại","11":"Bài 5: Một số nền văn minh phương Tây thời cổ-trung đại","12":"Bài 5: Một số nền văn minh phương Tây thời cổ-trung đại","13":"Thực hành CĐ 3","14":"Bài 6: Cách mạng công nghiệp thời cận đại.","15":"Bài 6: Cách mạng công nghiệp thời cận đại.","16":"Bài 6: Cách mạng công nghiệp thời cận đại.","17":"Bài 7: Cách mạng công nghiệp thời hiện đại.","18":"Bài 7: Cách mạng công nghiệp thời hiện đại.","19":"Bài 7: Cách mạng công nghiệp thời hiện đại.","20":"Kiểm tra giữa kì 1","21":"Thực hành CĐ 4","22":"Bài 8: Hành trình phát triển và thành tựu của văn minh Đông Nam Á thời cổ - trung đại","23":"Bài 8: Hành trình phát triển và thành tựu của văn minh Đông Nam Á thời cổ - trung đại","24":"Bài 8: Hành trình phát triển và thành tựu của văn minh Đông Nam Á thời cổ - trung đại","25":"Thực hành CĐ 5","26":"Bài 9. Một số nền văn minh cổ trên đất nước Việt Nam","27":"Bài 9. Một số nền văn minh cổ trên đất nước Việt Nam","28":"Bài 9. Một số nền văn minh cổ trên đất nước Việt Nam","29":"Bài 9. Một số nền văn minh cổ trên đất nước Việt Nam","30":"Bài 9. Một số nền văn minh cổ trên đất nước Việt Nam","31":"Bài 9. Một số nền văn minh cổ trên đất nước Việt Nam","32":"Bài 10: Văn minh Đại Việt","33":"Bài 10: Văn minh Đại Việt","34":"Bài 10: Văn minh Đại Việt","35":"Ôn tập cuối kì 1","36":"Kiểm tra cuối học kỳ 1","37":"Bài 10: Văn minh Đại Việt","38":"Bài 10: Văn minh Đại Việt","39":"Bài 10: Văn minh Đại Việt","40":"Thực hành CĐ 6","41":"Thực hành CĐ 6","42":"Thực hành CĐ 6","43":"Bài 11. Các dân tộc trên đất nước Việt Nam","44":"Bài 12. Khái quát về đời sống vật chất và tinh thần của cộng đồng các dân tộc Việt Nam","45":"Kiểm tra giữa kì 2","46":"Bài 12. Khái quát về đời sống vật chất và tinh thần của cộng đồng các dân tộc Việt Nam","47":"Bài 13: Khối đại đoàn kết dân tộc trong lịch sử Việt Nam","48":"Bài 13: Khối đại đoàn kết dân tộc trong lịch sử Việt Nam","49":"Bài 13: Khối đại đoàn kết dân tộc trong lịch sử Việt Nam","50":"Thực hành CĐ 7","51":"Thực hành CĐ 7","52":"Kiểm tra cuối kì 2"},"11":{"1":"Bài 1: Một số vấn đề chung về cách mạng tư sản","2":"Bài 1: Một số vấn đề chung về cách mạng tư sản","3":"Bài 1: Một số vấn đề chung về cách mạng tư sản","4":"Bài 2: Sự xác lập và phát triển của chủ nghĩa tư bản","5":"Bài 2: Sự xác lập và phát triển của chủ nghĩa tư bản","6":"Bài 2: Sự xác lập và phát triển của chủ nghĩa tư bản","7":"Thực hành chủ đề 1","8":"Bài 3. Sự hình thành Liên bang Cộng hoà xã hội chủ nghĩa Xô Viết","9":"Bài 3. Sự hình thành Liên bang Cộng hoà xã hội chủ nghĩa Xô Viết","10":"Bài 4. Sự phát triển của chủ nghĩa xã hội từ sau Chiến tranh thế giới thứ hai đến nay","11":"Bài 4. Sự phát triển của chủ nghĩa xã hội từ sau Chiến tranh thế giới thứ hai đến nay","12":"Thực hành chủ đề 2","13":"Bài 5: Quá trình xâm lược và cai trị của chủ nghĩa thực dân ở Đông Nam Á.","14":"Bài 5: Quá trình xâm lược và cai trị của chủ nghĩa thực dân ở Đông Nam Á.","15":"Bài 6: Hành trình đi đến độc lập dân tộc ở Đông Nam Á.","16":"Bài 6: Hành trình đi đến độc lập dân tộc ở Đông Nam Á.","17":"Thực hành chủ đề 3","18":"Ôn tập kiểm tra giữa kì 1","19":"Kiểm tra giữa học kì 1","20":"Bài 7: Khái quát về chiến tranh bảo vệ Tổ quốc trong lịch sử Việt Nam.","21":"Bài 7: Khái quát về chiến tranh bảo vệ Tổ quốc trong lịch sử Việt Nam.","22":"Bài 7: Khái quát về chiến tranh bảo vệ Tổ quốc trong lịch sử Việt Nam.","23":"Bài 7: Khái quát về chiến tranh bảo vệ Tổ quốc trong lịch sử Việt Nam.","24":"Bài 8: Một số cuộc khởi nghĩa và chiến tranh giải phóng trong lịch sử Việt Nam (từ TK III TCN đến cuối TK XIX).","25":"Bài 8: Một số cuộc khởi nghĩa và chiến tranh giải phóng trong lịch sử Việt Nam (từ TK III TCN đến cuối TK XIX).","26":"Bài 8: Một số cuộc khởi nghĩa và chiến tranh giải phóng trong lịch sử Việt Nam (từ TK III TCN đến cuối TK XIX).","27":"Bài 8: Một số cuộc khởi nghĩa và chiến tranh giải phóng trong lịch sử Việt Nam (từ TK III TCN đến cuối TK XIX).","28":"Thực hành chủ đề 4","29":"Thực hành chủ đề 4","30":"Thực hành chủ đề 4","31":"Bài 9. Cuộc cải cách của Hồ Quý Ly và triều Hồ (đầu thế kỉ XV).","32":"Bài 9. Cuộc cải cách của Hồ Quý Ly và triều Hồ (đầu thế kỉ XV).","33":"Ôn tập kiểm tra cuối học kì 1","34":"Kiểm tra cuối học kì 1","35":"Bài 10. Cuộc cải cách của Lê Thánh Tông (thế kỉ XV)","36":"Bài 10. Cuộc cải cách của Lê Thánh Tông (thế kỉ XV)","37":"Bài 11. Cuộc cải cách của Minh Mạng (nửa đầu TK XIX)","38":"Bài 11. Cuộc cải cách của Minh Mạng (nửa đầu TK XIX)","39":"Thực hành chủ đề 5","40":"Thực hành chủ đề 5","41":"Ôn tập kiểm tra giữa học kì 2","42":"Kiểm tra giữa học kì 2","43":"Bài 12. Vị trí và tầm quan trọng của Biển Đông.","44":"Bài 12. Vị trí và tầm quan trọng của Biển Đông.","45":"Bài 13. Việt Nam và Biển Đông","46":"Bài 13. Việt Nam và Biển Đông","47":"Bài 13. Việt Nam và Biển Đông","48":"Bài 13. Việt Nam và Biển Đông","49":"Thực hành chủ đề 6","50":"Thực hành chủ đề 6","51":"Ôn tập kiểm tra cuối học kì 2","52":"Kiểm tra cuối học kì 2"},"12":{"1":"Bài 1: Liên hợp quốc","2":"Bài 1: Liên hợp quốc","3":"Bài 2: Trật tự thế giới trong Chiến tranh lạnh","4":"Bài 2: Trật tự thế giới trong Chiến tranh lạnh","5":"Bài 3: Trật tự thế giới sau Chiến tranh lạnh","6":"Thực hành chủ đề 1","7":"Thực hành chủ đề 1","8":"Bài 4. Sự ra đời và phát triển của Hiệp hội các quốc gia Đông Nam Á (ASEAN)","9":"Bài 4. Sự ra đời và phát triển của Hiệp hội các quốc gia Đông Nam Á (ASEAN)","10":"Bài 5. Cộng đồng ASEAN từ ý tưởng đến hiện thực","11":"Bài 5. Cộng đồng ASEAN từ ý tưởng đến hiện thực","12":"Thực hành chủ đề 2","13":"Bài 6: Cách mạng tháng Tám năm 1945","14":"Bài 6: Cách mạng tháng Tám năm 1945","15":"Kiểm tra giữa học kì I","16":"Bài 7: Cuộc kháng chiến chống thực dân Pháp (1945 – 1954)","17":"Bài 7: Cuộc kháng chiến chống thực dân Pháp (1945 – 1954)","18":"Bài 7: Cuộc kháng chiến chống thực dân Pháp (1945 – 1954)","19":"Bài 8: Cuộc kháng chiến chống Mỹ, cứu nước (1954 – 1975)","20":"Bài 8: Cuộc kháng chiến chống Mỹ, cứu nước (1954 – 1975)","21":"Bài 8: Cuộc kháng chiến chống Mỹ, cứu nước (1954 – 1975)","22":"Bài 8: Cuộc kháng chiến chống Mỹ, cứu nước (1954 – 1975)","23":"Bài 9: Đấu tranh bảo vệ Tổ quốc từ sau tháng 4 năm 1975 đến nay. Một số bài học lịch sử của các cuộc kháng chiến bảo vệ Tổ quốc từ năm 1945 đến nay.","24":"Bài 9: Đấu tranh bảo vệ Tổ quốc từ sau tháng 4 năm 1975 đến nay. Một số bài học lịch sử của các cuộc kháng chiến bảo vệ Tổ quốc từ năm 1945 đến nay.","25":"Thực hành chủ đề 3","26":"Thực hành chủ đề 3","27":"Bài 10: Khái quát về công cuộc đổi mới từ năm 1986 đến nay","28":"Bài 10: Khái quát về công cuộc đổi mới từ năm 1986 đến nay","29":"Bài 11: Thành tựu cơ bản và bài học của công cuộc Đổi mới ở Việt Nam từ năm 1986 đến nay","30":"Bài 11: Thành tựu cơ bản và bài học của công cuộc Đổi mới ở Việt Nam từ năm 1986 đến nay","31":"Thực hành chủ đề 4","32":"Thực hành chủ đề 4","33":"Bài 12: Hoạt động đối ngoại của Việt Nam trong đấu tranh giành độc lập dân tộc (từ đầu thế kỉ XX đến Cách mạng tháng Tám năm 1945)","34":"Ôn tập kiểm tra học kì 1","35":"Kiểm tra cuối học kì 1","36":"Bài 13: Hoạt động đối ngoại của Việt Nam trong kháng chiến chống Pháp (1945 - 1954) và kháng chiến chống Mỹ (1954 - 1975)","37":"Bài 13: Hoạt động đối ngoại của Việt Nam trong kháng chiến chống Pháp (1945 - 1954) và kháng chiến chống Mỹ (1954 - 1975)","38":"Bài 14: Hoạt động đối ngoại của Việt Nam từ năm 1975 đến nay","39":"Bài 14: Hoạt động đối ngoại của Việt Nam từ năm 1975 đến nay","40":"Thực hành chủ đề 5","41":"Bài 15: Khái quát cuộc đời và sự nghiệp của Hồ Chí Minh","42":"Bài 15: Khái quát cuộc đời và sự nghiệp của Hồ Chí Minh","43":"Ôn tập kiểm tra giữa kì 2","44":"Kiểm tra giữa kì 2","45":"Bài 16: Hồ Chí Minh-Anh hùng giải phóng dân tộc","46":"Bài 16: Hồ Chí Minh-Anh hùng giải phóng dân tộc","47":"Bài 16: Hồ Chí Minh-Anh hùng giải phóng dân tộc","48":"Bài 17: Dấu ấn Hồ Chí Minh trong lòng nhân dân thế giới và Việt Nam","49":"Thực hành chủ đề 6","50":"Thực hành chủ đề 6","51":"Ôn tập kiểm tra cuối học kì 2","52":"Kiểm tra cuối học kì 2"}},"electiveMap":{"10":{"1":"Chuyên đề 10.1: Các lĩnh vực của sử học","2":"Chuyên đề 10.1: Các lĩnh vực của sử học","3":"Chuyên đề 10.1: Các lĩnh vực của sử học","4":"Chuyên đề 10.1: Các lĩnh vực của sử học","5":"Chuyên đề 10.1: Các lĩnh vực của sử học","6":"Chuyên đề 10.1: Các lĩnh vực của sử học","7":"Chuyên đề 10.1: Các lĩnh vực của sử học","8":"Chuyên đề 10.1: Các lĩnh vực của sử học","9":"Chuyên đề 10.1: Các lĩnh vực của sử học","10":"Chuyên đề 10.1: Các lĩnh vực của sử học","11":"Chuyên đề 10.2: Bảo tồn và phát huy giá trị di sản văn hóa ở Việt Nam","12":"Chuyên đề 10.2: Bảo tồn và phát huy giá trị di sản văn hóa ở Việt Nam","13":"Chuyên đề 10.2: Bảo tồn và phát huy giá trị di sản văn hóa ở Việt Nam","14":"Chuyên đề 10.2: Bảo tồn và phát huy giá trị di sản văn hóa ở Việt Nam","15":"Chuyên đề 10.2: Bảo tồn và phát huy giá trị di sản văn hóa ở Việt Nam","16":"Chuyên đề 10.2: Bảo tồn và phát huy giá trị di sản văn hóa ở Việt Nam","17":"Chuyên đề 10.2: Bảo tồn và phát huy giá trị di sản văn hóa ở Việt Nam","18":"Chuyên đề 10.2: Bảo tồn và phát huy giá trị di sản văn hóa ở Việt Nam","19":"Chuyên đề 10.2: Bảo tồn và phát huy giá trị di sản văn hóa ở Việt Nam","20":"Chuyên đề 10.2: Bảo tồn và phát huy giá trị di sản văn hóa ở Việt Nam","21":"Chuyên đề 10.2: Bảo tồn và phát huy giá trị di sản văn hóa ở Việt Nam","22":"Chuyên đề 10.2: Bảo tồn và phát huy giá trị di sản văn hóa ở Việt Nam","23":"Chuyên đề 10.2: Bảo tồn và phát huy giá trị di sản văn hóa ở Việt Nam","24":"Chuyên đề 10.2: Bảo tồn và phát huy giá trị di sản văn hóa ở Việt Nam","25":"Chuyên đề 10.2: Bảo tồn và phát huy giá trị di sản văn hóa ở Việt Nam","26":"Chuyên đề 3. Nhà nước và pháp luật trong lịch sử Việt Nam","27":"Chuyên đề 3. Nhà nước và pháp luật trong lịch sử Việt Nam","28":"Chuyên đề 3. Nhà nước và pháp luật trong lịch sử Việt Nam","29":"Chuyên đề 3. Nhà nước và pháp luật trong lịch sử Việt Nam","30":"Chuyên đề 3. Nhà nước và pháp luật trong lịch sử Việt Nam","31":"Chuyên đề 3. Nhà nước và pháp luật trong lịch sử Việt Nam","32":"Chuyên đề 3. Nhà nước và pháp luật trong lịch sử Việt Nam","33":"Chuyên đề 3. Nhà nước và pháp luật trong lịch sử Việt Nam","34":"Chuyên đề 3. Nhà nước và pháp luật trong lịch sử Việt Nam","35":"Chuyên đề 3. Nhà nước và pháp luật trong lịch sử Việt Nam"},"11":{"1":"Chuyên đề 1: Lịch sử nghệ thuật truyền thống Việt Nam","2":"Chuyên đề 1: Lịch sử nghệ thuật truyền thống Việt Nam","3":"Chuyên đề 1: Lịch sử nghệ thuật truyền thống Việt Nam","4":"Chuyên đề 1: Lịch sử nghệ thuật truyền thống Việt Nam","5":"Chuyên đề 1: Lịch sử nghệ thuật truyền thống Việt Nam","6":"Chuyên đề 1: Lịch sử nghệ thuật truyền thống Việt Nam","7":"Chuyên đề 1: Lịch sử nghệ thuật truyền thống Việt Nam","8":"Chuyên đề 1: Lịch sử nghệ thuật truyền thống Việt Nam","9":"Chuyên đề 1: Lịch sử nghệ thuật truyền thống Việt Nam","10":"Chuyên đề 1: Lịch sử nghệ thuật truyền thống Việt Nam","11":"Chuyên đề 1: Lịch sử nghệ thuật truyền thống Việt Nam","12":"Chuyên đề 1: Lịch sử nghệ thuật truyền thống Việt Nam","13":"Chuyên đề 1: Lịch sử nghệ thuật truyền thống Việt Nam","14":"Chuyên đề 1: Lịch sử nghệ thuật truyền thống Việt Nam","15":"Chuyên đề 1: Lịch sử nghệ thuật truyền thống Việt Nam","16":"Chuyên đề 2: Chiến tranh và hòa bình trong thế kỉ XX","17":"Chuyên đề 2: Chiến tranh và hòa bình trong thế kỉ XX","18":"Chuyên đề 2: Chiến tranh và hòa bình trong thế kỉ XX","19":"Chuyên đề 2: Chiến tranh và hòa bình trong thế kỉ XX","20":"Chuyên đề 2: Chiến tranh và hòa bình trong thế kỉ XX","21":"Chuyên đề 2: Chiến tranh và hòa bình trong thế kỉ XX","22":"Chuyên đề 2: Chiến tranh và hòa bình trong thế kỉ XX","23":"Chuyên đề 2: Chiến tranh và hòa bình trong thế kỉ XX","24":"Chuyên đề 2: Chiến tranh và hòa bình trong thế kỉ XX","25":"Chuyên đề 2: Chiến tranh và hòa bình trong thế kỉ XX","26":"Chuyên đề 3. Danh nhân trong lịch sử Việt Nam","27":"Chuyên đề 3. Danh nhân trong lịch sử Việt Nam","28":"Chuyên đề 3. Danh nhân trong lịch sử Việt Nam","29":"Chuyên đề 3. Danh nhân trong lịch sử Việt Nam","30":"Chuyên đề 3. Danh nhân trong lịch sử Việt Nam","31":"Chuyên đề 3. Danh nhân trong lịch sử Việt Nam","32":"Chuyên đề 3. Danh nhân trong lịch sử Việt Nam","33":"Chuyên đề 3. Danh nhân trong lịch sử Việt Nam","34":"Chuyên đề 3. Danh nhân trong lịch sử Việt Nam","35":"Chuyên đề 3. Danh nhân trong lịch sử Việt Nam"},"12":{"1":"Chuyên đề 1. Lịch sử tín ngưỡng và tôn giáo ở Việt Nam","2":"Chuyên đề 1. Lịch sử tín ngưỡng và tôn giáo ở Việt Nam","3":"Chuyên đề 1. Lịch sử tín ngưỡng và tôn giáo ở Việt Nam","4":"Chuyên đề 1. Lịch sử tín ngưỡng và tôn giáo ở Việt Nam","5":"Chuyên đề 1. Lịch sử tín ngưỡng và tôn giáo ở Việt Nam","6":"Chuyên đề 1. Lịch sử tín ngưỡng và tôn giáo ở Việt Nam","7":"Chuyên đề 1. Lịch sử tín ngưỡng và tôn giáo ở Việt Nam","8":"Chuyên đề 1. Lịch sử tín ngưỡng và tôn giáo ở Việt Nam","9":"Chuyên đề 1. Lịch sử tín ngưỡng và tôn giáo ở Việt Nam","10":"Chuyên đề 1. Lịch sử tín ngưỡng và tôn giáo ở Việt Nam","11":"Chuyên đề 1. Lịch sử tín ngưỡng và tôn giáo ở Việt Nam","12":"Chuyên đề 1. Lịch sử tín ngưỡng và tôn giáo ở Việt Nam","13":"Chuyên đề 1. Lịch sử tín ngưỡng và tôn giáo ở Việt Nam","14":"Chuyên đề 1. Lịch sử tín ngưỡng và tôn giáo ở Việt Nam","15":"Chuyên đề 1. Lịch sử tín ngưỡng và tôn giáo ở Việt Nam","16":"Chuyên đề 2: Nhật Bản: Hành trình lịch sử từ năm 1945 đến nay","17":"Chuyên đề 2: Nhật Bản: Hành trình lịch sử từ năm 1945 đến nay","18":"Chuyên đề 2: Nhật Bản: Hành trình lịch sử từ năm 1945 đến nay","19":"Chuyên đề 2: Nhật Bản: Hành trình lịch sử từ năm 1945 đến nay","20":"Chuyên đề 2: Nhật Bản: Hành trình lịch sử từ năm 1945 đến nay","21":"Chuyên đề 2: Nhật Bản: Hành trình lịch sử từ năm 1945 đến nay","22":"Chuyên đề 2: Nhật Bản: Hành trình lịch sử từ năm 1945 đến nay","23":"Chuyên đề 2: Nhật Bản: Hành trình lịch sử từ năm 1945 đến nay","24":"Chuyên đề 2: Nhật Bản: Hành trình lịch sử từ năm 1945 đến nay","25":"Chuyên đề 2: Nhật Bản: Hành trình lịch sử từ năm 1945 đến nay","26":"Chuyên đề 3. Quá trình hội nhập quốc tế của Việt Nam","27":"Chuyên đề 3. Quá trình hội nhập quốc tế của Việt Nam","28":"Chuyên đề 3. Quá trình hội nhập quốc tế của Việt Nam","29":"Chuyên đề 3. Quá trình hội nhập quốc tế của Việt Nam","30":"Chuyên đề 3. Quá trình hội nhập quốc tế của Việt Nam","31":"Chuyên đề 3. Quá trình hội nhập quốc tế của Việt Nam","32":"Chuyên đề 3. Quá trình hội nhập quốc tế của Việt Nam","33":"Chuyên đề 3. Quá trình hội nhập quốc tế của Việt Nam","34":"Chuyên đề 3. Quá trình hội nhập quốc tế của Việt Nam","35":"Chuyên đề 3. Quá trình hội nhập quốc tế của Việt Nam"}},"warnings":[],"gradeCounts":{"10":52,"11":52,"12":52},"electiveGradeCounts":{"10":35,"11":35,"12":35},"regularEntries":156,"electiveEntries":105,"entries":261,"warningCount":0,"modes":["duration"],"criticalWarningCount":0,"partial":false,"criticalWarnings":[]},"Toán":{"subject":"Toán","title":"Phu luc I - Ke hoach day hoc - Toan (x).docx","kind":"Kho PPCT tích hợp","format":"Dữ liệu chuẩn của trường từ Kế hoạch dạy học 2026–2027","map":{"10":{"1":"Bài 1. Mệnh đề","2":"Bài 1. Mệnh đề","3":"Bài 1. Mệnh đề","4":"Bài 1. Mệnh đề","5":"Bài 2. Tập hợp và các phép toán trên tập hợp","6":"Bài 2. Tập hợp và các phép toán trên tập hợp","7":"Bài 2. Tập hợp và các phép toán trên tập hợp","8":"Bài 2. Tập hợp và các phép toán trên tập hợp","9":"Bài tập cuối chương I","10":"Bài 3. Bất phương trình bậc nhất hai ẩn","11":"Bài 3. Bất phương trình bậc nhất hai ẩn","12":"Bài 4. Hệ bất phương trình bậc nhất hai ẩn","13":"Bài 4. Hệ bất phương trình bậc nhất hai ẩn","14":"Bài 4. Hệ bất phương trình bậc nhất hai ẩn","15":"Bài tập cuối chương II","16":"Bài 5. Giá trị lượng giác của một góc từ 00 đến 1800","17":"Bài 5. Giá trị lượng giác của một góc từ 00 đến 1800","18":"Bài 6. Hệ thức lượng trong tam giác","19":"Bài 6. Hệ thức lượng trong tam giác","20":"Bài 6. Hệ thức lượng trong tam giác","21":"Bài 6. Hệ thức lượng trong tam giác","22":"Bài tập cuối chương III","23":"Bài 7. Các khái niệm mở đầu","24":"Bài 7. Các khái niệm mở đầu","25":"Bài 8. Tổng và hiệu của hai vectơ","26":"Bài 8. Tổng và hiệu của hai vectơ","27":"Bài 9. Tích của một vectơ với một số","28":"Ôn tập giữa HK1","29":"Ôn tập kiểm tra giữa HK1","30":"Ôn tập kiểm tra giữa HK1","31":"Bài 9. Tích của một vectơ với một số","32":"Bài 10. Vectơ trong mặt phẳng toạ độ","33":"Bài 10. Vectơ trong mặt phẳng toạ độ","34":"Bài 10. Vectơ trong mặt phẳng toạ độ","35":"Bài 11. Tích vô hướng của hai vectơ","36":"Bài 11. Tích vô hướng của hai vectơ","37":"Bài 11. Tích vô hướng của hai vectơ","38":"Bài tập cuối chương IV","39":"Bài 12. Số gần đúng và sai số","40":"Bài 12. Số gần đúng và sai số","41":"Bài 13. Các số đặc trưng đo xu thế trung tâm","42":"Bài 13. Các số đặc trưng đo xu thế trung tâm","43":"Bài 14. Các số đặc trưng đo độ phân tán","44":"Bài 14. Các số đặc trưng đo độ phân tán","45":"Bài 14. Các số đặc trưng đo độ phân tán","46":"Ôn tập chương V","47":"Tìm hiểu một số kiến thức về tài chính","48":"Ôn tập Cuối học kì 1","49":"Ôn tập Cuối học kì 1","50":"Kiểm tra cuối học kì 1","51":"Kiểm tra cuối học kì 1","52":"Tìm hiểu một số kiến thức về tài chính","53":"Mạng xã hội: Lợi và hại","54":"Mạng xã hội: Lợi và hại","55":"Bài 15. Hàm số","56":"Bài 15. Hàm số","57":"Bài 15. Hàm số","58":"Bài 16. Hàm số bậc hai","59":"Bài 16. Hàm số bậc hai","60":"Bài 16. Hàm số bậc hai","61":"Bài 17. Dấu của tam thức bậc hai","62":"Bài 17. Dấu của tam thức bậc hai","63":"Bài 17. Dấu của tam thức bậc hai","64":"Bài 18. Phương trình quy về phương trình bậc hai","65":"Bài 18. Phương trình quy về phương trình bậc hai","66":"Bài tập cuối chương VI","67":"Bài 19. Phương trình đường thẳng","68":"Bài 19. Phương trình đường thẳng","69":"Bài 20. Vị trí tương đối giữa hai đường thẳng. Góc và khoảng cách","70":"Bài 20. Vị trí tương đối giữa hai đường thẳng. Góc và khoảng cách","71":"Bài 20. Vị trí tương đối giữa hai đường thẳng. Góc và khoảng cách","72":"Bài 21. Đường tròn trong mặt phẳng toạ độ","73":"Bài 21. Đường tròn trong mặt phẳng toạ độ","74":"Bài 22. Ba đường conic","75":"Bài 22. Ba đường conic","76":"Ôn tập giữa học kì 2","77":"Kiểm tra giữa kì II","78":"Kiểm tra giữa kì II","79":"Bài 22. Ba đường conic","80":"Bài 22. Ba đường conic","81":"Bài tập cuối chương VII","82":"Bài 23. Quy tắc đếm","83":"Bài 23. Quy tắc đếm","84":"Bài 23. Quy tắc đếm","85":"Bài 23. Quy tắc đếm","86":"Bài 24. Hoán vị, chỉnh hợp và tổ hợp","87":"Bài 24. Hoán vị, chỉnh hợp và tổ hợp","88":"Bài 24. Hoán vị, chỉnh hợp và tổ hợp","89":"Bài 24. Hoán vị, chỉnh hợp và tổ hợp","90":"Bài 25. Nhị thức Newton","91":"Bài 25. Nhị thức Newton","92":"Bài tập cuối chương VIII","93":"Bài 26. Biến cố và định nghĩa cổ điển của xác suất","94":"Bài 26. Biến cố và định nghĩa cổ điển của xác suất","95":"Bài 27. Thực hành tính xác suất theo định nghĩa cổ điển","96":"Bài 27. Thực hành tính xác suất theo định nghĩa cổ điển","97":"Bài 27. Thực hành tính xác suất theo định nghĩa cổ điển","98":"Bài tập cuối chương IX","99":"Ôn tập cuối HK2","100":"Ôn tập cuối HK2","101":"Kiểm tra cuối HK2","102":"Kiểm tra cuối HK2","103":"Một số nội dung cho hoạt động trải nghiệm hình học","104":"Một số nội dung cho hoạt động trải nghiệm hình học","105":"Ước tính số các thể trong một quần thể"},"11":{"1":"Bài 1. Giá trị lượng giác của một góc lượng giác","2":"Bài 1. Giá trị lượng giác của một góc lượng giác","3":"Bài 1. Giá trị lượng giác của một góc lượng giác","4":"Bài 2. Công thức lượng giác","5":"Bài 2. Công thức lượng giác","6":"Bài 3. Hàm số lượng giác","7":"Bài 3. Hàm số lượng giác","8":"Bài 4. Phương trình lượng giác cơ bản","9":"Bài 4. Phương trình lượng giác cơ bản","10":"Ôn tập chương 1","11":"Bài 5. Dãy số","12":"Bài 5. Dãy số","13":"Bài 6. Cấp số cộng","14":"Bài 6. Cấp số cộng","15":"Bài 7. Cấp số nhân","16":"Bài 7. Cấp số nhân","17":"Bài tập ôn tập cuối chương II","18":"Bài 8. Mẫu số liệu ghép nhóm","19":"Bài 9. Các số đặc trưng đo su thế trung tâm","20":"Bài 9. Các số đặc trưng đo su thế trung tâm","21":"Bài tập ôn tập cuối chương III","22":"Bài 10. đường thẳng và mặt phẳng trong không gian","23":"Bài 10. đường thẳng và mặt phẳng trong không gian","24":"Bài 10. đường thẳng và mặt phẳng trong không gian","25":"Bài 11. Hai đường thẳng song song","26":"Bài 11. Hai đường thẳng song song","27":"Bài 11. Hai đường thẳng song song","28":"Ôn tập giữa học kì 1","29":"Kiểm tra giữa kì 1","30":"Kiểm tra giữa kì 1","31":"Bài 12.Đường thẳng và mặt phẳng song song","32":"Bài 12.Đường thẳng và mặt phẳng song song","33":"Bài 13. Hai mặt phẳng song song","34":"Bài 13. Hai mặt phẳng song song","35":"Bài 13. Hai mặt phẳng song song","36":"Bài 13. Hai mặt phẳng song song","37":"Bài 14. Phép chiếu song song","38":"Bài 14. Phép chiếu song song","39":"Bài tập ôn tập cuối chương IV","40":"Bài 15. Giới hạn của dãy số","41":"Bài 15. Giới hạn của dãy số","42":"Bài 16. Giới hạn của hàm số","43":"Bài 16. Giới hạn của hàm số","44":"Bài 17. Hàm số liên tục","45":"Bài 17. Hàm số liên tục","46":"Bài tập ôn tập cuối chương V","47":"Một vài áp dụng của toán học trong tài chính","48":"Ôn tập cuối kì 1","49":"Ôn tập cuối kì 1","50":"Kiểm tra cuối kì 1","51":"Kiểm tra cuối kì 1","52":"Một vài áp dụng của toán học trong tài chính","53":"Lực căng mặt ngoài của nước","54":"Lực căng mặt ngoài của nước","55":"Bài 18. Lũy thừa với số mũ thực","56":"Bài 18. Lũy thừa với số mũ thực","57":"Bài 19: Lôgarit","58":"Bài 19: Lôgarit","59":"Bài 20. Hàm số mũ.Hàm số lôgarit","60":"Bài 21. Phương trình, bất phương trình mũ và lôgarit","61":"Bài 21. Phương trình, bất phương trình mũ và lôgarit","62":"Ôn tập chương VI","63":"Bài 22. Hai đường thẳng vuông góc","64":"Bài 22. Hai đường thẳng vuông góc","65":"Bài 23. Đường thẳng vuông góc với mặt phẳng","66":"Bài 23. Đường thẳng vuông góc với mặt phẳng","67":"Bài 23. Đường thẳng vuông góc với mặt phẳng","68":"Bài 24. Phép chiếu vuông góc. Góc giữa đường thẳng và mặt phẳng.","69":"Bài 24. Phép chiếu vuông góc. Góc giữa đường thẳng và mặt phẳng.","70":"Bài 25. Hai mặt phẳng vuông góc","71":"Bài 25. Hai mặt phẳng vuông góc","72":"Bài 25. Hai mặt phẳng vuông góc","73":"Bài 25. Hai mặt phẳng vuông góc","74":"Bài 26. Khoảng cách trong không gian","75":"Bài 26. Khoảng cách trong không gian","76":"Ôn tập giữa kì 2","77":"Kiểm tra giữa kì 2","78":"Kiểm tra giữa kì 2","79":"Bài 26. Khoảng cách trong không gian (t)","80":"Bài 27. Thể tích","81":"Bài 27. Thể tích","82":"Bài 27. Thể tích","83":"Ôn tập chương VII","84":"Bài 28. Biến cố hợp, biến cố giao, biến cố độc lập","85":"Bài 28. Biến cố hợp, biến cố giao, biến cố độc lập","86":"Bài 28. Biến cố hợp, biến cố giao, biến cố độc lập","87":"Bài 29. Công thức cộng xác suất","88":"Bài 29. Công thức cộng xác suất","89":"Bài 29. Công thức cộng xác suất","90":"Bài 30. Công thức nhân xác suất cho 2 biến cố độc lập.","91":"Bài 30. Công thức nhân xác suất cho 2 biến cố độc lập.","92":"Ôn tập chương VIII","93":"Bài 31. Định nghĩa và ý nghĩa của đạo hàm","94":"Bài 31. Định nghĩa và ý nghĩa của đạo hàm","95":"Bài 32. Các quy tắc tính đạo hàm","96":"Bài 32. Các quy tắc tính đạo hàm","97":"Bài 32. Các quy tắc tính đạo hàm","98":"Bài 33. Đạo hàm cấp hai","99":"Ôn tập cuối kì 2","100":"Ôn tập cuối kì 2","101":"Kiểm tra cuối học kì 2","102":"Kiểm tra cuối học kì 2","103":"Ôn tập chương IX","104":"Một vài mô hình toán học sử dụng hàm số mũ và hàm số lôgarít","105":"Hoạt động thực hàn trải nghiệm hình học"},"12":{"1":"Bài 1. Tính đơn điệu và cực trị của hàm số","2":"Bài 1. Tính đơn điệu và cực trị của hàm số","3":"Bài 1. Tính đơn điệu và cực trị của hàm số","4":"Bài 1. Tính đơn điệu và cực trị của hàm số","5":"Bài 1. Tính đơn điệu và cực trị của hàm số","6":"Bài 1. Tính đơn điệu và cực trị của hàm số","7":"Bài 2. Giá trị lớn nhất, giá trị nhỏ nhất của hàm số","8":"Bài 2. Giá trị lớn nhất, giá trị nhỏ nhất của hàm số","9":"Bài 2. Giá trị lớn nhất, giá trị nhỏ nhất của hàm số","10":"Bài 3. Đường tiệm cận của đồ thị hàm số","11":"Bài 3. Đường tiệm cận của đồ thị hàm số","12":"Bài 3. Đường tiệm cận của đồ thị hàm số","13":"Bài 4. Khảo sát và vẽ đồ thị một số hàm số cơ bản","14":"Bài 4. Khảo sát và vẽ đồ thị một số hàm số cơ bản","15":"Bài 4. Khảo sát và vẽ đồ thị một số hàm số cơ bản","16":"Bài 4. Khảo sát và vẽ đồ thị một số hàm số cơ bản","17":"Bài 4. Khảo sát và vẽ đồ thị một số hàm số cơ bản","18":"Bài 4. Khảo sát và vẽ đồ thị một số hàm số cơ bản","19":"Bài 5. Ứng dụng đạo hàm để giải quyết một số vấn đề liên quan đến thực tiễn","20":"Bài 5. Ứng dụng đạo hàm để giải quyết một số vấn đề liên quan đến thực tiễn","21":"Bài 5. Ứng dụng đạo hàm để giải quyết một số vấn đề liên quan đến thực tiễn","22":"Ôn tập chương I","23":"Ôn tập chương I","24":"Ôn tập chương I","25":"Bài 6. Vectơ và các phép toán trong không gian","26":"Bài 6. Vectơ và các phép toán trong không gian","27":"Bài 6. Vectơ và các phép toán trong không gian","28":"Ôn tập giữa HK1","29":"Kiểm tra giữa HK1","30":"Kiểm tra giữa HK1","31":"Bài 6. Vectơ và các phép toán trong không gian","32":"Bài 6. Vectơ và các phép toán trong không gian","33":"Bài 6. Vectơ và các phép toán trong không gian","34":"Bài 7. Hệ trục toạ độ trong không gian","35":"Bài 7. Hệ trục toạ độ trong không gian","36":"Bài 7. Hệ trục toạ độ trong không gian","37":"Bài 8. Biểu thức toạ độ của các phép toán vectơ","38":"Bài 8. Biểu thức toạ độ của các phép toán vectơ","39":"Bài 8. Biểu thức toạ độ của các phép toán vectơ","40":"Bài tập cuối chương II","41":"Bài tập cuối chương II","42":"Bài 9. Khoảng biến thiên và khoảng tứ phân vị","43":"Bài 10. Phương sai và độ lệch chuẩn","44":"Bài tập cuối chương III","45":"Bài tập cuối chương III","46":"- Khảo sát và vẽ đồ thị hàm số với phần mềm Geogebra.","47":"- Khảo sát và vẽ đồ thị hàm số với phần mềm Geogebra.","48":"Ôn tập cuối kì I","49":"Ôn tập cuối kì I","50":"Kiểm tra cuối kì I","51":"Kiểm tra cuối kì I","52":"Vẽ véc tơ tổng của ba véc tơ trong không gian bằng phần nềm Geogebra.","53":"Độ dài gang tay (gang tay của bạn dài bao nhiêu)","54":"Độ dài gang tay (gang tay của bạn dài bao nhiêu)","55":"Bài 11. Nguyên hàm","56":"Bài 11. Nguyên hàm","57":"Bài 11. Nguyên hàm","58":"Bài 11. Nguyên hàm","59":"Bài 11. Nguyên hàm","60":"Bài 12. Tích phân","61":"Bài 12. Tích phân","62":"Bài 12. Tích phân","63":"Bài 12. Tích phân","64":"Bài 13. Ứng dụng hình học của tích phân","65":"Bài 13. Ứng dụng hình học của tích phân","66":"Bài 13. Ứng dụng hình học của tích phân","67":"Bài 13. Ứng dụng hình học của tích phân","68":"Bài tập cuối chương IV","69":"Bài tập cuối chương IV","70":"Bài 14. Phương trình mặt phẳng","71":"Bài 14. Phương trình mặt phẳng","72":"Bài 14. Phương trình mặt phẳng","73":"Bài 14. Phương trình mặt phẳng","74":"Bài 14. Phương trình mặt phẳng","75":"Bài 14. Phương trình mặt phẳng","76":"Ôn tập GKII","77":"Kiểm tra GK II","78":"Kiểm tra GK II","79":"Bài 15. Phương trình đường thẳng trong không gian","80":"Bài 15. Phương trình đường thẳng trong không gian","81":"Bài 15. Phương trình đường thẳng trong không gian","82":"Bài 15. Phương trình đường thẳng trong không gian","83":"Bài 15. Phương trình đường thẳng trong không gian","84":"Bài 16. Công thức tính góc trong không gian","85":"Bài 16. Công thức tính góc trong không gian","86":"Bài 17. Phương trình mặt cầu","87":"Bài 17. Phương trình mặt cầu","88":"Bài 17. Phương trình mặt cầu","89":"Bài tập cuối chương V","90":"Bài tập cuối chương V","91":"Bài 18. Xác suất có điều kiện","92":"Bài 18. Xác suất có điều kiện","93":"Bài 18. Xác suất có điều kiện","94":"Bài 18. Xác suất có điều kiện","95":"Bài 19. Công thức xác suất toàn phần và công thức Bayes","96":"Bài 19. Công thức xác suất toàn phần và công thức Bayes","97":"Bài 19. Công thức xác suất toàn phần và công thức Bayes","98":"Bài 19. Công thức xác suất toàn phần và công thức Bayes","99":"Ôn tập cuối HK2","100":"Ôn tập cuối HK2","101":"Kiểm tra cuối HK2","102":"Kiểm tra cuối HK2","103":"Bài tập cuối chương VI","104":"Tính nguyên hàm và tích phân với phần mềm GeoGebra. Tính gần đúng tích phân bằng phương pháp hình thang","105":"Vẽ đồ hoạ 3D với phần mềm GeoGebra"}},"electiveMap":{"10":{"1":"Bài 1: Hệ phương trình bậc nhất 3 ẩn","2":"Bài 1: Hệ phương trình bậc nhất 3 ẩn","3":"Bài 1: Hệ phương trình bậc nhất 3 ẩn","4":"Bài 1: Hệ phương trình bậc nhất 3 ẩn","5":"Bài 1: Hệ phương trình bậc nhất 3 ẩn","6":"Bài 2. Ứng dụng của hệ phương trình bậc nhất 3 ẩn","7":"Bài 2. Ứng dụng của hệ phương trình bậc nhất 3 ẩn","8":"Bài 2. Ứng dụng của hệ phương trình bậc nhất 3 ẩn","9":"Bài 2. Ứng dụng của hệ phương trình bậc nhất 3 ẩn","10":"Bài tập cuối chuyên đề 1","11":"Bài tập cuối chuyên đề 1","12":"Bài tập cuối chuyên đề 1","13":"Bài 3: Phương pháp quy nạp toán học","14":"Bài 3: Phương pháp quy nạp toán học","15":"Bài 3: Phương pháp quy nạp toán học","16":"Bài 3: Phương pháp quy nạp toán học","17":"Bài 4: Nhị thức Newton","18":"Bài 4: Nhị thức Newton","19":"Bài 4: Nhị thức Newton","20":"Bài 4: Nhị thức Newton","21":"Bài 4: Nhị thức Newton","22":"Bài tập cuối chuyên đề 2","23":"Bài tập cuối chuyên đề 2","24":"Bài 5: Elip","25":"Bài 5: Elip","26":"Bài 5: Elip","27":"Bài 6: Hypebol","28":"Bài 6: Hypebol","29":"Bài 6: Hypebol","30":"Bài 7: Parabol","31":"Bài 7: Parabol","32":"Bài 8: Sự thống nhất giữa 3 đường Conic","33":"Bài 8: Sự thống nhất giữa 3 đường Conic","34":"Bài tập cuối chuyên đề 3.","35":"Bài tập cuối chuyên đề 3."},"11":{"1":"Bài 1: Phép biến hình","2":"Bài 2. Phép tịnh tiến","3":"Bài 2. Phép tịnh tiến","4":"Bài 3. Phép đối xứng trục","5":"Bài 3. Phép đối xứng trục","6":"Bài 4. Phép quay và phép đối xứng tâm","7":"Bài 4. Phép quay và phép đối xứng tâm","8":"Bài 5. Phép dời hình","9":"Bài 5. Phép dời hình","10":"Bài 6. Phép vị tự","11":"Bài 6. Phép vị tự","12":"Bài 7. Phép đồng dạng","13":"Bài 7. Phép đồng dạng","14":"Bài tập cuối chuyên đề 1","15":"Bài tập cuối chuyên đề 1","16":"Bài tập cuối chuyên đề 1","17":"Bài 8. Một vài khái niệm cơ bản","18":"Bài 8. Một vài khái niệm cơ bản","19":"Bài 9. Đường đi Euler và đường đi Hamilton","20":"Bài 9. Đường đi Euler và đường đi Hamilton","21":"Bài 10. Bài toán tìm đường đi tối ưu trong một vài trường hợp đơn giản","22":"Bài 10. Bài toán tìm đường đi tối ưu trong một vài trường hợp đơn giản","23":"Bài tập cuối chuyên đề 2","24":"Bài tập cuối chuyên đề 2","25":"Bài 11. Hình chiếu vuông góc và hình chiếu trục đo","26":"Bài 11. Hình chiếu vuông góc và hình chiếu trục đo","27":"Bài 11. Hình chiếu vuông góc và hình chiếu trục đo","28":"Bài 12. Bản vẽ kỹ thuật","29":"Bài 12. Bản vẽ kỹ thuật","30":"Bài 12. Bản vẽ kỹ thuật","31":"Bài tập cuối chuyên đề 3","32":"Bài tập cuối chuyên đề 3","33":"Bài tập cuối chuyên đề 3","34":"Ôn tập cả 3 chuyên đề","35":"Ôn tập và kiểm tra cả 3 chuyên đề"},"12":{"1":"Bài 1: Biến ngẫu nhiên rời rạc và các số đặc trưng","2":"Bài 1: Biến ngẫu nhiên rời rạc và các số đặc trưng","3":"Bài 1: Biến ngẫu nhiên rời rạc và các số đặc trưng","4":"Bài 1: Biến ngẫu nhiên rời rạc và các số đặc trưng","5":"Bài 1: Biến ngẫu nhiên rời rạc và các số đặc trưng","6":"Bài 2: Biến ngẫu nhiên có phân bố nhị thức và áp dụng","7":"Bài 2: Biến ngẫu nhiên có phân bố nhị thức và áp dụng","8":"Bài 2: Biến ngẫu nhiên có phân bố nhị thức và áp dụng","9":"Bài 2: Biến ngẫu nhiên có phân bố nhị thức và áp dụng","10":"Bài 2: Biến ngẫu nhiên có phân bố nhị thức và áp dụng","11":"Bài tập cuối chuyên đề 1","12":"Bài tập cuối chuyên đề 1","13":"Bài 3: Vận dụng hệ bất phương trình bậc nhất để giải quyết một số bài toán quy hoạch tuyến tính","14":"Bài 3: Vận dụng hệ bất phương trình bậc nhất để giải quyết một số bài toán quy hoạch tuyến tính","15":"Bài 3: Vận dụng hệ bất phương trình bậc nhất để giải quyết một số bài toán quy hoạch tuyến tính","16":"Bài 3: Vận dụng hệ bất phương trình bậc nhất để giải quyết một số bài toán quy hoạch tuyến tính","17":"Bài 3: Vận dụng hệ bất phương trình bậc nhất để giải quyết một số bài toán quy hoạch tuyến tính","18":"Bài 4: Vận dụng đạo hàm để giải quyết một số bài toán tối ưu","19":"Bài 4: Vận dụng đạo hàm để giải quyết một số bài toán tối ưu","20":"Bài 4: Vận dụng đạo hàm để giải quyết một số bài toán tối ưu","21":"Bài 4: Vận dụng đạo hàm để giải quyết một số bài toán tối ưu","22":"Bài 4: Vận dụng đạo hàm để giải quyết một số bài toán tối ưu","23":"Bài tập cuối chuyên đề2","24":"Bài tập cuối chuyên đề2","25":"Bài 5: Tiền tệ. Lãi suất","26":"Bài 5: Tiền tệ. Lãi suất","27":"Bài 5: Tiền tệ. Lãi suất","28":"Bài 6: Tín dụng. Vay nợ","29":"Bài 6: Tín dụng. Vay nợ","30":"Bài 6: Tín dụng. Vay nợ","31":"Bài 7: Đầu tư tài chính. Lập kế hoạch tài chính cá nhân","32":"Bài 7: Đầu tư tài chính. Lập kế hoạch tài chính cá nhân","33":"Bài 7: Đầu tư tài chính. Lập kế hoạch tài chính cá nhân","34":"Bài tập cuối chuyên đề 3 Kiểm tra chuyên đề 3","35":"Bài tập cuối chuyên đề 3 Kiểm tra chuyên đề 3"}},"warnings":["Lớp 10 chính khóa: Dòng “Ôn tập kiểm tra giữa HK1”: PPCT ghi 29,30 nhưng Số tiết 3. Giữ đúng số PPCT được ghi trực tiếp.","Lớp 11 chính khóa: Dòng “Một vài áp dụng của toán học trong tài chính”: PPCT ghi 47 nhưng Số tiết 2. Giữ đúng số PPCT được ghi trực tiếp.","Lớp 11 chính khóa: Dòng “Một vài áp dụng của toán học trong tài chính”: PPCT ghi 52 nhưng Số tiết 2. Giữ đúng số PPCT được ghi trực tiếp.","Lớp 11 chính khóa: Dòng “Bài 26. Khoảng cách trong không gian”: PPCT ghi 74,75 nhưng Số tiết 3. Giữ đúng số PPCT được ghi trực tiếp.","Lớp 11 chính khóa: Dòng “Ôn tập cuối kì 2”: PPCT ghi 99,100 nhưng Số tiết 1. Giữ đúng số PPCT được ghi trực tiếp.","Lớp 12 chính khóa: Dòng “Bài tập cuối chương VI”: PPCT ghi 103 nhưng Số tiết 2. Giữ đúng số PPCT được ghi trực tiếp."],"gradeCounts":{"10":105,"11":105,"12":105},"electiveGradeCounts":{"10":35,"11":35,"12":35},"regularEntries":315,"electiveEntries":105,"entries":420,"warningCount":6,"modes":["direct"],"criticalWarningCount":0,"partial":false,"criticalWarnings":[]},"Tiếng Anh":{"subject":"Tiếng Anh","title":"Phu luc I - Ke hoach day hoc - Tieng Anh (x).docx","kind":"Kho PPCT tích hợp","format":"Dữ liệu chuẩn của trường từ Kế hoạch dạy học 2026–2027","map":{"10":{"1":"UNIT 1 FAMILY LIFE – Getting started","2":"UNIT 1 FAMILY LIFE – Language","3":"UNIT 1 FAMILY LIFE – Reading","4":"UNIT 1 FAMILY LIFE – Speaking","5":"UNIT 1 FAMILY LIFE – Listening","6":"UNIT 1 FAMILY LIFE – Writing","7":"UNIT 1 FAMILY LIFE – Communication & Culture","8":"UNIT 1 FAMILY LIFE – Looking back & project","9":"UNIT 2 HUMANS AND THE ENVIRONMENT – Getting started","10":"UNIT 2 HUMANS AND THE ENVIRONMENT – Language","11":"UNIT 2 HUMANS AND THE ENVIRONMENT – Reading","12":"UNIT 2 HUMANS AND THE ENVIRONMENT – Speaking","13":"UNIT 2 HUMANS AND THE ENVIRONMENT – Listening","14":"UNIT 2 HUMANS AND THE ENVIRONMENT – Writing","15":"UNIT 2 HUMANS AND THE ENVIRONMENT – Communication & Culture","16":"UNIT 2 HUMANS AND THE ENVIRONMENT – Looking back & project","17":"UNIT 3 MUSIC – Getting started","18":"UNIT 3 MUSIC – Language","19":"UNIT 3 MUSIC – Reading","20":"UNIT 3 MUSIC – Speaking","21":"UNIT 3 MUSIC – Listening","22":"UNIT 3 MUSIC – Writing","23":"UNIT 3 MUSIC – Communication & Culture","24":"UNIT 3 MUSIC – Looking back & project","25":"REVIEW 1 – Language","26":"REVIEW 1 – Skills","27":"REVIEW 1 – Further practice","28":"Mid-term test","29":"UNIT 4 FOR A BETTER COMMUNITY – Getting started","30":"UNIT 4 FOR A BETTER COMMUNITY – Language","31":"UNIT 4 FOR A BETTER COMMUNITY – Reading","32":"UNIT 4 FOR A BETTER COMMUNITY – Speaking","33":"UNIT 4 FOR A BETTER COMMUNITY – Listening","34":"UNIT 4 FOR A BETTER COMMUNITY – Writing","35":"UNIT 4 FOR A BETTER COMMUNITY – Communication & Culture","36":"UNIT 4 FOR A BETTER COMMUNITY – Looking back & project","37":"Correcting the mid-term test","38":"UNIT 5 INVENTIONS – Getting started","39":"UNIT 5 INVENTIONS – Language 1","40":"UNIT 5 INVENTIONS – Language 2","41":"UNIT 5 INVENTIONS – Reading","42":"UNIT 5 INVENTIONS – Speaking","43":"UNIT 5 INVENTIONS – Listening","44":"UNIT 5 INVENTIONS – Writing","45":"UNIT 5 INVENTIONS – Communication & Culture","46":"UNIT 5 INVENTIONS – Looking back & project","47":"REVIEW 2 – Language","48":"REVIEW 2 – Skills","49":"Revision (1)","50":"Revision (2)","51":"Revision (3)","52":"1st Term Speaking test 1","53":"1st Term Speaking test 2","54":"The first term exam","55":"UNIT 6 GENDER EQUALITY – Getting started","56":"UNIT 6 GENDER EQUALITY – Language","57":"UNIT 6 GENDER EQUALITY – Reading","58":"UNIT 6 GENDER EQUALITY – Speaking","59":"UNIT 6 GENDER EQUALITY – Listening","60":"UNIT 6 GENDER EQUALITY – Writing","61":"UNIT 6 GENDER EQUALITY – Communication & Culture","62":"UNIT 6 GENDER EQUALITY – Looking back & project","63":"UNIT 7 VIETNAM AND INTERNATIONAL ORGANIZATIONS – Getting started","64":"UNIT 7 VIETNAM AND INTERNATIONAL ORGANIZATIONS – Language 1","65":"UNIT 7 VIETNAM AND INTERNATIONAL ORGANIZATIONS – Language 2","66":"UNIT 7 VIETNAM AND INTERNATIONAL ORGANIZATIONS – Reading","67":"UNIT 7 VIETNAM AND INTERNATIONAL ORGANIZATIONS – Speaking","68":"UNIT 7 VIETNAM AND INTERNATIONAL ORGANIZATIONS – Listening","69":"UNIT 7 VIETNAM AND INTERNATIONAL ORGANIZATIONS – Writing","70":"UNIT 7 VIETNAM AND INTERNATIONAL ORGANIZATIONS – Communication & Culture","71":"UNIT 7 VIETNAM AND INTERNATIONAL ORGANIZATIONS – Looking back & project","72":"UNIT 8 NEW WAYS TO LEARN – Getting started","73":"UNIT 8 NEW WAYS TO LEARN – Language","74":"UNIT 8 NEW WAYS TO LEARN – Reading","75":"UNIT 8 NEW WAYS TO LEARN – Speaking","76":"UNIT 8 NEW WAYS TO LEARN – Listening","77":"UNIT 8 NEW WAYS TO LEARN – Writing","78":"UNIT 8 NEW WAYS TO LEARN – Communication & Culture","79":"UNIT 8 NEW WAYS TO LEARN – Looking back & project","80":"REVIEW 3 – Language","81":"REVIEW 3 – Skills","82":"Mid-term test","83":"UNIT 9: PROTECTING THE ENVIRONMENT – Getting started","84":"UNIT 9: PROTECTING THE ENVIRONMENT – Language 1","85":"UNIT 9: PROTECTING THE ENVIRONMENT – Language 2","86":"UNIT 9: PROTECTING THE ENVIRONMENT – Reading","87":"UNIT 9: PROTECTING THE ENVIRONMENT – Speaking","88":"UNIT 9: PROTECTING THE ENVIRONMENT – Listening","89":"UNIT 9: PROTECTING THE ENVIRONMENT – Writing","90":"UNIT 9: PROTECTING THE ENVIRONMENT – Communication & Culture","91":"UNIT 9: PROTECTING THE ENVIRONMENT – Looking back & project","92":"Correcting the mid-term test","93":"UNIT 10: ECOTOURISM – Getting started","94":"UNIT 10: ECOTOURISM – Language","95":"UNIT 10: ECOTOURISM – Reading","96":"UNIT 10: ECOTOURISM – Speaking","97":"UNIT 10: ECOTOURISM – Listening","98":"UNIT 10: ECOTOURISM – Writing","99":"UNIT 10: ECOTOURISM – Communication & Culture","100":"UNIT 10: ECOTOURISM – Looking back & project","101":"REVIEW 2 – Language","102":"REVIEW 2 – Skills","103":"2nd Term Speaking test 1","104":"2nd Term Speaking test 2","105":"The second term test"},"11":{"1":"UNIT 1 A LONG AND HEALTHY LIFE – Getting started","2":"UNIT 1 A LONG AND HEALTHY LIFE – Language","3":"UNIT 1 A LONG AND HEALTHY LIFE – Reading","4":"UNIT 1 A LONG AND HEALTHY LIFE – Speaking","5":"UNIT 1 A LONG AND HEALTHY LIFE – Listening","6":"UNIT 1 A LONG AND HEALTHY LIFE – Writing","7":"UNIT 1 A LONG AND HEALTHY LIFE – Communication & Culture","8":"UNIT 1 A LONG AND HEALTHY LIFE – Looking back & project","9":"UNIT 2 THE GENERATION GAP – Getting started","10":"UNIT 2 THE GENERATION GAP – Language","11":"UNIT 2 THE GENERATION GAP – Reading","12":"UNIT 2 THE GENERATION GAP – Speaking","13":"UNIT 2 THE GENERATION GAP – Listening","14":"UNIT 2 THE GENERATION GAP – Writing","15":"UNIT 2 THE GENERATION GAP – Communication & Culture","16":"UNIT 2 THE GENERATION GAP – Looking back & project","17":"UNIT 3 CITIES OF THE FUTURE – Getting started","18":"UNIT 3 CITIES OF THE FUTURE – Language","19":"UNIT 3 CITIES OF THE FUTURE – Reading","20":"UNIT 3 CITIES OF THE FUTURE – Speaking","21":"UNIT 3 CITIES OF THE FUTURE – Listening","22":"UNIT 3 CITIES OF THE FUTURE – Writing","23":"UNIT 3 CITIES OF THE FUTURE – Communication & Culture","24":"UNIT 3 CITIES OF THE FUTURE – Looking back & project","25":"REVIEW 1 – Language","26":"REVIEW 1 – Skills","27":"Further practice","28":"Mid- term test","29":"UNIT 4 ASEAN AND VIET NAM – Getting started","30":"UNIT 4 ASEAN AND VIET NAM – Language","31":"UNIT 4 ASEAN AND VIET NAM – Reading","32":"UNIT 4 ASEAN AND VIET NAM – Speaking","33":"UNIT 4 ASEAN AND VIET NAM – Listening","34":"UNIT 4 ASEAN AND VIET NAM – Writing","35":"UNIT 4 ASEAN AND VIET NAM – Communication & Culture","36":"UNIT 4 ASEAN AND VIET NAM – Looking back & project","37":"Correcting test","38":"UNIT 5: GLOBAL WARMING – Getting started","39":"UNIT 5: GLOBAL WARMING – Language","40":"UNIT 5: GLOBAL WARMING – Reading","41":"UNIT 5: GLOBAL WARMING – Speaking","42":"UNIT 5: GLOBAL WARMING – Listening","43":"UNIT 5: GLOBAL WARMING – Writing","44":"UNIT 5: GLOBAL WARMING – Communication & Culture","45":"UNIT 5: GLOBAL WARMING – Looking back & project","46":"REVIEW 2 – Language","47":"REVIEW 2 – Language","48":"REVIEW 2 – Skills","49":"Further practice","50":"Further practice","51":"Further practice","52":"Speaking test 1","53":"Speaking test 2","54":"The 1st final term test","55":"UNIT 6 PRESERVING OUR HERRITAGE – Getting started","56":"UNIT 6 PRESERVING OUR HERRITAGE – Language","57":"UNIT 6 PRESERVING OUR HERRITAGE – Reading","58":"UNIT 6 PRESERVING OUR HERRITAGE – Speaking","59":"UNIT 6 PRESERVING OUR HERRITAGE – Listening","60":"UNIT 6 PRESERVING OUR HERRITAGE – Writing","61":"UNIT 6 PRESERVING OUR HERRITAGE – Communication & Culture","62":"UNIT 6 PRESERVING OUR HERRITAGE – Looking back & project","63":"UNIT 7 EDUCATION OPTIONS FOR SCHOOL- LEAVERS – Getting started","64":"UNIT 7 EDUCATION OPTIONS FOR SCHOOL- LEAVERS – Language","65":"UNIT 7 EDUCATION OPTIONS FOR SCHOOL- LEAVERS – Reading","66":"UNIT 7 EDUCATION OPTIONS FOR SCHOOL- LEAVERS – Speaking","67":"UNIT 7 EDUCATION OPTIONS FOR SCHOOL- LEAVERS – Listening","68":"UNIT 7 EDUCATION OPTIONS FOR SCHOOL- LEAVERS – Writing","69":"UNIT 7 EDUCATION OPTIONS FOR SCHOOL- LEAVERS – Communication & Culture","70":"UNIT 7 EDUCATION OPTIONS FOR SCHOOL- LEAVERS – Looking back & project","71":"UNIT 8 BECOMING INDEPENDENT – Getting started","72":"UNIT 8 BECOMING INDEPENDENT – Language","73":"UNIT 8 BECOMING INDEPENDENT – Reading","74":"UNIT 8 BECOMING INDEPENDENT – Speaking","75":"UNIT 8 BECOMING INDEPENDENT – Listening","76":"UNIT 8 BECOMING INDEPENDENT – Writing","77":"UNIT 8 BECOMING INDEPENDENT – Communication & Culture","78":"UNIT 8 BECOMING INDEPENDENT – Looking back & project","79":"REVIEW 3 – Language","80":"REVIEW 3 – Skills","81":"Further practice","82":"Mid- term test","83":"UNIT 9: SOCIAL ISSUES – Getting started","84":"UNIT 9: SOCIAL ISSUES – Language","85":"UNIT 9: SOCIAL ISSUES – Reading","86":"UNIT 9: SOCIAL ISSUES – Speaking","87":"UNIT 9: SOCIAL ISSUES – Listening","88":"UNIT 9: SOCIAL ISSUES – Writing","89":"UNIT 9: SOCIAL ISSUES – Communication & Culture","90":"UNIT 9: SOCIAL ISSUES – Looking back & project","91":"Correcting test","92":"UNIT 10: THE ECOTOURISM – Getting started","93":"UNIT 10: THE ECOTOURISM – Language","94":"UNIT 10: THE ECOTOURISM – Reading","95":"UNIT 10: THE ECOTOURISM – Speaking","96":"UNIT 10: THE ECOTOURISM – Listening","97":"UNIT 10: THE ECOTOURISM – Writing","98":"UNIT 10: THE ECOTOURISM – Communication & Culture","99":"UNIT 10: THE ECOTOURISM – Looking back & project","100":"REVIEW 4 – Language","101":"REVIEW 4 – Skills","102":"Further practice","103":"Speaking test 1","104":"Speaking test 2","105":"The 2nd final term test"},"12":{"1":"UNIT 1 LIFE STORIES WE ADMIRE – Getting started","2":"UNIT 1 LIFE STORIES WE ADMIRE – Language","3":"UNIT 1 LIFE STORIES WE ADMIRE – Reading","4":"UNIT 1 LIFE STORIES WE ADMIRE – Speaking","5":"UNIT 1 LIFE STORIES WE ADMIRE – Listening","6":"UNIT 1 LIFE STORIES WE ADMIRE – Writing","7":"UNIT 1 LIFE STORIES WE ADMIRE – Communication and Culture/CLIL","8":"UNIT 1 LIFE STORIES WE ADMIRE – Looking back & Project","9":"UNIT 2 A MULTICULTURAL WORLD – Getting started","10":"UNIT 2 A MULTICULTURAL WORLD – Language","11":"UNIT 2 A MULTICULTURAL WORLD – Reading","12":"UNIT 2 A MULTICULTURAL WORLD – Speaking","13":"UNIT 2 A MULTICULTURAL WORLD – Listening","14":"UNIT 2 A MULTICULTURAL WORLD – Writing","15":"UNIT 2 A MULTICULTURAL WORLD – Communication and Culture/CLIL","16":"UNIT 2 A MULTICULTURAL WORLD – Looking back & Project","17":"UNIT 3 GREEN LIVING – Getting started","18":"UNIT 3 GREEN LIVING – Language","19":"UNIT 3 GREEN LIVING – Reading","20":"UNIT 3 GREEN LIVING – Speaking","21":"UNIT 3 GREEN LIVING – Listening","22":"UNIT 3 GREEN LIVING – Writing","23":"UNIT 3 GREEN LIVING – Communication and Culture/CLIL","24":"UNIT 3 GREEN LIVING – Looking back & Project","25":"REVIEW 1 – Language","26":"REVIEW 1 – Skills (1)","27":"REVIEW 1 – Skills (2)","28":"FURTHER PRACTICE","29":"MID-TERM TEST","30":"UNIT 4 URBANIZATION – Getting started","31":"UNIT 4 URBANIZATION – Language","32":"UNIT 4 URBANIZATION – Reading","33":"UNIT 4 URBANIZATION – Speaking","34":"UNIT 4 URBANIZATION – Listening","35":"UNIT 4 URBANIZATION – Writing","36":"UNIT 4 URBANIZATION – Communication and Culture/CLIL","37":"UNIT 4 URBANIZATION – Looking back & Project","38":"CORRECT THE MID –TERM TEST","39":"UNIT 5 THE WORLD OF WORK – Getting started","40":"UNIT 5 THE WORLD OF WORK – Language","41":"UNIT 5 THE WORLD OF WORK – Reading","42":"UNIT 5 THE WORLD OF WORK – Speaking","43":"UNIT 5 THE WORLD OF WORK – Listening","44":"UNIT 5 THE WORLD OF WORK – Writing","45":"UNIT 5 THE WORLD OF WORK – Communication and Culture/CLIL","46":"UNIT 5 THE WORLD OF WORK – Looking back & Project","47":"REVIEW 2 – Language","48":"REVIEW 2 – Skills (1)","49":"REVIEW 2 – Skills (2)","50":"FURTHER PRACTICE","51":"FURTHER PRACTICE","52":"SPEAKING TEST","53":"SPEAKING TEST","54":"THE 1ST FINAL TERM TEST","55":"UNIT 6 ARTIFICIAL INTELLIGENT – Getting started","56":"UNIT 6 ARTIFICIAL INTELLIGENT – Language","57":"UNIT 6 ARTIFICIAL INTELLIGENT – Reading","58":"UNIT 6 ARTIFICIAL INTELLIGENT – Speaking","59":"UNIT 6 ARTIFICIAL INTELLIGENT – Listening","60":"UNIT 6 ARTIFICIAL INTELLIGENT – Writing","61":"UNIT 6 ARTIFICIAL INTELLIGENT – Communication and Culture/CLIL","62":"UNIT 6 ARTIFICIAL INTELLIGENT – Looking back & Project","63":"UNIT 7 THE WORLD OF MASS MEDIA – Getting started","64":"UNIT 7 THE WORLD OF MASS MEDIA – Language","65":"UNIT 7 THE WORLD OF MASS MEDIA – Reading","66":"UNIT 7 THE WORLD OF MASS MEDIA – Speaking","67":"UNIT 7 THE WORLD OF MASS MEDIA – Listening","68":"UNIT 7 THE WORLD OF MASS MEDIA – Writing","69":"UNIT 7 THE WORLD OF MASS MEDIA – Communication and Culture/CLIL","70":"UNIT 7 THE WORLD OF MASS MEDIA – Looking back & Project","71":"UNIT 8 WILDLIFE CONSERVATION – Getting started","72":"UNIT 8 WILDLIFE CONSERVATION – Language","73":"UNIT 8 WILDLIFE CONSERVATION – Reading","74":"UNIT 8 WILDLIFE CONSERVATION – Speaking","75":"UNIT 8 WILDLIFE CONSERVATION – Listening","76":"UNIT 8 WILDLIFE CONSERVATION – Writing","77":"UNIT 8 WILDLIFE CONSERVATION – Communication and Culture/CLIL","78":"UNIT 8 WILDLIFE CONSERVATION – Looking back & Project","79":"REVIEW 3 – Language","80":"REVIEW 3 – Skills","81":"FURTHER PRACTICE","82":"MID-TERM TEST","83":"UNIT 9 CAREER PATHS – Getting started","84":"UNIT 9 CAREER PATHS – Language","85":"UNIT 9 CAREER PATHS – Reading","86":"UNIT 9 CAREER PATHS – Speaking","87":"UNIT 9 CAREER PATHS – Listening","88":"UNIT 9 CAREER PATHS – Writing","89":"UNIT 9 CAREER PATHS – Communication and Culture/CLIL","90":"UNIT 9 CAREER PATHS – Looking back & Project","91":"CORRECTING THE MIDTERM-TEST","92":"UNIT 10 LIFELONG LEARNING – Getting started","93":"UNIT 10 LIFELONG LEARNING – Language","94":"UNIT 10 LIFELONG LEARNING – Reading","95":"UNIT 10 LIFELONG LEARNING – Speaking","96":"UNIT 10 LIFELONG LEARNING – Listening","97":"UNIT 10 LIFELONG LEARNING – Writing","98":"UNIT 10 LIFELONG LEARNING – Communication and Culture/CLIL","99":"UNIT 10 LIFELONG LEARNING – Looking back & Project","100":"REVIEW 4 – Language","101":"REVIEW 4 – Skills","102":"FURTHER PRACTICE","103":"SPEAKING TEST","104":"SPEAKING TEST","105":"THE 2ND FINAL TERM TEST"}},"electiveMap":{},"warnings":[],"gradeCounts":{"10":105,"11":105,"12":105},"electiveGradeCounts":{},"regularEntries":315,"electiveEntries":0,"entries":315,"warningCount":0,"modes":["duration"],"criticalWarningCount":0,"partial":false,"criticalWarnings":[]},"GDTC":{"subject":"GDTC","title":"Phụ lục I - Ke hoach day hoc - GDTC (X).docx","kind":"Kho PPCT tích hợp","format":"Dữ liệu chuẩn của trường từ Kế hoạch dạy học 2026–2027","map":{"10":{"1":"Phần một: Kiến thức chung - Chủ đề: Sử dụng các yếu tố tự nhiên và dinh dưỡng để rèn luyện sức khỏe và phát triển thể chất. Tích hợp: Phương pháp phòng tránh đuối nước","2":"Phần một: Kiến thức chung - Chủ đề: Sử dụng các yếu tố tự nhiên và dinh dưỡng để rèn luyện sức khỏe và phát triển thể chất. Tích hợp: Phương pháp phòng tránh đuối nước","3":"Phần hai: Thể thao tự chọn – Bóng rổ Chủ đề: Lịch sử ra đời và phát triển môn bóng rổ. Một số điều luật cơ bản về sân tập, dụng cụ và quy định thi đấu môn bóng rổ.","4":"Phần hai: Thể thao tự chọn – Bóng rổ Chủ đề: Lịch sử ra đời và phát triển môn bóng rổ. Một số điều luật cơ bản về sân tập, dụng cụ và quy định thi đấu môn bóng rổ.","5":"Phần hai: Thể thao tự chọn – Bóng rổ Chủ đề: Lịch sử ra đời và phát triển môn bóng rổ. Một số điều luật cơ bản về sân tập, dụng cụ và quy định thi đấu môn bóng rổ.","6":"Phần hai: Thể thao tự chọn – Bóng rổ Chủ đề: Lịch sử ra đời và phát triển môn bóng rổ. Một số điều luật cơ bản về sân tập, dụng cụ và quy định thi đấu môn bóng rổ.","7":"Bài 1: Kỹ thuật di chuyển cơ bản (di chuyển thường, chạy, dừng lại, đổi hướng).","8":"Bài 1: Kỹ thuật di chuyển cơ bản (di chuyển thường, chạy, dừng lại, đổi hướng).","9":"Bài 1: Kỹ thuật di chuyển cơ bản (di chuyển thường, chạy, dừng lại, đổi hướng).","10":"Bài 1: Kỹ thuật di chuyển cơ bản (di chuyển thường, chạy, dừng lại, đổi hướng).","11":"Kiểm tra thường xuyên 1: Dẫn bóng di chuyển","12":"Bài 2: Kĩ thuật dẫn bóng (Dẫn bóng tại chỗ, di chuyển dẫn bóng cao tay, thấp tay).","13":"Bài 2: Kĩ thuật dẫn bóng (Dẫn bóng tại chỗ, di chuyển dẫn bóng cao tay, thấp tay).","14":"Bài 2: Kĩ thuật dẫn bóng (Dẫn bóng tại chỗ, di chuyển dẫn bóng cao tay, thấp tay).","15":"Bài 2: Kĩ thuật dẫn bóng (Dẫn bóng tại chỗ, di chuyển dẫn bóng cao tay, thấp tay).","16":"Bài 2: Kĩ thuật dẫn bóng (Dẫn bóng tại chỗ, di chuyển dẫn bóng cao tay, thấp tay).","17":"Bài 2: Kĩ thuật dẫn bóng (Dẫn bóng tại chỗ, di chuyển dẫn bóng cao tay, thấp tay).","18":"Kiểm tra giữa kì I Kĩ thuật di chuyển dẫn bóng.","19":"Bài 3: Kĩ thuật bắt và chuyền bóng (chuyền bóng hai tay trước ngực, bắt bóng).","20":"Bài 3: Kĩ thuật bắt và chuyền bóng (chuyền bóng hai tay trước ngực, bắt bóng).","21":"Bài 3: Kĩ thuật bắt và chuyền bóng (chuyền bóng hai tay trước ngực, bắt bóng).","22":"Bài 3: Kĩ thuật bắt và chuyền bóng (chuyền bóng hai tay trước ngực, bắt bóng).","23":"Bài 3: Kĩ thuật bắt và chuyền bóng (chuyền bóng hai tay trước ngực, bắt bóng).","24":"Bài 3: Kĩ thuật bắt và chuyền bóng (chuyền bóng hai tay trước ngực, bắt bóng).","25":"Bài 3: Kĩ thuật bắt và chuyền bóng (chuyền bóng hai tay trước ngực, bắt bóng).","26":"Bài 3: Kĩ thuật bắt và chuyền bóng (chuyền bóng hai tay trước ngực, bắt bóng).","27":"Kiểm tra thường xuyên 2: Kĩ thuật bắt bóng, chuyền bóng hai tay trước ngực.","28":"Bài 4: Kỹ thuật tại chỗ chuyền bóng 1 tay trên vai","29":"Bài 4: Kỹ thuật tại chỗ chuyền bóng 1 tay trên vai","30":"Bài 4: Kỹ thuật tại chỗ chuyền bóng 1 tay trên vai","31":"Bài 4: Kỹ thuật tại chỗ chuyền bóng 1 tay trên vai","32":"Kiểm tra thường xuyên 2: Kĩ thuật di chuyển bắt, chuyền bóng hai tay trước ngực","33":"Bài 5:Kĩ thuật ném rổ một tay trên cao","34":"Bài 5:Kĩ thuật ném rổ một tay trên cao","35":"Bài 5:Kĩ thuật ném rổ một tay trên cao","36":"Bài 5:Kĩ thuật ném rổ một tay trên cao","37":"Bài 5:Kĩ thuật ném rổ một tay trên cao","38":"Bài 5:Kĩ thuật ném rổ một tay trên cao","39":"Bài 5:Kĩ thuật ném rổ một tay trên cao","40":"Bài 5:Kĩ thuật ném rổ một tay trên cao","41":"Kiểm tra học kì I: Kĩ thuật di chuyển, chuyền và bắt bóng bằng hai tay trước ngực nhóm 2 người.","42":"Bài 6: kĩ thuật tại chỗ ném rổ hai tay trước ngực","43":"Bài 6: kĩ thuật tại chỗ ném rổ hai tay trước ngực","44":"Bài 6: kĩ thuật tại chỗ ném rổ hai tay trước ngực","45":"Bài 6: kĩ thuật tại chỗ ném rổ hai tay trước ngực","46":"Bài 6: kĩ thuật tại chỗ ném rổ hai tay trước ngực","47":"Bài 6: kĩ thuật tại chỗ ném rổ hai tay trước ngực","48":"Bài 6: kĩ thuật tại chỗ ném rổ hai tay trước ngực","49":"Bài 6: kĩ thuật tại chỗ ném rổ hai tay trước ngực","50":"Kiểm tra thường xuyên 3: kỹ thuật ném rổ 2 tay trước ngực","51":"Bài 7: Kĩ thuật dẫn bóng hai bước ném rổ một tay trên cao","52":"Bài 7: Kĩ thuật dẫn bóng hai bước ném rổ một tay trên cao","53":"Bài 7: Kĩ thuật dẫn bóng hai bước ném rổ một tay trên cao","54":"Bài 7: Kĩ thuật dẫn bóng hai bước ném rổ một tay trên cao","55":"Bài 7: Kĩ thuật dẫn bóng hai bước ném rổ một tay trên cao","56":"Bài 7: Kĩ thuật dẫn bóng hai bước ném rổ một tay trên cao","57":"Bài 7: Kĩ thuật dẫn bóng hai bước ném rổ một tay trên cao","58":"Bài 7: Kĩ thuật dẫn bóng hai bước ném rổ một tay trên cao","59":"Bài 7: Kĩ thuật dẫn bóng hai bước ném rổ một tay trên cao","60":"Bài 7: Kĩ thuật dẫn bóng hai bước ném rổ một tay trên cao","61":"Kiểm tra giữa kì II: kĩ thuật dẫn bóng hai bước ném rổ 1 tay trên cao.","62":"Bài 8: Phối hợp một số kỹ thuật cơ bản và thi đấu","63":"Bài 8: Phối hợp một số kỹ thuật cơ bản và thi đấu","64":"Bài 8: Phối hợp một số kỹ thuật cơ bản và thi đấu","65":"Bài 8: Phối hợp một số kỹ thuật cơ bản và thi đấu","66":"Bài 8: Phối hợp một số kỹ thuật cơ bản và thi đấu","67":"Bài 8: Phối hợp một số kỹ thuật cơ bản và thi đấu","68":"Bài 8: Phối hợp một số kỹ thuật cơ bản và thi đấu","69":"Bài 8: Phối hợp một số kỹ thuật cơ bản và thi đấu","70":"Kiểm tra thường xuyên 4: Bài tập phối hợp tại chỗ chuyền, bắt bóng hai tay trước ngực thực hiện kĩ thuật ném rổ 1 tay trên cao"},"11":{"1":"Phần một: Kiến thức chung - Chủ đề: Sử dụng các yếu tố tự nhiên và dinh dưỡng để rèn luyện sức khỏe và phát triển thể chất. Tích hợp: Phương pháp phòng tránh đuối nước. Bài tập hình thành tư thế chuẩn bị Phần hai: Thể thao tự chọn – Bóng chuyền - Chủ đề 1: Sơ lược lịch sử phát triển, một số điều luật cơ bản về sân tập, dụng cụ và thi đấu bóng chuyền","2":"Phần một: Kiến thức chung - Chủ đề: Sử dụng các yếu tố tự nhiên và dinh dưỡng để rèn luyện sức khỏe và phát triển thể chất. Tích hợp: Phương pháp phòng tránh đuối nước. Bài tập hình thành tư thế chuẩn bị Phần hai: Thể thao tự chọn – Bóng chuyền - Chủ đề 1: Sơ lược lịch sử phát triển, một số điều luật cơ bản về sân tập, dụng cụ và thi đấu bóng chuyền","3":"Phần một: Kiến thức chung - Chủ đề: Sử dụng các yếu tố tự nhiên và dinh dưỡng để rèn luyện sức khỏe và phát triển thể chất. Tích hợp: Phương pháp phòng tránh đuối nước. Bài tập hình thành tư thế chuẩn bị Phần hai: Thể thao tự chọn – Bóng chuyền - Chủ đề 1: Sơ lược lịch sử phát triển, một số điều luật cơ bản về sân tập, dụng cụ và thi đấu bóng chuyền","4":"Phần một: Kiến thức chung - Chủ đề: Sử dụng các yếu tố tự nhiên và dinh dưỡng để rèn luyện sức khỏe và phát triển thể chất. Tích hợp: Phương pháp phòng tránh đuối nước. Bài tập hình thành tư thế chuẩn bị Phần hai: Thể thao tự chọn – Bóng chuyền - Chủ đề 1: Sơ lược lịch sử phát triển, một số điều luật cơ bản về sân tập, dụng cụ và thi đấu bóng chuyền","5":"Chủ đề 2: Kĩ thuật tư thế chuẩn bị, di chuyển và chuyền bóng cơ bản: Bài 1: Tư thế chuẩn bị","6":"Chủ đề 2: Kĩ thuật tư thế chuẩn bị, di chuyển và chuyền bóng cơ bản: Bài 1: Tư thế chuẩn bị","7":"Bài 2: Kĩ thuật di chuyển cơ bản","8":"Bài 2: Kĩ thuật di chuyển cơ bản","9":"Bài 2: Kĩ thuật di chuyển cơ bản","10":"Bài 2: Kĩ thuật di chuyển cơ bản","11":"Kiểm tra thường xuyên 1: Kĩ thuật di chuyển cơ bản","12":"Bài 3: Kĩ thuật chuyền bóng thấp tay bằng hai tay trước mặt","13":"Bài 3: Kĩ thuật chuyền bóng thấp tay bằng hai tay trước mặt","14":"Bài 3: Kĩ thuật chuyền bóng thấp tay bằng hai tay trước mặt","15":"Bài 3: Kĩ thuật chuyền bóng thấp tay bằng hai tay trước mặt","16":"Bài 3: Kĩ thuật chuyền bóng thấp tay bằng hai tay trước mặt","17":"Bài 3: Kĩ thuật chuyền bóng thấp tay bằng hai tay trước mặt","18":"Bài 3: Kĩ thuật chuyền bóng thấp tay bằng hai tay trước mặt","19":"Bài 3: Kĩ thuật chuyền bóng thấp tay bằng hai tay trước mặt","20":"Bài 3: Kĩ thuật chuyền bóng thấp tay bằng hai tay trước mặt","21":"Bài 3: Kĩ thuật chuyền bóng thấp tay bằng hai tay trước mặt","22":"Kiểm tra giữa kì I: Kỹ thuật chuyền bóng thấp tay bằng hai tay trước mặt","23":"Bài 4: Kĩ thuật chuyền bóng cao tay bằng hai tay trước mặt","24":"Bài 4: Kĩ thuật chuyền bóng cao tay bằng hai tay trước mặt","25":"Bài 4: Kĩ thuật chuyền bóng cao tay bằng hai tay trước mặt","26":"Bài 4: Kĩ thuật chuyền bóng cao tay bằng hai tay trước mặt","27":"Bài 4: Kĩ thuật chuyền bóng cao tay bằng hai tay trước mặt","28":"Bài 4: Kĩ thuật chuyền bóng cao tay bằng hai tay trước mặt","29":"Bài 4: Kĩ thuật chuyền bóng cao tay bằng hai tay trước mặt","30":"Bài 4: Kĩ thuật chuyền bóng cao tay bằng hai tay trước mặt","31":"Bài 4: Kĩ thuật chuyền bóng cao tay bằng hai tay trước mặt","32":"Bài 4: Kĩ thuật chuyền bóng cao tay bằng hai tay trước mặt","33":"Bài 4: Kĩ thuật chuyền bóng cao tay bằng hai tay trước mặt","34":"Bài 4: Kĩ thuật chuyền bóng cao tay bằng hai tay trước mặt","35":"Kiểm tra thường xuyên 2: Bài tập hình thành kỹ thuật chuyền bóng cao tay","36":"Kiểm tra cuối học kì I: Kỹ thuật chuyền bóng cao tay","37":"Chủ đề 3: Kĩ thuật phát bóng, đập bóng và chắn bóng cơ bản Bài 1: Kĩ thuật phát bóng thấp tay trước mặt","38":"Chủ đề 3: Kĩ thuật phát bóng, đập bóng và chắn bóng cơ bản Bài 1: Kĩ thuật phát bóng thấp tay trước mặt","39":"Chủ đề 3: Kĩ thuật phát bóng, đập bóng và chắn bóng cơ bản Bài 1: Kĩ thuật phát bóng thấp tay trước mặt","40":"Chủ đề 3: Kĩ thuật phát bóng, đập bóng và chắn bóng cơ bản Bài 1: Kĩ thuật phát bóng thấp tay trước mặt","41":"Chủ đề 3: Kĩ thuật phát bóng, đập bóng và chắn bóng cơ bản Bài 1: Kĩ thuật phát bóng thấp tay trước mặt","42":"Chủ đề 3: Kĩ thuật phát bóng, đập bóng và chắn bóng cơ bản Bài 1: Kĩ thuật phát bóng thấp tay trước mặt","43":"Chủ đề 3: Kĩ thuật phát bóng, đập bóng và chắn bóng cơ bản Bài 1: Kĩ thuật phát bóng thấp tay trước mặt","44":"Chủ đề 3: Kĩ thuật phát bóng, đập bóng và chắn bóng cơ bản Bài 1: Kĩ thuật phát bóng thấp tay trước mặt","45":"Chủ đề 3: Kĩ thuật phát bóng, đập bóng và chắn bóng cơ bản Bài 1: Kĩ thuật phát bóng thấp tay trước mặt","46":"Chủ đề 3: Kĩ thuật phát bóng, đập bóng và chắn bóng cơ bản Bài 1: Kĩ thuật phát bóng thấp tay trước mặt","47":"Kiểm tra thường xuyên 3: kỹ thuật phát bóng","48":"Bài 2: Kĩ thuật đập bóng chính diện theo phương lấy đà","49":"Bài 2: Kĩ thuật đập bóng chính diện theo phương lấy đà","50":"Bài 2: Kĩ thuật đập bóng chính diện theo phương lấy đà","51":"Bài 2: Kĩ thuật đập bóng chính diện theo phương lấy đà","52":"Bài 2: Kĩ thuật đập bóng chính diện theo phương lấy đà","53":"Bài 2: Kĩ thuật đập bóng chính diện theo phương lấy đà","54":"Bài 2: Kĩ thuật đập bóng chính diện theo phương lấy đà","55":"Bài 2: Kĩ thuật đập bóng chính diện theo phương lấy đà","56":"Bài 2: Kĩ thuật đập bóng chính diện theo phương lấy đà","57":"Bài 2: Kĩ thuật đập bóng chính diện theo phương lấy đà","58":"Bài 2: Kĩ thuật đập bóng chính diện theo phương lấy đà","59":"Bài 2: Kĩ thuật đập bóng chính diện theo phương lấy đà","60":"Kiểm tra giữa kì II: Bài tập hình thành Kĩ thuật đập bóng","61":"Bài 3: Kĩ thuật chắn bóng","62":"Bài 3: Kĩ thuật chắn bóng","63":"Bài 3: Kĩ thuật chắn bóng","64":"Bài 3: Kĩ thuật chắn bóng","65":"Bài 3: Kĩ thuật chắn bóng","66":"Kiểm tra thường xuyên 4: Kỹ thuật chắn bóng thấp tay trước mặt","67":"Bài tập phối hợp + Đấu tập","68":"Bài tập phối hợp + Đấu tập","69":"Bài tập phối hợp + Đấu tập","70":"Kiểm tra cuối học kì II: Bài tập đệm bóng kết hợp với chuyền bóng cao tay"},"12":{"1":"Phần một: Kiến thức chung Chủ đề: Sử dụng các yếu tố tự nhiên, dinh dưỡng để rèn luyện sức khỏe và phát triển thể chất. Tích hợp: Lợi ích của bơi lội và phòng tránh đuối nước","2":"Phần một: Kiến thức chung Chủ đề: Sử dụng các yếu tố tự nhiên, dinh dưỡng để rèn luyện sức khỏe và phát triển thể chất. Tích hợp: Lợi ích của bơi lội và phòng tránh đuối nước","3":"Phần hai: Thể thao tự chọn - Bóng đá Chủ đề 1: Lịch sử ra đời, phát triển môn bóng đá và một số điều luật trong thi đấu bóng đá Bài 1: Lịch sử ra đời, phát triển môn bóng đá Bài 2: Một số điều luật trong thi đấu bóng đá","4":"Phần hai: Thể thao tự chọn - Bóng đá Chủ đề 1: Lịch sử ra đời, phát triển môn bóng đá và một số điều luật trong thi đấu bóng đá Bài 1: Lịch sử ra đời, phát triển môn bóng đá Bài 2: Một số điều luật trong thi đấu bóng đá","5":"Phần hai: Thể thao tự chọn - Bóng đá Chủ đề 1: Lịch sử ra đời, phát triển môn bóng đá và một số điều luật trong thi đấu bóng đá Bài 1: Lịch sử ra đời, phát triển môn bóng đá Bài 2: Một số điều luật trong thi đấu bóng đá","6":"Phần hai: Thể thao tự chọn - Bóng đá Chủ đề 1: Lịch sử ra đời, phát triển môn bóng đá và một số điều luật trong thi đấu bóng đá Bài 1: Lịch sử ra đời, phát triển môn bóng đá Bài 2: Một số điều luật trong thi đấu bóng đá","7":"Phần hai: Thể thao tự chọn - Bóng đá Chủ đề 1: Lịch sử ra đời, phát triển môn bóng đá và một số điều luật trong thi đấu bóng đá Bài 1: Lịch sử ra đời, phát triển môn bóng đá Bài 2: Một số điều luật trong thi đấu bóng đá","8":"Chủ đề 2: Kĩ thuật dẫn bóng Bài 1: Kĩ thuật dẫn bóng bằng lòng bàn chân Bài 2: Kĩ thuật dẫn bóng bằng mu giữa bàn chân","9":"Chủ đề 2: Kĩ thuật dẫn bóng Bài 1: Kĩ thuật dẫn bóng bằng lòng bàn chân Bài 2: Kĩ thuật dẫn bóng bằng mu giữa bàn chân","10":"Chủ đề 2: Kĩ thuật dẫn bóng Bài 1: Kĩ thuật dẫn bóng bằng lòng bàn chân Bài 2: Kĩ thuật dẫn bóng bằng mu giữa bàn chân","11":"Chủ đề 2: Kĩ thuật dẫn bóng Bài 1: Kĩ thuật dẫn bóng bằng lòng bàn chân Bài 2: Kĩ thuật dẫn bóng bằng mu giữa bàn chân","12":"Chủ đề 2: Kĩ thuật dẫn bóng Bài 1: Kĩ thuật dẫn bóng bằng lòng bàn chân Bài 2: Kĩ thuật dẫn bóng bằng mu giữa bàn chân","13":"Chủ đề 2: Kĩ thuật dẫn bóng Bài 1: Kĩ thuật dẫn bóng bằng lòng bàn chân Bài 2: Kĩ thuật dẫn bóng bằng mu giữa bàn chân","14":"Chủ đề 2: Kĩ thuật dẫn bóng Bài 1: Kĩ thuật dẫn bóng bằng lòng bàn chân Bài 2: Kĩ thuật dẫn bóng bằng mu giữa bàn chân","15":"Chủ đề 2: Kĩ thuật dẫn bóng Bài 1: Kĩ thuật dẫn bóng bằng lòng bàn chân Bài 2: Kĩ thuật dẫn bóng bằng mu giữa bàn chân","16":"Chủ đề 2: Kĩ thuật dẫn bóng Bài 1: Kĩ thuật dẫn bóng bằng lòng bàn chân Bài 2: Kĩ thuật dẫn bóng bằng mu giữa bàn chân","17":"Chủ đề 2: Kĩ thuật dẫn bóng Bài 1: Kĩ thuật dẫn bóng bằng lòng bàn chân Bài 2: Kĩ thuật dẫn bóng bằng mu giữa bàn chân","18":"Chủ đề 2: Kĩ thuật dẫn bóng Bài 1: Kĩ thuật dẫn bóng bằng lòng bàn chân Bài 2: Kĩ thuật dẫn bóng bằng mu giữa bàn chân","19":"Chủ đề 2: Kĩ thuật dẫn bóng Bài 1: Kĩ thuật dẫn bóng bằng lòng bàn chân Bài 2: Kĩ thuật dẫn bóng bằng mu giữa bàn chân","20":"Kiểm tra thường xuyên 1: Kĩ thuật dẫn bóng bằng lòng bàn chân","21":"Chủ đề 3: Kĩ thuật đá bóng Bài 1: Kĩ thuật đá bóng bằng lòng bàn chân Bài 2: Kĩ thuật đá bóng bằng mu giữa bàn chân","22":"Chủ đề 3: Kĩ thuật đá bóng Bài 1: Kĩ thuật đá bóng bằng lòng bàn chân Bài 2: Kĩ thuật đá bóng bằng mu giữa bàn chân","23":"Chủ đề 3: Kĩ thuật đá bóng Bài 1: Kĩ thuật đá bóng bằng lòng bàn chân Bài 2: Kĩ thuật đá bóng bằng mu giữa bàn chân","24":"Chủ đề 3: Kĩ thuật đá bóng Bài 1: Kĩ thuật đá bóng bằng lòng bàn chân Bài 2: Kĩ thuật đá bóng bằng mu giữa bàn chân","25":"Chủ đề 3: Kĩ thuật đá bóng Bài 1: Kĩ thuật đá bóng bằng lòng bàn chân Bài 2: Kĩ thuật đá bóng bằng mu giữa bàn chân","26":"Chủ đề 3: Kĩ thuật đá bóng Bài 1: Kĩ thuật đá bóng bằng lòng bàn chân Bài 2: Kĩ thuật đá bóng bằng mu giữa bàn chân","27":"Chủ đề 3: Kĩ thuật đá bóng Bài 1: Kĩ thuật đá bóng bằng lòng bàn chân Bài 2: Kĩ thuật đá bóng bằng mu giữa bàn chân","28":"Chủ đề 3: Kĩ thuật đá bóng Bài 1: Kĩ thuật đá bóng bằng lòng bàn chân Bài 2: Kĩ thuật đá bóng bằng mu giữa bàn chân","29":"Chủ đề 3: Kĩ thuật đá bóng Bài 1: Kĩ thuật đá bóng bằng lòng bàn chân Bài 2: Kĩ thuật đá bóng bằng mu giữa bàn chân","30":"Chủ đề 3: Kĩ thuật đá bóng Bài 1: Kĩ thuật đá bóng bằng lòng bàn chân Bài 2: Kĩ thuật đá bóng bằng mu giữa bàn chân","31":"Chủ đề 3: Kĩ thuật đá bóng Bài 1: Kĩ thuật đá bóng bằng lòng bàn chân Bài 2: Kĩ thuật đá bóng bằng mu giữa bàn chân","32":"Chủ đề 3: Kĩ thuật đá bóng Bài 1: Kĩ thuật đá bóng bằng lòng bàn chân Bài 2: Kĩ thuật đá bóng bằng mu giữa bàn chân","33":"Kiểm tra giữa kì I Kĩ thuật dẫn bóng bằng mu giữa bàn chân","34":"Kiểm tra thường xuyên 2: Kĩ thuật đá bóng bằng lòng bàn chân","35":"Kiểm tra cuối học kì I: Kĩ thuật đá bóng bằng mu giữa bàn chân","36":"Chủ đề 4: Kĩ thuật dừng bóng Bài 1: Kĩ thuật dừng bóng lăn sệt bằng lòng bàn chân Bài 2: Kĩ thuật dừng bóng lăn sệt bằng gan bàn chân","37":"Chủ đề 4: Kĩ thuật dừng bóng Bài 1: Kĩ thuật dừng bóng lăn sệt bằng lòng bàn chân Bài 2: Kĩ thuật dừng bóng lăn sệt bằng gan bàn chân","38":"Chủ đề 4: Kĩ thuật dừng bóng Bài 1: Kĩ thuật dừng bóng lăn sệt bằng lòng bàn chân Bài 2: Kĩ thuật dừng bóng lăn sệt bằng gan bàn chân","39":"Chủ đề 4: Kĩ thuật dừng bóng Bài 1: Kĩ thuật dừng bóng lăn sệt bằng lòng bàn chân Bài 2: Kĩ thuật dừng bóng lăn sệt bằng gan bàn chân","40":"Chủ đề 4: Kĩ thuật dừng bóng Bài 1: Kĩ thuật dừng bóng lăn sệt bằng lòng bàn chân Bài 2: Kĩ thuật dừng bóng lăn sệt bằng gan bàn chân","41":"Chủ đề 4: Kĩ thuật dừng bóng Bài 1: Kĩ thuật dừng bóng lăn sệt bằng lòng bàn chân Bài 2: Kĩ thuật dừng bóng lăn sệt bằng gan bàn chân","42":"Chủ đề 4: Kĩ thuật dừng bóng Bài 1: Kĩ thuật dừng bóng lăn sệt bằng lòng bàn chân Bài 2: Kĩ thuật dừng bóng lăn sệt bằng gan bàn chân","43":"Chủ đề 4: Kĩ thuật dừng bóng Bài 1: Kĩ thuật dừng bóng lăn sệt bằng lòng bàn chân Bài 2: Kĩ thuật dừng bóng lăn sệt bằng gan bàn chân","44":"Chủ đề 4: Kĩ thuật dừng bóng Bài 1: Kĩ thuật dừng bóng lăn sệt bằng lòng bàn chân Bài 2: Kĩ thuật dừng bóng lăn sệt bằng gan bàn chân","45":"Chủ đề 4: Kĩ thuật dừng bóng Bài 1: Kĩ thuật dừng bóng lăn sệt bằng lòng bàn chân Bài 2: Kĩ thuật dừng bóng lăn sệt bằng gan bàn chân","46":"Kiểm tra thường xuyên 3: Kĩ thuật dừng bóng lăn sệt bằng lòng bàn chân","47":"Chủ đề 5: Kĩ thuật ném biên và đánh đầu Bài 1:Kĩ thuật ném biên Bài 2: Kĩ thuật tại chỗ đánh đầu bằng trán giữa","48":"Chủ đề 5: Kĩ thuật ném biên và đánh đầu Bài 1:Kĩ thuật ném biên Bài 2: Kĩ thuật tại chỗ đánh đầu bằng trán giữa","49":"Chủ đề 5: Kĩ thuật ném biên và đánh đầu Bài 1:Kĩ thuật ném biên Bài 2: Kĩ thuật tại chỗ đánh đầu bằng trán giữa","50":"Chủ đề 5: Kĩ thuật ném biên và đánh đầu Bài 1:Kĩ thuật ném biên Bài 2: Kĩ thuật tại chỗ đánh đầu bằng trán giữa","51":"Chủ đề 5: Kĩ thuật ném biên và đánh đầu Bài 1:Kĩ thuật ném biên Bài 2: Kĩ thuật tại chỗ đánh đầu bằng trán giữa","52":"Chủ đề 5: Kĩ thuật ném biên và đánh đầu Bài 1:Kĩ thuật ném biên Bài 2: Kĩ thuật tại chỗ đánh đầu bằng trán giữa","53":"Chủ đề 5: Kĩ thuật ném biên và đánh đầu Bài 1:Kĩ thuật ném biên Bài 2: Kĩ thuật tại chỗ đánh đầu bằng trán giữa","54":"Chủ đề 5: Kĩ thuật ném biên và đánh đầu Bài 1:Kĩ thuật ném biên Bài 2: Kĩ thuật tại chỗ đánh đầu bằng trán giữa","55":"Chủ đề 5: Kĩ thuật ném biên và đánh đầu Bài 1:Kĩ thuật ném biên Bài 2: Kĩ thuật tại chỗ đánh đầu bằng trán giữa","56":"Chủ đề 5: Kĩ thuật ném biên và đánh đầu Bài 1:Kĩ thuật ném biên Bài 2: Kĩ thuật tại chỗ đánh đầu bằng trán giữa","57":"Kiểm tra giữa kì II: Kĩ thuật ném biên","58":"Chủ đề 6: Kĩ thuật thủ môn Bài 1: Kĩ thuật bắt bóng lăn sệt Bài 2: Kĩ thuất phát bóng thấp tay, cao tay","59":"Chủ đề 6: Kĩ thuật thủ môn Bài 1: Kĩ thuật bắt bóng lăn sệt Bài 2: Kĩ thuất phát bóng thấp tay, cao tay","60":"Chủ đề 6: Kĩ thuật thủ môn Bài 1: Kĩ thuật bắt bóng lăn sệt Bài 2: Kĩ thuất phát bóng thấp tay, cao tay","61":"Chủ đề 6: Kĩ thuật thủ môn Bài 1: Kĩ thuật bắt bóng lăn sệt Bài 2: Kĩ thuất phát bóng thấp tay, cao tay","62":"Chủ đề 6: Kĩ thuật thủ môn Bài 1: Kĩ thuật bắt bóng lăn sệt Bài 2: Kĩ thuất phát bóng thấp tay, cao tay","63":"Chủ đề 6: Kĩ thuật thủ môn Bài 1: Kĩ thuật bắt bóng lăn sệt Bài 2: Kĩ thuất phát bóng thấp tay, cao tay","64":"Chủ đề 6: Kĩ thuật thủ môn Bài 1: Kĩ thuật bắt bóng lăn sệt Bài 2: Kĩ thuất phát bóng thấp tay, cao tay","65":"Chủ đề 6: Kĩ thuật thủ môn Bài 1: Kĩ thuật bắt bóng lăn sệt Bài 2: Kĩ thuất phát bóng thấp tay, cao tay","66":"Chủ đề 6: Kĩ thuật thủ môn Bài 1: Kĩ thuật bắt bóng lăn sệt Bài 2: Kĩ thuất phát bóng thấp tay, cao tay","67":"Chủ đề 6: Kĩ thuật thủ môn Bài 1: Kĩ thuật bắt bóng lăn sệt Bài 2: Kĩ thuất phát bóng thấp tay, cao tay","68":"Kiểm tra thường xuyên 4: Kĩ thuật bắt bóng lăn sệt","69":"Kiểm tra cuối học kì II: Kĩ thuật phát bóng thấp tay hoặc cao tay","70":"Ôn tập +Đấu tập"}},"electiveMap":{},"warnings":[],"gradeCounts":{"10":70,"11":70,"12":70},"electiveGradeCounts":{},"regularEntries":210,"electiveEntries":0,"entries":210,"warningCount":0,"modes":["duration"],"criticalWarningCount":0,"partial":false,"criticalWarnings":[]},"GDQPAN":{"subject":"GDQPAN","title":"Phu luc I - Ke hoach day hoc  GDQPAN (x).docx","kind":"Kho PPCT tích hợp","format":"Dữ liệu chuẩn của trường từ Kế hoạch dạy học 2026–2027","map":{"10":{"1":"Đội ngũ từng người không có súng","2":"Đội ngũ từng người không có súng","3":"Đội ngũ từng người không có súng","4":"Đội ngũ từng người không có súng","5":"Đội ngũ tiểu đội","6":"Đội ngũ tiểu đội","7":"Đội ngũ tiểu đội","8":"Kiểm tra giữa kỳ","9":"Lịch sử, truyền thống của lực lượng vũ trang nhân dân Việt Nam","10":"Lịch sử, truyền thống của lực lượng vũ trang nhân dân Việt Nam","11":"Phòng chống vi phạm pháp luật về trật tự an toàn giao thông","12":"Phòng chống vi phạm pháp luật về trật tự an toàn giao thông","13":"Một số nội dung Điều lệnh Quản lý bộ đội và Điều lệnh Công an nhân dân","14":"Một số nội dung Điều lệnh Quản lý bộ đội và Điều lệnh Công an nhân dân","15":"Thường thức phòng tránh một số loại bom, mìn, đạn… thiên tai, dịch bệnh và cháy nổ","16":"Thường thức phòng tránh một số loại bom, mìn, đạn… thiên tai, dịch bệnh và cháy nổ","17":"Thường thức phòng tránh một số loại bom, mìn, đạn… thiên tai, dịch bệnh và cháy nổ","18":"Kiểm tra cuối kỳ","19":"Các tư thế, động tác cơ bản vận động trong chiến đấu","20":"Các tư thế, động tác cơ bản vận động trong chiến đấu","21":"Các tư thế, động tác cơ bản vận động trong chiến đấu","22":"Kỹ thuật cấp cứu và chuyển thương","23":"Kỹ thuật cấp cứu và chuyển thương","24":"Kỹ thuật cấp cứu và chuyển thương","25":"Kỹ thuật cấp cứu và chuyển thương","26":"Kiểm tra giữa kỳ","27":"Bảo vệ an ninh quốc gia và bảo đảm trật tự, an toàn xã hội","28":"Bảo vệ an ninh quốc gia và bảo đảm trật tự, an toàn xã hội","29":"Nội dung cơ bản một số luật về quốc phòng, an ninh Việt Nam","30":"Nội dung cơ bản một số luật về quốc phòng, an ninh Việt Nam","31":"Ma túy, tác hại của ma túy","32":"Ma túy, tác hại của ma túy","33":"Một số hiểu biết về an ninh mạng","34":"Một số hiểu biết về an ninh mạng","35":"Kiểm tra cuối kỳ"},"11":{"1":"Lợi dụng địa hình, địa vật","2":"Lợi dụng địa hình, địa vật","3":"Lợi dụng địa hình, địa vật","4":"Kỹ thuật sử dụng lựu đạn","5":"Kỹ thuật sử dụng lựu đạn","6":"Kỹ thuật sử dụng lựu đạn","7":"Kỹ thuật sử dụng lựu đạn","8":"Kỹ thuật sử dụng lựu đạn","9":"Kiểm tra giữa kỳ","10":"Kiến thức phổ thông về phòng không nhân dân","11":"Kiến thức phổ thông về phòng không nhân dân","12":"Kiến thức phổ thông về phòng không nhân dân","13":"Một số vẫn đề về vi phạm pháp luật bảo vệ môi trường","14":"Một số vẫn đề về vi phạm pháp luật bảo vệ môi trường","15":"Nhìn nghe, phát hiện địch, chỉ thị mục tiêu, truyền tin liên lạc, báo cáo.","16":"Nhìn nghe, phát hiện địch, chỉ thị mục tiêu, truyền tin liên lạc, báo cáo.","17":"Nhìn nghe, phát hiện địch, chỉ thị mục tiêu, truyền tin liên lạc, báo cáo.","18":"Kiểm tra cuối kỳ","19":"Giới thiệu một số loại súng bộ binh, thuốc nổ, vật cản và vũ khí tự tạo","20":"Giới thiệu một số loại súng bộ binh, thuốc nổ, vật cản và vũ khí tự tạo","21":"Giới thiệu một số loại súng bộ binh, thuốc nổ, vật cản và vũ khí tự tạo","22":"Giới thiệu một số loại súng bộ binh, thuốc nổ, vật cản và vũ khí tự tạo","23":"Giới thiệu một số loại súng bộ binh, thuốc nổ, vật cản và vũ khí tự tạo","24":"Giới thiệu một số loại súng bộ binh, thuốc nổ, vật cản và vũ khí tự tạo","25":"Giới thiệu một số loại súng bộ binh, thuốc nổ, vật cản và vũ khí tự tạo","26":"Pháp luật về quản lý vũ khí, vật liệu nổ, công cụ hỗ trợ.","27":"Pháp luật về quản lý vũ khí, vật liệu nổ, công cụ hỗ trợ.","28":"Kiểm tra giữa kỳ","29":"Bảo vệ chủ quyền lãnh thổ, biên giới quốc gia nước CHXHCN Việt Nam","30":"Bảo vệ chủ quyền lãnh thổ, biên giới quốc gia nước CHXHCN Việt Nam","31":"Phòng chống tệ nạn xã hội ở Việt Nam trong thời kỳ hội nhập Quốc tế","32":"Phòng chống tệ nạn xã hội ở Việt Nam trong thời kỳ hội nhập Quốc tế","33":"Luật Nghĩa vụ quân sự, trách nhiệm của học sinh","34":"Luật Nghĩa vụ quân sự, trách nhiệm của học sinh","35":"Kiểm tra cuối kỳ"},"12":{"1":"Kỹ thuật bắn súng tiểu liên AK","2":"Kỹ thuật bắn súng tiểu liên AK","3":"Kỹ thuật bắn súng tiểu liên AK","4":"Kỹ thuật bắn súng tiểu liên AK","5":"Kỹ thuật bắn súng tiểu liên AK","6":"Kỹ thuật bắn súng tiểu liên AK","7":"Kỹ thuật bắn súng tiểu liên AK","8":"Vận dụng các tư thế, động tác cơ bản khi vận động trong chiến đấu","9":"Vận dụng các tư thế, động tác cơ bản khi vận động trong chiến đấu","10":"Vận dụng các tư thế, động tác cơ bản khi vận động trong chiến đấu","11":"Kiểm tra giữa kỳ 1","12":"Tổ chức Quân đội nhân dân Việt Nam và Công an nhân dân Việt Nam","13":"Tổ chức Quân đội nhân dân Việt Nam và Công an nhân dân Việt Nam","14":"Tổ chức Quân đội nhân dân Việt Nam và Công an nhân dân Việt Nam","15":"Công tác tuyển sinh, đào tạo trong các trường QĐND VN và CAND Việt Nam","16":"Công tác tuyển sinh, đào tạo trong các trường QĐND VN và CAND Việt Nam","17":"Công tác tuyển sinh, đào tạo trong các trường QĐND VN và CAND Việt Nam","18":"Kiểm tra cuối kỳ","19":"Chạy vũ trang 800m","20":"Chạy vũ trang 800m","21":"Chạy vũ trang 800m","22":"Chạy vũ trang 800m","23":"Tìm và giữ phương hướng","24":"Tìm và giữ phương hướng","25":"Kiểm tra giữa kỳ","26":"Một số hiểu biết về chiến lược “ diễn biến hòa bình, bạo loạn lật đổ của các thế lực thù địch đối với Cách mạng Việt Nam","27":"Một số hiểu biết về chiến lược “ diễn biến hòa bình, bạo loạn lật đổ của các thế lực thù địch đối với Cách mạng Việt Nam","28":"Bảo vệ Tổ quốc Việt Nam xã hội chủ nghĩa sau năm 1975","29":"Bảo vệ Tổ quốc Việt Nam xã hội chủ nghĩa sau năm 1975","30":"Bảo vệ Tổ quốc Việt Nam xã hội chủ nghĩa sau năm 1975","31":"Truyền thống và nghệ thuật đánh giặc giữ nước của địa phương","32":"Truyền thống và nghệ thuật đánh giặc giữ nước của địa phương","33":"Truyền thống và nghệ thuật đánh giặc giữ nước của địa phương","34":"Truyền thống và nghệ thuật đánh giặc giữ nước của địa phương","35":"Kiểm tra cuối kỳ"}},"electiveMap":{},"warnings":[],"gradeCounts":{"10":35,"11":35,"12":35},"electiveGradeCounts":{},"regularEntries":105,"electiveEntries":0,"entries":105,"warningCount":0,"modes":["duration"],"criticalWarningCount":0,"partial":false,"criticalWarnings":[]},"Địa lí":{"subject":"Địa lí","title":"Phu luc I - Ke hoach day hoc - Dia li (x).docx","kind":"Kho PPCT tích hợp","format":"Dữ liệu chuẩn của trường từ Kế hoạch dạy học 2026–2027","map":{"10":{"1":"Bài 1. Môn Địa lí với định hướng nghề nghiệp cho học sinh","2":"Bài 2. Một số các phương pháp biểu hiện các đối tượng địa lí trên bản đồ","3":"Bài 2. Một số các phương pháp biểu hiện các đối tượng địa lí trên bản đồ","4":"Bài 3. Sử dụng bản đồ trong học tập và đời sống, một số ứng dụng của GPS và bản đồ số trong đời sống","5":"Bài 4. Sự hình thành Trái Đất, vỏ Trái Đất và vật liệu cấu tạo vỏ Trái đất","6":"Bài 4. Sự hình thành Trái Đất, vỏ Trái Đất và vật liệu cấu tạo vỏ Trái đất","7":"Bài 5. Hệ quả địa lí các chuyển động của Trái Đất","8":"Bài 5. Hệ quả địa lí các chuyển động của Trái Đất","9":"Bài 5. Hệ quả địa lí các chuyển động của Trái Đất","10":"Bài 6. Thạch quyển, thuyết kiến tạo mảng","11":"Bài 7. Nội lực và ngoại lực","12":"Bài 7. Nội lực và ngoại lực","13":"Bài 7. Nội lực và ngoại lực","14":"Bài 8. Thực hành: Sự phân bố các vành đai động đất, núi lửa","15":"Ôn tập giữa kì I","16":"Kiểm tra giữa kì I","17":"Bài 9. Khí quyển, các yếu tố khí hậu","18":"Bài 9. Khí quyển, các yếu tố khí hậu","19":"Bài 9. Khí quyển, các yếu tố khí hậu","20":"Bài 9. Khí quyển, các yếu tố khí hậu","21":"Bài 10. Thực hành: Phân tích chế độ nước của sông Hồng","22":"Bài 11. Thủy quyển, nước trên lục địa","23":"Bài 11. Thủy quyển, nước trên lục địa","24":"Bài 12. Nước biển và đại dương","25":"Bài 12. Nước biển và đại dương","26":"Bài 13. Thực hành: Phân tích bản đồ, sơ đồ về phân bố của đất và sinh vật trên thế giới","27":"Bài 14. Đất trên Trái Đất","28":"Bài 14. Đất trên Trái Đất","29":"Bài 15. Sinh quyển","30":"Bài 15. Sinh quyển","31":"Bài 16. Thực hành: Tìm hiểu về sự phân bố đất và sinh vật trên Trái Đất","32":"Bài 17. Vỏ địa lí, quy luật thống nhất và hoàn chỉnh của vỏ địa lí","33":"Bài 18. Quy luật địa đới và quy luật phi địa đới","34":"Bài 18. Quy luật địa đới và quy luật phi địa đới","35":"Ôn tập cuối kì I","36":"Kiểm tra cuối kì I","37":"Bài 19. Quy mô dân số, gia tăng dân số và cơ cấu dân số thế giới","38":"Bài 19. Quy mô dân số, gia tăng dân số và cơ cấu dân số thế giới","39":"Bài 19. Quy mô dân số, gia tăng dân số và cơ cấu dân số thế giới","40":"Bài 20. Phân bố dân cư và đô thị hóa trên thế giới","41":"Bài 20. Phân bố dân cư và đô thị hóa trên thế giới","42":"Bài 21. Các nguồn lực phát triển kinh tế","43":"Bài 22. Cơ cấu kinh tế, tổng sản phẩm trong nước và tổng thu nhập quốc gia","44":"Bài 22. Cơ cấu kinh tế, tổng sản phẩm trong nước và tổng thu nhập quốc gia","45":"Bài 23. Vai trò, đặc điểm, các nhân tố ảnh hưởng đến sự phát triển và phân bố nông nghiệp, lâm nghiệp, thủy sản","46":"Bài 24. Địa lí ngành lâm nghiệp và ngành thủy sản","47":"Bài 24. Địa lí ngành lâm nghiệp và ngành thủy sản","48":"Bài 25. Địa lí ngành lâm nghiệp và ngành thủy sản","49":"Bài 26. Tổ chức lãnh thổ nông nghiệp, một số vấn đề phát triển nông nghiệp hiện đại trên thế giới và định hướng phát triển nông nghiệp trong tương lai","50":"Bài 27. Thực hành: Vẽ và nhận xét biểu đồ về sản lượng lương thực của thế giới","51":"Ôn tập giữa kì II","52":"Kiểm tra giữa kì II","53":"Bài 28. Vai trò, đặc điểm, cơ cấu ngành công nghiệp và các nhân tố ảnh hưởng đến sự phát triển và phân bố công nghiệp","54":"Bài 29. Địa lí một số ngành công nghiệp","55":"Bài 29. Địa lí một số ngành công nghiệp","56":"Bài 30. Tổ chức lãnh thổ công nghiệp","57":"Bài 31. Tác động của công nghiệp đối với môi trường, phát triển năng lượng tái tạo, định hướng phát triển công nghiệp trong tương lai.","58":"Bài 32. Thực hành: Viết báo cáo tìm hiểu một vấn đề về công nghiệp","59":"Bài 33. Cơ cấu, vai trò, đặc điểm các nhân tố ảnh hưởng đến sự phát triển và phân bố dịch vụ","60":"Bài 34. Địa lí ngành giao thông vận tải","61":"Bài 34. Địa lí ngành giao thông vận tải","62":"Bài 35. Địa lí ngành bưu chính viễn thông","63":"Bài 36. Địa lí ngành du lịch","64":"Bài 37. Địa lí ngành tương mại và ngành tài chính ngân hàng","65":"Bài 38. Thực hành: Viết báo cáo tìm hiểu về một ngành dịch vụ","66":"Bài 39. Môi trường và tài nguyên thiên nhiên","67":"Bài 40. Phát triển bền vững và tăng trưởng xanh","68":"Bài 40. Phát triển bền vững và tăng trưởng xanh","69":"Ôn tập cuối kì II","70":"Kiểm tra cuối kì II"},"11":{"1":"Bài 1. Sự khác biệt về trình độ phát triển kinh tế xã hội giữa các nhóm nước","2":"Bài 1. Sự khác biệt về trình độ phát triển kinh tế xã hội giữa các nhóm nước","3":"Bài 2: Toàn cầu hóa, khu vực hóa kinh tế","4":"Bài 2: Toàn cầu hóa, khu vực hóa kinh tế","5":"Bài 3. Thực hành: Tìm hiểu cơ hội, thách thức của toàn cầu hóa và khu vực hóa kinh tế","6":"Bài 4: Một số tổ chức quốc tế và khu vực, an ninh toàn cầu","7":"Bài 4: Một số tổ chức quốc tế và khu vực, an ninh toàn cầu","8":"Bài 5: Thực hành: Viết báo cáo về nền kinh tế tri thức","9":"Bài 6: Vị trí địa lí, điều kiện tự nhiên, dân cư và kinh tế khu vực Mỹ La tinh","10":"Bài 6: Vị trí địa lí, điều kiện tự nhiên, dân cư và kinh tế khu vực Mỹ La tinh","11":"Bài 6: Vị trí địa lí, điều kiện tự nhiên, dân cư và kinh tế khu vực Mỹ La tinh"},"12":{"1":"Bài 1. Vị trí địa lí và phạm vi lãnh thổ","2":"Bài 1. Vị trí địa lí và phạm vi lãnh thổ","3":"Bài 2. Thiên nhiên nhiệt đới ẩm gió mùa","4":"Bài 2. Thiên nhiên nhiệt đới ẩm gió mùa","5":"Bài 2. Thiên nhiên nhiệt đới ẩm gió mùa","6":"Bài 3. Sự phân hoá đa dạng của thiên nhiên","7":"Bài 3. Sự phân hoá đa dạng của thiên nhiên","8":"Bài 3. Sự phân hoá đa dạng của thiên nhiên","9":"Bài 3. Sự phân hoá đa dạng của thiên nhiên","10":"Bài 4. Thực hành: Viết báo cáo về sự phân hoá tự nhiên Việt Nam","11":"Bài 5. Vấn đề sử dụng hợp lí tài nguyên thiên nhiên và bảo vệ môi trường","12":"Bài 5. Vấn đề sử dụng hợp lí tài nguyên thiên nhiên và bảo vệ môi trường","13":"Bài 6: Thực hành: tuyên truyền sử dụng hợp lí tài nguyên thiên nhiên hoặc bảo vệ môi trường ở địa phương","14":"Bài 7. Dân số Việt Nam","15":"Bài 7. Dân số Việt Nam","16":"Bài 8. Lao động và việc làm","17":"Bài 8. Lao động và việc làm","18":"Bài 9. Đô thị hoá","19":"Ôn tập giữa kì I","20":"Kiểm tra giữa kì I","21":"Bài 10. Thực hành: Viết báo cáo về một chủ đề dân cư ở Việt Nam","22":"Bài 11. Chuyển dịch cơ cấu kinh tế","23":"Bài 12. Vấn đề phát triển ngành nông nghiệp","24":"Bài 12. Vấn đề phát triển ngành nông nghiệp","25":"Bài 12. Vấn đề phát triển ngành nông nghiệp","26":"Bài 13. Vấn đề phát triển ngành lâm nghiệp và ngành thuỷ sản","27":"Bài 13. Vấn đề phát triển ngành lâm nghiệp và ngành thuỷ sản","28":"Bài 14. Tổ chức lãnh thổ nông nghiệp","29":"Bài 15. Thực hành: Tìm hiểu vài trò ngành nông nghiệp, lâm nghiệp và thuỷ sản; vẽ biểu đồ và nhận xét về ngành nông nghiệp, lâm nghiệp và thuỷ sản","30":"Bài 16. Chuyển dịch cơ cấu ngành công nghiệp","31":"Bài 17. Một số ngành công nghiệp","32":"Bài 17. Một số ngành công nghiệp","33":"Bài 17. Một số ngành công nghiệp","34":"Bài 17. Một số ngành công nghiệp","35":"Bài 18. Tổ chức lãnh thổ công nghiệp","36":"Bài 19. Thực hành: Vẽ biểu đồ, nhận xét và giải thích tình hình phát triển ngành công nghiệp","37":"Ôn tập cuối kì I","38":"Kiểm tra cuối kì I","39":"Bài 20. Vai trò, các nhân tố ảnh hưởng đến sự phát triển và phân bố các ngành dịch vụ","40":"Bài 21. Giao thông vận tải và bưu chính viễn thông","41":"Bài 21. Giao thông vận tải và bưu chính viễn thông","42":"Bài 22. Thương mại và du lịch","43":"Bài 22. Thương mại và du lịch","44":"Bài 23. Thực hành: Tìm hiểu sự phát triển một số ngành dịch vụ","45":"Bài 24. Khai thác thế mạnh ở Trung du và miền núi phía Bắc","46":"Bài 24. Khai thác thế mạnh ở Trung du và miền núi phía Bắc","47":"Bài 24. Khai thác thế mạnh ở Trung du và miền núi phía Bắc","48":"Bài 24. Khai thác thế mạnh ở Trung du và miền núi phía Bắc","49":"Bài 25. Phát triển kinh tế - xã hội ở Đồng bằng sông Hồng","50":"Bài 25. Phát triển kinh tế - xã hội ở Đồng bằng sông Hồng","51":"Bài 26: Thực hành: tìm hiểu vấn đề phát triển kinh tế biển ở Đồng bằng sông Hồng","52":"Bài 27. Phát triển kinh tế xã hội ở Bắc Trung Bộ","53":"Bài 27. Phát triển kinh tế xã hội ở Bắc Trung Bộ","54":"Ôn tập giữa kì II","55":"Kiểm tra giữa kì II","56":"Bài 28. Phát triển kinh tế - xã hội ở Duyên hải Nam Trung Bộ và Tây Nguyên (Nam Trung Bộ)","57":"Bài 28. Phát triển kinh tế - xã hội ở Duyên hải Nam Trung Bộ và Tây Nguyên (Nam Trung Bộ)","58":"Bài 28. Phát triển kinh tế - xã hội ở Duyên hải Nam Trung Bộ và Tây Nguyên (Nam Trung Bộ)","59":"Bài 28. Phát triển kinh tế - xã hội ở Duyên hải Nam Trung Bộ và Tây Nguyên (Nam Trung Bộ)","60":"Bài 29. Thực hành: phân tích ý nghĩa của phát triển kinh tế biển đối với quốc phòng, an ninh vùng Duyên hải Nam Trung Bộ và Tây Nguyên (Nam Trung Bộ)","61":"Bài 30. Phát triển kinh tế - xã hội ở Đông Nam Bộ","62":"Bài 30. Phát triển kinh tế - xã hội ở Đông Nam Bộ","63":"Bài 30. Phát triển kinh tế - xã hội ở Đông Nam Bộ","64":"Bài 31. Sử dụng hợp lí tự nhiên để phát triển kinh tế ở vùng Đồng bằng sông Cửu Long","65":"Bài 31. Sử dụng hợp lí tự nhiên để phát triển kinh tế ở vùng Đồng bằng sông Cửu Long","66":"Bài 32. Thực hành: Viết báo cáo về biển đổi khí hậu ở Đồng bằng sông Cửu Long","67":"Bài 33. Phát triển kinh tế và đảm bảo quốc phòng an ninh ở Biển Đông và các đảo, quần đảo","68":"Bài 33. Phát triển kinh tế và đảm bảo quốc phòng an ninh ở Biển Đông và các đảo, quần đảo","69":"Bài 33. Phát triển kinh tế và đảm bảo quốc phòng an ninh ở Biển Đông và các đảo, quần đảo","70":"Bài 34. Thực hành: Viết báo cáo tuyên truyền về bảo vệ chủ quyền biển đảo của Việt Nam","71":"Bài 35. Thực hành: Tìm hiểu địa lí địa phương","72":"Bài 35. Thực hành: Tìm hiểu địa lí địa phương","73":"Ôn tập cuối kì II","74":"Kiểm tra cuối kì II"}},"electiveMap":{"10":{"1":"Biến đổi khí hậu","2":"Biến đổi khí hậu","3":"Biến đổi khí hậu","4":"Biến đổi khí hậu","5":"Biến đổi khí hậu","6":"Biến đổi khí hậu","7":"Biến đổi khí hậu","8":"Biến đổi khí hậu","9":"Biến đổi khí hậu","10":"Biến đổi khí hậu","11":"Đô thị hóa","12":"Đô thị hóa","13":"Đô thị hóa","14":"Đô thị hóa","15":"Đô thị hóa","16":"Đô thị hóa","17":"Đô thị hóa","18":"Đô thị hóa","19":"Đô thị hóa","20":"Đô thị hóa","21":"Đô thị hóa","22":"Đô thị hóa","23":"Đô thị hóa","24":"Đô thị hóa","25":"Đô thị hóa","26":"Phương pháp viết báo cáo địa lí","27":"Phương pháp viết báo cáo địa lí","28":"Phương pháp viết báo cáo địa lí","29":"Phương pháp viết báo cáo địa lí","30":"Phương pháp viết báo cáo địa lí","31":"Phương pháp viết báo cáo địa lí","32":"Phương pháp viết báo cáo địa lí","33":"Phương pháp viết báo cáo địa lí","34":"Phương pháp viết báo cáo địa lí","35":"Phương pháp viết báo cáo địa lí"},"11":{"1":"Một số vấn đề về du lịch thế giới","2":"Một số vấn đề về du lịch thế giới","3":"Một số vấn đề về du lịch thế giới","4":"Một số vấn đề về du lịch thế giới","5":"Một số vấn đề về du lịch thế giới","6":"Một số vấn đề về du lịch thế giới","7":"Một số vấn đề về du lịch thế giới","8":"Một số vấn đề về du lịch thế giới","9":"Một số vấn đề về du lịch thế giới","10":"Một số vấn đề về du lịch thế giới","11":"Một số vấn đề khu vực Đông Nam Á","12":"Một số vấn đề khu vực Đông Nam Á","13":"Một số vấn đề khu vực Đông Nam Á","14":"Một số vấn đề khu vực Đông Nam Á","15":"Một số vấn đề khu vực Đông Nam Á","16":"Một số vấn đề khu vực Đông Nam Á","17":"Một số vấn đề khu vực Đông Nam Á","18":"Một số vấn đề khu vực Đông Nam Á","19":"Một số vấn đề khu vực Đông Nam Á","20":"Một số vấn đề khu vực Đông Nam Á","21":"Một số vấn đề khu vực Đông Nam Á","22":"Một số vấn đề khu vực Đông Nam Á","23":"Một số vấn đề khu vực Đông Nam Á","24":"Một số vấn đề khu vực Đông Nam Á","25":"Một số vấn đề khu vực Đông Nam Á","26":"Cuộc cách mạng công nghiệp lần thứ tư (4.0)","27":"Cuộc cách mạng công nghiệp lần thứ tư (4.0)","28":"Cuộc cách mạng công nghiệp lần thứ tư (4.0)","29":"Cuộc cách mạng công nghiệp lần thứ tư (4.0)","30":"Cuộc cách mạng công nghiệp lần thứ tư (4.0)","31":"Cuộc cách mạng công nghiệp lần thứ tư (4.0)","32":"Cuộc cách mạng công nghiệp lần thứ tư (4.0)","33":"Cuộc cách mạng công nghiệp lần thứ tư (4.0)","34":"Cuộc cách mạng công nghiệp lần thứ tư (4.0)","35":"Cuộc cách mạng công nghiệp lần thứ tư (4.0)"},"12":{"1":"Thiên tai và biện pháp phòng chống","2":"Thiên tai và biện pháp phòng chống","3":"Thiên tai và biện pháp phòng chống","4":"Thiên tai và biện pháp phòng chống","5":"Thiên tai và biện pháp phòng chống","6":"Thiên tai và biện pháp phòng chống","7":"Thiên tai và biện pháp phòng chống","8":"Thiên tai và biện pháp phòng chống","9":"Thiên tai và biện pháp phòng chống","10":"Thiên tai và biện pháp phòng chống","11":"Phát triển vùng","12":"Phát triển vùng","13":"Phát triển vùng","14":"Phát triển vùng","15":"Phát triển vùng","16":"Phát triển vùng","17":"Phát triển vùng","18":"Phát triển vùng","19":"Phát triển vùng","20":"Phát triển vùng","21":"Phát triển vùng","22":"Phát triển vùng","23":"Phát triển vùng","24":"Phát triển vùng","25":"Phát triển vùng","26":"Phát triển làng nghề","27":"Phát triển làng nghề","28":"Phát triển làng nghề","29":"Phát triển làng nghề","30":"Phát triển làng nghề","31":"Phát triển làng nghề","32":"Phát triển làng nghề","33":"Phát triển làng nghề","34":"Phát triển làng nghề","35":"Phát triển làng nghề"}},"warnings":["Lớp 11 chính khóa: nguồn khai báo tổng 70 tiết nhưng đọc được 11 PPCT.","Lớp 11 chính khóa: Thiếu Số tiết tại “Bài 7. Kinh tế khu vực Mỹ La tinh”; dừng đánh PPCT từ đây để tránh lệch tiến độ.","Lớp 12 chính khóa: nguồn khai báo tổng 70 tiết nhưng đọc được 74 PPCT."],"gradeCounts":{"10":70,"11":11,"12":74},"electiveGradeCounts":{"10":35,"11":35,"12":35},"regularEntries":155,"electiveEntries":105,"entries":260,"warningCount":3,"modes":["duration"],"criticalWarningCount":3,"partial":true,"criticalWarnings":["Lớp 11 chính khóa: nguồn khai báo tổng 70 tiết nhưng đọc được 11 PPCT.","Lớp 11 chính khóa: Thiếu Số tiết tại “Bài 7. Kinh tế khu vực Mỹ La tinh”; dừng đánh PPCT từ đây để tránh lệch tiến độ.","Lớp 12 chính khóa: nguồn khai báo tổng 70 tiết nhưng đọc được 74 PPCT."]},"GDKTPL":{"subject":"GDKTPL","title":"Phu luc I - 18.9. 2025. Ke hoach day hoc GDKT&PL (x).docx","kind":"Kho PPCT tích hợp","format":"Dữ liệu chuẩn của trường từ Kế hoạch dạy học 2026–2027","map":{"10":{"1":"Bài 1: Các hoạt động kinh tế cơ bản trong đời sống xã hội","2":"Bài 1: Các hoạt động kinh tế cơ bản trong đời sống xã hội","3":"Bài 1: Các hoạt động kinh tế cơ bản trong đời sống xã hội","4":"Bài 2: Các chủ thể của nền kinh tế","5":"Bài 2: Các chủ thể của nền kinh tế","6":"Bài 2: Các chủ thể của nền kinh tế","7":"Bài 3: Thị trường","8":"Bài 3: Thị trường","9":"Bài 3: Thị trường","10":"Bài 4: Cơ chế thị trường","11":"Bài 4: Cơ chế thị trường","12":"Bài 4: Cơ chế thị trường","13":"Bài 5: Ngân sách nhà nước","14":"Bài 5: Ngân sách nhà nước","15":"Bài 5: Ngân sách nhà nước","16":"Bài 6: Thuế","17":"Bài 6: Thuế","18":"Ôn tập giữa kì 1","19":"Kiểm tra giữa kì 1","20":"Bài 7: Sản xuất kinh doanh và các mô hình sản xuất kinh doanh","21":"Bài 7: Sản xuất kinh doanh và các mô hình sản xuất kinh doanh","22":"Bài 7: Sản xuất kinh doanh và các mô hình sản xuất kinh doanh","23":"Bài 7: Sản xuất kinh doanh và các mô hình sản xuất kinh doanh","24":"Bài 7: Sản xuất kinh doanh và các mô hình sản xuất kinh doanh","25":"Bài 8: Tín dụng và vai trò của tín dụng trong đời sống","26":"Bài 8: Tín dụng và vai trò của tín dụng trong đời sống","27":"Bài 9: Dịch vụ tín dụng","28":"Bài 9: Dịch vụ tín dụng","29":"Bài 9: Dịch vụ tín dụng","30":"Bài 10: Lập kế hoạch tài chính cá nhân","31":"Bài 10: Lập kế hoạch tài chính cá nhân","32":"Bài 10: Lập kế hoạch tài chính cá nhân","33":"Bài 10: Lập kế hoạch tài chính cá nhân","34":"Ôn tập cuối kì","35":"Kiểm tra cuối kì","36":"Bài 11: Khái niệm, đặc điểm và vai trò của pháp luật","37":"Bài 11: Khái niệm, đặc điểm và vai trò của pháp luật","38":"Bài 11: Khái niệm, đặc điểm và vai trò của pháp luật","39":"Bài 12: Hệ thống pháp luật và văn bản pháp luật Việt Nam","40":"Bài 12: Hệ thống pháp luật và văn bản pháp luật Việt Nam","41":"Bài 13: Thực hiện pháp luật","42":"Bài 13: Thực hiện pháp luật","43":"Bài 14: Khái niệm, đặc điểm, vị trí của Hiến pháp nước Cộng hòa xã hội chru nghĩa Việt Nam","44":"Bài 14: Khái niệm, đặc điểm, vị trí của Hiến pháp nước Cộng hòa xã hội chru nghĩa Việt Nam","45":"Bài 15: Nội dung cơ bản của Hiến pháp và chế độ chính trị","46":"Bài 15: Nội dung cơ bản của Hiến pháp và chế độ chính trị","47":"Bài 15: Nội dung cơ bản của Hiến pháp và chế độ chính trị","48":"Bài 16: Nội dung cơ bản của Hiến pháp về quyền con người, quyền và nghĩa vụ cơ bản của công dân","49":"Bài 16: Nội dung cơ bản của Hiến pháp về quyền con người, quyền và nghĩa vụ cơ bản của công dân","50":"Bài 16: Nội dung cơ bản của Hiến pháp về quyền con người, quyền và nghĩa vụ cơ bản của công dân","51":"Ôn tập giữa kì 2","52":"Kiểm tra giữa kì 2","53":"Bài 17: Nội dung cơ bản của Hiến pháp về kinh tế, văn hóa, xã hội, giáo dục, khoa học, công nghệ, môi trường","54":"Bài 17: Nội dung cơ bản của Hiến pháp về kinh tế, văn hóa, xã hội, giáo dục, khoa học, công nghệ, môi trường","55":"Bài 17: Nội dung cơ bản của Hiến pháp về kinh tế, văn hóa, xã hội, giáo dục, khoa học, công nghệ, môi trường","56":"Bài 17: Nội dung cơ bản của Hiến pháp về kinh tế, văn hóa, xã hội, giáo dục, khoa học, công nghệ, môi trường","57":"Bài 18: Đặc điểm, cấu trúc và nguyên tắc hoạt động của hệ thống chính trị nước Cộng hòa xã hội chủ nghĩa Việt Nam","58":"Bài 18: Đặc điểm, cấu trúc và nguyên tắc hoạt động của hệ thống chính trị nước Cộng hòa xã hội chủ nghĩa Việt Nam","59":"Bài 18: Đặc điểm, cấu trúc và nguyên tắc hoạt động của hệ thống chính trị nước Cộng hòa xã hội chủ nghĩa Việt Nam","60":"Bài 18: Đặc điểm, cấu trúc và nguyên tắc hoạt động của hệ thống chính trị nước Cộng hòa xã hội chủ nghĩa Việt Nam","61":"Bài 19: Quốc hội, Chủ tịch nước, Chính phủ nước Cộng hòa xã hội chủ nghĩa Việt Nam","62":"Bài 19: Quốc hội, Chủ tịch nước, Chính phủ nước Cộng hòa xã hội chủ nghĩa Việt Nam","63":"Bài 19: Quốc hội, Chủ tịch nước, Chính phủ nước Cộng hòa xã hội chủ nghĩa Việt Nam","64":"Bài 19: Quốc hội, Chủ tịch nước, Chính phủ nước Cộng hòa xã hội chủ nghĩa Việt Nam","65":"Bài 20: Tòa án nhân dân và Viện Kiểm sát nhân dân","66":"Bài 20: Tòa án nhân dân và Viện Kiểm sát nhân dân","67":"Bài 21: Hội đồng nhân dân và Ủy ban nhân dân","68":"Bài 21: Hội đồng nhân dân và Ủy ban nhân dân","69":"Ôn tập cuối kỳ 2","70":"Kiểm tra cuối kì 2"},"11":{"1":"Bài 1: Cạnh tranh trong nền kinh tế thị trường","2":"Bài 1: Cạnh tranh trong nền kinh tế thị trường","3":"Bài 1: Cạnh tranh trong nền kinh tế thị trường","4":"Bài 2: Cung – cầu trong nền kinh tế thị trường","5":"Bài 2: Cung – cầu trong nền kinh tế thị trường","6":"Bài 2: Cung – cầu trong nền kinh tế thị trường","7":"Bài 3: Lạm phát","8":"Bài 3: Lạm phát","9":"Bài 3: Lạm phát","10":"Bài 4: Thất nghiệp","11":"Bài 4: Thất nghiệp","12":"Bài 4: Thất nghiệp","13":"Bài 4: Thất nghiệp","14":"Bài 5: Thị trường lao động và việc làm","15":"Bài 5: Thị trường lao động và việc làm","16":"Bài 5: Thị trường lao động và việc làm","17":"Bài 5: Thị trường lao động và việc làm","18":"Ôn tập giữa kì 1","19":"Kiểm tra giữa kì 1","20":"Bài 6: ý tưởng, cơ hội kinh doanh và các năng lực cần thiết của người kinh doanh","21":"Bài 6: ý tưởng, cơ hội kinh doanh và các năng lực cần thiết của người kinh doanh","22":"Bài 6: ý tưởng, cơ hội kinh doanh và các năng lực cần thiết của người kinh doanh","23":"Bài 6: ý tưởng, cơ hội kinh doanh và các năng lực cần thiết của người kinh doanh","24":"Bài 6: ý tưởng, cơ hội kinh doanh và các năng lực cần thiết của người kinh doanh","25":"Bài 6: ý tưởng, cơ hội kinh doanh và các năng lực cần thiết của người kinh doanh","26":"Bài 7: Đạo đức kinh doanh","27":"Bài 7: Đạo đức kinh doanh","28":"Bài 7: Đạo đức kinh doanh","29":"Bài 7: Đạo đức kinh doanh","30":"Bài 7: Đạo đức kinh doanh","31":"Bài 8: Văn hóa tiêu dùng","32":"Bài 8: Văn hóa tiêu dùng","33":"Bài 8: Văn hóa tiêu dùng","34":"Bài 8: Văn hóa tiêu dùng","35":"Ôn tập cuối kì 1","36":"Kiểm tra cuối kì 1","37":"Bài 9: Quyền bình đẳng của công dân trước pháp luật","38":"Bài 9: Quyền bình đẳng của công dân trước pháp luật","39":"Bài 10: Bình đẳng giới trong các lĩnh vực","40":"Bài 10: Bình đẳng giới trong các lĩnh vực","41":"Bài 10: Bình đẳng giới trong các lĩnh vực","42":"Bài 11: Quyền bình đẳng giữa các dân tộc","43":"Bài 11: Quyền bình đẳng giữa các dân tộc","44":"Bài 12: Quyền bình đẳng giữa các tôn giáo","45":"Bài 12: Quyền bình đẳng giữa các tôn giáo","46":"Bài 13: Quyền và nghĩa vụ của công dân trong tham gia quản lý nhà nước và xã hội","47":"Bài 13: Quyền và nghĩa vụ của công dân trong tham gia quản lý nhà nước và xã hội","48":"Bài 14: Quyền và nghĩa vụ của công dân về bầu cử và ứng cử","49":"Bài 14: Quyền và nghĩa vụ của công dân về bầu cử và ứng cử","50":"Ôn tập giữa kì 2","51":"Kiểm tra giữa kì 2","52":"Bài 15: Quyền và nghĩa vụ của công dân về khiếu nại, tố cáo","53":"Bài 15: Quyền và nghĩa vụ của công dân về khiếu nại, tố cáo","54":"Bài 15: Quyền và nghĩa vụ của công dân về khiếu nại, tố cáo","55":"Bài 16: Quyền và nghĩa vụ của công dân về bảo vệ tổ quốc","56":"Bài 16: Quyền và nghĩa vụ của công dân về bảo vệ tổ quốc","57":"Bài 17: Quyền bất khả xâm phạm về thân thể và quyền được pháp luật bảo hộ về tính mạng, sức khỏe, danh dự, nhân phẩm của công dân","58":"Bài 17: Quyền bất khả xâm phạm về thân thể và quyền được pháp luật bảo hộ về tính mạng, sức khỏe, danh dự, nhân phẩm của công dân","59":"Bài 17: Quyền bất khả xâm phạm về thân thể và quyền được pháp luật bảo hộ về tính mạng, sức khỏe, danh dự, nhân phẩm của công dân","60":"Bài 18: Quyền bất khả xâm phạm về chỗ ở của công dân","61":"Bài 18: Quyền bất khả xâm phạm về chỗ ở của công dân","62":"Bài 19: Quyền được bảo đảm an toàn và bí mật thư tín, điện thoại, điện tín của công dân","63":"Bài 19: Quyền được bảo đảm an toàn và bí mật thư tín, điện thoại, điện tín của công dân","64":"Bài 20: Quyền và nghĩa vụ của công dân về tự do ngôn luận, báo chí và tiếp cận thông tin","65":"Bài 20: Quyền và nghĩa vụ của công dân về tự do ngôn luận, báo chí và tiếp cận thông tin","66":"Bài 20: Quyền và nghĩa vụ của công dân về tự do ngôn luận, báo chí và tiếp cận thông tin","67":"Bài 21: Quyền và nghĩa vụ của công dân về tự do tín ngưỡng và tôn giáo","68":"Bài 21: Quyền và nghĩa vụ của công dân về tự do tín ngưỡng và tôn giáo","69":"Ôn tập cuối kỳ 2","70":"Kiểm tra cuối kì 2"},"12":{"1":"Bài 1: Tăng trưởng và phát triển kinh tế","2":"Bài 1: Tăng trưởng và phát triển kinh tế","3":"Bài 1: Tăng trưởng và phát triển kinh tế","4":"Bài 1: Tăng trưởng và phát triển kinh tế","5":"Bài 1: Tăng trưởng và phát triển kinh tế","6":"Bài 2: Hội nhập kinh tế quốc tế","7":"Bài 2: Hội nhập kinh tế quốc tế","8":"Bài 2: Hội nhập kinh tế quốc tế","9":"Bài 2: Hội nhập kinh tế quốc tế","10":"Bài 2: Hội nhập kinh tế quốc tế","11":"Bài 3: Bảo hiểm","12":"Bài 3: Bảo hiểm","13":"Bài 3: Bảo hiểm","14":"Bài 4: An sinh xã hội","15":"Bài 4: An sinh xã hội","16":"Bài 4: An sinh xã hội","17":"Ôn tập giữa kì 1","18":"Kiểm tra giữa kì 1","19":"Bài 5: Lập kế hoạch kinh doanh","20":"Bài 5: Lập kế hoạch kinh doanh","21":"Bài 5: Lập kế hoạch kinh doanh","22":"Bài 5: Lập kế hoạch kinh doanh","23":"Bài 5: Lập kế hoạch kinh doanh","24":"Bài 6: Trách nhiệm xã hội của doanh nghiệp","25":"Bài 6: Trách nhiệm xã hội của doanh nghiệp","26":"Bài 6: Trách nhiệm xã hội của doanh nghiệp","27":"Bài 6: Trách nhiệm xã hội của doanh nghiệp","28":"Bài 6: Trách nhiệm xã hội của doanh nghiệp","29":"Bài 7: Quản lý thu, chi trong gia đình","30":"Bài 7: Quản lý thu, chi trong gia đình","31":"Bài 7: Quản lý thu, chi trong gia đình","32":"Bài 7: Quản lý thu, chi trong gia đình","33":"Bài 7: Quản lý thu, chi trong gia đình","34":"Ôn tập cuối kì I","35":"Kiểm tra cuối kì I","36":"Bài 8: Quyền và nghĩa vụ của công dân về kinh doanh và nộp thuế","37":"Bài 8: Quyền và nghĩa vụ của công dân về kinh doanh và nộp thuế","38":"Bài 8: Quyền và nghĩa vụ của công dân về kinh doanh và nộp thuế","39":"Bài 9: Quyền và nghĩa vụ của công dân về sở hữu tài sản và nghĩa vụ tôn trọng tài sản của người khác","40":"Bài 9: Quyền và nghĩa vụ của công dân về sở hữu tài sản và nghĩa vụ tôn trọng tài sản của người khác","41":"Bài 9: Quyền và nghĩa vụ của công dân về sở hữu tài sản và nghĩa vụ tôn trọng tài sản của người khác","42":"Bài 10: Quyền và nghĩa vụ của công dân trong hôn nhân và gia đình","43":"Bài 10: Quyền và nghĩa vụ của công dân trong hôn nhân và gia đình","44":"Bài 10: Quyền và nghĩa vụ của công dân trong hôn nhân và gia đình","45":"Bài 11: Quyền và nghĩa vụ của công dân trong học tập","46":"Bài 11: Quyền và nghĩa vụ của công dân trong học tập","47":"Bài 12: Quyền và nghĩa vụ cơ bản của công dân trong bảo vệ, chăm sóc sức khỏe và bảo đảm an sinh xã hội","48":"Bài 12: Quyền và nghĩa vụ cơ bản của công dân trong bảo vệ, chăm sóc sức khỏe và bảo đảm an sinh xã hội","49":"Bài 12: Quyền và nghĩa vụ cơ bản của công dân trong bảo vệ, chăm sóc sức khỏe và bảo đảm an sinh xã hội","50":"Bài 13: Quyền và nghĩa vụ của công dân trong bảo vệ di sản văn hóa, môi trường và tài nguyên thiên nhiên","51":"Bài 13: Quyền và nghĩa vụ của công dân trong bảo vệ di sản văn hóa, môi trường và tài nguyên thiên nhiên","52":"Ôn tập giữa kì 2","53":"Kiểm tra giữa kì 2","54":"Bài 13: Quyền và nghĩa vụ của công dân trong bảo vệ di sản văn hóa, môi trường và tài nguyên thiên nhiên","55":"Bài 14: Một số vấn đề chung về pháp luật quốc tế","56":"Bài 14: Một số vấn đề chung về pháp luật quốc tế","57":"Bài 15: Công pháp quốc tế về dân cư, lãnh thổ và chủ quyền quốc gia","58":"Bài 15: Công pháp quốc tế về dân cư, lãnh thổ và chủ quyền quốc gia","59":"Bài 15: Công pháp quốc tế về dân cư, lãnh thổ và chủ quyền quốc gia","60":"Bài 15: Công pháp quốc tế về dân cư, lãnh thổ và chủ quyền quốc gia","61":"Bài 15: Công pháp quốc tế về dân cư, lãnh thổ và chủ quyền quốc gia","62":"Bài 15: Công pháp quốc tế về dân cư, lãnh thổ và chủ quyền quốc gia","63":"Bài 16: Nguyên tắc cơ bản của tổ chức thương mại thế giới và hợp đồng thương mại quốc tế","64":"Bài 16: Nguyên tắc cơ bản của tổ chức thương mại thế giới và hợp đồng thương mại quốc tế","65":"Bài 16: Nguyên tắc cơ bản của tổ chức thương mại thế giới và hợp đồng thương mại quốc tế","66":"Bài 16: Nguyên tắc cơ bản của tổ chức thương mại thế giới và hợp đồng thương mại quốc tế","67":"Bài 16: Nguyên tắc cơ bản của tổ chức thương mại thế giới và hợp đồng thương mại quốc tế","68":"Bài 16: Nguyên tắc cơ bản của tổ chức thương mại thế giới và hợp đồng thương mại quốc tế","69":"Ôn tập cuối kỳ 2","70":"Kiểm tra cuối kì 2"}},"electiveMap":{},"warnings":[],"gradeCounts":{"10":70,"11":70,"12":70},"electiveGradeCounts":{},"regularEntries":210,"electiveEntries":0,"entries":210,"warningCount":0,"modes":["duration"],"criticalWarningCount":0,"partial":false,"criticalWarnings":[]},"Vật lí":{"subject":"Vật lí","title":"Phu luc I - Ke hoach day hoc môn Vật lí (x).docx","kind":"Kho PPCT tích hợp","format":"Dữ liệu chuẩn của trường từ Kế hoạch dạy học 2026–2027","map":{"10":{"1":"Bài 1. Làm quen với Vật lí học","2":"Bài 1. Làm quen với Vật lí học","3":"Bài 2. Các quy tắc an toàn trong phòng thí nghiệm Vật lí","4":"Bài 3. Thực hành tính sai số trong phép đo. Ghi kết quả đo.","5":"Bài 4. Độ dịch chuyển và quãng đường đi được","6":"Bài 4. Độ dịch chuyển và quãng đường đi được","7":"Bài 5. Tốc độ và vận tốc","8":"Bài 5. Tốc độ và vận tốc","9":"Bài 6. Thực hành: đo tốc độ của vật chuyển động","10":"Bài 6. Thực hành: đo tốc độ của vật chuyển động","11":"Bài 7. Đồ thị độ dịch chuyển – thời gian","12":"Bài 7. Đồ thị độ dịch chuyển – thời gian","13":"Bài 8. Chuyển động thẳng biến đổi. Gia tốc","14":"Bài 8. Chuyển động thẳng biến đổi. Gia tốc","15":"Bài 9. Chuyển động thẳng biến đổi đều","16":"Bài 9. Chuyển động thẳng biến đổi đều","17":"Bài 10.Sự rơi tự do","18":"Bài 11. Thực hành: đo gia tốc rơi tự do","19":"Ôn tập giữa học kì 1","20":"Kiểm tra giữa học kì 1","21":"Bài 12. Chuyển động ném","22":"Bài 12. Chuyển động ném","23":"Bài 13. Tổng hợp và phân tích lực. Cân bằng lực","24":"Bài 14. Định luật I Newton","25":"Bài 14. Định luật I Newton","26":"Bài 15. Định luật II Newton","27":"Bài 15. Định luật II Newton","28":"Bài 16. Định luật III Newton","29":"Bài 17. Trọng lực và lực căng","30":"Bài 17. Trọng lực và lực căng","31":"Bài 18. Lực ma sát","32":"Bài 18. Lực ma sát","33":"Ôn tập kiểm tra cuối học kì 1"},"11":{"1":"Bài 1 : Dao động điều hòa","2":"Bài 1 : Dao động điều hòa","3":"Bài 2: Mô tả dao động điều hòa","4":"Bài 2: Mô tả dao động điều hòa","5":"Bài 3: Vận tốc, gia tốc trong dao động điều hòa","6":"Bài 3: Vận tốc, gia tốc trong dao động điều hòa","7":"Bài 4: Bài tập về dao động điều hòa","8":"Bài 4: Bài tập về dao động điều hòa","9":"Bài 5: Động năng, thế năng, sự chuyển hóa năng lượng trong DDDH","10":"Bài 5: Động năng, thế năng, sự chuyển hóa năng lượng trong DDDH","11":"Bài 6: Dao động tắt dần, dao động cưỡng bức. Hiện tượng cộng hưởng","12":"Bài 6: Dao động tắt dần, dao động cưỡng bức. Hiện tượng cộng hưởng","13":"Bài 7: Bài tập về sự chuyển hóa năng lượng trong DDDH","14":"Bài 7: Bài tập về sự chuyển hóa năng lượng trong DDDH","15":"Bài 8: Mô tả sóng","16":"Bài 8: Mô tả sóng","17":"Bài 9: Sóng ngang. Sóng dọc. Sự truyền năng lượng của sóng cơ","18":"Bài 9: Sóng ngang. Sóng dọc. Sự truyền năng lượng của sóng cơ","19":"Ôn tập kiểm tra giữa học kì I","20":"Kiểm tra giữa giữa học kì I","21":"Bài 10: Thực hành đo tần số của sóng âm","22":"Bài 10: Thực hành đo tần số của sóng âm","23":"Bài 11: Sóng điện từ","24":"Bài 11: Sóng điện từ","25":"Bài 12: Giao thoa sóng","26":"Bài 12: Giao thoa sóng","27":"Bài 13: Sóng dừng","28":"Bài 13: Sóng dừng","29":"Bài 14:Bài tập về sóng","30":"Bài 14:Bài tập về sóng","31":"Bài 15: Thực hành đo tốc độ truyền âm","32":"Bài 15: Thực hành đo tốc độ truyền âm","33":"Ôn tập cuối học kì I","34":"Kiểm tra cuối học kì I","35":"Bài 16: Lực tương tác giữa hai điện tích","36":"Bài 16: Lực tương tác giữa hai điện tích","37":"Bài 17: Khái niệm điện trường","38":"Bài 17: Khái niệm điện trường","39":"Bài 17: Khái niệm điện trường","40":"Bài 17: Khái niệm điện trường","41":"Bài 18: Điện trường đều","42":"Bài 18: Điện trường đều","43":"Bài 18: Điện trường đều","44":"Bài 18: Điện trường đều","45":"Bài 19: Thế năng điện","46":"Bài 19: Thế năng điện","47":"Bài 20: Điện thế","48":"Bài 20: Điện thế","49":"Bài 21: Tụ điện (tiết 1,2)","50":"Bài 21: Tụ điện (tiết 1,2)","51":"Ôn tập giữa học kì II","52":"Kiểm tra giữa học học kì II","53":"Bài 21. Tụ điện (tiết 3,4)","54":"Bài 21. Tụ điện (tiết 3,4)","55":"Bài 22: Cường độ dòng điện","56":"Bài 22: Cường độ dòng điện","57":"Bài 23: Điện trở. Định luật Ohm","58":"Bài 23: Điện trở. Định luật Ohm","59":"Bài 23: Điện trở. Định luật Ohm","60":"Bài 23: Điện trở. Định luật Ohm","61":"Bài 24: Nguồn điện","62":"Bài 24: Nguồn điện","63":"Bài 24: Nguồn điện","64":"Bài 24: Nguồn điện","65":"Bài 25: Năng lượng điện và công suất điện","66":"Bài 25: Năng lượng điện và công suất điện","67":"Ôn tập cuối học kì II","68":"Kiểm tra cuối học kì II","69":"Bài 26: Thực hành đo suất điện động và điện trở trong của pin điện hóa","70":"Bài 26: Thực hành đo suất điện động và điện trở trong của pin điện hóa"},"12":{"1":"Bài 1: Cấu trúc của chất. Sự chuyển thể","2":"Bài 1: Cấu trúc của chất. Sự chuyển thể","3":"Bài 2: Nội năng. Định luật I của nhiệt động lực học","4":"Bài 2: Nội năng. Định luật I của nhiệt động lực học","5":"Bài 3: Nhiệt độ. Thang nhiệt độ- nhiệt kế","6":"Bài 3: Nhiệt độ. Thang nhiệt độ- nhiệt kế","7":"Bài 4: Nhiệt dung riêng","8":"Bài 4: Nhiệt dung riêng","9":"Bài 5: Nhiệt nóng chảy riêng","10":"Bài 5: Nhiệt nóng chảy riêng","11":"Bài 6: Nhiệt hóa hơi riêng","12":"Bài 6: Nhiệt hóa hơi riêng","13":"Bài 7: Bài tập về vật lí nhiệt","14":"Bài 7: Bài tập về vật lí nhiệt","15":"Bài 8: Mô hình động học phân tử chất khí","16":"Bài 8: Mô hình động học phân tử chất khí","17":"Bài 9: Định luật Boyle","18":"Bài 9: Định luật Boyle","19":"Ôn tập giữa học kì I","20":"Kiểm tra giữa học kì I","21":"Bài 10: Định luật Charles","22":"Bài 10: Định luật Charles","23":"Bài 11: Phương trình trạng thái của khí lí tưởng","24":"Bài 11: Phương trình trạng thái của khí lí tưởng","25":"Bài 12: Áp suất khí theo mô hình động học phân tử. Quan hệ giữa động năng phân tử và nhiệt độ","26":"Bài 12: Áp suất khí theo mô hình động học phân tử. Quan hệ giữa động năng phân tử và nhiệt độ","27":"Bài 13: Bài tập về khí lí tưởng","28":"Bài 13: Bài tập về khí lí tưởng","29":"Bài 14: Từ trường","30":"Bài 14: Từ trường","31":"Bài 14: Từ trường","32":"Ôn tập cuối học kì I","33":"Ôn tập cuối học kì I","34":"Kiểm tra cuối học kì I","35":"Bài 15: Lực từ tác dụng lên dây dẫn mang dòng điện. Cảm ứng từ","36":"Bài 15: Lực từ tác dụng lên dây dẫn mang dòng điện. Cảm ứng từ","37":"Bài 15: Lực từ tác dụng lên dây dẫn mang dòng điện. Cảm ứng từ","38":"Bài 15: Lực từ tác dụng lên dây dẫn mang dòng điện. Cảm ứng từ","39":"Bài 15: Lực từ tác dụng lên dây dẫn mang dòng điện. Cảm ứng từ","40":"Bài 16: Từ thông. Hiện tượng cảm ứng điện từ","41":"Bài 16: Từ thông. Hiện tượng cảm ứng điện từ","42":"Bài 17: Máy phát điện xoay chiều","43":"Bài 17: Máy phát điện xoay chiều","44":"Bài 18: Ứng dụng hiện tượng cảm ứng điện từ","45":"Bài 18: Ứng dụng hiện tượng cảm ứng điện từ","46":"Bài 19: Điện từ trường. Mô hình sóng điện từ","47":"Bài 19: Điện từ trường. Mô hình sóng điện từ","48":"Bài 20: Bài tập về từ trường","49":"Bài 20: Bài tập về từ trường","50":"Ôn tập giữa học kì II","51":"Kiểm tra giữa học kì II","52":"Bài 21: Cấu trúc hạt nhân","53":"Bài 21: Cấu trúc hạt nhân","54":"Bài 21: Cấu trúc hạt nhân","55":"Bài 22: Phản ứng hạt nhân và năng lượng liên kết","56":"Bài 22: Phản ứng hạt nhân và năng lượng liên kết","57":"Bài 22: Phản ứng hạt nhân và năng lượng liên kết","58":"Bài 22: Phản ứng hạt nhân và năng lượng liên kết","59":"Bài 23: Hiện tượng phóng xạ","60":"Bài 23: Hiện tượng phóng xạ","61":"Bài 23: Hiện tượng phóng xạ","62":"Bài 23: Hiện tượng phóng xạ","63":"Bài 24: Công nghiệp hạt nhân","64":"Bài 24: Công nghiệp hạt nhân","65":"Bài 24: Công nghiệp hạt nhân","66":"Ôn tập cuối học kì II","67":"Ôn tập cuối học kì II","68":"Kiểm tra cuối học kì II","69":"Bài 25: Bài tập về vật lí hạt nhân","70":"Bài 25: Bài tập về vật lí hạt nhân"}},"electiveMap":{"10":{"1":"Bài 1: Sự hình thành và phát triển của vật lí học","2":"Bài 1: Sự hình thành và phát triển của vật lí học","3":"Bài 1: Sự hình thành và phát triển của vật lí học","4":"Bài 1: Sự hình thành và phát triển của vật lí học","5":"Bài 1: Sự hình thành và phát triển của vật lí học","6":"Bài 2: Ứng dụng của vật lí trong một số lĩnh vực","7":"Bài 2: Ứng dụng của vật lí trong một số lĩnh vực","8":"Bài 2: Ứng dụng của vật lí trong một số lĩnh vực","9":"Bài 2: Ứng dụng của vật lí trong một số lĩnh vực","10":"Bài 2: Ứng dụng của vật lí trong một số lĩnh vực","11":"Bài 3: Xác định phương hướng","12":"Bài 3: Xác định phương hướng","13":"Bài 4: Chuyển động nhìn thấy của bầu trời","14":"Bài 4: Chuyển động nhìn thấy của bầu trời","15":"Bài 4: Chuyển động nhìn thấy của bầu trời","16":"Bài 4: Chuyển động nhìn thấy của bầu trời","17":"Bài 4: Chuyển động nhìn thấy của bầu trời","18":"Bài 5: Nhật thực, Nguyệt thực và thủy triều","19":"Bài 5: Nhật thực, Nguyệt thực và thủy triều","20":"Bài 5: Nhật thực, Nguyệt thực và thủy triều","21":"Bài 6: Sự cần thiết phải bảo vệ môi trường","22":"Bài 6: Sự cần thiết phải bảo vệ môi trường","23":"Bài 6: Sự cần thiết phải bảo vệ môi trường","24":"Bài 6: Sự cần thiết phải bảo vệ môi trường","25":"Bài 6: Sự cần thiết phải bảo vệ môi trường","26":"Bài 7: Sử dụng năng lượng tiết kiệm và hiệu quả","27":"Bài 7: Sử dụng năng lượng tiết kiệm và hiệu quả","28":"Bài 7: Sử dụng năng lượng tiết kiệm và hiệu quả","29":"Bài 7: Sử dụng năng lượng tiết kiệm và hiệu quả","30":"Bài 7: Sử dụng năng lượng tiết kiệm và hiệu quả","31":"Bài 8: Năng lượng tái tạo","32":"Bài 8: Năng lượng tái tạo","33":"Bài 8: Năng lượng tái tạo","34":"Bài 8: Năng lượng tái tạo","35":"Bài 8: Năng lượng tái tạo"},"11":{"1":"Bài 1: Trường hấp dẫn","2":"Bài 1: Trường hấp dẫn","3":"Bài 1: Trường hấp dẫn","4":"Bài 1: Trường hấp dẫn","5":"Bài 1: Trường hấp dẫn","6":"Bài 2: Cường độ trường hấp dẫn","7":"Bài 2: Cường độ trường hấp dẫn","8":"Bài 2: Cường độ trường hấp dẫn","9":"Bài 2: Cường độ trường hấp dẫn","10":"Bài 2: Cường độ trường hấp dẫn","11":"Bài 3: Thế hấp dẫn và thế năng hấp dẫn","12":"Bài 3: Thế hấp dẫn và thế năng hấp dẫn","13":"Bài 3: Thế hấp dẫn và thế năng hấp dẫn","14":"Bài 3: Thế hấp dẫn và thế năng hấp dẫn","15":"Bài 3: Thế hấp dẫn và thế năng hấp dẫn","16":"Bài 4: Biến điệu","17":"Bài 4: Biến điệu","18":"Bài 4: Biến điệu","19":"Bài 5: Tín hiệu tương tự và tín hiệu số","20":"Bài 5: Tín hiệu tương tự và tín hiệu số","21":"Bài 5: Tín hiệu tương tự và tín hiệu số","22":"Bài 5: Tín hiệu tương tự và tín hiệu số","23":"Bài 6: Suy giảm tín hiệu","24":"Bài 6: Suy giảm tín hiệu","25":"Bài 6: Suy giảm tín hiệu","26":"Bài 7: Cảm biến","27":"Bài 7: Cảm biến","28":"Bài 7: Cảm biến","29":"Bài 8: Bộ khuếch đại thuật toán và thiết bị đầu ra","30":"Bài 8: Bộ khuếch đại thuật toán và thiết bị đầu ra","31":"Bài 8: Bộ khuếch đại thuật toán và thiết bị đầu ra","32":"Bài 8: Bộ khuếch đại thuật toán và thiết bị đầu ra","33":"Bài 9: Mạch điện ứng dụng đơn giản có sử dụng thiết bị đầu ra","34":"Bài 9: Mạch điện ứng dụng đơn giản có sử dụng thiết bị đầu ra","35":"Bài 9: Mạch điện ứng dụng đơn giản có sử dụng thiết bị đầu ra"},"12":{"1":"Bài 5: Tia X","2":"Bài 5: Tia X","3":"Bài 6: Chụp X-quang. Chụp cắt lớp","4":"Bài 6: Chụp X-quang. Chụp cắt lớp","5":"Bài 6: Chụp X-quang. Chụp cắt lớp","6":"Bài 6: Chụp X-quang. Chụp cắt lớp","7":"Bài 7: Siêu âm","8":"Bài 7: Siêu âm","9":"Bài 8: Chụp cộng hưởng từ","10":"Bài 8: Chụp cộng hưởng từ","11":"Bài 9: Hiệu ứng quang điện và năng lượng của photon","12":"Bài 9: Hiệu ứng quang điện và năng lượng của photon","13":"Bài 9: Hiệu ứng quang điện và năng lượng của photon","14":"Bài 9: Hiệu ứng quang điện và năng lượng của photon","15":"Bài 9: Hiệu ứng quang điện và năng lượng của photon","16":"Bài 9: Hiệu ứng quang điện và năng lượng của photon","17":"Bài 9: Hiệu ứng quang điện và năng lượng của photon","18":"Bài 10: Lưỡng tính sóng hạt","19":"Bài 10: Lưỡng tính sóng hạt","20":"Bài 11: Quang phổ vạch của nguyên tử","21":"Bài 11: Quang phổ vạch của nguyên tử","22":"Bài 11: Quang phổ vạch của nguyên tử","23":"Bài 12: Vùng năng lượng của tinh thể chất rắn","24":"Bài 12: Vùng năng lượng của tinh thể chất rắn","25":"Bài 12: Vùng năng lượng của tinh thể chất rắn","26":"Bài 1: Đặc trưng của dòng điện xoay chiều","27":"Bài 1: Đặc trưng của dòng điện xoay chiều","28":"Bài 1: Đặc trưng của dòng điện xoay chiều","29":"Bài 2: Đoạn mạch điện xoay chiều RLC mắc nối tiếp","30":"Bài 2: Đoạn mạch điện xoay chiều RLC mắc nối tiếp","31":"Bài 2: Đoạn mạch điện xoay chiều RLC mắc nối tiếp","32":"Bài 3: Máy biến áp","33":"Bài 3: Máy biến áp","34":"Bài 4: Chỉnh lưu dòng điện xoay chiều","35":"Bài 4: Chỉnh lưu dòng điện xoay chiều"}},"warnings":["Lớp 10 chính khóa: nguồn khai báo tổng 70 tiết nhưng đọc được 33 PPCT.","Lớp 10 chính khóa: Thiếu Số tiết tại “Kiểm tra cuối học kì I”; dừng đánh PPCT từ đây để tránh lệch tiến độ."],"gradeCounts":{"10":33,"11":70,"12":70},"electiveGradeCounts":{"10":35,"11":35,"12":35},"regularEntries":173,"electiveEntries":105,"entries":278,"warningCount":2,"modes":["duration"],"criticalWarningCount":2,"partial":true,"criticalWarnings":["Lớp 10 chính khóa: nguồn khai báo tổng 70 tiết nhưng đọc được 33 PPCT.","Lớp 10 chính khóa: Thiếu Số tiết tại “Kiểm tra cuối học kì I”; dừng đánh PPCT từ đây để tránh lệch tiến độ."]},"Hóa học":{"subject":"Hóa học","title":"Phu luc I - Ke hoach day hoc Hóa học (x).docx","kind":"Kho PPCT tích hợp","format":"Dữ liệu chuẩn của trường từ Kế hoạch dạy học 2026–2027","map":{"10":{"1":"Bài mở đầu: Nhập môn Hóa học","2":"Bài 1. Thành phần của nguyên tử","3":"Bài 1. Thành phần của nguyên tử","4":"Bài 2. Nguyên tố hóa học","5":"Bài 2. Nguyên tố hóa học","6":"Bài 2. Nguyên tố hóa học","7":"Bài 3. Cấu trúc lớp vỏ electron nguyên tử","8":"Bài 3. Cấu trúc lớp vỏ electron nguyên tử","9":"Bài 3. Cấu trúc lớp vỏ electron nguyên tử","10":"Bài 3. Cấu trúc lớp vỏ electron nguyên tử","11":"Bài 4. Ôn tập chương 1","12":"Bài 4. Ôn tập chương 1","13":"Bài 5. Cấu tạo của bảng tuần hoàn các nguyên tố hóa học","14":"Bài 5. Cấu tạo của bảng tuần hoàn các nguyên tố hóa học","15":"Bài 6. Xu hướng biến đổi một số tính chất của nguyên tử các nguyên tố trong một chu kì và trong một nhóm","16":"Bài 6. Xu hướng biến đổi một số tính chất của nguyên tử các nguyên tố trong một chu kì và trong một nhóm","17":"Bài 7. Xu hướng biến đổi thành phần và một số tính chất của hợp chất trong một chu kì","18":"Bài 7. Xu hướng biến đổi thành phần và một số tính chất của hợp chất trong một chu kì","19":"Ôn tập giữa HK1","20":"Kiểm tra giữa HKI","21":"Bài 8. Định luật tuần hoàn và ý nghĩa của bảng tuần hoàn các nguyên tó hóa học","22":"Bài 9. Ôn tập chương 2","23":"Bài 9. Ôn tập chương 2","24":"Bài 10. Qui tắc octet","25":"Bài 11. Liên kết ion","26":"Bài 11. Liên kết ion","27":"Bài 12. Liên kết cộng hóa trị","28":"Bài 12. Liên kết cộng hóa trị","29":"Bài 12. Liên kết cộng hóa trị","30":"Bài 12. Liên kết cộng hóa trị","31":"Bài 13. Liên kết hydrogen và tương tác Van der Waals","32":"Bài 13. Liên kết hydrogen và tương tác Van der Waals","33":"Bài 14. Ôn tập chương 3","34":"Ôn tập cuối kỳ I","35":"Ôn tập cuối kỳ I","36":"Kiểm tra cuối kỳ I","37":"Bài 15. Phản ứng oxi hóa- khử","38":"Bài 15. Phản ứng oxi hóa- khử","39":"Bài 15. Phản ứng oxi hóa- khử","40":"Bài 15. Phản ứng oxi hóa- khử","41":"Bài 15. Phản ứng oxi hóa- khử","42":"Bài 16. Ôn tập chương 4","43":"Bài 17. Biến thiên ethanpy trong các phản ứng hóa học","44":"Bài 17. Biến thiên ethanpy trong các phản ứng hóa học","45":"Bài 17. Biến thiên ethanpy trong các phản ứng hóa học","46":"Bài 17. Biến thiên ethanpy trong các phản ứng hóa học","47":"Bài 17. Biến thiên ethanpy trong các phản ứng hóa học","48":"Bài 18. Ôn tập chương 5","49":"Bài 18. Ôn tập chương 5","50":"Ôn tập giữa kì II","51":"Ôn tập giữa kì II","52":"Kiểm tra giữa kì II","53":"Bài 19. Tốc độ phản ứng","54":"Bài 19. Tốc độ phản ứng","55":"Bài 19. Tốc độ phản ứng","56":"Bài 19. Tốc độ phản ứng","57":"Bài 20. Ôn tập chương 6","58":"Bài 20. Ôn tập chương 6","59":"Bài 21. Nhóm Halogen","60":"Bài 21. Nhóm Halogen","61":"Bài 21. Nhóm Halogen","62":"Bài 21. Nhóm Halogen","63":"Bài 22. Hydrogen halide và muối halide","64":"Bài 22. Hydrogen halide và muối halide","65":"Bài 22. Hydrogen halide và muối halide","66":"Bài 23. Ôn tập chương 7","67":"Bài 23. Ôn tập chương 7","68":"Ôn tập cuối kỳ II","69":"Ôn tập cuối kỳ II","70":"Kiểm tra cuối HKII"},"11":{"1":"Bài 1: Khái niệm về cân bằng hoá học","2":"Bài 1: Khái niệm về cân bằng hoá học","3":"Bài 1: Khái niệm về cân bằng hoá học","4":"Bài 2: Cân bằng trong dung dịch nước","5":"Bài 2: Cân bằng trong dung dịch nước","6":"Bài 2: Cân bằng trong dung dịch nước","7":"Bài 2: Cân bằng trong dung dịch nước","8":"Bài 3: Ôn tập chương 1","9":"Bài 4: Nitrogen","10":"Bài 5: Ammonia - Muối ammonium","11":"Bài 5: Ammonia - Muối ammonium","12":"Bài 6: Một số hợp chất của nitrogen với oxygen","13":"Bài 6: Một số hợp chất của nitrogen với oxygen","14":"Bài 7: Sulfur và sulfur dioxide","15":"Bài 7: Sulfur và sulfur dioxide","16":"Ôn tập giữa HK1","17":"Ôn tập giữa HK1","18":"Kiểm tra giữa HK1","19":"Bài 8: Sulfuric acid và muối sulfate","20":"Bài 8: Sulfuric acid và muối sulfate","21":"Bài 9: Ôn tập chương 2","22":"Bài 10: Hợp chất hữu cơ và hoá học hữu cơ","23":"Bài 10: Hợp chất hữu cơ và hoá học hữu cơ","24":"Bài 11: Phương pháp tách biệt và tinh chế hợp chất hữu cơ","25":"Bài 11: Phương pháp tách biệt và tinh chế hợp chất hữu cơ","26":"Bài 12: Công thức phân tử hợp chất hữu cơ","27":"Bài 12: Công thức phân tử hợp chất hữu cơ","28":"Bài 13: Cấu tạo hoá học hợp chất hữu cơ","29":"Bài 13: Cấu tạo hoá học hợp chất hữu cơ","30":"Bài 14: Ôn tập chương 3","31":"Bài 15: Alkane","32":"Bài 15: Alkane","33":"Bài 15: Alkane","34":"Bài 15: Alkane","35":"Ôn tập HK 1","36":"Kiểm tra HK 1","37":"Bài 16: Hydrocarbon không no","38":"Bài 16: Hydrocarbon không no","39":"Bài 16: Hydrocarbon không no","40":"Bài 16: Hydrocarbon không no","41":"Bài 16: Hydrocarbon không no","42":"Bài 17: Arene (Hydrocarbon thơm)","43":"Bài 17: Arene (Hydrocarbon thơm)","44":"Bài 18: Ôn tập chương 4","45":"Bài 18: Ôn tập chương 4","46":"Bài 19: Dẫn xuất halogen","47":"Bài 19: Dẫn xuất halogen","48":"Bài 20: Alcohol","49":"Bài 20: Alcohol","50":"Bài 20: Alcohol","51":"Bài 20: Alcohol","52":"Ôn tập giữa kì 2","53":"Ôn tập giữa kì 2","54":"Kiểm tra giữa kì 2","55":"Bài 21: Phenol","56":"Bài 21: Phenol","57":"Bài 22: Ôn tập chương 5","58":"Bài 23: Hợp chất carbonyl","59":"Bài 23: Hợp chất carbonyl","60":"Bài 23: Hợp chất carbonyl","61":"Bài 23: Hợp chất carbonyl","62":"Bài 23: Hợp chất carbonyl","63":"Bài 24: Carboxylic acid","64":"Bài 24: Carboxylic acid","65":"Bài 24: Carboxylic acid","66":"Bài 24: Carboxylic acid","67":"Bài 25: Ôn tập chương 6","68":"Ôn tập HK2","69":"Ôn tập HK2","70":"Kiểm tra kì 2"},"12":{"1":"Bài 1. Ester - Lipid","2":"Bài 1. Ester - Lipid","3":"Bài 1. Ester - Lipid","4":"Bài 2. Xà phòng và chất giặt rửa tổng hợp","5":"Bài 3: Ôn tập chương 1","6":"Bài 4: Giới thiệu về carbohydrate. Glucose và fructose","7":"Bài 4: Giới thiệu về carbohydrate. Glucose và fructose","8":"Bài 5: Saccharose và maltose","9":"Bài 6: Tinh bột và cellulose","10":"Bài 6: Tinh bột và cellulose","11":"Bài 7: Ôn tập chương 2","12":"Bài 8: Amine","13":"Bài 8: Amine","14":"Bài 9: Amino acid và peptide","15":"Bài 9: Amino acid và peptide","16":"Bài 9: Amino acid và peptide","17":"Bài 10: Protein và enzyme","18":"Bài 11: Ôn tập chương 3","19":"Ôn tập kiểm tra giữa kỳ I","20":"Kiểm tra giữa kỳ I","21":"Bài 12: Đại cương về polimer","22":"Bài 12: Đại cương về polimer","23":"Bài 13: Vật liệu polimer","24":"Bài 13: Vật liệu polimer","25":"Bài 14: Ôn tập chương 4","26":"Bài 15: Thế điện cực và nguồn điện hóa học","27":"Bài 15: Thế điện cực và nguồn điện hóa học","28":"Bài 15: Thế điện cực và nguồn điện hóa học","29":"Bài 15: Thế điện cực và nguồn điện hóa học","30":"Bài 16: Điện phân","31":"Bài 16: Điện phân","32":"Bài 16: Điện phân","33":"Bài 17: Ôn tập chương 5","34":"Bài 17: Ôn tập chương 5","35":"Ôn tập kiểm tra cuối kỳ I","36":"Kiểm tra cuối kỳ I","37":"Bài 18: Cấu tạo và liên kết trong tinh thể kim loại","38":"Bài 19: Tính chất vật lí, tính chất hóa học của kim loại","39":"Bài 19: Tính chất vật lí, tính chất hóa học của kim loại","40":"Bài 19: Tính chất vật lí, tính chất hóa học của kim loại","41":"Bài 19: Tính chất vật lí, tính chất hóa học của kim loại","42":"Bài 20: Kim loại trong tự nhiên và phương pháp tách kim loại","43":"Bài 20: Kim loại trong tự nhiên và phương pháp tách kim loại","44":"Bài 21: Hợp kim","45":"Bài 22: Sự ăn mòn kim loại","46":"Bài 22: Sự ăn mòn kim loại","47":"Bài 23: Ôn tập chương 6","48":"Bài 23: Ôn tập chương 6","49":"Bài 24: Nguyên tố nhóm IA","50":"Bài 24: Nguyên tố nhóm IA","51":"Bài 24: Nguyên tố nhóm IA","52":"Bài 24: Nguyên tố nhóm IA","53":"Ôn tập kiểm tra giữa kỳ II","54":"Kiểm tra giữa kỳ II","55":"Bài 25: Nguyên tố nhóm IIA","56":"Bài 25: Nguyên tố nhóm IIA","57":"Bài 25: Nguyên tố nhóm IIA","58":"Bài 25: Nguyên tố nhóm IIA","59":"Bài 26: Ôn tập chương 7","60":"Bài 26: Ôn tập chương 7","61":"Bài 27: Đại cương về kim loại chuyển tiếp dãy thứ nhất","62":"Bài 27: Đại cương về kim loại chuyển tiếp dãy thứ nhất","63":"Bài 27: Đại cương về kim loại chuyển tiếp dãy thứ nhất","64":"Bài 28: Sơ lược về phức chất","65":"Bài 28: Sơ lược về phức chất","66":"Bài 29: Một số tính chất và ứng dụng của phức chất","67":"Bài 30: Ôn tập chương 8","68":"Ôn tập kiểm tra cuối kỳ II","69":"Ôn tập kiểm tra cuối kỳ II","70":"Kiểm tra cuối kỳ II"}},"electiveMap":{"10":{"1":"Bài 2. Phản ứng hạt nhân","2":"Bài 2. Phản ứng hạt nhân","3":"Bài 2. Phản ứng hạt nhân","4":"Bài 2. Phản ứng hạt nhân","5":"Bài 2. Phản ứng hạt nhân","6":"Bài 5. Sơ lược về phản ứng cháy nổ","7":"Bài 5. Sơ lược về phản ứng cháy nổ","8":"Bài 6. Điểm chớp cháy. Nhiệt độ ngọn lửa. Nhiệt độ tự bốc cháy","9":"Bài 6. Điểm chớp cháy. Nhiệt độ ngọn lửa. Nhiệt độ tự bốc cháy","10":"Bài 8. Phòng chống cháy nổ","11":"Bài 8. Phòng chống cháy nổ","12":"Bài 8. Phòng chống cháy nổ","13":"Bài 1. Liên kết hóa học","14":"Bài 1. Liên kết hóa học","15":"Bài 1. Liên kết hóa học","16":"Bài 9. Thực hành vẽ cấu trúc phân tử","17":"Bài 9. Thực hành vẽ cấu trúc phân tử","18":"Bài 9. Thực hành vẽ cấu trúc phân tử","19":"Bài 4. Entropy & biến thiên năng lượng tự do Gibbs","20":"Bài 4. Entropy & biến thiên năng lượng tự do Gibbs","21":"Bài 4. Entropy & biến thiên năng lượng tự do Gibbs","22":"Bài 4. Entropy & biến thiên năng lượng tự do Gibbs","23":"Bài 4. Entropy & biến thiên năng lượng tự do Gibbs","24":"Bài 3. Năng lượng hoạt hóa của phản ứng hóa học","25":"Bài 3. Năng lượng hoạt hóa của phản ứng hóa học","26":"Bài 7. Hóa học về phản ứng cháy nổ","27":"Bài 7. Hóa học về phản ứng cháy nổ","28":"Bài 7. Hóa học về phản ứng cháy nổ","29":"Bài 10. Thực hành thí nghiệm hóa học ảo","30":"Bài 10. Thực hành thí nghiệm hóa học ảo","31":"Bài 10. Thực hành thí nghiệm hóa học ảo","32":"Bài 10. Thực hành thí nghiệm hóa học ảo","33":"Bài 11. Thực hành tính tham số cấu trúc và năng lượng","34":"Bài 11. Thực hành tính tham số cấu trúc và năng lượng","35":"Bài 11. Thực hành tính tham số cấu trúc và năng lượng"},"11":{"1":"Bài 1: Giới thiệu chung về phân bón","2":"Bài 1: Giới thiệu chung về phân bón","3":"Bài 2: Phân bón vô cơ","4":"Bài 2: Phân bón vô cơ","5":"Bài 2: Phân bón vô cơ","6":"Bài 2: Phân bón vô cơ","7":"Bài 3: Phân bón hữu cơ","8":"Bài 3: Phân bón hữu cơ","9":"Bài 3: Phân bón hữu cơ","10":"Bài 3: Phân bón hữu cơ","11":"Bài 7. Nguồn gốc dầu mỏ. Thành phần và phân loại dầu mỏ","12":"Bài 7. Nguồn gốc dầu mỏ. Thành phần và phân loại dầu mỏ","13":"Bài 8. Chế biến dầu mỏ","14":"Bài 8. Chế biến dầu mỏ","15":"Bài 8. Chế biến dầu mỏ","16":"Bài 8. Chế biến dầu mỏ","17":"Bài 9. Ngành sản xuất dầu mỏ trên thế giới và Việt Nam","18":"Bài 9. Ngành sản xuất dầu mỏ trên thế giới và Việt Nam","19":"Bài 9. Ngành sản xuất dầu mỏ trên thế giới và Việt Nam","20":"Bài 9. Ngành sản xuất dầu mỏ trên thế giới và Việt Nam","21":"Bài 4. Tách tinh dầu từ các nguồn gốc thảo mộc tự nhiên","22":"Bài 4. Tách tinh dầu từ các nguồn gốc thảo mộc tự nhiên","23":"Bài 4. Tách tinh dầu từ các nguồn gốc thảo mộc tự nhiên","24":"Bài 4. Tách tinh dầu từ các nguồn gốc thảo mộc tự nhiên","25":"Bài 4. Tách tinh dầu từ các nguồn gốc thảo mộc tự nhiên","26":"Bài 5. Chuyển hóa chất béo thành xà phòng","27":"Bài 5. Chuyển hóa chất béo thành xà phòng","28":"Bài 5. Chuyển hóa chất béo thành xà phòng","29":"Bài 5. Chuyển hóa chất béo thành xà phòng","30":"Bài 5. Chuyển hóa chất béo thành xà phòng","31":"Bài 6. Điều chế glucosamin hydrocholoride từ vỏ tôm","32":"Bài 6. Điều chế glucosamin hydrocholoride từ vỏ tôm","33":"Bài 6. Điều chế glucosamin hydrocholoride từ vỏ tôm","34":"Bài 6. Điều chế glucosamin hydrocholoride từ vỏ tôm","35":"Bài 6. Điều chế glucosamin hydrocholoride từ vỏ tôm"},"12":{"1":"Bài 1. Đại cương về cơ chế phản ứng","2":"Bài 1. Đại cương về cơ chế phản ứng","3":"Bài 1. Đại cương về cơ chế phản ứng","4":"Bài 1. Đại cương về cơ chế phản ứng","5":"Bài 2 – 3. Cơ chế phản ứng thế và phản ứng cộng","6":"Bài 2 – 3. Cơ chế phản ứng thế và phản ứng cộng","7":"Bài 2 – 3. Cơ chế phản ứng thế và phản ứng cộng","8":"Bài 2 – 3. Cơ chế phản ứng thế và phản ứng cộng","9":"Bài 2 – 3. Cơ chế phản ứng thế và phản ứng cộng","10":"Bài 2 – 3. Cơ chế phản ứng thế và phản ứng cộng","11":"Bài 4. Tái chế kim loại","12":"Bài 4. Tái chế kim loại","13":"Bài 4. Tái chế kim loại","14":"Bài 4. Tái chế kim loại","15":"Bài 4. Tái chế kim loại","16":"Bài 5. Công nghiệp silicate","17":"Bài 5. Công nghiệp silicate","18":"Bài 5. Công nghiệp silicate","19":"Bài 5. Công nghiệp silicate","20":"Bài 5. Công nghiệp silicate","21":"Bài 6. Xử lí nước sinh hoạt","22":"Bài 6. Xử lí nước sinh hoạt","23":"Bài 6. Xử lí nước sinh hoạt","24":"Bài 6. Xử lí nước sinh hoạt","25":"Bài 6. Xử lí nước sinh hoạt","26":"Bài 7. Một số vấn đề cơ bản về phức chất.","27":"Bài 7. Một số vấn đề cơ bản về phức chất.","28":"Bài 7. Một số vấn đề cơ bản về phức chất.","29":"Bài 8. Liên kết và cấu tạo của phức chất.","30":"Bài 8. Liên kết và cấu tạo của phức chất.","31":"Bài 8. Liên kết và cấu tạo của phức chất.","32":"Bài 8. Liên kết và cấu tạo của phức chất.","33":"Bài 9. Vai trò và ứng dụng của phức chất","34":"Bài 9. Vai trò và ứng dụng của phức chất","35":"Bài 9. Vai trò và ứng dụng của phức chất"}},"warnings":[],"gradeCounts":{"10":70,"11":70,"12":70},"electiveGradeCounts":{"10":35,"11":35,"12":35},"regularEntries":210,"electiveEntries":105,"entries":315,"warningCount":0,"modes":["direct"],"criticalWarningCount":0,"partial":false,"criticalWarnings":[]},"Sinh học":{"subject":"Sinh học","title":"Phụ luc I - Kế hoạch dạy học môn sinh (x).docx","kind":"Kho PPCT tích hợp","format":"Dữ liệu chuẩn của trường từ Kế hoạch dạy học 2026–2027","map":{"10":{"1":"Bài 1. Giới thiệu khái quát môn Sinh học","2":"Bài 1. Giới thiệu khái quát môn Sinh học","3":"Bài 2. Phương pháp nghiên cứu và học tập môn Sinh học","4":"Bài 2. Phương pháp nghiên cứu và học tập môn Sinh học","5":"Bài 3. Các cấp độ tổ chức của sự sống","6":"Bài 3. Các cấp độ tổ chức của sự sống","7":"Bài 4. Các nguyên tố hóa học và nước","8":"Bài 4. Các nguyên tố hóa học và nước","9":"Bài 5. Các phân tử sinh học","10":"Bài 5. Các phân tử sinh học","11":"Bài 5. Các phân tử sinh học","12":"Bài 5. Các phân tử sinh học","13":"Bài 5. Các phân tử sinh học","14":"Bài 6. Thực hành: Nhận biết một số phân tử sinh học","15":"Bài 7. Tế bào nhân sơ","16":"Bài 7. Tế bào nhân sơ","17":"Ôn tập giữa kì I","18":"Đánh giá giữa kì I","19":"Bài 8. Tế bào nhân thực","20":"Bài 8. Tế bào nhân thực","21":"Bài 8. Tế bào nhân thực","22":"Bài 8. Tế bào nhân thực","23":"Bài 8. Tế bào nhân thực","24":"Bài 9. Thực hành: Quan sát tế bào","25":"Bài 10. Trao đổi chất qua màng tế bào","26":"Bài 10. Trao đổi chất qua màng tế bào","27":"Bài 11. Thực hành: Thí nghiệm co và phản co nguyên sinh","28":"Bài 12. Truyền tin tế bào","29":"Bài 13. Khái quát về chuyển hóa vật chất và năng lượng","30":"Bài 13. Khái quát về chuyển hóa vật chất và năng lượng","31":"Bài 13. Khái quát về chuyển hóa vật chất và năng lượng","32":"Ôn tập","33":"Đánh giá cuối học kì I","34":"Bài 14. Phân giải và tổng hợp các chất trong tế bào","35":"Bài 14. Phân giải và tổng hợp các chất trong tế bào","36":"Bài 14. Phân giải và tổng hợp các chất trong tế bào","37":"Bài 14. Phân giải và tổng hợp các chất trong tế bào","38":"Bài 15. Thực hành: Thí nghiệm phân tích ảnh hưởng của một số yếu tố đến hoạt tính của enzyme và kiểm tra hoạt tính của enzyme amylase","39":"Bài 16. Chu kì tế bào và nguyên phân","40":"Bài 16. Chu kì tế bào và nguyên phân","41":"Bài 17. Giảm phân","42":"Bài 17. Giảm phân","43":"Ôn tập NP, GP","44":"Bài 18. Thực hành: Làm và quan sát tiêu bản quá trình nguyên phân và giảm phân","45":"Bài 19. Công nghệ tế bào","46":"Bài 19. Công nghệ tế bào","47":"Bài 20. Sự đa dạng và phương pháp nghiên cứu vi sinh vật","48":"Bài 20. Sự đa dạng và phương pháp nghiên cứu vi sinh vật","49":"Ôn tập","50":"Đánh giá giữa học kì II","51":"Bài 21. Trao đổi chất, sinh trưởng và sinh sản ở vi sinh vật","52":"Bài 21. Trao đổi chất, sinh trưởng và sinh sản ở vi sinh vật","53":"Bài 21. Trao đổi chất, sinh trưởng và sinh sản ở vi sinh vật","54":"Bài 21. Trao đổi chất, sinh trưởng và sinh sản ở vi sinh vật","55":"Bài 21. Trao đổi chất, sinh trưởng và sinh sản ở vi sinh vật","56":"Bài 22. Vai trò và ứng dụng của vi sinh vật","57":"Bài 22. Vai trò và ứng dụng của vi sinh vật","58":"Bài 22. Vai trò và ứng dụng của vi sinh vật","59":"Bài 23. Thực hành: Một số phương pháp nghiên cứu vi sinh vật thông dụng, tìm hiểu về các sản phẩm công nghệ vi sinh vật và làm một số sản phẩm lên men từ vi sinh vật","60":"Bài 23. Thực hành: Một số phương pháp nghiên cứu vi sinh vật thông dụng, tìm hiểu về các sản phẩm công nghệ vi sinh vật và làm một số sản phẩm lên men từ vi sinh vật","61":"Bài 23. Thực hành: Một số phương pháp nghiên cứu vi sinh vật thông dụng, tìm hiểu về các sản phẩm công nghệ vi sinh vật và làm một số sản phẩm lên men từ vi sinh vật","62":"Bài 24. Khái quát về virus","63":"Bài 24. Khái quát về virus","64":"Bài 25. Một số bệnh do virus và các thành tựu nghiên cứu ứng dụng virus","65":"Bài 25. Một số bệnh do virus và các thành tựu nghiên cứu ứng dụng virus","66":"Bài 25. Một số bệnh do virus và các thành tựu nghiên cứu ứng dụng virus","67":"Ôn tập","68":"Đánh giá cuối học kì II","69":"Bài 26. Thực hành: Điều tra một số bệnh do virus và tuyên truyền phòng chống bệnh","70":"Bài 26. Thực hành: Điều tra một số bệnh do virus và tuyên truyền phòng chống bệnh"},"11":{"1":"Bài 1. Khái quát về trao đổi chất và chuyển hóa năng lượng","2":"Bài 1. Khái quát về trao đổi chất và chuyển hóa năng lượng","3":"Bài 2. Trao đổi nước và khoáng ở thực vật","4":"Bài 2. Trao đổi nước và khoáng ở thực vật","5":"Bài 2. Trao đổi nước và khoáng ở thực vật","6":"Bài 2. Trao đổi nước và khoáng ở thực vật","7":"Bài 2. Trao đổi nước và khoáng ở thực vật","8":"Bài 3. Thực hành: Trao đổi nước và khoáng ở thực vật","9":"Bài 3. Thực hành: Trao đổi nước và khoáng ở thực vật","10":"Bài 4. Quang hợp ở thực vật","11":"Bài 4. Quang hợp ở thực vật","12":"Bài 4. Quang hợp ở thực vật","13":"Bài 6. Hô hấp ở thực vật","14":"Bài 6. Hô hấp ở thực vật","15":"Bài 5. Thực hành: Quang hợp ở thực vật Bài 7. Thực hành hô hấp ở thực vật","16":"Bài 5. Thực hành: Quang hợp ở thực vật Bài 7. Thực hành hô hấp ở thực vật","17":"Đánh giá giữa học kì I","18":"Bài 8. Dinh dưỡng và tiêu hóa ở động vật","19":"Bài 8. Dinh dưỡng và tiêu hóa ở động vật","20":"Bài 8. Dinh dưỡng và tiêu hóa ở động vật","21":"Bài 9. Hô hấp ở động vật","22":"Bài 9. Hô hấp ở động vật","23":"Bài 10. Tuần hoàn ở động vật","24":"Bài 10. Tuần hoàn ở động vật","25":"Bài 11. Thực hành: Một số thí nghiệm về tuần hoàn","26":"Bài 11. Thực hành: Một số thí nghiệm về tuần hoàn","27":"Bài 12. Miễn dịch ở động vật","28":"Bài 12. Miễn dịch ở động vật","29":"Bài 13. Bài tiết và cân bằng nội môi","30":"Bài 13. Bài tiết và cân bằng nội môi","31":"Bài 14. Khái quát về cảm ứng ở sinh vật Bài 15. Cảm ứng ở thực vật","32":"Bài 14. Khái quát về cảm ứng ở sinh vật Bài 15. Cảm ứng ở thực vật","33":"Bài 16. Thực hành: Cảm ứng ở thực vật","34":"Bài 16. Thực hành: Cảm ứng ở thực vật","35":"Ôn tập học kì I","36":"Đánh giá cuối học kì I","37":"Bài 17. Cảm ứng ở động vật","38":"Bài 17. Cảm ứng ở động vật","39":"Bài 17. Cảm ứng ở động vật","40":"Bài 17. Cảm ứng ở động vật","41":"Bài 18. Tập tính động vật","42":"Bài 18. Tập tính động vật","43":"Bài 18. Tập tính động vật","44":"Bài 19. Khái quát về sinh trưởng và phát triển ở sinh vật","45":"Bài 20. Sinh trưởng và phát triển ở thực vật","46":"Bài 20. Sinh trưởng và phát triển ở thực vật","47":"Bài 20. Sinh trưởng và phát triển ở thực vật","48":"Bài 20. Sinh trưởng và phát triển ở thực vật","49":"Bài 20. Sinh trưởng và phát triển ở thực vật","50":"Bài 21. Thực hành: Bấm ngọn, tỉa cành, tính tuổi cây","51":"Bài 21. Thực hành: Bấm ngọn, tỉa cành, tính tuổi cây","52":"Ôn tập","53":"Đánh giá giữa học kì II","54":"Bài 22. Sinh trưởng và phát triển ở động vật","55":"Bài 22. Sinh trưởng và phát triển ở động vật","56":"Bài 22. Sinh trưởng và phát triển ở động vật","57":"Bài 23. Thực hành: Quan sát quá trình biến thái ở động vật","58":"Bài 24. Khái quát về sinh sản ở sinh vật","59":"Bài 25. Sinh sản ở thực vật","60":"Bài 25. Sinh sản ở thực vật","61":"Bài 25. Sinh sản ở thực vật","62":"Bài 26. Thực hành: Nhân giống vô tính và thụ phấn cho cây.","63":"Bài 26. Thực hành: Nhân giống vô tính và thụ phấn cho cây.","64":"Bài 27. Sinh sản ở động vật","65":"Bài 27. Sinh sản ở động vật","66":"Bài 27. Sinh sản ở động vật","67":"Bài 27. Sinh sản ở động vật","68":"Bài 28. Mối quan hệ giữa các quá trình sinh lí trong cơ thể sinh vật. Bài 29. Một số ngành nghề liên quan đến sinh học cơ thể.","69":"Ôn tập","70":"Đánh cuối học kỳ II"},"12":{"1":"Bài 1. DNA và cơ chế tái bản DNA","2":"Bài 2. Gene, hệ gen và quá trình truyền đạt thông tin di truyền","3":"Bài 2. Gene, hệ gen và quá trình truyền đạt thông tin di truyền","4":"Bài 2. Gene, hệ gen và quá trình truyền đạt thông tin di truyền","5":"Bài 3. Điều hòa biểu hiện gene","6":"Bài 4. Đột biến gene","7":"Bài 5. Công nghệ gene","8":"Bài 6. Thực hành: Tách chiết DNA","9":"Bài 7. Cấu trúc và chức năng của nhiễm sắc thể","10":"Bài 8. Học thuyết di truyền Mendel","11":"Bài 8. Học thuyết di truyền Mendel","12":"Bài 8. Học thuyết di truyền Mendel","13":"Bài 9. Mở rộng học thuyết Mendel","14":"Bài 10. Di truyền giới tính và di truyền liên kết với giới tính","15":"Bài 10. Di truyền giới tính và di truyền liên kết với giới tính","16":"Ôn tập","17":"Đánh giá giữa kì I","18":"Bài 11. Liên kết gene và hoán vị gene","19":"Bài 11. Liên kết gene và hoán vị gene","20":"Bài 11. Liên kết gene và hoán vị gene","21":"Bài 12. Đột biến nhiễm sắc thể","22":"Bài 12. Đột biến nhiễm sắc thể","23":"Bài 12. Đột biến nhiễm sắc thể","24":"Bài 13. Di truyền học người và di truyền y học","25":"Bài 13. Di truyền học người và di truyền y học","26":"Bài 13. Di truyền học người và di truyền y học","27":"Bài 14. Thực hành: Quan sát một số dạng đột biến nhiễm sắc thể","28":"Bài 15. Di truyền gene ngoài nhân","29":"Bài 16. Tương tác giữa kiểu gene với môi trường và thành tựu chọn giống","30":"Bài 17. Thực hành: Thí nghiệm về thường biến ở cây trồng","31":"Bài 17. Thực hành: Thí nghiệm về thường biến ở cây trồng","32":"Bài 18. Di truyền học quần thể","33":"Bài 18. Di truyền học quần thể","34":"Bài 18. Di truyền học quần thể","35":"Ôn tập","36":"Đánh giá cuối kì I","37":"Bài 19. Các bằng chứng tiến hóa","38":"Bài 20. Quan niệm của Darwin về chọn lọc tự nhiên và hình thành loài","39":"Bài 20. Quan niệm của Darwin về chọn lọc tự nhiên và hình thành loài","40":"Bài 21. Học thuyết tiến hóa tổng hợp hiện đại","41":"Bài 21. Học thuyết tiến hóa tổng hợp hiện đại","42":"Bài 21. Học thuyết tiến hóa tổng hợp hiện đại","43":"Bài 21. Học thuyết tiến hóa tổng hợp hiện đại","44":"Bài 22. Tiến hóa lớn và quá trình phát sinh chủng loại","45":"Bài 22. Tiến hóa lớn và quá trình phát sinh chủng loại","46":"Bài 22. Tiến hóa lớn và quá trình phát sinh chủng loại","47":"Bài 22. Tiến hóa lớn và quá trình phát sinh chủng loại","48":"Bài 23. Môi trường và các nhân tố sinh thái","49":"Bài 24. Sinh thái học quần thể","50":"Bài 24. Sinh thái học quần thể","51":"Bài 24. Sinh thái học quần thể","52":"Đánh giá giữa học kì II","53":"Bài 25. Thực hành: Xác định một số đặc trưng của quần thể","54":"Bài 25. Thực hành: Xác định một số đặc trưng của quần thể","55":"Bài 26. Quần xã sinh vật","56":"Bài 26. Quần xã sinh vật","57":"Bài 27. Thực hành: Tìm hiểu cấu trúc dinh dưỡng của quần xã trong tự nhiên","58":"Bài 28. Hệ sinh thái","59":"Bài 29. Trao đổi vật chất và chuyển hóa năng lượng trong hệ sinh thái","60":"Bài 29. Trao đổi vật chất và chuyển hóa năng lượng trong hệ sinh thái","61":"Bài 30. Diễn thế sinh thái","62":"Bài 31. Sinh quyển, khu sinh học và chu trình sinh - địa - hóa","63":"Bài 31. Sinh quyển, khu sinh học và chu trình sinh - địa - hóa","64":"Bài 32. Thực hành: Thiết kế một hệ sinh thái nhân tạo","65":"Bài 33. Sinh thái học phục hồi và bảo tồn đa dạng sinh học","66":"Bài 34. Phát triển bền vững","67":"Bài 34. Phát triển bền vững","68":"Bài 35. Dự án: Tìm hiểu thực trạng bảo tồn sinh thái tại địa phương và đề xuất giải pháp bảo tồn.","69":"Ôn tập","70":"Đánh giá cuối học kì II"}},"electiveMap":{"11":{"1":"Bài 1. Nguyên tắc và các biện pháp kĩ thuật sử dụng dinh dưỡng khoáng trong nền nông nghiệp sạch","2":"Bài 1. Nguyên tắc và các biện pháp kĩ thuật sử dụng dinh dưỡng khoáng trong nền nông nghiệp sạch","3":"Bài 2. Mô hình thủy canh theo hướng phát triển nông nghiệp sạch.","4":"Bài 2. Mô hình thủy canh theo hướng phát triển nông nghiệp sạch.","5":"Bài 3. Dự án: Điều tra tình hình sử dụng phân bón tại địa phương hoặc thực hành trồng cây với các kỹ thuật bón phân phù hợp","6":"Bài 3. Dự án: Điều tra tình hình sử dụng phân bón tại địa phương hoặc thực hành trồng cây với các kỹ thuật bón phân phù hợp","7":"Bài 3. Dự án: Điều tra tình hình sử dụng phân bón tại địa phương hoặc thực hành trồng cây với các kỹ thuật bón phân phù hợp","8":"Bài 4. Thực hành: Thí nghiệm chứng minh tác dụng của loại phân bón, cách bón và hàm lượng phân bón đối với cây trồng.","9":"Bài 4. Thực hành: Thí nghiệm chứng minh tác dụng của loại phân bón, cách bón và hàm lượng phân bón đối với cây trồng.","10":"Ôn tập","11":"Bài 5. Bệnh dịch và tác nhân gây bệnh ở người","12":"Bài 5. Bệnh dịch và tác nhân gây bệnh ở người","13":"Bài 5. Bệnh dịch và tác nhân gây bệnh ở người","14":"Bài 6. Nguyên nhân lây nhiễm bệnh dịch ở người","15":"Bài 6. Nguyên nhân lây nhiễm bệnh dịch ở người","16":"Bài 6. Nguyên nhân lây nhiễm bệnh dịch ở người","17":"Bài 7. Các biện pháp phòng, chống bệnh dịch ở người.","18":"Bài 7. Các biện pháp phòng, chống bệnh dịch ở người.","19":"Bài 8. Dự án: điều tra một số bệnh dịch phổ biến ở người và tuyên truyền phòng, chống bệnh.","20":"Bài 8. Dự án: điều tra một số bệnh dịch phổ biến ở người và tuyên truyền phòng, chống bệnh.","21":"Bài 8. Dự án: điều tra một số bệnh dịch phổ biến ở người và tuyên truyền phòng, chống bệnh.","22":"Bài 8. Dự án: điều tra một số bệnh dịch phổ biến ở người và tuyên truyền phòng, chống bệnh.","23":"Bài 8. Dự án: điều tra một số bệnh dịch phổ biến ở người và tuyên truyền phòng, chống bệnh.","24":"Ôn tập","25":"Ôn tập","26":"Bài 9. Khái quát về vệ sinh an toàn thực phẩm","27":"Bài 9. Khái quát về vệ sinh an toàn thực phẩm","28":"Bài 9. Khái quát về vệ sinh an toàn thực phẩm","29":"Bài 10. Ngộ độc thực phẩm","30":"Bài 10. Ngộ độc thực phẩm","31":"Bài 10. Ngộ độc thực phẩm","32":"Bài 11. Dự án: điều tra về hiện trạng mất vệ sinh an toàn thực phẩm tại địa phương.","33":"Bài 11. Dự án: điều tra về hiện trạng mất vệ sinh an toàn thực phẩm tại địa phương.","34":"Bài 11. Dự án: điều tra về hiện trạng mất vệ sinh an toàn thực phẩm tại địa phương.","35":"Ôn tập"}},"warnings":[],"gradeCounts":{"10":70,"11":70,"12":70},"electiveGradeCounts":{"11":35},"regularEntries":210,"electiveEntries":35,"entries":245,"warningCount":0,"modes":["duration"],"criticalWarningCount":0,"partial":false,"criticalWarnings":[]},"Công nghệ":{"subject":"Công nghệ","title":"Phu luc I - Ke hoach day hoc - Cong nghe (x).docx","kind":"Kho PPCT tích hợp","format":"Dữ liệu chuẩn của trường từ Kế hoạch dạy học 2026–2027","map":{"10":{"1":"Bài 1: Công nghệ và đời sống","2":"Bài 1: Công nghệ và đời sống","3":"Bài 2: Hệ thống kĩ thuật","4":"Bài 2: Hệ thống kĩ thuật","5":"Bài 3- Công nghệ phổ biến","6":"Bài 3- Công nghệ phổ biến","7":"Bài 3- Công nghệ phổ biến","8":"Bài 3- Công nghệ phổ biến","9":"Bài 4- Một số công nghệ mới","10":"Bài 4- Một số công nghệ mới","11":"Bài 4- Một số công nghệ mới","12":"Bài 5- Đánh giá công nghệ","13":"Bài 5- Đánh giá công nghệ","14":"Bài 6- Cách mạng công nghiệp","15":"Bài 6- Cách mạng công nghiệp","16":"Bài 6- Cách mạng công nghiệp","17":"Bài 7- Ngành nghề kỹ thuật, công nghệ","18":"Bài 7- Ngành nghề kỹ thuật, công nghệ","19":"Ôn tập và kiểm tra giữa kì I","20":"Ôn tập và kiểm tra giữa kì I","21":"Bài 7- Ngành nghề kỹ thuật, công nghệ","22":"Bài 8- Bản vẽ kỹ thuật và tiêu chuẩn trình bày bản vẽ kỹ thuật","23":"Bài 8- Bản vẽ kỹ thuật và tiêu chuẩn trình bày bản vẽ kỹ thuật","24":"Bài 9- Hình chiếu vuông góc","25":"Bài 9- Hình chiếu vuông góc","26":"Bài 9- Hình chiếu vuông góc","27":"Bài 9- Hình chiếu vuông góc","28":"Bài 9- Hình chiếu vuông góc","29":"Bài 10- Hình cắt và mặt cắt","30":"Bài 10- Hình cắt và mặt cắt","31":"Bài 11- Hình chiếu trục đo","32":"Bài 11- Hình chiếu trục đo","33":"Ôn tập và kiểm tra cuối kì I","34":"Ôn tập và kiểm tra cuối kì I","35":"Bài 11- Hình chiếu trục đo","36":"Bài 11- Hình chiếu trục đo","37":"Bài 12- Hình chiếu phối cảnh","38":"Bài 12- Hình chiếu phối cảnh","39":"Bài 13- Biểu diễn quy ước ren","40":"Bài 13- Biểu diễn quy ước ren","41":"Bài 13- Biểu diễn quy ước ren","42":"Bài 14- Bản vẽ cơ khí","43":"Bài 14- Bản vẽ cơ khí","44":"Bài 15- Bản vẽ xây dựng","45":"Bài 15- Bản vẽ xây dựng","46":"Bài 16- Vẽ kỹ thuật với sự trợ giúp của máy tính","47":"Bài 16- Vẽ kỹ thuật với sự trợ giúp của máy tính","48":"Bài 16- Vẽ kỹ thuật với sự trợ giúp của máy tính","49":"Bài 17- Khái quát về thiết kế kỹ thuật","50":"Bài 17- Khái quát về thiết kế kỹ thuật","51":"Ôn tập và kiểm tra giữa kì II","52":"Ôn tập và kiểm tra giữa kì II","53":"Bài 18- Quy trình thiết kế kỹ thuật","54":"Bài 18- Quy trình thiết kế kỹ thuật","55":"Bài 18- Quy trình thiết kế kỹ thuật","56":"Bài 19- Những yếu tố ảnh hưởng đến thiết kế kỹ thuật","57":"Bài 19- Những yếu tố ảnh hưởng đến thiết kế kỹ thuật","58":"Bài 19- Những yếu tố ảnh hưởng đến thiết kế kỹ thuật","59":"Bài 20- Nguyên tắc thiết kế kỹ thuật","60":"Bài 20- Nguyên tắc thiết kế kỹ thuật","61":"Bài 20- Nguyên tắc thiết kế kỹ thuật","62":"Bài 21- Phương pháp, phương tiện hỗ trợ thiết kế kỹ thuật","63":"Bài 21- Phương pháp, phương tiện hỗ trợ thiết kế kỹ thuật","64":"Bài 21- Phương pháp, phương tiện hỗ trợ thiết kế kỹ thuật","65":"Bài 21- Phương pháp, phương tiện hỗ trợ thiết kế kỹ thuật","66":"Bài 22- Dự án: thiết kế sản phẩm đơn giản","67":"Ôn tập và kiểm tra cuối kì II","68":"Ôn tập và kiểm tra cuối kì II","69":"Bài 22- Dự án: thiết kế sản phẩm đơn giản","70":"Bài 22- Dự án: thiết kế sản phẩm đơn giản"},"11":{"1":"Bài 1. Khái Quát về cơ khí chế tạo","2":"Bài 1. Khái Quát về cơ khí chế tạo","3":"Bài 2. Ngành nghề trong lĩnh vực cơ khí chế tạo","4":"Bài 2. Ngành nghề trong lĩnh vực cơ khí chế tạo","5":"Bài 3. Tổng quan về vật liệu cơ khí","6":"Bài 4. Vật liệu kim loại và hợp kim","7":"Bài 4. Vật liệu kim loại và hợp kim","8":"Bài 5. Vật liệu phi kim loại","9":"Bài 5. Vật liệu phi kim loại","10":"Bài 6. Vật liệu mới","11":"Bài 6. Vật liệu mới","12":"Bài 7. Khái quát về gia công cơ khí","13":"Bài 7. Khái quát về gia công cơ khí","14":"Bài 8. Một số phương pháp gia công cơ khí","15":"Bài 8. Một số phương pháp gia công cơ khí","16":"Bài 8. Một số phương pháp gia công cơ khí","17":"Bài 9. Quy trình công nghệ gia công chi tiế","18":"Bài 9. Quy trình công nghệ gia công chi tiế","19":"tÔn tập và kiểm tra giữa kì I","20":"tÔn tập và kiểm tra giữa kì I","21":"Bài 10. Dự án: Chế tạo sản phẩm bằng phương pháp gia công cắt gọt","22":"Bài 10. Dự án: Chế tạo sản phẩm bằng phương pháp gia công cắt gọt","23":"Bài 10. Dự án: Chế tạo sản phẩm bằng phương pháp gia công cắt gọt","24":"Bài 10. Dự án: Chế tạo sản phẩm bằng phương pháp gia công cắt gọt","25":"Bài 11. Quá trình sản xuất cơ khí","26":"Bài 11. Quá trình sản xuất cơ khí","27":"Bài 11. Quá trình sản xuất cơ khí","28":"Bài 12. Dây truyền sản xuất tự động với sự tham gia của robot","29":"Bài 12. Dây truyền sản xuất tự động với sự tham gia của robot","30":"Bài 13. Tự động hóa quá trình sản xuất dưới tác động của cuộc cách mạng công nghiệp lần thứ 4","31":"Bài 13. Tự động hóa quá trình sản xuất dưới tác động của cuộc cách mạng công nghiệp lần thứ 4","32":"Bài 14. An toàn lao động và bảo vệ môi trường trong sản xuất cơ khí","33":"Ôn tập và kiểm tra cuối kì I","34":"Ôn tập và kiểm tra cuối kì I","35":"Bài 14. An toàn lao động và bảo vệ môi trường trong sản xuất cơ khí","36":"Bài 14. An toàn lao động và bảo vệ môi trường trong sản xuất cơ khí","37":"Bài 15. Khái quát về cơ khí động lực","38":"Bài 15. Khái quát về cơ khí động lực","39":"Bài 16. Ngành nghề trong lĩnh vực cơ khí động lực","40":"Bài 16. Ngành nghề trong lĩnh vực cơ khí động lực","41":"Bài 17. Đại cương về động cơ đốt trong","42":"Bài 17. Đại cương về động cơ đốt trong","43":"Bài 18. Nguyên lý làm việc của Động cơ đốt trong","44":"Bài 18. Nguyên lý làm việc của Động cơ đốt trong","45":"Bài 18. Nguyên lý làm việc của Động cơ đốt trong","46":"Bài 18. Nguyên lý làm việc của Động cơ đốt trong","47":"Bài 19. Các cơ cấu trong động cơ đốt trong","48":"Bài 19. Các cơ cấu trong động cơ đốt trong","49":"Bài 19. Các cơ cấu trong động cơ đốt trong","50":"Ôn tập và kiểm tra giữa kì II","51":"Ôn tập và kiểm tra giữa kì II","52":"Bài 20. Các hệ thống trong động cơ đốt trong","53":"Bài 20. Các hệ thống trong động cơ đốt trong","54":"Bài 20. Các hệ thống trong động cơ đốt trong","55":"Bài 20. Các hệ thống trong động cơ đốt trong","56":"Bài 20. Các hệ thống trong động cơ đốt trong","57":"Bài 21. Khái quát chung về ô tô","58":"Bài 21. Khái quát chung về ô tô","59":"Bài 22. Hệ thống truyền lực","60":"Bài 22. Hệ thống truyền lực","61":"Bài 22. Hệ thống truyền lực","62":"Bài 23. Bánh xe và hệ thống treo ô tô","63":"Bài 23. Bánh xe và hệ thống treo ô tô","64":"Bài 24. Hệ thống lái","65":"Bài 24. Hệ thống lái","66":"Bài 25. Hệ thống phanh và an toàn khi tham gia giao thông","67":"Bài 25. Hệ thống phanh và an toàn khi tham gia giao thông","68":"Bài 25. Hệ thống phanh và an toàn khi tham gia giao thông","69":"Ôn tập và kiểm tra cuối kì II","70":"Ôn tập và kiểm tra cuối kì II"},"12":{"1":"Bài 1. Giới thiệu tổng quan về kĩ thuật điện","2":"Bài 1. Giới thiệu tổng quan về kĩ thuật điện","3":"Bài 2. Ngành nghề trong lĩnh vực kĩ thuật điện","4":"Bài 2. Ngành nghề trong lĩnh vực kĩ thuật điện","5":"Bài 3. Mạch điện xoay chiều 3 pha","6":"Bài 3. Mạch điện xoay chiều 3 pha","7":"Bài 3. Mạch điện xoay chiều 3 pha","8":"Bài 4. Hệ thống điện quốc gia","9":"Bài 4. Hệ thống điện quốc gia","10":"Bài 5. Sản xuất điện năng","11":"Bài 5. Sản xuất điện năng","12":"Bài 5. Sản xuất điện năng","13":"Bài 6. Mạng điện sản xuất quy mô nhỏ","14":"Bài 6. Mạng điện sản xuất quy mô nhỏ","15":"Bài 7. Mạng điện hạ áp dùng trong sinh hoạt","16":"Bài 7. Mạng điện hạ áp dùng trong sinh hoạt","17":"Bài 8. Hệ thống điện trong gia đình","18":"Bài 8. Hệ thống điện trong gia đình","19":"Ôn tập và kiểm tra giữa kì I","20":"Ôn tập và kiểm tra giữa kì I","21":"Bài 9. Thiết bị điện trong hệ thống điện gia đình","22":"Bài 9. Thiết bị điện trong hệ thống điện gia đình","23":"Bài 9. Thiết bị điện trong hệ thống điện gia đình","24":"Bài 10. Thiết kế và lắp đặt mạch điện điều khiển trong gia đình","25":"Bài 10. Thiết kế và lắp đặt mạch điện điều khiển trong gia đình","26":"Bài 10. Thiết kế và lắp đặt mạch điện điều khiển trong gia đình","27":"Bài 10. Thiết kế và lắp đặt mạch điện điều khiển trong gia đình","28":"Bài 11. An toàn điện","29":"Bài 11. An toàn điện","30":"Bài 12. Tiết kiệm điện năng","31":"Bài 12. Tiết kiệm điện năng","32":"Ôn tập và kiểm tra cuối học kì I","33":"Ôn tập và kiểm tra cuối học kì I","34":"Bài 8. Hệ thống điện trong gia đình","35":"Bài 13. Khái quát về kĩ thuật điện tử","36":"Bài 13. Khái quát về kĩ thuật điện tử","37":"Bài 14. Ngành nghề và dịch vụ trong lĩnh vực kĩ thuật điện tử","38":"Bài 14. Ngành nghề và dịch vụ trong lĩnh vực kĩ thuật điện tử","39":"Bài 15. Điện trở, tụ điện và Cuộn cảm","40":"Bài 15. Điện trở, tụ điện và Cuộn cảm","41":"Bài 16. Diode, transistor và mạch tích hợp IC","42":"Bài 16. Diode, transistor và mạch tích hợp IC","43":"Bài 17. Thực hành: Mạch phát hiện dòng điện trong dây dẫn","44":"Bài 17. Thực hành: Mạch phát hiện dòng điện trong dây dẫn","45":"Bài 18. Giới thiệu về điện tử tương tự","46":"Bài 18. Giới thiệu về điện tử tương tự","47":"Bài 19. Mạch khuếch đại thuật toán","48":"Bài 19. Mạch khuếch đại thuật toán","49":"Bài 19. Mạch khuếch đại thuật toán","50":"Bài 20. Thực hành: Mạch khuếch đại đảo","51":"Bài 20. Thực hành: Mạch khuếch đại đảo","52":"Bài 21. Tín hiệu số và các cổng logic cơ bản","53":"Bài 21. Tín hiệu số và các cổng logic cơ bản","54":"Ôn tập và kiểm tra giữa học kì II","55":"Ôn tập và kiểm tra giữa học kì II","56":"Bài 22. Một số mạch xử lí tín hiệu trong điện tử số","57":"Bài 22. Một số mạch xử lí tín hiệu trong điện tử số","58":"Bài 22. Một số mạch xử lí tín hiệu trong điện tử số","59":"Bài 23. Thực hành: Lắp ráp, kiểm tra mạch báo cháy sử dụng các cổng logic cơ bản","60":"Bài 23. Thực hành: Lắp ráp, kiểm tra mạch báo cháy sử dụng các cổng logic cơ bản","61":"Bài 24. Khái quát về vi điều khiển","62":"Bài 24. Khái quát về vi điều khiển","63":"Bài 25. Bo mạch lập trình vi điều khiển","64":"Bài 25. Bo mạch lập trình vi điều khiển","65":"Bài 25. Bo mạch lập trình vi điều khiển","66":"Bài 25. Bo mạch lập trình vi điều khiển","67":"Ôn tập kiểm tra cuối học kì II","68":"Ôn tập kiểm tra cuối học kì II","69":"Bài 26. Thực hành: Thiết kế, lắp ráp, kiểm tra mạch tự động điều chỉnh cường độ sáng của đèn LED theo môi trường xung quanh","70":"Bài 26. Thực hành: Thiết kế, lắp ráp, kiểm tra mạch tự động điều chỉnh cường độ sáng của đèn LED theo môi trường xung quanh"}},"electiveMap":{},"warnings":[],"gradeCounts":{"10":70,"11":70,"12":70},"electiveGradeCounts":{},"regularEntries":210,"electiveEntries":0,"entries":210,"warningCount":0,"modes":["duration"],"criticalWarningCount":0,"partial":false,"criticalWarnings":[]},"Tin học":{"subject":"Tin học","title":"Phu luc I - Ke hoach day hoc - Tin hoc (x).docx","kind":"Kho PPCT tích hợp","format":"Dữ liệu chuẩn của trường từ Kế hoạch dạy học 2026–2027","map":{"10":{"1":"Bài 1. Thông tin và xử lí thông tin","2":"Bài 1. Thông tin và xử lí thông tin","3":"Bài 2. Vai Trò của thiết bị thông minh và tin học đối với xã hội","4":"Bài 2. Vai Trò của thiết bị thông minh và tin học đối với xã hội","5":"Bài 7. Thực hành sử dụng thiết bị số thông dụng","6":"Bài 7. Thực hành sử dụng thiết bị số thông dụng","7":"Bài 8. Mạng máy tính trong cuộc sống hiện đại","8":"Bài 8. Mạng máy tính trong cuộc sống hiện đại","9":"Bài 9. An toàn trên không gian mạng","10":"Bài 9. An toàn trên không gian mạng","11":"Bài 10. Thực hành khai thác tài nguyên trên Internet.","12":"Bài 10. Thực hành khai thác tài nguyên trên Internet.","13":"Bài 11. Ứng dụng trên môi trường số. Nghĩa vụ tôn trọng bản quyền.","14":"Bài 11. Ứng dụng trên môi trường số. Nghĩa vụ tôn trọng bản quyền.","15":"Bài 12. Phần mềm thiết kế đồ họa","16":"Bài 12. Phần mềm thiết kế đồ họa","17":"Bài 13. Bổ sung các đối tượng đồ họa","18":"Bài 13. Bổ sung các đối tượng đồ họa","19":"KIỂM TRA ĐÁNH GIÁ GIỮA HỌC KÌ I","20":"Bài 14. Làm việc với đối tượng đường và văn bản","21":"Bài 14. Làm việc với đối tượng đường và văn bản","22":"Bài 15. Hoàn thiện hình ảnh đồ họa","23":"Bài 15. Hoàn thiện hình ảnh đồ họa","24":"Bài 16. Ngôn ngữ lập trình bậc cao và Python","25":"Bài 16. Ngôn ngữ lập trình bậc cao và Python","26":"Bài 17. Biến và lệnh gán","27":"Bài 17. Biến và lệnh gán","28":"Bài 18. Các lệnh vào ra đơn giản","29":"Bài 18. Các lệnh vào ra đơn giản","30":"Bài 19. Câu lệnh rẽ nhánh If","31":"Bài 19. Câu lệnh rẽ nhánh If","32":"Ôn tập","33":"KIỂM TRA HỌC KỲ I","34":"Bài 20. Câu lệnh lặp For","35":"Bài 20. Câu lệnh lặp For","36":"Bài 21.Câu lệnh lặp While","37":"Bài 21.Câu lệnh lặp While","38":"Bài 22. Kiểu dữ liệu danh sách","39":"Bài 22. Kiểu dữ liệu danh sách","40":"Bài 23.Một số lệnh làm việc với kiểu dữ liệu danh sách","41":"Bài 23.Một số lệnh làm việc với kiểu dữ liệu danh sách","42":"Bài 23.Một số lệnh làm việc với kiểu dữ liệu danh sách","43":"Bài 24. Xâu kí tự","44":"Bài 24. Xâu kí tự","45":"Bài 25. Một số lệnh làm việc với xâu kí tự","46":"Bài 25. Một số lệnh làm việc với xâu kí tự","47":"Bài 25. Một số lệnh làm việc với xâu kí tự","48":"Bài 26. Hàm trong Python","49":"Bài 26. Hàm trong Python","50":"Bài 27. Tham số của hàm","51":"Bài 27. Tham số của hàm","52":"Bài 27. Tham số của hàm","53":"KIỂM TRA GIỮA KỲ II","54":"Bài 28. Phạm vi của biến","55":"Bài 28. Phạm vi của biến","56":"Bài 28. Phạm vi của biến","57":"Bài 29. Nhận biết lỗi trong chương trình","58":"Bài 29. Nhận biết lỗi trong chương trình","59":"Bài 30. Kiểm thử và gỡ lỗi chương trình","60":"Bài 30. Kiểm thử và gỡ lỗi chương trình","61":"Bài 31. Thực hành viết chương trình đơn giản","62":"Bài 31. Thực hành viết chương trình đơn giản","63":"Bài 32. Ôn tập lập trình Python","64":"Bài 32. Ôn tập lập trình Python","65":"Bài 33. Nghề thiết kế đồ họa máy tính","66":"Bài 33. Nghề thiết kế đồ họa máy tính","67":"Ôn tập","68":"KIỂM TRA HỌC KỲ II","69":"Bài 34. Nghề phát triển phần mềm","70":"Bài 34. Nghề phát triển phần mềm"},"11":{"1":"Hệ điều hành","2":"Hệ điều hành","3":"Thực hành sử dụng hệ điều hành","4":"Thực hành sử dụng hệ điều hành","5":"Phần mềm nguồn mở và phần mềm chạy trên Internet","6":"Phần mềm nguồn mở và phần mềm chạy trên Internet","7":"Bên trong máy tính","8":"Bên trong máy tính","9":"Kết nối máy tính với các thiết bị số","10":"Kết nối máy tính với các thiết bị số","11":"Lưu trữ và chia sẻ tệp tin trên Internet","12":"Lưu trữ và chia sẻ tệp tin trên Internet","13":"Thực hành tìm kiếm thông tin trên Internet","14":"Thực hành tìm kiếm thông tin trên Internet","15":"Thực hành nâng cao sử dụng thư điện tử và mạng xã hội","16":"Thực hành nâng cao sử dụng thư điện tử và mạng xã hội","17":"Giao tiếp an toàn trên Internet","18":"Giao tiếp an toàn trên Internet","19":"Kiểm tra giữa kì I","20":"Lưu trữ dữ liệu và khai thác thông tin phục vụ quản lí","21":"Lưu trữ dữ liệu và khai thác thông tin phục vụ quản lí","22":"Cơ sở dữ liệu","23":"Cơ sở dữ liệu","24":"Cơ sở dữ liệu","25":"Hệ quản trị cơ sở dữ liệu và hệ cơ sở dữ liệu","26":"Hệ quản trị cơ sở dữ liệu và hệ cơ sở dữ liệu","27":"Hệ quản trị cơ sở dữ liệu và hệ cơ sở dữ liệu","28":"Cơ sở dữ liệu quan hệ","29":"Cơ sở dữ liệu quan hệ","30":"SQL – Ngôn ngữ truy vấn có cấu trúc","31":"SQL – Ngôn ngữ truy vấn có cấu trúc","32":"Bảo mật và an toàn hệ cơ sở dữ liệu","33":"Bảo mật và an toàn hệ cơ sở dữ liệu","34":"Ôn tập cuối học kì I","35":"Kiểm tra cuối học kì I","36":"Nghề quản trị cơ sở dữ liệu","37":"Nghề quản trị cơ sở dữ liệu","38":"Quản trị CSDL trên máy tính","39":"Quản trị CSDL trên máy tính","40":"Xác định cấu trúc bảng và các trường khóa","41":"Xác định cấu trúc bảng và các trường khóa","42":"Thực hành tạo lập CSDL và các bảng đơn giản","43":"Thực hành tạo lập CSDL và các bảng đơn giản","44":"Thực hành tạo lập các bảng có khóa ngoài","45":"Thực hành tạo lập các bảng có khóa ngoài","46":"Thực hành cập nhật và truy xuất dữ liệu các bảng đơn giản","47":"Thực hành cập nhật và truy xuất dữ liệu các bảng đơn giản","48":"Thực hành cập nhật bảng dữ liệu có tham chiếu","49":"Thực hành cập nhật bảng dữ liệu có tham chiếu","50":"Kiểm tra giữa kì II","51":"Thực hành truy xuất dữ liệu qua liên kết các bảng","52":"Thực hành truy xuất dữ liệu qua liên kết các bảng","53":"Thực hành: Sao lưu dữ liệu","54":"Thực hành: Sao lưu dữ liệu","55":"Phần mềm chỉnh sửa ảnh","56":"Phần mềm chỉnh sửa ảnh","57":"Công cụ chọn và công cụ tinh chỉnh màu sắc","58":"Công cụ chọn và công cụ tinh chỉnh màu sắc","59":"Công cụ vẽ và một số ứng dụng","60":"Công cụ vẽ và một số ứng dụng","61":"Tạo ảnh động","62":"Tạo ảnh động","63":"Khám phá phần mềm làm phim","64":"Khám phá phần mềm làm phim","65":"Biên tập phim","66":"Biên tập phim","67":"Ôn tập cuối học kì II","68":"Kiểm tra cuối học kì II","69":"Thực hành tạo phim hoạt hình","70":"Thực hành tạo phim hoạt hình"},"12":{"1":"Bài 1: Làm quen với Trí tuệ nhân tạo","2":"Bài 1: Làm quen với Trí tuệ nhân tạo","3":"Bài 2: Trí tuệ nhân tạo trong khoa học và đời sống","4":"Bài 2: Trí tuệ nhân tạo trong khoa học và đời sống","5":"Bài 3: Một số thiết bị mạng thông dụng","6":"Bài 3: Một số thiết bị mạng thông dụng","7":"Bài 4: Giao thức mạng","8":"Bài 4: Giao thức mạng","9":"Bài 5: Thực hành chia sẻ tài nguyên trên mạng","10":"Bài 5: Thực hành chia sẻ tài nguyên trên mạng","11":"Bài 6: Giáo tiếp và ứng xử trong không gian mạng","12":"Bài 6: Giáo tiếp và ứng xử trong không gian mạng","13":"Bài 7: HTML và cấu trúc trang web","14":"Bài 7: HTML và cấu trúc trang web","15":"Bài 8: Định dạng văn bản","16":"Bài 8: Định dạng văn bản","17":"Bài 9: Tạo danh sách, bảng","18":"Bài 9: Tạo danh sách, bảng","19":"Ôn tập giữa kỳ I","20":"Kiểm tra giữa học kì 1","21":"Bài 10: Tạo liên kết","22":"Bài 10: Tạo liên kết","23":"Bài 11: Chèn tập tin đa phương tiện và khung nội tuyến và trang web","24":"Bài 11: Chèn tập tin đa phương tiện và khung nội tuyến và trang web","25":"Bài 12. Tạo biểu mẫu","26":"Bài 12. Tạo biểu mẫu","27":"Bài 13. Khái niệm, vai trò CSS","28":"Bài 13. Khái niệm, vai trò CSS","29":"Bài 14. Định dạng văn bản bằng CSS","30":"Bài 14. Định dạng văn bản bằng CSS","31":"Bài 15. Tạo màu cho chữ và nền","32":"Bài 15. Tạo màu cho chữ và nền","33":"Ôn tập cuối học kì 1","34":"KIỂM TRA ĐÁNH GIÁ HỌC KÌ I","35":"Bài 16. Định dạng khung","36":"Bài 16. Định dạng khung","37":"Bài 17: Các mức ưu tiên của bộ chọn","38":"Bài 17: Các mức ưu tiên của bộ chọn","39":"Bài 18: Thực hành tổng hợp thiết kế trang web","40":"Bài 18: Thực hành tổng hợp thiết kế trang web","41":"Bài 18: Thực hành tổng hợp thiết kế trang web","42":"Bài 19: Dịch vụ sửa chữa và bảo trì máy tính","43":"Bài 19: Dịch vụ sửa chữa và bảo trì máy tính","44":"Bài 20: Nhóm nghề quản trị trong ngành Công nghệ thông tin","45":"Bài 20: Nhóm nghề quản trị trong ngành Công nghệ thông tin","46":"Bài 21: Hội thảo hướng nghiệp","47":"Bài 21: Hội thảo hướng nghiệp","48":"Bài 21: Hội thảo hướng nghiệp","49":"Bài 22: Thực hành kết nối các thiết bị số","50":"Bài 22: Thực hành kết nối các thiết bị số","51":"Ôn tập giữa học kì II","52":"KIỂM TRA ĐÁNH GIÁ GIỮA HỌC KÌ II","53":"Bài 22: Thực hành kết nối các thiết bị số","54":"Bài 22: Thực hành kết nối các thiết bị số","55":"Bài 23: Chuẩn bị xây dựng trang web","56":"Bài 23: Chuẩn bị xây dựng trang web","57":"Bài 23: Chuẩn bị xây dựng trang web","58":"Bài 24: Xây dựng phần đầu trang web","59":"Bài 24: Xây dựng phần đầu trang web","60":"Bài 25: Xây dựng phần thân và chân trang web","61":"Bài 25: Xây dựng phần thân và chân trang web","62":"Bài 26: Liên kết và thanh điều hướng","63":"Bài 26: Liên kết và thanh điều hướng","64":"Bài 27: Biểu mẫu trên trang web","65":"Bài 27: Biểu mẫu trên trang web","66":"Ôn tập cuối học kì II","67":"KIỂM TRA ĐÁNH GIÁ CUỐI HỌC KÌ II","68":"Bài 28. Thực hành tổng hợp","69":"Bài 28. Thực hành tổng hợp","70":"Bài 28. Thực hành tổng hợp"}},"electiveMap":{},"warnings":[],"gradeCounts":{"10":70,"11":70,"12":70},"electiveGradeCounts":{},"regularEntries":210,"electiveEntries":0,"entries":210,"warningCount":0,"modes":["duration"],"criticalWarningCount":0,"partial":false,"criticalWarnings":[]},"HĐTNHN":{"subject":"HĐTNHN","title":"Phu luc II - 18.9.2025. Ke hoach day hoc hoat dong trai nghiem huong nghiep.docx","kind":"Kho PPCT tích hợp","format":"Dữ liệu chuẩn của trường từ Kế hoạch dạy học 2026–2027","map":{"10":{"1":"Chủ đề 1: Phát huy truyền thống nhà trường","2":"Chủ đề 1: Phát huy truyền thống nhà trường","3":"Chủ đề 1: Phát huy truyền thống nhà trường","4":"Chủ đề 1: Phát huy truyền thống nhà trường","5":"Chủ đề 1: Phát huy truyền thống nhà trường","6":"Chủ đề 1: Phát huy truyền thống nhà trường","7":"Chủ đề 1: Phát huy truyền thống nhà trường","8":"Chủ đề 1: Phát huy truyền thống nhà trường","9":"Chủ đề 1: Phát huy truyền thống nhà trường","10":"Chủ đề 1: Phát huy truyền thống nhà trường","11":"Chủ đề 1: Phát huy truyền thống nhà trường","12":"Chủ đề 2: Khám phá bản thân","13":"Chủ đề 2: Khám phá bản thân","14":"Chủ đề 2: Khám phá bản thân","15":"Chủ đề 2: Khám phá bản thân","16":"Chủ đề 2: Khám phá bản thân","17":"Chủ đề 2: Khám phá bản thân","18":"Chủ đề 3: Rèn luyện bản thân","19":"Chủ đề 3: Rèn luyện bản thân","20":"Chủ đề 3: Rèn luyện bản thân","21":"Chủ đề 3: Rèn luyện bản thân","22":"Chủ đề 3: Rèn luyện bản thân","23":"Chủ đề 3: Rèn luyện bản thân","24":"Chủ đề 3: Rèn luyện bản thân","25":"Chủ đề 3: Rèn luyện bản thân","26":"Chủ đề 3: Rèn luyện bản thân","27":"Chủ đề 3: Rèn luyện bản thân","28":"Chủ đề 3: Rèn luyện bản thân","29":"Chủ đề 3: Rèn luyện bản thân","30":"Chủ đề 3: Rèn luyện bản thân","31":"Chủ đề 3: Rèn luyện bản thân","32":"Chủ đề 3: Rèn luyện bản thân","33":"Đánh giá giữa kì 1","34":"Đánh giá giữa kì 1","35":"Chủ đề 4: Chủ động, tự tin trong học tập và giao tiếp","36":"Chủ đề 4: Chủ động, tự tin trong học tập và giao tiếp","37":"Chủ đề 4: Chủ động, tự tin trong học tập và giao tiếp","38":"Chủ đề 4: Chủ động, tự tin trong học tập và giao tiếp","39":"Chủ đề 4: Chủ động, tự tin trong học tập và giao tiếp","40":"Chủ đề 4: Chủ động, tự tin trong học tập và giao tiếp","41":"Chủ đề 4: Chủ động, tự tin trong học tập và giao tiếp","42":"Chủ đề 4: Chủ động, tự tin trong học tập và giao tiếp","43":"Chủ đề 4: Chủ động, tự tin trong học tập và giao tiếp","44":"Chủ đề 5: Trách nhiệm với gia đình","45":"Chủ đề 5: Trách nhiệm với gia đình","46":"Chủ đề 5: Trách nhiệm với gia đình","47":"Chủ đề 5: Trách nhiệm với gia đình","48":"Chủ đề 5: Trách nhiệm với gia đình","49":"Chủ đề 5: Trách nhiệm với gia đình","50":"Đánh giá cuối kì 1","51":"Đánh giá cuối kì 1","52":"Chủ đề 6: Tham gia xây dựng cộng đồng","53":"Chủ đề 6: Tham gia xây dựng cộng đồng","54":"Chủ đề 6: Tham gia xây dựng cộng đồng","55":"Chủ đề 6: Tham gia xây dựng cộng đồng","56":"Chủ đề 6: Tham gia xây dựng cộng đồng","57":"Chủ đề 6: Tham gia xây dựng cộng đồng","58":"Chủ đề 6: Tham gia xây dựng cộng đồng","59":"Chủ đề 6: Tham gia xây dựng cộng đồng","60":"Chủ đề 7: Bảo tồn cảnh quan thiên nhiên","61":"Chủ đề 7: Bảo tồn cảnh quan thiên nhiên","62":"Chủ đề 7: Bảo tồn cảnh quan thiên nhiên","63":"Chủ đề 7: Bảo tồn cảnh quan thiên nhiên","64":"Chủ đề 7: Bảo tồn cảnh quan thiên nhiên","65":"Chủ đề 7: Bảo tồn cảnh quan thiên nhiên","66":"Chủ đề 8: Bảo vệ môi trường tự nhiên","67":"Chủ đề 8: Bảo vệ môi trường tự nhiên","68":"Chủ đề 8: Bảo vệ môi trường tự nhiên","69":"Chủ đề 8: Bảo vệ môi trường tự nhiên","70":"Chủ đề 8: Bảo vệ môi trường tự nhiên","71":"Chủ đề 8: Bảo vệ môi trường tự nhiên","72":"Chủ đề 8: Bảo vệ môi trường tự nhiên","73":"Chủ đề 8: Bảo vệ môi trường tự nhiên","74":"Chủ đề 9: Tìm hiểu nghề nghiệp","75":"Chủ đề 9: Tìm hiểu nghề nghiệp","76":"Chủ đề 9: Tìm hiểu nghề nghiệp","77":"Chủ đề 9: Tìm hiểu nghề nghiệp","78":"Chủ đề 9: Tìm hiểu nghề nghiệp","79":"Chủ đề 9: Tìm hiểu nghề nghiệp","80":"Chủ đề 9: Tìm hiểu nghề nghiệp","81":"Chủ đề 9: Tìm hiểu nghề nghiệp","82":"Chủ đề 9: Tìm hiểu nghề nghiệp","83":"Chủ đề 9: Tìm hiểu nghề nghiệp","84":"Chủ đề 9: Tìm hiểu nghề nghiệp","85":"Chủ đề 9: Tìm hiểu nghề nghiệp","86":"Đánh giá giữa kì 2","87":"Đánh giá giữa kì 2","88":"Chủ đề 10: Hiểu bản thân để chọn nghề phù hợp","89":"Chủ đề 10: Hiểu bản thân để chọn nghề phù hợp","90":"Chủ đề 10: Hiểu bản thân để chọn nghề phù hợp","91":"Chủ đề 10: Hiểu bản thân để chọn nghề phù hợp","92":"Chủ đề 10: Hiểu bản thân để chọn nghề phù hợp","93":"Chủ đề 10: Hiểu bản thân để chọn nghề phù hợp","94":"Chủ đề 10: Hiểu bản thân để chọn nghề phù hợp","95":"Chủ đề 10: Hiểu bản thân để chọn nghề phù hợp","96":"Chủ đề 11: Lập kế hoạch học tập, rèn luyện theo định hướng nghề nghiệp.","97":"Chủ đề 11: Lập kế hoạch học tập, rèn luyện theo định hướng nghề nghiệp.","98":"Chủ đề 11: Lập kế hoạch học tập, rèn luyện theo định hướng nghề nghiệp.","99":"Chủ đề 11: Lập kế hoạch học tập, rèn luyện theo định hướng nghề nghiệp.","100":"Chủ đề 11: Lập kế hoạch học tập, rèn luyện theo định hướng nghề nghiệp.","101":"Chủ đề 11: Lập kế hoạch học tập, rèn luyện theo định hướng nghề nghiệp.","102":"Chủ đề 11: Lập kế hoạch học tập, rèn luyện theo định hướng nghề nghiệp.","103":"Chủ đề 11: Lập kế hoạch học tập, rèn luyện theo định hướng nghề nghiệp.","104":"Đánh giá cuối kì 2","105":"Đánh giá cuối kì 2"},"11":{"1":"Chủ đề 1: Xây dựng và phát triển nhà trường","2":"Chủ đề 1: Xây dựng và phát triển nhà trường","3":"Chủ đề 1: Xây dựng và phát triển nhà trường","4":"Chủ đề 1: Xây dựng và phát triển nhà trường","5":"Chủ đề 1: Xây dựng và phát triển nhà trường","6":"Chủ đề 1: Xây dựng và phát triển nhà trường","7":"Chủ đề 1: Xây dựng và phát triển nhà trường","8":"Chủ đề 2: Khám phá bản thân","9":"Chủ đề 2: Khám phá bản thân","10":"Chủ đề 2: Khám phá bản thân","11":"Chủ đề 2: Khám phá bản thân","12":"Chủ đề 2: Khám phá bản thân","13":"Chủ đề 2: Khám phá bản thân","14":"Chủ đề 2: Khám phá bản thân","15":"Chủ đề 2: Khám phá bản thân","16":"Chủ đề 2: Khám phá bản thân","17":"Chủ đề 2: Khám phá bản thân","18":"Chủ đề 2: Khám phá bản thân","19":"Chủ đề 2: Khám phá bản thân","20":"Chủ đề 2: Khám phá bản thân","21":"Chủ đề 3: Rèn luyện bản thân","22":"Chủ đề 3: Rèn luyện bản thân","23":"Chủ đề 3: Rèn luyện bản thân","24":"Chủ đề 3: Rèn luyện bản thân","25":"Chủ đề 3: Rèn luyện bản thân","26":"Chủ đề 3: Rèn luyện bản thân","27":"Chủ đề 3: Rèn luyện bản thân","28":"Chủ đề 3: Rèn luyện bản thân","29":"Chủ đề 3: Rèn luyện bản thân","30":"Chủ đề 3: Rèn luyện bản thân","31":"Chủ đề 3: Rèn luyện bản thân","32":"Chủ đề 3: Rèn luyện bản thân","33":"Chủ đề 3: Rèn luyện bản thân","34":"Chủ đề 3: Rèn luyện bản thân","35":"Chủ đề 3: Rèn luyện bản thân","36":"Chủ đề 3: Rèn luyện bản thân","37":"Đánh giá giữa kì 1","38":"Đánh giá giữa kì 1","39":"Chủ đề 4: Trách nhiệm với gia đình","40":"Chủ đề 4: Trách nhiệm với gia đình","41":"Chủ đề 4: Trách nhiệm với gia đình","42":"Chủ đề 4: Trách nhiệm với gia đình","43":"Chủ đề 4: Trách nhiệm với gia đình","44":"Chủ đề 4: Trách nhiệm với gia đình","45":"Chủ đề 4: Trách nhiệm với gia đình","46":"Chủ đề 4: Trách nhiệm với gia đình","47":"Chủ đề 4: Trách nhiệm với gia đình","48":"Chủ đề 5: Phát triển cộng đồng","49":"Chủ đề 5: Phát triển cộng đồng","50":"Chủ đề 5: Phát triển cộng đồng","51":"Chủ đề 5: Phát triển cộng đồng","52":"Chủ đề 5: Phát triển cộng đồng","53":"Chủ đề 5: Phát triển cộng đồng","54":"Chủ đề 5: Phát triển cộng đồng","55":"Chủ đề 5: Phát triển cộng đồng","56":"Đánh giá cuối kì 1","57":"Đánh giá cuối kì 1","58":"Chủ đề 6: Bảo tồn cảnh quan thiên nhiên","59":"Chủ đề 6: Bảo tồn cảnh quan thiên nhiên","60":"Chủ đề 6: Bảo tồn cảnh quan thiên nhiên","61":"Chủ đề 6: Bảo tồn cảnh quan thiên nhiên","62":"Chủ đề 6: Bảo tồn cảnh quan thiên nhiên","63":"Chủ đề 6: Bảo tồn cảnh quan thiên nhiên","64":"Chủ đề 6: Bảo tồn cảnh quan thiên nhiên","65":"Chủ đề 6: Bảo tồn cảnh quan thiên nhiên","66":"Chủ đề 7: Bảo vệ môi trường","67":"Chủ đề 7: Bảo vệ môi trường","68":"Chủ đề 7: Bảo vệ môi trường","69":"Chủ đề 7: Bảo vệ môi trường","70":"Chủ đề 7: Bảo vệ môi trường","71":"Chủ đề 7: Bảo vệ môi trường","72":"Chủ đề 7: Bảo vệ môi trường","73":"Đánh giá giữa kì 2","74":"Đánh giá giữa kì 2","75":"Chủ đề 8: Các nhóm nghề cơ bản và yêu cầu của thị trường lao động","76":"Chủ đề 8: Các nhóm nghề cơ bản và yêu cầu của thị trường lao động","77":"Chủ đề 8: Các nhóm nghề cơ bản và yêu cầu của thị trường lao động","78":"Chủ đề 8: Các nhóm nghề cơ bản và yêu cầu của thị trường lao động","79":"Chủ đề 8: Các nhóm nghề cơ bản và yêu cầu của thị trường lao động","80":"Chủ đề 8: Các nhóm nghề cơ bản và yêu cầu của thị trường lao động","81":"Chủ đề 8: Các nhóm nghề cơ bản và yêu cầu của thị trường lao động","82":"Chủ đề 8: Các nhóm nghề cơ bản và yêu cầu của thị trường lao động","83":"Chủ đề 8: Các nhóm nghề cơ bản và yêu cầu của thị trường lao động","84":"Chủ đề 8: Các nhóm nghề cơ bản và yêu cầu của thị trường lao động","85":"Chủ đề 9: Xây dựng và thực hiện kế hoạch học tập theo định hhướng","86":"Chủ đề 9: Xây dựng và thực hiện kế hoạch học tập theo định hhướng","87":"Chủ đề 9: Xây dựng và thực hiện kế hoạch học tập theo định hhướng","88":"Chủ đề 9: Xây dựng và thực hiện kế hoạch học tập theo định hhướng","89":"Chủ đề 9: Xây dựng và thực hiện kế hoạch học tập theo định hhướng","90":"Chủ đề 9: Xây dựng và thực hiện kế hoạch học tập theo định hhướng","91":"Chủ đề 9: Xây dựng và thực hiện kế hoạch học tập theo định hhướng","92":"Chủ đề 9: Xây dựng và thực hiện kế hoạch học tập theo định hhướng","93":"Chủ đề 9: Xây dựng và thực hiện kế hoạch học tập theo định hhướng","94":"Chủ đề 10: xây dựng và thực hiện kế hoạch học tập theo định hướng ngành, nghề lựa chọn.","95":"Chủ đề 10: xây dựng và thực hiện kế hoạch học tập theo định hướng ngành, nghề lựa chọn.","96":"Chủ đề 10: xây dựng và thực hiện kế hoạch học tập theo định hướng ngành, nghề lựa chọn.","97":"Chủ đề 10: xây dựng và thực hiện kế hoạch học tập theo định hướng ngành, nghề lựa chọn.","98":"Chủ đề 10: xây dựng và thực hiện kế hoạch học tập theo định hướng ngành, nghề lựa chọn.","99":"Chủ đề 10: xây dựng và thực hiện kế hoạch học tập theo định hướng ngành, nghề lựa chọn.","100":"Chủ đề 10: xây dựng và thực hiện kế hoạch học tập theo định hướng ngành, nghề lựa chọn.","101":"Chủ đề 10: xây dựng và thực hiện kế hoạch học tập theo định hướng ngành, nghề lựa chọn.","102":"Chủ đề 10: xây dựng và thực hiện kế hoạch học tập theo định hướng ngành, nghề lựa chọn.","103":"Chủ đề 10: xây dựng và thực hiện kế hoạch học tập theo định hướng ngành, nghề lựa chọn.","104":"Đánh giá cuối kì 2","105":"Đánh giá cuối kì 2"},"12":{"1":"Chủ đề 1: Phát triển các mối quan hệ tốt đẹp với thầy cô và các bạn","2":"Chủ đề 1: Phát triển các mối quan hệ tốt đẹp với thầy cô và các bạn","3":"Chủ đề 1: Phát triển các mối quan hệ tốt đẹp với thầy cô và các bạn","4":"Chủ đề 1: Phát triển các mối quan hệ tốt đẹp với thầy cô và các bạn","5":"Chủ đề 1: Phát triển các mối quan hệ tốt đẹp với thầy cô và các bạn","6":"Chủ đề 1: Phát triển các mối quan hệ tốt đẹp với thầy cô và các bạn","7":"Chủ đề 1: Phát triển các mối quan hệ tốt đẹp với thầy cô và các bạn","8":"Chủ đề 1: Phát triển các mối quan hệ tốt đẹp với thầy cô và các bạn","9":"Chủ đề 1: Phát triển các mối quan hệ tốt đẹp với thầy cô và các bạn","10":"Chủ đề 2: Tôi trưởng thành","11":"Chủ đề 2: Tôi trưởng thành","12":"Chủ đề 2: Tôi trưởng thành","13":"Chủ đề 2: Tôi trưởng thành","14":"Chủ đề 2: Tôi trưởng thành","15":"Chủ đề 2: Tôi trưởng thành","16":"Chủ đề 2: Tôi trưởng thành","17":"Chủ đề 2: Tôi trưởng thành","18":"Chủ đề 2: Tôi trưởng thành","19":"Đánh giá giữa kì 1","20":"Đánh giá giữa kì 1","21":"Chủ đề 3: Hoàn thiện bản thân","22":"Chủ đề 3: Hoàn thiện bản thân","23":"Chủ đề 3: Hoàn thiện bản thân","24":"Chủ đề 3: Hoàn thiện bản thân","25":"Chủ đề 3: Hoàn thiện bản thân","26":"Chủ đề 3: Hoàn thiện bản thân","27":"Chủ đề 3: Hoàn thiện bản thân","28":"Chủ đề 3: Hoàn thiện bản thân","29":"Chủ đề 3: Hoàn thiện bản thân","30":"Chủ đề 3: Hoàn thiện bản thân","31":"Chủ đề 3: Hoàn thiện bản thân","32":"Chủ đề 4: Trách nhiệm với gia đình","33":"Chủ đề 4: Trách nhiệm với gia đình","34":"Chủ đề 4: Trách nhiệm với gia đình","35":"Chủ đề 4: Trách nhiệm với gia đình","36":"Chủ đề 4: Trách nhiệm với gia đình","37":"Chủ đề 4: Trách nhiệm với gia đình","38":"Chủ đề 4: Trách nhiệm với gia đình","39":"Chủ đề 4: Trách nhiệm với gia đình","40":"Chủ đề 5: Xây dựng cộng đồng","41":"Chủ đề 5: Xây dựng cộng đồng","42":"Chủ đề 5: Xây dựng cộng đồng","43":"Chủ đề 5: Xây dựng cộng đồng","44":"Chủ đề 5: Xây dựng cộng đồng","45":"Chủ đề 5: Xây dựng cộng đồng","46":"Chủ đề 5: Xây dựng cộng đồng","47":"Chủ đề 5: Xây dựng cộng đồng","48":"Chủ đề 5: Xây dựng cộng đồng","49":"Chủ đề 5: Xây dựng cộng đồng","50":"Đánh giá cuối kì 1","51":"Đánh giá cuối kì 1","52":"Chủ đề 6: Chung tay gìn giữ, bảo tồn cảnh quan thiên nhiên","53":"Chủ đề 6: Chung tay gìn giữ, bảo tồn cảnh quan thiên nhiên","54":"Chủ đề 6: Chung tay gìn giữ, bảo tồn cảnh quan thiên nhiên","55":"Chủ đề 6: Chung tay gìn giữ, bảo tồn cảnh quan thiên nhiên","56":"Chủ đề 6: Chung tay gìn giữ, bảo tồn cảnh quan thiên nhiên","57":"Chủ đề 6: Chung tay gìn giữ, bảo tồn cảnh quan thiên nhiên","58":"Chủ đề 6: Chung tay gìn giữ, bảo tồn cảnh quan thiên nhiên","59":"Chủ đề 6: Chung tay gìn giữ, bảo tồn cảnh quan thiên nhiên","60":"Chủ đề 7: Bảo vệ thế giới tự nhiên","61":"Chủ đề 7: Bảo vệ thế giới tự nhiên","62":"Chủ đề 7: Bảo vệ thế giới tự nhiên","63":"Chủ đề 7: Bảo vệ thế giới tự nhiên","64":"Chủ đề 7: Bảo vệ thế giới tự nhiên","65":"Chủ đề 7: Bảo vệ thế giới tự nhiên","66":"Chủ đề 7: Bảo vệ thế giới tự nhiên","67":"Chủ đề 7: Bảo vệ thế giới tự nhiên","68":"Chủ đề 8: Nghề nghiệp và những yêu cầu đối với người lao động trong xã hội hiện đại","69":"Chủ đề 8: Nghề nghiệp và những yêu cầu đối với người lao động trong xã hội hiện đại","70":"Chủ đề 8: Nghề nghiệp và những yêu cầu đối với người lao động trong xã hội hiện đại","71":"Chủ đề 8: Nghề nghiệp và những yêu cầu đối với người lao động trong xã hội hiện đại","72":"Chủ đề 8: Nghề nghiệp và những yêu cầu đối với người lao động trong xã hội hiện đại","73":"Chủ đề 8: Nghề nghiệp và những yêu cầu đối với người lao động trong xã hội hiện đại","74":"Chủ đề 8: Nghề nghiệp và những yêu cầu đối với người lao động trong xã hội hiện đại","75":"Chủ đề 8: Nghề nghiệp và những yêu cầu đối với người lao động trong xã hội hiện đại","76":"Chủ đề 8: Nghề nghiệp và những yêu cầu đối với người lao động trong xã hội hiện đại","77":"Chủ đề 8: Nghề nghiệp và những yêu cầu đối với người lao động trong xã hội hiện đại","78":"Chủ đề 8: Nghề nghiệp và những yêu cầu đối với người lao động trong xã hội hiện đại","79":"Đánh giá giữa kì 2","80":"Đánh giá giữa kì 2","81":"Chủ đề 9: Rèn luyện phẩm chất, năng lực phù hợp với định hướng nghề nghiệp","82":"Chủ đề 9: Rèn luyện phẩm chất, năng lực phù hợp với định hướng nghề nghiệp","83":"Chủ đề 9: Rèn luyện phẩm chất, năng lực phù hợp với định hướng nghề nghiệp","84":"Chủ đề 9: Rèn luyện phẩm chất, năng lực phù hợp với định hướng nghề nghiệp","85":"Chủ đề 9: Rèn luyện phẩm chất, năng lực phù hợp với định hướng nghề nghiệp","86":"Chủ đề 9: Rèn luyện phẩm chất, năng lực phù hợp với định hướng nghề nghiệp","87":"Chủ đề 9: Rèn luyện phẩm chất, năng lực phù hợp với định hướng nghề nghiệp","88":"Chủ đề 9: Rèn luyện phẩm chất, năng lực phù hợp với định hướng nghề nghiệp","89":"Chủ đề 9: Rèn luyện phẩm chất, năng lực phù hợp với định hướng nghề nghiệp","90":"Chủ đề 9: Rèn luyện phẩm chất, năng lực phù hợp với định hướng nghề nghiệp","91":"Chủ đề 9: Rèn luyện phẩm chất, năng lực phù hợp với định hướng nghề nghiệp","92":"Chủ đề 10: Quyết định lựa chọn nghề phù hợp và chuẩn bị tâm lí thích ứng với môi trường mới","93":"Chủ đề 10: Quyết định lựa chọn nghề phù hợp và chuẩn bị tâm lí thích ứng với môi trường mới","94":"Chủ đề 10: Quyết định lựa chọn nghề phù hợp và chuẩn bị tâm lí thích ứng với môi trường mới","95":"Chủ đề 10: Quyết định lựa chọn nghề phù hợp và chuẩn bị tâm lí thích ứng với môi trường mới","96":"Chủ đề 10: Quyết định lựa chọn nghề phù hợp và chuẩn bị tâm lí thích ứng với môi trường mới","97":"Chủ đề 10: Quyết định lựa chọn nghề phù hợp và chuẩn bị tâm lí thích ứng với môi trường mới","98":"Chủ đề 10: Quyết định lựa chọn nghề phù hợp và chuẩn bị tâm lí thích ứng với môi trường mới","99":"Chủ đề 10: Quyết định lựa chọn nghề phù hợp và chuẩn bị tâm lí thích ứng với môi trường mới","100":"Chủ đề 10: Quyết định lựa chọn nghề phù hợp và chuẩn bị tâm lí thích ứng với môi trường mới","101":"Chủ đề 10: Quyết định lựa chọn nghề phù hợp và chuẩn bị tâm lí thích ứng với môi trường mới","102":"Chủ đề 10: Quyết định lựa chọn nghề phù hợp và chuẩn bị tâm lí thích ứng với môi trường mới","103":"Chủ đề 10: Quyết định lựa chọn nghề phù hợp và chuẩn bị tâm lí thích ứng với môi trường mới","104":"Đánh giá cuối kì 2","105":"Đánh giá cuối kì 2"}},"electiveMap":{},"warnings":[],"gradeCounts":{"10":105,"11":105,"12":105},"electiveGradeCounts":{},"regularEntries":315,"electiveEntries":0,"entries":315,"warningCount":0,"modes":["duration"],"criticalWarningCount":0,"partial":false,"criticalWarnings":[]},"GDĐP":{"subject":"GDĐP","title":"Phu luc III - Ke hoach day hoc noi dung giao duc dia phuong (x).docx","kind":"Kho PPCT tích hợp","format":"Dữ liệu chuẩn của trường từ Kế hoạch dạy học 2026–2027","map":{"10":{"1":"Chủ đề 1: Tìm hiểu về thời nhà Mạc ở Cao Bằng","2":"Chủ đề 1: Tìm hiểu về thời nhà Mạc ở Cao Bằng","3":"Chủ đề 1: Tìm hiểu về thời nhà Mạc ở Cao Bằng","4":"Chủ đề 1: Tìm hiểu về thời nhà Mạc ở Cao Bằng","5":"Chủ đề 7: Bảo vệ chủ quyền lãnh thổ, an ninh biên giới quốc gia ở tỉnh Cao Bằng","6":"Chủ đề 7: Bảo vệ chủ quyền lãnh thổ, an ninh biên giới quốc gia ở tỉnh Cao Bằng","7":"Chủ đề 7: Bảo vệ chủ quyền lãnh thổ, an ninh biên giới quốc gia ở tỉnh Cao Bằng","8":"Đánh giá giữa kì I","9":"Chủ đề 2: Truyện thơ dân gian Cao Bằng","10":"Chủ đề 2: Truyện thơ dân gian Cao Bằng","11":"Chủ đề 2: Truyện thơ dân gian Cao Bằng","12":"Chủ đề 2: Truyện thơ dân gian Cao Bằng","13":"Chủ đề 3: Các nguồn lực phát triển kinh tế Cao Bằng","14":"Chủ đề 3: Các nguồn lực phát triển kinh tế Cao Bằng","15":"Chủ đề 3: Các nguồn lực phát triển kinh tế Cao Bằng","16":"Chủ đề 3: Các nguồn lực phát triển kinh tế Cao Bằng","17":"Đánh giá cuối học kì I","18":"Chủ đề 4: Tìm hiểu về hoạt động kinh doanh ở Cao Bằng","19":"Chủ đề 4: Tìm hiểu về hoạt động kinh doanh ở Cao Bằng","20":"Chủ đề 4: Tìm hiểu về hoạt động kinh doanh ở Cao Bằng","21":"Chủ đề 4: Tìm hiểu về hoạt động kinh doanh ở Cao Bằng","22":"Chủ đề 6: Sử dụng bền vững tài nguyên thiên nhiên","23":"Chủ đề 6: Sử dụng bền vững tài nguyên thiên nhiên","24":"Chủ đề 6: Sử dụng bền vững tài nguyên thiên nhiên","25":"Chủ đề 6: Sử dụng bền vững tài nguyên thiên nhiên","26":"Đánh giá giữa kì II","27":"Chủ đề 5: Tìm hiểu mô hình sản xuất một số loại cây ăn quả/ cây công nghiệp ở địa phương","28":"Chủ đề 5: Tìm hiểu mô hình sản xuất một số loại cây ăn quả/ cây công nghiệp ở địa phương","29":"Chủ đề 5: Tìm hiểu mô hình sản xuất một số loại cây ăn quả/ cây công nghiệp ở địa phương","30":"Chủ đề 5: Tìm hiểu mô hình sản xuất một số loại cây ăn quả/ cây công nghiệp ở địa phương","31":"Chủ đề 8: Xây dựng nếp sống văn minh, tôn trọng kỷ cương, pháp luật ở tỉnh Cao Bằng","32":"Chủ đề 8: Xây dựng nếp sống văn minh, tôn trọng kỷ cương, pháp luật ở tỉnh Cao Bằng","33":"Chủ đề 8: Xây dựng nếp sống văn minh, tôn trọng kỷ cương, pháp luật ở tỉnh Cao Bằng","34":"Chủ đề 8: Xây dựng nếp sống văn minh, tôn trọng kỷ cương, pháp luật ở tỉnh Cao Bằng","35":"Đánh giá cuối học kì II"},"11":{"1":"Chủ đề 5: Phát triển kinh tế nông nghiệp ở Cao Bằng","2":"Chủ đề 5: Phát triển kinh tế nông nghiệp ở Cao Bằng","3":"Chủ đề 5: Phát triển kinh tế nông nghiệp ở Cao Bằng","4":"Chủ đề 5: Phát triển kinh tế nông nghiệp ở Cao Bằng","5":"Chủ đề 5: Phát triển kinh tế nông nghiệp ở Cao Bằng","6":"Chủ đề 5: Phát triển kinh tế nông nghiệp ở Cao Bằng","7":"Chủ đề 5: Phát triển kinh tế nông nghiệp ở Cao Bằng","8":"Chủ đề 5: Phát triển kinh tế nông nghiệp ở Cao Bằng","9":"Đánh giá giữa kì I","10":"Chủ đề 6: Tìm hiểu về hoạt động khởi nghiệp (Startup) ở Cao Bằng","11":"Chủ đề 6: Tìm hiểu về hoạt động khởi nghiệp (Startup) ở Cao Bằng","12":"Chủ đề 6: Tìm hiểu về hoạt động khởi nghiệp (Startup) ở Cao Bằng","13":"Chủ đề 6: Tìm hiểu về hoạt động khởi nghiệp (Startup) ở Cao Bằng","14":"Chủ đề 6: Tìm hiểu về hoạt động khởi nghiệp (Startup) ở Cao Bằng","15":"Chủ đề 7: Phòng chống dịch bệnh ở người và vật nuôi ở Cao Bằng","16":"Chủ đề 7: Phòng chống dịch bệnh ở người và vật nuôi ở Cao Bằng","17":"Chủ đề 7: Phòng chống dịch bệnh ở người và vật nuôi ở Cao Bằng","18":"Chủ đề 7: Phòng chống dịch bệnh ở người và vật nuôi ở Cao Bằng","19":"Đánh giá cuối kì I","20":"Chủ đề 2: Một số lễ, tết ở Cao Bằng","21":"Chủ đề 2: Một số lễ, tết ở Cao Bằng","22":"Chủ đề 2: Một số lễ, tết ở Cao Bằng","23":"Chủ đề 4: Tiểu thuyết hiện đại Cao Bằng","24":"Chủ đề 4: Tiểu thuyết hiện đại Cao Bằng","25":"Chủ đề 4: Tiểu thuyết hiện đại Cao Bằng","26":"Đánh giá giữa kì II","27":"Chủ đề 1: Nhân vật lịch sử tiêu biểu ở Cao Bằng từ đầu thế kỉ XX đến nay","28":"Chủ đề 1: Nhân vật lịch sử tiêu biểu ở Cao Bằng từ đầu thế kỉ XX đến nay","29":"Chủ đề 1: Nhân vật lịch sử tiêu biểu ở Cao Bằng từ đầu thế kỉ XX đến nay","30":"Chủ đề 1: Nhân vật lịch sử tiêu biểu ở Cao Bằng từ đầu thế kỉ XX đến nay","31":"Chủ đề 3: Sự thành lập và vai trò của Đảng bộ tỉnh Cao Bằng trong thời kì 1930-1945","32":"Chủ đề 3: Sự thành lập và vai trò của Đảng bộ tỉnh Cao Bằng trong thời kì 1930-1945","33":"Chủ đề 3: Sự thành lập và vai trò của Đảng bộ tỉnh Cao Bằng trong thời kì 1930-1945","34":"Chủ đề 3: Sự thành lập và vai trò của Đảng bộ tỉnh Cao Bằng trong thời kì 1930-1945","35":"Đánh giá cuối học kì II"},"12":{"1":"Chủ đề 1: Nguyễn Ái Quốc - Hồ Chí Minh với Cao Bằng","2":"Chủ đề 1: Nguyễn Ái Quốc - Hồ Chí Minh với Cao Bằng","3":"Chủ đề 1: Nguyễn Ái Quốc - Hồ Chí Minh với Cao Bằng","4":"Chủ đề 1: Nguyễn Ái Quốc - Hồ Chí Minh với Cao Bằng","5":"Chủ đề 3: Mặt trận Việt Minh ở Cao Bằng","6":"Chủ đề 3: Mặt trận Việt Minh ở Cao Bằng","7":"Chủ đề 3: Mặt trận Việt Minh ở Cao Bằng","8":"Chủ đề 3: Mặt trận Việt Minh ở Cao Bằng","9":"Đánh giá giữa kì I","10":"Chủ đề 2: Thơ hiện đại Cao Bằng","11":"Chủ đề 2: Thơ hiện đại Cao Bằng","12":"Chủ đề 4: Phát triển kinh tế du lịch ở Cao Bằng","13":"Chủ đề 4: Phát triển kinh tế du lịch ở Cao Bằng","14":"Chủ đề 4: Phát triển kinh tế du lịch ở Cao Bằng","15":"Chủ đề 4: Phát triển kinh tế du lịch ở Cao Bằng","16":"Chủ đề 4: Phát triển kinh tế du lịch ở Cao Bằng","17":"Chủ đề 4: Phát triển kinh tế du lịch ở Cao Bằng","18":"Đánh giá cuối kì I","19":"Chủ đề 5: Định hướng nghề nghiệp cho học sinh ở Cao Bằng","20":"Chủ đề 5: Định hướng nghề nghiệp cho học sinh ở Cao Bằng","21":"Chủ đề 5: Định hướng nghề nghiệp cho học sinh ở Cao Bằng","22":"Chủ đề 5: Định hướng nghề nghiệp cho học sinh ở Cao Bằng","23":"Chủ đề 5: Định hướng nghề nghiệp cho học sinh ở Cao Bằng","24":"Chủ đề 5: Định hướng nghề nghiệp cho học sinh ở Cao Bằng","25":"Chủ đề 7: Chính sách xã hội ở Cao Bằng","26":"Chủ đề 7: Chính sách xã hội ở Cao Bằng","27":"Chủ đề 7: Chính sách xã hội ở Cao Bằng","28":"Đánh giá giữa kì II","29":"Chủ đề 6: Đánh giá tác động của biến đổi khí hậu đối với tỉnh Cao Bằng. Kế hoạch hành động, ứng phó.","30":"Chủ đề 6: Đánh giá tác động của biến đổi khí hậu đối với tỉnh Cao Bằng. Kế hoạch hành động, ứng phó.","31":"Chủ đề 6: Đánh giá tác động của biến đổi khí hậu đối với tỉnh Cao Bằng. Kế hoạch hành động, ứng phó.","32":"Chủ đề 6: Đánh giá tác động của biến đổi khí hậu đối với tỉnh Cao Bằng. Kế hoạch hành động, ứng phó.","33":"Chủ đề 6: Đánh giá tác động của biến đổi khí hậu đối với tỉnh Cao Bằng. Kế hoạch hành động, ứng phó.","34":"Chủ đề 6: Đánh giá tác động của biến đổi khí hậu đối với tỉnh Cao Bằng. Kế hoạch hành động, ứng phó.","35":"Đánh giá cuối kì II"}},"electiveMap":{},"warnings":[],"gradeCounts":{"10":35,"11":35,"12":35},"electiveGradeCounts":{},"regularEntries":105,"electiveEntries":0,"entries":105,"warningCount":0,"modes":["duration"],"criticalWarningCount":0,"partial":false,"criticalWarnings":[]}};

const V4151_PPCT_ALIASES = {
  'van':'Ngữ văn','nguvan':'Ngữ văn',
  'su':'Lịch sử','lichsu':'Lịch sử',
  'toan':'Toán','toanhoc':'Toán',
  'anh':'Tiếng Anh','tienganh':'Tiếng Anh',
  'td':'GDTC','gdtc':'GDTC','giaoducthechat':'GDTC',
  'qpan':'GDQPAN','gdqpan':'GDQPAN','giaoducquocphongvaanninh':'GDQPAN',
  'dia':'Địa lí','diali':'Địa lí','dialy':'Địa lí',
  'gdktpl':'GDKTPL','giaoduckinhtevaphapluat':'GDKTPL',
  'ly':'Vật lí','vatli':'Vật lí','vatly':'Vật lí',
  'hoa':'Hóa học','hoahoc':'Hóa học',
  'sinh':'Sinh học','sinhhoc':'Sinh học',
  'cnghe':'Công nghệ','congnghe':'Công nghệ',
  'tin':'Tin học','tinhoc':'Tin học',
  'hdtn':'HĐTNHN','hdtnhn':'HĐTNHN','hoatdongtrainghiemhuongnghiep':'HĐTNHN',
  'gddp':'GDĐP','giaoducdiaphuong':'GDĐP'
};

function v4151PlainSubjectKey_(subject) {
  const raw = v4135SubjectTrackInfo_(normalizeText_(subject)).baseSubject || normalizeText_(subject);
  return keyText_(raw || '').replace(/[^a-z0-9]+/g,'');
}
function v4151CanonicalSubject_(subject) {
  const raw = v4135SubjectTrackInfo_(normalizeText_(subject)).baseSubject || normalizeText_(subject);
  const k = v4151PlainSubjectKey_(raw);
  return V4151_PPCT_ALIASES[k] || raw;
}
function v4151WarehouseSource_(subject) {
  const canonical = v4151CanonicalSubject_(subject);
  return V4151_PPCT_WAREHOUSE[canonical] || null;
}
function v4151ReadPersonalMap_() {
  try {
    const raw = PropertiesService.getScriptProperties().getProperty(V4151_PPCT_PERSONAL_MAP_PROPERTY) || '';
    const obj = raw ? JSON.parse(raw) : {};
    return obj && typeof obj === 'object' ? obj : {};
  } catch (e) { return {}; }
}
function v4151WritePersonalMap_(map) {
  PropertiesService.getScriptProperties().setProperty(V4151_PPCT_PERSONAL_MAP_PROPERTY, JSON.stringify(map || {}));
}
function v4151FindPersonalEntry_(map, subject) {
  const canonical = v4151CanonicalSubject_(subject);
  const target = v4151PlainSubjectKey_(canonical);
  const key = Object.keys(map || {}).find(k => v4151PlainSubjectKey_(k) === target);
  return key ? {key:key,url:normalizeText_(map[key])} : null;
}

// Từ V4.151, URL chỉ có nghĩa là nguồn CÁ NHÂN ghi đè. Nguồn trường không cần URL.
function getPpctSourceUrl_(subject) {
  const map = v4151ReadPersonalMap_();
  if (subject) {
    const hit = v4151FindPersonalEntry_(map, subject);
    return hit && hit.url ? hit.url : '';
  }
  const primary = getTeacherDirectoryInfo_(FIXED_TEACHER_KEY).subject || '';
  const hit = primary ? v4151FindPersonalEntry_(map, primary) : null;
  if (hit && hit.url) return hit.url;
  const first = Object.keys(map).find(k => normalizeText_(map[k]));
  return first ? normalizeText_(map[first]) : '';
}

function v4151WarehouseCurriculum_(subject) {
  const canonical = v4151CanonicalSubject_(subject);
  const src = v4151WarehouseSource_(canonical);
  if (!src) return null;
  return {
    map:src.map || {}, electiveMap:src.electiveMap || {},
    configured:true, entries:Number(src.entries||0),
    regularEntries:Number(src.regularEntries||0), electiveEntries:Number(src.electiveEntries||0),
    kind:'Kho PPCT chuẩn', title:'Nguồn chuẩn của trường · ' + canonical,
    error:'', subject:canonical,
    gradeCounts:src.gradeCounts || {}, electiveGradeCounts:src.electiveGradeCounts || {},
    format:src.format || 'Tích hợp sẵn từ Kế hoạch dạy học 2026–2027',
    warnings:src.warnings || [], warningCount:Number(src.warningCount||0), criticalWarnings:src.criticalWarnings||[], criticalWarningCount:Number(src.criticalWarningCount||0), partial:!!src.partial,
    sourceType:'school', isOverride:false, defaultAvailable:true,
    sourceFile:src.title || '', warehouseVersion:V4151_PPCT_WAREHOUSE_VERSION
  };
}

function loadPpctCurriculum_(subject) {
  const canonical = v4151CanonicalSubject_(subject);
  const overrideUrl = getPpctSourceUrl_(canonical);
  const id = extractDriveFileId_(overrideUrl);
  if (id) {
    const cache = CacheService.getScriptCache();
    const key = 'ppct_v4151_personal_' + v4151PlainSubjectKey_(canonical) + '_' + id;
    const cached = cache.get(key);
    if (cached) { try { return JSON.parse(cached); } catch (e) {} }
    try {
      const data = readPpctSourceById_(id);
      const res = {
        map:data.map || {}, electiveMap:data.electiveMap || {}, configured:true,
        entries:data.entries || 0, regularEntries:data.regularEntries || 0, electiveEntries:data.electiveEntries || 0,
        kind:data.kind || 'Nguồn cá nhân', title:data.title || ('Nguồn cá nhân · '+canonical), error:'',
        subject:canonical, gradeCounts:data.gradeCounts || {}, electiveGradeCounts:data.electiveGradeCounts || {},
        format:data.format || '', warnings:data.warnings || [], warningCount:data.warningCount || 0, criticalWarnings:[], criticalWarningCount:0, partial:false,
        sourceType:'personal', isOverride:true, defaultAvailable:!!v4151WarehouseSource_(canonical),
        url:overrideUrl, warehouseVersion:V4151_PPCT_WAREHOUSE_VERSION
      };
      try { cache.put(key, JSON.stringify(res), 600); } catch (_e) {}
      return res;
    } catch (e) {
      return {
        map:{}, electiveMap:{}, configured:true, entries:0, regularEntries:0, electiveEntries:0,
        kind:'Nguồn cá nhân', title:'Nguồn cá nhân · '+canonical, error:e.message || String(e), subject:canonical,
        gradeCounts:{}, electiveGradeCounts:{}, format:'', warnings:[], warningCount:0, criticalWarnings:[], criticalWarningCount:0, partial:false,
        sourceType:'personal', isOverride:true, defaultAvailable:!!v4151WarehouseSource_(canonical),
        url:overrideUrl, warehouseVersion:V4151_PPCT_WAREHOUSE_VERSION
      };
    }
  }
  const school = v4151WarehouseCurriculum_(canonical);
  if (school) return school;
  return {
    map:{}, electiveMap:{}, configured:false, entries:0, regularEntries:0, electiveEntries:0,
    kind:'', title:'Chưa có nguồn chuẩn cho '+canonical, error:'', subject:canonical,
    gradeCounts:{}, electiveGradeCounts:{}, format:'', warnings:[], warningCount:0, criticalWarnings:[], criticalWarningCount:0, partial:false,
    sourceType:'missing', isOverride:false, defaultAvailable:false, url:'', warehouseVersion:V4151_PPCT_WAREHOUSE_VERSION
  };
}

function getPpctSourceConfig(subject) {
  const raw = normalizeText_(subject) || getTeacherDirectoryInfo_(FIXED_TEACHER_KEY).subject || 'Toán';
  const canonical = v4151CanonicalSubject_(raw);
  const data = loadPpctCurriculum_(canonical);
  const overrideUrl = getPpctSourceUrl_(canonical);
  return {
    subject:canonical, url:overrideUrl, configured:!!data.configured,
    entries:data.entries || 0, regularEntries:data.regularEntries || 0, electiveEntries:data.electiveEntries || 0,
    kind:data.kind || '', title:data.title || '', error:data.error || '',
    gradeCounts:data.gradeCounts || {}, electiveGradeCounts:data.electiveGradeCounts || {}, format:data.format || '',
    warnings:data.warnings || [], warningCount:data.warningCount || 0, criticalWarnings:data.criticalWarnings||[], criticalWarningCount:data.criticalWarningCount||0, partial:!!data.partial,
    sourceType:data.sourceType || (overrideUrl?'personal':'school'),
    isOverride:!!data.isOverride, defaultAvailable:!!v4151WarehouseSource_(canonical),
    sourceFile:data.sourceFile || '', warehouseVersion:V4151_PPCT_WAREHOUSE_VERSION
  };
}

function v4127StoredSourceConfig_(subject) {
  const canonical = v4151CanonicalSubject_(subject);
  const school = v4151WarehouseSource_(canonical);
  const url = getPpctSourceUrl_(canonical);
  return {
    subject:canonical, url:url, configured:!!url || !!school,
    sourceType:url ? 'personal' : (school ? 'school' : 'missing'),
    defaultAvailable:!!school, isOverride:!!url,
    entries:school && !url ? Number(school.entries||0) : 0,
    kind:school && !url ? 'Kho PPCT chuẩn' : (url?'Nguồn cá nhân':''),
    title:school && !url ? ('Nguồn chuẩn của trường · '+canonical) : '',
    error:''
  };
}

function getPpctSourceConfigs(teacherKey, tkbSheetName) {
  // V4.154: không dùng Toán làm fallback khi giao diện chưa truyền xong giáo viên.
  // Nếu teacherKey rỗng, trả trạng thái pending để lần mở đầu không chớp sai môn.
  const requested = normalizeText_(teacherKey);
  if (!requested) {
    return {teacher:'', subjects:[], sources:[], pending:true, warehouseVersion:V4151_PPCT_WAREHOUSE_VERSION};
  }
  teacherKey = resolveTeacherKey_(requested);
  let subjects = [];
  try {
    subjects = readMathSchedule_(teacherKey, tkbSheetName)
      .map(r => v4151CanonicalSubject_(r.subject))
      .filter(Boolean);
  } catch (e) {}
  const directory = getTeacherDirectoryInfo_(teacherKey);
  if (!subjects.length && directory.subject) subjects.push(v4151CanonicalSubject_(directory.subject));
  subjects = subjects.filter((s,i,arr)=>arr.findIndex(x=>v4151PlainSubjectKey_(x)===v4151PlainSubjectKey_(s))===i);
  return {
    teacher:TEACHER_MAP[teacherKey] || teacherKey,
    subjects:subjects,
    sources:subjects.map(s=>getPpctSourceConfig(s)),
    pending:false,
    warehouseVersion:V4151_PPCT_WAREHOUSE_VERSION
  };
}

function savePpctSubjectSourceConfig(subject, url) {
  const canonical = v4151CanonicalSubject_(subject);
  if (!canonical) throw new Error('Chưa xác định môn cần lưu nguồn PPCT.');
  const clean = normalizeText_(url);
  const map = v4151ReadPersonalMap_();
  const old = v4151FindPersonalEntry_(map, canonical);
  if (old) delete map[old.key];

  // Xóa link = quay lại Kho PPCT chuẩn của trường.
  if (!clean) {
    v4151WritePersonalMap_(map);
    return getPpctSourceConfig(canonical);
  }

  const id = extractDriveFileId_(clean);
  if (!id) throw new Error('Link nguồn cá nhân không hợp lệ. Hãy dùng link Google Sheets hoặc Google Docs.');
  const test = readPpctSourceById_(id);
  if (!test.entries) {
    throw new Error('Đã mở được file nhưng Parser V2 chưa nhận diện được PPCT của môn '+canonical+'.');
  }
  map[canonical] = clean;
  v4151WritePersonalMap_(map);
  try { CacheService.getScriptCache().remove('ppct_v4151_personal_'+v4151PlainSubjectKey_(canonical)+'_'+id); } catch (_e) {}
  return getPpctSourceConfig(canonical);
}

// Tương thích nút nguồn đơn cũ.
function savePpctSourceConfig(url) {
  const primary = v4151CanonicalSubject_(getTeacherDirectoryInfo_(FIXED_TEACHER_KEY).subject || 'Toán');
  return savePpctSubjectSourceConfig(primary, url);
}

function v4137GetPpctSourceStatus(teacherKey, tkbSheetName) {
  const requested = normalizeText_(teacherKey);
  if (!requested) return {subjects:[],sources:[],missing:[],pending:true,warehouseVersion:V4151_PPCT_WAREHOUSE_VERSION};
  teacherKey = resolveTeacherKey_(requested);
  let subjects = [];
  try {
    subjects = readMathSchedule_(teacherKey, tkbSheetName).map(r=>v4151CanonicalSubject_(r.subject)).filter(Boolean);
  } catch (e) {}
  const directory = getTeacherDirectoryInfo_(teacherKey);
  if (!subjects.length && directory.subject) subjects.push(v4151CanonicalSubject_(directory.subject));
  subjects = subjects.filter((s,i,arr)=>arr.findIndex(x=>v4151PlainSubjectKey_(x)===v4151PlainSubjectKey_(s))===i);
  const sources=subjects.map(subject=>{
    const school=!!v4151WarehouseSource_(subject), personal=!!getPpctSourceUrl_(subject);
    return {subject:subject,configured:school||personal,sourceType:personal?'personal':(school?'school':'missing')};
  });
  return {subjects:subjects,sources:sources,missing:sources.filter(x=>!x.configured).map(x=>x.subject),pending:false,warehouseVersion:V4151_PPCT_WAREHOUSE_VERSION};
}


// ===== V4.142: HOÀN THIỆN CĂN GIỮA TIẾT TKB + TỔ TRƯỞNG BÁO GIẢNG =====


// V4.144 — API adapter cho giao diện Vercel.
// ============================================================================
// V4.152 — TIẾT PHÁT SINH TỰ ĐỒNG BỘ BÁO GIẢNG + PPCT
// - Lưu/Sửa/Xóa Tiết phát sinh => ghi ngay vào Lịch báo giảng của tuần.
// - Chỉ tính/ghi lại đúng Lớp + Môn + loại tiết bị ảnh hưởng; các lớp khác giữ nguyên.
// - Nếu Báo giảng tuần còn hoàn toàn trống và toàn bộ nguồn PPCT hợp lệ, tự ghi luôn cả tuần.
// - Khi xóa/di chuyển tiết phát sinh, ô cũ được xóa và PPCT các tiết phía sau tự lùi/tiến.
// - Cập nhật luôn số tiết Tiến độ; lỗi Tiến độ không làm mất phần Báo giảng đã đồng bộ.
// ============================================================================

function v4152ExtraPairKey_(x) {
  x = x || {};
  const info = v4135SubjectTrackInfo_(x.baseSubject || x.subject || '');
  return v4127PairKey_(x.className || '', info.baseSubject || '', x.track || info.track || 'regular');
}

function v4152PreviewPairKey_(r) {
  r = r || {};
  const info = v4135SubjectTrackInfo_(r.baseSubject || r.subject || '');
  return v4127PairKey_(r.className || '', info.baseSubject || '', r.track || info.track || 'regular');
}

function v4152ReportPairKey_(r) {
  r = r || {};
  const cls = normalizeText_(r.className).replace(/\s+/g, '');
  const subject = normalizeText_(r.subject);
  if (!cls || !subject) return '';
  const info = v4135SubjectTrackInfo_(subject);
  const ppctTrack = v4135TrackFromPpct_(r.ppct);
  const track = ppctTrack === 'elective' ? 'elective' : info.track;
  return v4127PairKey_(cls, info.baseSubject, track);
}

function v4152ReadReportRows_(sheet, blockStartZero) {
  const sections = findTeacherSectionRows_(sheet, blockStartZero);
  const startCol1 = blockStartZero + 1;
  const out = [];
  [['Sáng', sections.morning], ['Chiều', sections.afternoon]].forEach(pair => {
    const session = pair[0];
    const firstDataRow = pair[1] + 3;
    const vals = sheet.getRange(firstDataRow, startCol1, 30, 6).getDisplayValues();
    let currentDay = null;
    vals.forEach((row, i) => {
      const dayCell = normalizeText_(row[0]);
      if (dayCell) {
        const m = dayCell.match(/^([2-7])/);
        if (m) currentDay = Number(m[1]);
      }
      const period = Number(normalizeText_(row[1]));
      if (!currentDay || !period) return;
      out.push({
        row:firstDataRow + i,
        session:session,
        dayNum:currentDay,
        period:period,
        subject:normalizeText_(row[2]),
        className:normalizeText_(row[3]).replace(/\s+/g, ''),
        ppct:normalizeText_(row[4]),
        lesson:normalizeText_(row[5])
      });
    });
  });
  return out;
}

function v4152ReportHasData_(rows) {
  return (rows || []).some(r => normalizeText_(r.subject) || normalizeText_(r.className) || normalizeText_(r.ppct) || normalizeText_(r.lesson));
}

function v4152SnapshotReport_(sheet, blockStartZero) {
  const sections = findTeacherSectionRows_(sheet, blockStartZero);
  const startCol1 = blockStartZero + 1;
  return [sections.morning, sections.afternoon].map(titleRow => {
    const row = titleRow + 3;
    const col = startCol1 + 2;
    return {row:row, col:col, values:sheet.getRange(row, col, 30, 4).getValues()};
  });
}

function v4152RestoreReport_(sheet, snapshot) {
  (snapshot || []).forEach(s => sheet.getRange(s.row, s.col, s.values.length, s.values[0].length).setValues(s.values));
}

function v4152SyncExtraToBaoGiang_(payload, affectedPairKeys, reason) {
  payload = payload || {};
  if (!payload.teacherKey) throw new Error('Thiếu giáo viên để đồng bộ Tiết phát sinh.');
  const teacherKey = payload.teacherKey;
  const fullName = TEACHER_MAP[teacherKey];
  if (!fullName) throw new Error('Giáo viên không hợp lệ.');

  // Validate tuần/ngày và suy ra đúng sheet Báo giảng từ TKB đang chọn.
  const weekMeta = buildWeekMeta_(payload);
  const reportSheetName = getSelectedReportSheetName_(payload);
  const ss = SpreadsheetApp.openById(BAO_GIANG_SPREADSHEET_ID);
  const sh = ss.getSheetByName(reportSheetName);
  if (!sh) throw new Error('Không tìm thấy sheet Báo giảng: ' + reportSheetName);

  const blockStartZero = findTeacherBlockStart_(sh, fullName);
  const startCol1 = blockStartZero + 1;
  const reportRows = v4152ReadReportRows_(sh, blockStartZero);
  const reportWasBlank = !v4152ReportHasData_(reportRows);
  const slotByKey = {};
  reportRows.forEach(r => slotByKey[r.session + '|' + r.dayNum + '|' + r.period] = r);

  const allRecords = buildPreview_(teacherKey, payload.starts || {}, payload.monday || '', payload.tkbSheet);
  const affected = {};
  (affectedPairKeys || []).forEach(k => { if (normalizeText_(k)) affected[k] = true; });
  if (!Object.keys(affected).length) throw new Error('Không xác định được lớp/môn cần đồng bộ.');

  const affectedRecords = allRecords.filter(r => affected[v4152PreviewPairKey_(r)]);
  const affectedMissing = affectedRecords.filter(r => !normalizeText_(r.lesson) || r.lessonMissing);
  if (affectedMissing.length) {
    const r = affectedMissing[0];
    throw new Error(r.lessonMissingReason || ('Chưa có tên bài PPCT cho ' + r.className + ' · ' + r.subject + ' · ' + r.ppct + '.'));
  }

  // Nếu tuần đang trống, chỉ ghi toàn bộ tuần khi tất cả nguồn đều đầy đủ.
  const allMissing = allRecords.filter(r => !normalizeText_(r.lesson) || r.lessonMissing);
  const fullSync = reportWasBlank && allMissing.length === 0;
  const recordsToWrite = fullSync ? allRecords : affectedRecords;

  recordsToWrite.forEach(r => {
    if (!slotByKey[r.session + '|' + r.dayNum + '|' + r.period]) {
      throw new Error('Không tìm thấy ô Báo giảng cho ' + r.session + ' Thứ ' + r.dayNum + ' tiết ' + r.period + '.');
    }
  });

  const snapshot = v4152SnapshotReport_(sh, blockStartZero);
  let cleared = 0;
  let written = 0;
  try {
    updateReportMetadata_(sh, blockStartZero, payload);

    if (fullSync) {
      reportRows.forEach(r => {
        sh.getRange(r.row, startCol1 + 2, 1, 4).clearContent();
        cleared += 1;
      });
    } else {
      reportRows.forEach(r => {
        const pairKey = v4152ReportPairKey_(r);
        if (pairKey && affected[pairKey]) {
          sh.getRange(r.row, startCol1 + 2, 1, 4).clearContent();
          cleared += 1;
        }
      });
    }

    recordsToWrite.forEach(r => {
      const slot = slotByKey[r.session + '|' + r.dayNum + '|' + r.period];
      sh.getRange(slot.row, startCol1 + 2, 1, 4).setValues([[
        r.subject,
        r.className,
        r.ppct,
        r.lesson
      ]]);
      v4141FormatWrittenRow_(sh, blockStartZero, slot.row);
      written += 1;
    });
    SpreadsheetApp.flush();
  } catch (e) {
    try {
      v4152RestoreReport_(sh, snapshot);
      SpreadsheetApp.flush();
    } catch (restoreErr) {}
    throw e;
  }

  let progressDetails = [];
  let progressError = '';
  try {
    progressDetails = updateProgressReport_(payload, allRecords);
  } catch (e) {
    progressError = e && e.message ? e.message : String(e);
  }

  const affectedRows = allRecords.filter(r => affected[v4152PreviewPairKey_(r)]);
  const affectedClasses = Array.from(new Set(affectedRows.map(r => r.className))).sort();
  const affectedSubjects = Array.from(new Set(affectedRows.map(r => r.subject))).sort();
  return {
    ok:true,
    reason:reason || 'save',
    sheet:reportSheetName,
    reportWasBlank:reportWasBlank,
    fullSync:fullSync,
    partialInitial:reportWasBlank && !fullSync,
    written:written,
    cleared:cleared,
    affectedClasses:affectedClasses,
    affectedSubjects:affectedSubjects,
    weekInfo:{week:weekMeta.week,from:fmtDMY_(weekMeta.monday),to:fmtDMY_(weekMeta.saturday)},
    progress:{ok:!progressError,error:progressError,details:progressDetails}
  };
}

// Override cuối cùng: giữ đủ cờ Phát sinh để Lịch ngày/tuần hiển thị nhãn chính xác.
function readTeacherScheduleAll_(teacherKey, tkbSheetName) {
  return v4136ReadEffectiveSchedule_(teacherKey, tkbSheetName).map(x => ({
    dayNum:x.dayNum, session:x.session, period:x.period, className:x.className, subject:x.subject,
    isMakeup:!!x.isMakeup, makeupSource:x.makeupSource||'', originalDayNum:x.originalDayNum||null,
    originalSession:x.originalSession||'', originalPeriod:x.originalPeriod||null,
    isExtra:!!x.isExtra, extraId:x.extraId||'', extraNote:x.extraNote||''
  }));
}

// Override V4.150: lưu và đồng bộ là MỘT giao dịch người dùng.
function saveExtraLesson(payload, item) {
  payload = payload || {};
  const teacherKey = payload.teacherKey || FIXED_TEACHER_KEY;
  const tkbSheetName = getSelectedTkbSheetName_(payload.tkbSheet);
  const preview = v4150HypotheticalPreview_(payload, item);
  if (preview.lessonMissing || !normalizeText_(preview.lesson)) {
    throw new Error(preview.lessonMissingReason || ('Chưa có tên bài PPCT cho ' + preview.className + ' · ' + preview.baseSubject + '.'));
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Hệ thống đang xử lý một thay đổi khác. Anh thử lưu lại sau vài giây.');
  try {
    const props = PropertiesService.getScriptProperties();
    const key = v4150ExtraStorageKey_(teacherKey, tkbSheetName);
    const oldRaw = props.getProperty(key);
    const before = v4150LoadExtraLessons_(teacherKey, tkbSheetName);
    const oldItem = before.find(x => x.id === preview.id) || null;
    const arr = before.filter(x => x.id !== preview.id);
    arr.push(v4150NormalizeExtra_(preview, arr.length));
    v4150SortSchedule_(arr);

    const affected = {};
    if (oldItem) affected[v4152ExtraPairKey_(oldItem)] = true;
    affected[v4152ExtraPairKey_(preview)] = true;

    props.setProperty(key, JSON.stringify(arr));
    let sync;
    try {
      sync = v4152SyncExtraToBaoGiang_(payload, Object.keys(affected), oldItem ? 'edit' : 'save');
    } catch (e) {
      if (oldRaw == null) props.deleteProperty(key); else props.setProperty(key, oldRaw);
      throw new Error('Không thể hoàn tất Tiết phát sinh nên app đã hoàn tác thay đổi. ' + (e && e.message ? e.message : String(e)));
    }

    const result = getExtraLessonConfig(payload);
    result.sync = sync;
    result.message = oldItem ? 'Đã sửa Tiết phát sinh, cập nhật Lịch báo giảng và tính lại PPCT.' : 'Đã lưu Tiết phát sinh, cập nhật Lịch báo giảng và tính lại PPCT.';
    return result;
  } finally {
    lock.releaseLock();
  }
}

function deleteExtraLesson(payload, id) {
  payload = payload || {};
  const teacherKey = payload.teacherKey || FIXED_TEACHER_KEY;
  const tkbSheetName = getSelectedTkbSheetName_(payload.tkbSheet);
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Hệ thống đang xử lý một thay đổi khác. Anh thử xóa lại sau vài giây.');
  try {
    const props = PropertiesService.getScriptProperties();
    const key = v4150ExtraStorageKey_(teacherKey, tkbSheetName);
    const oldRaw = props.getProperty(key);
    const before = v4150LoadExtraLessons_(teacherKey, tkbSheetName);
    const targetId = normalizeText_(id);
    const removed = before.find(x => x.id === targetId);
    if (!removed) throw new Error('Không tìm thấy tiết phát sinh cần xóa.');
    const after = before.filter(x => x.id !== targetId);
    if (after.length) props.setProperty(key, JSON.stringify(after)); else props.deleteProperty(key);

    let sync;
    try {
      sync = v4152SyncExtraToBaoGiang_(payload, [v4152ExtraPairKey_(removed)], 'delete');
    } catch (e) {
      if (oldRaw == null) props.deleteProperty(key); else props.setProperty(key, oldRaw);
      throw new Error('Không thể xóa đồng bộ nên app đã hoàn tác. ' + (e && e.message ? e.message : String(e)));
    }

    const result = getExtraLessonConfig(payload);
    result.sync = sync;
    result.message = 'Đã xóa Tiết phát sinh, cập nhật Lịch báo giảng và tính lại PPCT.';
    return result;
  } finally {
    lock.releaseLock();
  }
}

function clearExtraLessons(payload) {
  payload = payload || {};
  const teacherKey = payload.teacherKey || FIXED_TEACHER_KEY;
  const tkbSheetName = getSelectedTkbSheetName_(payload.tkbSheet);
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Hệ thống đang xử lý một thay đổi khác. Anh thử lại sau vài giây.');
  try {
    const props = PropertiesService.getScriptProperties();
    const key = v4150ExtraStorageKey_(teacherKey, tkbSheetName);
    const oldRaw = props.getProperty(key);
    const before = v4150LoadExtraLessons_(teacherKey, tkbSheetName);
    const affected = Array.from(new Set(before.map(v4152ExtraPairKey_).filter(Boolean)));
    props.deleteProperty(key);
    if (!affected.length) return getExtraLessonConfig(payload);
    let sync;
    try {
      sync = v4152SyncExtraToBaoGiang_(payload, affected, 'clear');
    } catch (e) {
      if (oldRaw != null) props.setProperty(key, oldRaw);
      throw new Error('Không thể xóa đồng bộ nên app đã hoàn tác. ' + (e && e.message ? e.message : String(e)));
    }
    const result = getExtraLessonConfig(payload);
    result.sync = sync;
    result.message = 'Đã xóa toàn bộ Tiết phát sinh và tính lại Lịch báo giảng/PPCT.';
    return result;
  } finally {
    lock.releaseLock();
  }
}


// ============================================================================
// V4.153 — HOÁN ĐỔI TIẾT 2 ĐẦU
// - Một giao dịch gồm TIẾT NHẬN + TIẾT NHƯỜNG.
// - Tiết nhường chỉ bị loại khỏi lịch thực tế, KHÔNG sửa TKB gốc.
// - Tiết nhận được chèn vào đúng ngày/buổi/tiết và gắn cờ Hoán đổi.
// - Có thể dùng một Tiết phát sinh đã có làm "tiết nhận"; khi đó Tiết phát sinh
//   được chuyển vào giao dịch Hoán đổi. Nếu Hủy hoán đổi, tiết phát sinh gốc
//   được khôi phục đúng trạng thái trước khi ghép.
// - Lưu/Hủy => tự đồng bộ Lịch báo giảng + tính lại PPCT + Tiến độ.
// ============================================================================
const V4153_SWAP_PREFIX = 'V4153_SWAP_';

function v4153SwapStorageKey_(teacherKey, tkbSheetName) {
  const token = extractWeekToken_(tkbSheetName) || normalizeText_(tkbSheetName) || 'week';
  const t = v4127SubjectKey_(teacherKey || FIXED_TEACHER_KEY);
  const w = keyText_(token).replace(/[^a-z0-9]+/g, '_');
  return V4153_SWAP_PREFIX + t + '_' + w;
}

function v4153SlotKey_(x) {
  x = x || {};
  return Number(x.dayNum) + '|' + (normalizeText_(x.session) === 'Chiều' ? 'Chiều' : 'Sáng') + '|' + Number(x.period);
}

function v4153NormalizeSlot_(raw, role) {
  raw = raw || {};
  const dayNum = Number(raw.dayNum);
  const session = normalizeText_(raw.session) === 'Chiều' ? 'Chiều' : 'Sáng';
  const period = Math.floor(Number(raw.period));
  if (!Number.isFinite(dayNum) || dayNum < 2 || dayNum > 7) throw new Error((role || 'Tiết') + ' phải nằm từ Thứ 2 đến Thứ 7.');
  const maxPeriod = role === 'Tiết nhường' ? 5 : (session === 'Chiều' ? 3 : 5);
  if (!Number.isFinite(period) || period < 1 || period > maxPeriod) throw new Error((role || 'Tiết') + ' không có Tiết ' + period + ' hợp lệ ở buổi ' + session.toLowerCase() + '.');
  return {dayNum:dayNum, dayLabel:'Thứ ' + dayNum, session:session, period:period};
}

function v4153NormalizeReceive_(raw) {
  raw = raw || {};
  const slot = v4153NormalizeSlot_(raw, 'Tiết nhận');
  const className = normalizeText_(raw.className).replace(/\s+/g, '');
  const track = normalizeText_(raw.track).toLowerCase() === 'elective' ? 'elective' : 'regular';
  const info = v4135SubjectTrackInfo_(normalizeText_(raw.baseSubject || raw.subject));
  const baseSubject = info.baseSubject;
  if (!v4146ClassGrade_(className)) throw new Error('Lớp của Tiết nhận không hợp lệ.');
  if (!baseSubject) throw new Error('Chưa chọn môn cho Tiết nhận.');
  return Object.assign({}, slot, {
    className:className,
    baseSubject:baseSubject,
    subject:track === 'elective' ? (baseSubject + ' CĐ') : baseSubject,
    track:track
  });
}

function v4153NormalizeSwap_(raw, idx) {
  raw = raw || {};
  const give = Object.assign(v4153NormalizeSlot_(raw.give || {}, 'Tiết nhường'), {
    className:normalizeText_((raw.give || {}).className).replace(/\s+/g, ''),
    subject:normalizeText_((raw.give || {}).subject),
    baseSubject:normalizeText_((raw.give || {}).baseSubject),
    track:normalizeText_((raw.give || {}).track) === 'elective' ? 'elective' : 'regular'
  });
  const receive = v4153NormalizeReceive_(raw.receive || {});
  if (v4153SlotKey_(give) === v4153SlotKey_(receive)) throw new Error('Tiết nhận và Tiết nhường không được trùng cùng một ô thời khóa biểu.');
  const originExtra = raw.originExtra ? v4150NormalizeExtra_(raw.originExtra, 0) : null;
  return {
    id:normalizeText_(raw.id) || ('swap_' + Utilities.getUuid()),
    give:give,
    receive:receive,
    otherTeacher:normalizeText_(raw.otherTeacher).slice(0, 120),
    note:normalizeText_(raw.note).slice(0, 300),
    receiveOrigin:normalizeText_(raw.receiveOrigin) === 'existing_extra' ? 'existing_extra' : 'new',
    sourceExtraId:normalizeText_(raw.sourceExtraId),
    restoreExtraOnCancel:!!raw.restoreExtraOnCancel,
    originExtra:originExtra,
    createdAt:normalizeText_(raw.createdAt) || new Date().toISOString()
  };
}

function v4153LoadSwaps_(teacherKey, tkbSheetName) {
  try {
    const raw = PropertiesService.getScriptProperties().getProperty(v4153SwapStorageKey_(teacherKey, tkbSheetName)) || '';
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.map((x,i) => v4153NormalizeSwap_(x,i));
  } catch (e) { return []; }
}

function v4153BaseBeforeSwaps_(teacherKey, tkbSheetName) {
  const base = readMathSchedule_(teacherKey, tkbSheetName);
  return v4136ApplyMakeupRules_(base, v4136LoadMakeupRules_(teacherKey, tkbSheetName), true);
}

function v4153ApplySwaps_(schedule, swaps, strict) {
  const original = (schedule || []).map(r => Object.assign({}, r));
  const normalized = (swaps || []).map((x,i) => v4153NormalizeSwap_(x,i));
  const giveSeen = {}, receiveSeen = {};

  normalized.forEach(sw => {
    const gk = v4153SlotKey_(sw.give);
    if (giveSeen[gk]) throw new Error('Một tiết đang bị nhường trong nhiều giao dịch Hoán đổi.');
    giveSeen[gk] = sw.id;
    const found = original.find(r => v4153SlotKey_(r) === gk);
    if (!found && strict) throw new Error('Không còn tiết để nhường ở ' + sw.give.session + ' Thứ ' + sw.give.dayNum + ' · Tiết ' + sw.give.period + '.');
  });

  let out = original.filter(r => !giveSeen[v4153SlotKey_(r)]).map(r => Object.assign({}, r));
  normalized.forEach(sw => {
    const rk = v4153SlotKey_(sw.receive);
    if (receiveSeen[rk]) throw new Error('Hai giao dịch Hoán đổi đang nhận vào cùng một tiết.');
    receiveSeen[rk] = sw.id;
    const conflict = out.find(r => v4153SlotKey_(r) === rk);
    if (conflict) {
      if (strict) throw new Error('Tiết nhận ' + sw.receive.session + ' Thứ ' + sw.receive.dayNum + ' · Tiết ' + sw.receive.period + ' đang có ' + conflict.className + '. Hãy chọn tiết trống hoặc chọn đúng tiết đã được nhường ở giao dịch khác.');
      return;
    }
    out.push({
      dayNum:sw.receive.dayNum, dayLabel:'Thứ ' + sw.receive.dayNum, dateLabel:'',
      session:sw.receive.session, period:sw.receive.period,
      className:sw.receive.className, subject:sw.receive.subject,
      isSwap:true, swapId:sw.id, swapOtherTeacher:sw.otherTeacher || '', swapNote:sw.note || '',
      swapGiveDayNum:sw.give.dayNum, swapGiveSession:sw.give.session, swapGivePeriod:sw.give.period,
      swapReceiveOrigin:sw.receiveOrigin || 'new'
    });
  });
  return v4150SortSchedule_(out);
}

// V4.153: TKB thực tế = TKB gốc -> Dạy bù -> Hoán đổi -> Tiết phát sinh.
function v4150BaseAdjustedSchedule_(teacherKey, tkbSheetName) {
  return v4153ApplySwaps_(v4153BaseBeforeSwaps_(teacherKey, tkbSheetName), v4153LoadSwaps_(teacherKey, tkbSheetName), true);
}

function v4136ReadEffectiveSchedule_(teacherKey, tkbSheetName) {
  const swapped = v4150BaseAdjustedSchedule_(teacherKey, tkbSheetName);
  return v4150ApplyExtraLessons_(swapped, v4150LoadExtraLessons_(teacherKey, tkbSheetName), true);
}

function v4150HasExtraPlan_(teacherKey, tkbSheetName) {
  try { return v4150LoadExtraLessons_(teacherKey, tkbSheetName).length > 0 || v4153LoadSwaps_(teacherKey, tkbSheetName).length > 0; }
  catch (e) { return false; }
}

function readTeacherScheduleAll_(teacherKey, tkbSheetName) {
  return v4136ReadEffectiveSchedule_(teacherKey, tkbSheetName).map(x => ({
    dayNum:x.dayNum, session:x.session, period:x.period, className:x.className, subject:x.subject,
    isMakeup:!!x.isMakeup, makeupSource:x.makeupSource||'', originalDayNum:x.originalDayNum||null,
    originalSession:x.originalSession||'', originalPeriod:x.originalPeriod||null,
    isExtra:!!x.isExtra, extraId:x.extraId||'', extraNote:x.extraNote||'',
    isSwap:!!x.isSwap, swapId:x.swapId||'', swapOtherTeacher:x.swapOtherTeacher||'', swapNote:x.swapNote||'',
    swapGiveDayNum:x.swapGiveDayNum||null, swapGiveSession:x.swapGiveSession||'', swapGivePeriod:x.swapGivePeriod||null
  }));
}

// Override dashboard để giữ cờ Hoán đổi/Phát sinh khi hiển thị Lịch ngày/Cả tuần.
function readTkbDashboardForDate_(teacherKey, targetDate, tkbSheetName, starts) {
  const jsDay = targetDate.getDay();
  const dayNum = jsDay === 0 ? 8 : jsDay + 1;
  const sessions = {Sáng:[], Chiều:[]};
  if (dayNum < 2 || dayNum > 7) return {sessions:sessions, sheetName:''};
  const sheetName = tkbSheetForDate_(targetDate, tkbSheetName);
  if (!sheetName) return {sessions:sessions, sheetName:''};
  const schedule = readTeacherScheduleAll_(teacherKey, sheetName).slice().sort((a,b) =>
    (a.dayNum-b.dayNum) || ((a.session==='Sáng'?0:1)-(b.session==='Sáng'?0:1)) ||
    (a.period-b.period) || String(a.className).localeCompare(String(b.className)) || String(a.subject).localeCompare(String(b.subject))
  );
  const counters = {}, curriculums = {}, times = dashboardTimes_();
  schedule.forEach(rec => {
    const info = v4135SubjectTrackInfo_(rec.subject);
    const subject = info.displaySubject, baseSubject = info.baseSubject, track = info.track;
    const pairKey = v4127PairKey_(rec.className, subject, track);
    if (counters[pairKey] == null) {
      let raw = starts && starts[pairKey] != null ? starts[pairKey] : null;
      if (raw == null && track === 'regular' && starts && starts[rec.className] != null) raw = starts[rec.className];
      const custom = Number(raw);
      counters[pairKey] = isFinite(custom) && custom > 0 ? custom : 1;
    } else counters[pairKey] += 1;
    if (rec.dayNum !== dayNum || !sessions[rec.session]) return;
    const grade = v4146ClassGrade_(rec.className);
    const sk = v4127SubjectKey_(baseSubject);
    if (!curriculums[sk]) curriculums[sk] = loadPpctCurriculum_(baseSubject);
    const ppctNum = counters[pairKey];
    sessions[rec.session].push({
      session:rec.session, period:rec.period, className:rec.className,
      ppct:v4135PpctLabel_(ppctNum, track), ppctNumber:ppctNum,
      subject:subject, baseSubject:baseSubject, track:track, isElective:track === 'elective',
      lesson:lessonFor_(grade, ppctNum, curriculums[sk], baseSubject, track) || 'Chưa có tên bài từ Nguồn PPCT',
      isExtra:!!rec.isExtra, extraId:rec.extraId||'', note:rec.extraNote||'',
      isSwap:!!rec.isSwap, swapId:rec.swapId||'', swapOtherTeacher:rec.swapOtherTeacher||'', swapNote:rec.swapNote||'',
      time:(times[rec.session] && times[rec.session][Number(rec.period)]) || ''
    });
  });
  return {sessions:sessions, sheetName:sheetName};
}

function v4153PairKeyFromLesson_(x) {
  x = x || {};
  const info = v4135SubjectTrackInfo_(x.baseSubject || x.subject || '');
  return v4127PairKey_(x.className || '', info.baseSubject || '', x.track || info.track || 'regular');
}

function v4153GiveOptions_(teacherKey, tkbSheetName, swaps) {
  const base = v4153BaseBeforeSwaps_(teacherKey, tkbSheetName);
  const used = {};
  (swaps || []).forEach(sw => used[v4153SlotKey_(sw.give)] = true);
  return base.filter(r => !used[v4153SlotKey_(r)]).map(r => {
    const info = v4135SubjectTrackInfo_(r.subject);
    return {
      key:v4153SlotKey_(r), dayNum:Number(r.dayNum), session:r.session, period:Number(r.period),
      className:r.className, subject:info.displaySubject, baseSubject:info.baseSubject, track:info.track,
      label:'Thứ ' + r.dayNum + ' · ' + r.session + ' · Tiết ' + r.period + ' · ' + r.className + ' · ' + info.displaySubject
    };
  }).sort((a,b) => (a.dayNum-b.dayNum) || ((a.session==='Sáng'?0:1)-(b.session==='Sáng'?0:1)) || (a.period-b.period));
}

function v4153Candidate_(payload, item) {
  payload = payload || {}; item = item || {};
  const teacherKey = payload.teacherKey || FIXED_TEACHER_KEY;
  const tkbSheetName = getSelectedTkbSheetName_(payload.tkbSheet);
  const swaps = v4153LoadSwaps_(teacherKey, tkbSheetName);
  const currentOthers = swaps.filter(x => x.id !== normalizeText_(item.id));
  const extras = v4150LoadExtraLessons_(teacherKey, tkbSheetName);
  const existingExtraId = normalizeText_(item.existingExtraId);
  let receiveRaw = item.receive || {};
  let originExtra = null;
  let receiveOrigin = 'new';
  let restoreExtraOnCancel = false;
  let sourceExtraId = '';
  let finalExtras = extras.slice();

  if (existingExtraId) {
    originExtra = extras.find(x => x.id === existingExtraId) || null;
    if (!originExtra) throw new Error('Không tìm thấy Tiết phát sinh đã chọn. Có thể tiết này vừa được sửa/xóa ở nơi khác.');
    receiveRaw = originExtra;
    receiveOrigin = 'existing_extra';
    restoreExtraOnCancel = true;
    sourceExtraId = originExtra.id;
    finalExtras = extras.filter(x => x.id !== existingExtraId);
  }

  const giveSlot = v4153NormalizeSlot_(item.give || {}, 'Tiết nhường');
  const base = v4153BaseBeforeSwaps_(teacherKey, tkbSheetName);
  const alreadyGiven = currentOthers.some(sw => v4153SlotKey_(sw.give) === v4153SlotKey_(giveSlot));
  if (alreadyGiven) throw new Error('Tiết nhường này đã thuộc một giao dịch Hoán đổi khác.');
  const giveRow = base.find(r => v4153SlotKey_(r) === v4153SlotKey_(giveSlot));
  if (!giveRow) throw new Error('Không tìm thấy tiết đang dạy để nhường ở vị trí đã chọn.');
  const giveInfo = v4135SubjectTrackInfo_(giveRow.subject);
  const give = Object.assign({}, giveSlot, {
    className:giveRow.className, subject:giveInfo.displaySubject, baseSubject:giveInfo.baseSubject, track:giveInfo.track
  });

  const candidate = v4153NormalizeSwap_({
    id:normalizeText_(item.id) || ('swap_' + Utilities.getUuid()),
    give:give,
    receive:receiveRaw,
    otherTeacher:item.otherTeacher || '', note:item.note || '',
    receiveOrigin:receiveOrigin, sourceExtraId:sourceExtraId,
    restoreExtraOnCancel:restoreExtraOnCancel, originExtra:originExtra,
    createdAt:item.createdAt || ''
  }, currentOthers.length);

  const giveDayOff = (typeof v4155LoadDayOffs_ === 'function' ? v4155LoadDayOffs_() : []).find(h => v4155DayOffMatchesRecord_(h, give, tkbSheetName));
  if (giveDayOff) throw new Error('Tiết nhường đang thuộc ngày nghỉ: '+giveDayOff.reason+'.');
  const receiveDayOff = (typeof v4155LoadDayOffs_ === 'function' ? v4155LoadDayOffs_() : []).find(h => v4155DayOffMatchesRecord_(h, candidate.receive, tkbSheetName));
  if (receiveDayOff) throw new Error('Tiết nhận đang thuộc ngày nghỉ: '+receiveDayOff.reason+'.');

  if (receiveOrigin === 'new') {
    const allowedClasses = Array.from(new Set(base.map(r => normalizeText_(r.className).replace(/\s+/g,'')))).filter(Boolean);
    if (allowedClasses.indexOf(candidate.receive.className) < 0) throw new Error('Lớp ' + candidate.receive.className + ' chưa thuộc lịch dạy của giáo viên trong tuần này.');
    const allowedSubjects = [];
    base.forEach(r => { const b = v4135SubjectTrackInfo_(r.subject).baseSubject; if (b && allowedSubjects.findIndex(x => v4127SubjectKey_(x) === v4127SubjectKey_(b)) < 0) allowedSubjects.push(b); });
    const dir = getTeacherDirectoryInfo_(teacherKey);
    String((dir && dir.subject) || '').split(/[;,/]+/).map(normalizeText_).filter(Boolean).forEach(b => { if (allowedSubjects.findIndex(x => v4127SubjectKey_(x) === v4127SubjectKey_(b)) < 0) allowedSubjects.push(b); });
    if (allowedSubjects.length && allowedSubjects.findIndex(x => v4127SubjectKey_(x) === v4127SubjectKey_(candidate.receive.baseSubject)) < 0) throw new Error('Môn ' + candidate.receive.baseSubject + ' chưa thuộc giáo viên trong tuần này.');
  }

  const finalSwaps = currentOthers.concat([candidate]);
  let finalSchedule = v4153ApplySwaps_(base, finalSwaps, true);
  finalSchedule = v4150ApplyExtraLessons_(finalSchedule, finalExtras, true);
  const previewRows = v4150BuildPreviewFromSchedule_(finalSchedule, teacherKey, payload.starts || {}, payload.monday || '');
  const receiveRow = previewRows.find(r => r.isSwap && r.swapId === candidate.id);
  if (!receiveRow) throw new Error('Không tính được PPCT cho Tiết nhận.');

  const affected = {};
  affected[v4153PairKeyFromLesson_(give)] = true;
  affected[v4152PreviewPairKey_(receiveRow)] = true;
  const affectedRows = previewRows.filter(r => affected[v4152PreviewPairKey_(r)]);
  const missing = affectedRows.filter(r => !normalizeText_(r.lesson) || r.lessonMissing);
  if (missing.length) {
    const r = missing[0];
    throw new Error(r.lessonMissingReason || ('Chưa có tên bài PPCT cho ' + r.className + ' · ' + r.subject + ' · ' + r.ppct + '.'));
  }
  return {
    teacherKey:teacherKey, tkbSheetName:tkbSheetName,
    candidate:candidate, finalExtras:finalExtras, finalSwaps:finalSwaps,
    givePreview:give,
    receivePreview:Object.assign({}, candidate.receive, {
      ppct:receiveRow.ppct, ppctNumber:receiveRow.ppctNumber, lesson:receiveRow.lesson || '', dateLabel:receiveRow.dateLabel || ''
    }),
    affectedPairKeys:Object.keys(affected)
  };
}

function previewSwapLesson(payload, item) {
  const p = v4153Candidate_(payload, item);
  return {ok:true, item:Object.assign({}, p.candidate, {givePreview:p.givePreview, receivePreview:p.receivePreview, affectedPairKeys:p.affectedPairKeys})};
}

function getSwapLessonConfig(payload) {
  payload = payload || {};
  const teacherKey = payload.teacherKey || FIXED_TEACHER_KEY;
  const tkbSheetName = getSelectedTkbSheetName_(payload.tkbSheet);
  const swaps = v4153LoadSwaps_(teacherKey, tkbSheetName);
  const extras = v4150LoadExtraLessons_(teacherKey, tkbSheetName);
  const meta = v4150CandidateMeta_(teacherKey, tkbSheetName);
  const preview = v4150BuildPreviewFromSchedule_(v4136ReadEffectiveSchedule_(teacherKey, tkbSheetName), teacherKey, payload.starts || {}, payload.monday || '');
  const receiveById = {};
  preview.filter(r => r.isSwap).forEach(r => receiveById[r.swapId] = r);
  const items = swaps.map(sw => {
    const r = receiveById[sw.id] || {};
    return Object.assign({}, sw, {receivePreview:Object.assign({}, sw.receive, {ppct:r.ppct||'',ppctNumber:r.ppctNumber||null,lesson:r.lesson||'',dateLabel:r.dateLabel||''})});
  });
  return {
    ok:true, teacher:TEACHER_MAP[teacherKey] || teacherKey, tkbSheet:tkbSheetName,
    weekToken:extractWeekToken_(tkbSheetName),
    classOptions:meta.classes || [], subjectOptions:meta.subjects || [],
    giveOptions:v4153GiveOptions_(teacherKey, tkbSheetName, swaps),
    extraOptions:extras.map(x => ({id:x.id,dayNum:x.dayNum,session:x.session,period:x.period,className:x.className,subject:x.subject,baseSubject:x.baseSubject,track:x.track,note:x.note||'',label:'Thứ '+x.dayNum+' · '+x.session+' · Tiết '+x.period+' · '+x.className+' · '+x.subject})),
    items:items, count:items.length
  };
}

function saveSwapLesson(payload, item) {
  payload = payload || {};
  const teacherKey = payload.teacherKey || FIXED_TEACHER_KEY;
  const tkbSheetName = getSelectedTkbSheetName_(payload.tkbSheet);
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Hệ thống đang xử lý một thay đổi khác. Anh thử lưu Hoán đổi lại sau vài giây.');
  try {
    const props = PropertiesService.getScriptProperties();
    const swapKey = v4153SwapStorageKey_(teacherKey, tkbSheetName);
    const extraKey = v4150ExtraStorageKey_(teacherKey, tkbSheetName);
    const oldSwapRaw = props.getProperty(swapKey);
    const oldExtraRaw = props.getProperty(extraKey);
    const prepared = v4153Candidate_(payload, item);

    if (prepared.finalSwaps.length) props.setProperty(swapKey, JSON.stringify(prepared.finalSwaps)); else props.deleteProperty(swapKey);
    if (prepared.finalExtras.length) props.setProperty(extraKey, JSON.stringify(prepared.finalExtras)); else props.deleteProperty(extraKey);

    let sync;
    try {
      sync = v4152SyncExtraToBaoGiang_(payload, prepared.affectedPairKeys, 'swap_save');
    } catch (e) {
      if (oldSwapRaw == null) props.deleteProperty(swapKey); else props.setProperty(swapKey, oldSwapRaw);
      if (oldExtraRaw == null) props.deleteProperty(extraKey); else props.setProperty(extraKey, oldExtraRaw);
      throw new Error('Không thể hoàn tất Hoán đổi nên app đã hoàn tác cả Tiết nhận và Tiết nhường. ' + (e && e.message ? e.message : String(e)));
    }
    const result = getSwapLessonConfig(payload);
    result.sync = sync;
    result.message = prepared.candidate.receiveOrigin === 'existing_extra'
      ? 'Đã ghép Tiết phát sinh vào Hoán đổi, nhường tiết đã chọn và tự tính lại Báo giảng/PPCT.'
      : 'Đã lưu Hoán đổi, cập nhật Lịch báo giảng và tính lại PPCT.';
    return result;
  } finally { lock.releaseLock(); }
}

function deleteSwapLesson(payload, id) {
  payload = payload || {};
  const teacherKey = payload.teacherKey || FIXED_TEACHER_KEY;
  const tkbSheetName = getSelectedTkbSheetName_(payload.tkbSheet);
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Hệ thống đang xử lý một thay đổi khác. Anh thử Hủy hoán đổi lại sau vài giây.');
  try {
    const props = PropertiesService.getScriptProperties();
    const swapKey = v4153SwapStorageKey_(teacherKey, tkbSheetName);
    const extraKey = v4150ExtraStorageKey_(teacherKey, tkbSheetName);
    const oldSwapRaw = props.getProperty(swapKey);
    const oldExtraRaw = props.getProperty(extraKey);
    const before = v4153LoadSwaps_(teacherKey, tkbSheetName);
    const targetId = normalizeText_(id);
    const removed = before.find(x => x.id === targetId);
    if (!removed) throw new Error('Không tìm thấy Hoán đổi cần hủy.');
    const after = before.filter(x => x.id !== targetId);
    let extras = v4150LoadExtraLessons_(teacherKey, tkbSheetName);
    if (removed.restoreExtraOnCancel && removed.originExtra) {
      const restored = v4150NormalizeExtra_(removed.originExtra, extras.length);
      if (!extras.some(x => x.id === restored.id)) extras.push(restored);
      v4150SortSchedule_(extras);
    }
    if (after.length) props.setProperty(swapKey, JSON.stringify(after)); else props.deleteProperty(swapKey);
    if (extras.length) props.setProperty(extraKey, JSON.stringify(extras)); else props.deleteProperty(extraKey);

    const affected = [v4153PairKeyFromLesson_(removed.give), v4153PairKeyFromLesson_(removed.receive)].filter(Boolean);
    let sync;
    try {
      // Validate trạng thái khôi phục trước khi ghi Báo giảng.
      v4136ReadEffectiveSchedule_(teacherKey, tkbSheetName);
      sync = v4152SyncExtraToBaoGiang_(payload, Array.from(new Set(affected)), 'swap_delete');
    } catch (e) {
      if (oldSwapRaw == null) props.deleteProperty(swapKey); else props.setProperty(swapKey, oldSwapRaw);
      if (oldExtraRaw == null) props.deleteProperty(extraKey); else props.setProperty(extraKey, oldExtraRaw);
      throw new Error('Không thể Hủy hoán đổi nên app đã hoàn tác. ' + (e && e.message ? e.message : String(e)));
    }
    const result = getSwapLessonConfig(payload);
    result.sync = sync;
    result.restoredExtra = !!(removed.restoreExtraOnCancel && removed.originExtra);
    result.message = result.restoredExtra
      ? 'Đã hủy Hoán đổi; tiết nhường được phục hồi và Tiết phát sinh ban đầu cũng được khôi phục.'
      : 'Đã hủy Hoán đổi; tiết nhường được phục hồi, tiết nhận được gỡ và PPCT đã tính lại.';
    return result;
  } finally { lock.releaseLock(); }
}


// ============================================================================
// V4.155 — NGÀY NGHỈ + LỊCH NGÀY BÁM 100% LỊCH BÁO GIẢNG
// - Ngày nghỉ được lưu dùng chung toàn trường, không sửa TKB gốc.
// - TKB vẫn là lịch dự kiến; Ngày nghỉ chỉ loại tiết khỏi lịch thực tế.
// - PPCT/tiến độ được tính từ lịch thực tế sau khi loại ngày nghỉ.
// - Lịch ngày/Cả tuần chỉ đọc Lịch báo giảng; không còn TKB dự phòng.
// - Mỗi giáo viên tự đồng bộ ngày nghỉ của tuần khi mở/chọn TKB; tránh quét 33 GV
//   trong một lần và tránh timeout Apps Script.
// ============================================================================
const V4155_DAY_OFF_PROPERTY = 'DAY_OFFS_V4155';
const V4155_DAY_OFF_SYNC_PREFIX = 'DAYOFF_SYNC_V4155_';
const V4155_DAY_OFF_NOTE_PREFIX = '💤 Nghỉ';

function v4155DateYmd_(value) {
  const s = normalizeText_(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new Error('Ngày nghỉ không hợp lệ.');
  const d = parseYmd_(s);
  const out = Utilities.formatDate(d, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');
  if (out !== s) throw new Error('Ngày nghỉ không hợp lệ.');
  return s;
}

function v4155NormalizeDayOff_(raw, idx) {
  raw = raw || {};
  const date = v4155DateYmd_(raw.date || raw.dateYmd || '');
  let scope = normalizeText_(raw.scope || 'school').toLowerCase();
  if (['school','morning','afternoon','class'].indexOf(scope) < 0) scope = 'school';
  const className = scope === 'class' ? normalizeText_(raw.className).replace(/\s+/g, '') : '';
  if (scope === 'class' && !v4146ClassGrade_(className)) throw new Error('Hãy chọn lớp áp dụng ngày nghỉ.');
  const reason = normalizeText_(raw.reason) || 'Nghỉ theo kế hoạch nhà trường';
  return {
    id: normalizeText_(raw.id) || ('dayoff_' + Utilities.getUuid()),
    date: date,
    scope: scope,
    className: className,
    reason: reason,
    createdAt: normalizeText_(raw.createdAt) || new Date().toISOString(),
    updatedAt: normalizeText_(raw.updatedAt) || new Date().toISOString(),
    order: Number(idx || 0)
  };
}

function v4155LoadDayOffs_() {
  try {
    const raw = PropertiesService.getScriptProperties().getProperty(V4155_DAY_OFF_PROPERTY) || '';
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.map((x,i) => v4155NormalizeDayOff_(x,i)).sort((a,b) => a.date.localeCompare(b.date) || a.scope.localeCompare(b.scope) || a.className.localeCompare(b.className));
  } catch (e) { return []; }
}

function v4155WriteDayOffs_(items) {
  const clean = (items || []).map((x,i) => v4155NormalizeDayOff_(x,i)).sort((a,b) => a.date.localeCompare(b.date) || a.scope.localeCompare(b.scope) || a.className.localeCompare(b.className));
  const props = PropertiesService.getScriptProperties();
  if (clean.length) props.setProperty(V4155_DAY_OFF_PROPERTY, JSON.stringify(clean));
  else props.deleteProperty(V4155_DAY_OFF_PROPERTY);
  return clean;
}

function v4155ScopeLabel_(x) {
  if (!x) return '';
  if (x.scope === 'morning') return 'Buổi sáng';
  if (x.scope === 'afternoon') return 'Buổi chiều';
  if (x.scope === 'class') return 'Lớp ' + x.className;
  return 'Cả trường';
}

function v4155DayNumForDate_(dateYmd, tkbSheetName) {
  const token = extractWeekToken_(tkbSheetName);
  const mondayYmd = token ? inferMondayFromWeekToken_(token) : '';
  if (!mondayYmd) return null;
  const monday = parseYmd_(mondayYmd);
  const target = parseYmd_(dateYmd);
  const diff = Math.round((dateOnly_(target).getTime() - dateOnly_(monday).getTime()) / 86400000);
  const dayNum = diff + 2;
  return dayNum >= 2 && dayNum <= 7 ? dayNum : null;
}

function v4155DayOffMatchesRecord_(holiday, rec, tkbSheetName) {
  if (!holiday || !rec) return false;
  const dayNum = v4155DayNumForDate_(holiday.date, tkbSheetName);
  if (!dayNum || Number(rec.dayNum) !== dayNum) return false;
  if (holiday.scope === 'morning') return rec.session === 'Sáng';
  if (holiday.scope === 'afternoon') return rec.session === 'Chiều';
  if (holiday.scope === 'class') return normalizeText_(rec.className).replace(/\s+/g,'') === holiday.className;
  return true;
}

function v4155ScheduleBeforeDayOff_(teacherKey, tkbSheetName) {
  const swapped = v4150BaseAdjustedSchedule_(teacherKey, tkbSheetName);
  return v4150ApplyExtraLessons_(swapped, v4150LoadExtraLessons_(teacherKey, tkbSheetName), true);
}

function v4155FilterDayOff_(schedule, tkbSheetName) {
  const holidays = v4155LoadDayOffs_();
  if (!holidays.length) return (schedule || []).map(x => Object.assign({}, x));
  return (schedule || []).filter(rec => !holidays.some(h => v4155DayOffMatchesRecord_(h, rec, tkbSheetName))).map(x => Object.assign({}, x));
}

// Ghi đè lịch thực tế: TKB -> Dạy bù -> Hoán đổi -> Phát sinh -> Ngày nghỉ.
function v4136ReadEffectiveSchedule_(teacherKey, tkbSheetName) {
  return v4155FilterDayOff_(v4155ScheduleBeforeDayOff_(teacherKey, tkbSheetName), tkbSheetName);
}

function v4155WeekTkbForDate_(targetDate) {
  const target = dateOnly_(targetDate);
  const rows = listTkbWeekSheets_().filter(x => {
    const mondayYmd = inferMondayFromWeekToken_(x.token);
    if (!mondayYmd) return false;
    const monday = parseYmd_(mondayYmd), saturday = addDays_(monday, 5);
    return target >= dateOnly_(monday) && target <= dateOnly_(saturday);
  });
  if (!rows.length) return '';
  return (rows.find(x => !/\(GV\)/i.test(x.name)) || rows[0]).name;
}

function v4155ClassOptionsForTkb_(tkbSheetName) {
  try {
    const ss = SpreadsheetApp.openById(TKB_SPREADSHEET_ID);
    const sh = ss.getSheetByName(getSelectedTkbSheetName_(tkbSheetName));
    const vals = sh.getRange(1, 4, 1, Math.min(Math.max(sh.getLastColumn()-3,1),60)).getDisplayValues()[0];
    return vals.map(x => normalizeText_(String(x||'').split('\n')[0]).replace(/\s+/g,''))
      .filter(x => !!v4146ClassGrade_(x)).filter((x,i,a) => a.indexOf(x) === i).sort();
  } catch (e) { return []; }
}

function v4155DayOffsInWeek_(tkbSheetName) {
  const token = extractWeekToken_(tkbSheetName);
  const mondayYmd = token ? inferMondayFromWeekToken_(token) : '';
  if (!mondayYmd) return [];
  const monday = parseYmd_(mondayYmd), saturday = addDays_(monday,5);
  return v4155LoadDayOffs_().filter(h => {
    const d = parseYmd_(h.date);
    return dateOnly_(d) >= dateOnly_(monday) && dateOnly_(d) <= dateOnly_(saturday);
  });
}

function v4155DayOffSignature_(teacherKey, tkbSheetName) {
  const rows = v4155DayOffsInWeek_(tkbSheetName).map(h => [h.id,h.date,h.scope,h.className,h.reason,h.updatedAt].join('|'));
  return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, teacherKey+'||'+tkbSheetName+'||'+rows.join(';;'))).slice(0,32);
}

function v4155SyncKey_(teacherKey, tkbSheetName) {
  const token = extractWeekToken_(tkbSheetName) || normalizeText_(tkbSheetName) || 'week';
  return V4155_DAY_OFF_SYNC_PREFIX + teacherSlug_(teacherKey) + '_' + token.replace(/[^0-9a-z.-]/gi,'_');
}

function v4155AffectedPairKeys_(teacherKey, tkbSheetName, holidays) {
  const before = v4155ScheduleBeforeDayOff_(teacherKey, tkbSheetName);
  const affected = {};
  (holidays || []).forEach(h => before.filter(r => v4155DayOffMatchesRecord_(h,r,tkbSheetName)).forEach(r => affected[v4152ExtraPairKey_(r)] = true));
  return Object.keys(affected).filter(Boolean);
}

function v4155ClearDayOffNotesForTeacherWeek_(payload) {
  const teacher = TEACHER_MAP[payload.teacherKey];
  if (!teacher) return 0;
  const ss = SpreadsheetApp.openById(BAO_GIANG_SPREADSHEET_ID);
  const sh = ss.getSheetByName(getSelectedReportSheetName_(payload));
  if (!sh) return 0;
  const blockStartZero = findTeacherBlockStart_(sh, teacher);
  const sections = findTeacherSectionRows_(sh, blockStartZero);
  const noteCol = blockStartZero + 1 + 6;
  let count = 0;
  [sections.morning, sections.afternoon].forEach(titleRow => {
    const firstDataRow = titleRow + 3;
    const rg = sh.getRange(firstDataRow, noteCol, 30, 1);
    const vals = rg.getDisplayValues();
    vals.forEach((r,i) => { if (normalizeText_(r[0]).indexOf(V4155_DAY_OFF_NOTE_PREFIX) === 0) { rg.getCell(i+1,1).clearContent(); count++; } });
  });
  return count;
}

function v4155ApplyDayOffMarksToReport_(payload) {
  payload = payload || {};
  const teacherKey = payload.teacherKey;
  const teacher = TEACHER_MAP[teacherKey];
  if (!teacher) return {marked:0};
  const tkbSheetName = getSelectedTkbSheetName_(payload.tkbSheet);
  const holidays = v4155DayOffsInWeek_(tkbSheetName);
  const ss = SpreadsheetApp.openById(BAO_GIANG_SPREADSHEET_ID);
  const sh = ss.getSheetByName(getSelectedReportSheetName_(payload));
  if (!sh) return {marked:0};
  const blockStartZero = findTeacherBlockStart_(sh, teacher);
  const startCol1 = blockStartZero + 1;
  const reportRows = v4152ReadReportRows_(sh, blockStartZero);
  const slotMap = {};
  reportRows.forEach(r => slotMap[r.session+'|'+r.dayNum+'|'+r.period] = r);
  v4155ClearDayOffNotesForTeacherWeek_(payload);
  if (!holidays.length) return {marked:0};

  const before = v4155ScheduleBeforeDayOff_(teacherKey, tkbSheetName);
  let marked = 0;
  holidays.forEach(h => {
    before.filter(r => v4155DayOffMatchesRecord_(h,r,tkbSheetName)).forEach(rec => {
      const slot = slotMap[rec.session+'|'+rec.dayNum+'|'+rec.period];
      if (!slot) return;
      const dataRg = sh.getRange(slot.row, startCol1 + 2, 1, 4);
      const current = dataRg.getDisplayValues()[0];
      const currentClass = normalizeText_(current[1]).replace(/\s+/g,'');
      if (!currentClass || currentClass === normalizeText_(rec.className).replace(/\s+/g,'')) dataRg.clearContent();
      sh.getRange(slot.row, startCol1 + 6).setValue(V4155_DAY_OFF_NOTE_PREFIX + ' · ' + h.reason);
      marked++;
    });
  });
  return {marked:marked};
}

function v4155BuildSyncPayload_(teacherKey, tkbSheetName) {
  const token = extractWeekToken_(tkbSheetName);
  const report = token ? findReportSheetForToken_(token) : null;
  if (!report) throw new Error('Chưa có sheet Báo giảng cùng tuần với TKB.');
  const ordered = orderedWeekSheets_();
  const idx = ordered.findIndex(x => x.name === report.name);
  const week = idx >= 0 ? idx + 1 : 1;
  const suggestions = getClassPpctSuggestions(teacherKey, report.name, tkbSheetName);
  const starts = {};
  (suggestions.classes || []).forEach(x => { starts[x.key] = Number(x.suggestedStart || 1); if (x.track === 'regular' && starts[x.className] == null) starts[x.className] = Number(x.suggestedStart || 1); });
  return {teacherKey:teacherKey, tkbSheet:tkbSheetName, reportSheet:report.name, monday:report.monday || inferMondayFromWeekToken_(token), week:week, starts:starts};
}

function v4155StaleMarkedPairKeys_(teacherKey, tkbSheetName, syncPayload) {
  try {
    const teacher = TEACHER_MAP[teacherKey];
    if (!teacher) return [];
    const ss = SpreadsheetApp.openById(BAO_GIANG_SPREADSHEET_ID);
    const sh = ss.getSheetByName(getSelectedReportSheetName_(syncPayload));
    if (!sh) return [];
    const blockStartZero = findTeacherBlockStart_(sh, teacher);
    const startCol1 = blockStartZero + 1;
    const sections = findTeacherSectionRows_(sh, blockStartZero);
    const markedSlots = {};
    [['Sáng',sections.morning],['Chiều',sections.afternoon]].forEach(pair => {
      const firstDataRow = pair[1] + 3;
      const vals = sh.getRange(firstDataRow, startCol1, 30, 7).getDisplayValues();
      let currentDay = null;
      vals.forEach((row,i) => {
        const dm = normalizeText_(row[0]).match(/^([2-7])/); if (dm) currentDay = Number(dm[1]);
        const period = Number(normalizeText_(row[1]));
        const note = normalizeText_(row[6]);
        if (currentDay && period && note.indexOf(V4155_DAY_OFF_NOTE_PREFIX) === 0) markedSlots[pair[0]+'|'+currentDay+'|'+period] = true;
      });
    });
    if (!Object.keys(markedSlots).length) return [];
    const currentHolidays = v4155DayOffsInWeek_(tkbSheetName);
    const before = v4155ScheduleBeforeDayOff_(teacherKey, tkbSheetName);
    const affected = {};
    before.forEach(rec => {
      const slot = rec.session+'|'+rec.dayNum+'|'+rec.period;
      if (!markedSlots[slot]) return;
      const stillOff = currentHolidays.some(h => v4155DayOffMatchesRecord_(h,rec,tkbSheetName));
      if (!stillOff) affected[v4152ExtraPairKey_(rec)] = true;
    });
    return Object.keys(affected).filter(Boolean);
  } catch (e) { return []; }
}

function v4155EnsureDayOffSync(payload) {
  payload = payload || {};
  if (!payload.teacherKey) throw new Error('Thiếu giáo viên.');
  const tkbSheetName = getSelectedTkbSheetName_(payload.tkbSheet);
  const holidays = v4155DayOffsInWeek_(tkbSheetName);
  const sig = v4155DayOffSignature_(payload.teacherKey, tkbSheetName);
  const props = PropertiesService.getScriptProperties();
  const key = v4155SyncKey_(payload.teacherKey, tkbSheetName);
  if (props.getProperty(key) === sig) return {ok:true,changed:false,count:holidays.length,message:'Ngày nghỉ đã đồng bộ.'};

  const syncPayload = v4155BuildSyncPayload_(payload.teacherKey, tkbSheetName);
  const currentAffected = v4155AffectedPairKeys_(payload.teacherKey, tkbSheetName, holidays);
  const staleAffected = v4155StaleMarkedPairKeys_(payload.teacherKey, tkbSheetName, syncPayload);
  const affected = Array.from(new Set(currentAffected.concat(staleAffected)));
  let sync = null, warning = '';
  if (affected.length) {
    try { sync = v4152SyncExtraToBaoGiang_(syncPayload, affected, 'day_off_sync'); }
    catch (e) { warning = e && e.message ? e.message : String(e); }
  }
  try { v4155ApplyDayOffMarksToReport_(syncPayload); } catch (e) { if (!warning) warning = e && e.message ? e.message : String(e); }
  if (!warning) props.setProperty(key, sig);
  return {ok:!warning,changed:true,count:holidays.length,affectedPairs:affected.length,sync:sync,warning:warning,message:warning?('Ngày nghỉ đã lưu nhưng đồng bộ Báo giảng còn cảnh báo: '+warning):'Đã đồng bộ ngày nghỉ vào Lịch báo giảng và tính lại PPCT.'};
}

function getDayOffConfig(payload) {
  payload = payload || {};
  const tkbSheetName = normalizeText_(payload.tkbSheet);
  const items = v4155LoadDayOffs_().map(x => Object.assign({},x,{scopeLabel:v4155ScopeLabel_(x)}));
  const weekItems = tkbSheetName ? v4155DayOffsInWeek_(tkbSheetName).map(x => Object.assign({},x,{scopeLabel:v4155ScopeLabel_(x)})) : [];
  return {ok:true,items:items,weekItems:weekItems,classOptions:tkbSheetName?v4155ClassOptionsForTkb_(tkbSheetName):[],count:items.length,weekCount:weekItems.length};
}

function saveDayOff(payload, item) {
  payload = payload || {};
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Hệ thống đang xử lý thay đổi khác. Anh thử lưu Ngày nghỉ lại sau vài giây.');
  try {
    const items = v4155LoadDayOffs_();
    const clean = v4155NormalizeDayOff_(item, items.length);
    const idx = items.findIndex(x => x.id === clean.id);
    if (idx >= 0) items[idx] = clean; else items.push(clean);
    // Không cho trùng cùng ngày + cùng phạm vi + cùng lớp.
    const dup = items.filter(x => x.id !== clean.id && x.date === clean.date && x.scope === clean.scope && x.className === clean.className);
    if (dup.length) throw new Error('Ngày nghỉ này đã được khai báo cho cùng phạm vi.');
    v4155WriteDayOffs_(items);
    let sync = null;
    try { if (payload.teacherKey && payload.tkbSheet) sync = v4155EnsureDayOffSync(payload); } catch (e) { sync = {ok:false,warning:e&&e.message?e.message:String(e)}; }
    const result = getDayOffConfig(payload);
    result.saved = clean; result.sync = sync;
    result.message = 'Đã lưu Ngày nghỉ dùng chung toàn trường. Lịch thực tế sẽ không tính PPCT cho các tiết thuộc phạm vi nghỉ.';
    return result;
  } finally { lock.releaseLock(); }
}

function deleteDayOff(payload, id) {
  payload = payload || {};
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Hệ thống đang xử lý thay đổi khác. Anh thử xóa Ngày nghỉ lại sau vài giây.');
  try {
    const items = v4155LoadDayOffs_();
    const removed = items.find(x => x.id === id);
    if (!removed) throw new Error('Không tìm thấy Ngày nghỉ cần xóa.');
    v4155WriteDayOffs_(items.filter(x => x.id !== id));
    // Khi xóa, cặp lớp/môn bị ảnh hưởng phải được khôi phục và đánh lại PPCT.
    let sync = null;
    try {
      if (payload.teacherKey && payload.tkbSheet) {
        const syncPayload = v4155BuildSyncPayload_(payload.teacherKey, payload.tkbSheet);
        const affected = v4155AffectedPairKeys_(payload.teacherKey, payload.tkbSheet, [removed]);
        if (affected.length) sync = v4152SyncExtraToBaoGiang_(syncPayload, affected, 'day_off_delete');
        v4155ApplyDayOffMarksToReport_(syncPayload);
        PropertiesService.getScriptProperties().setProperty(v4155SyncKey_(payload.teacherKey,payload.tkbSheet), v4155DayOffSignature_(payload.teacherKey,payload.tkbSheet));
      }
    } catch (e) { sync = {ok:false,warning:e&&e.message?e.message:String(e)}; }
    const result = getDayOffConfig(payload);
    result.removed = removed; result.sync = sync;
    result.message = 'Đã xóa Ngày nghỉ; tiết dạy và PPCT của giáo viên đang mở đã được khôi phục/tính lại.';
    return result;
  } finally { lock.releaseLock(); }
}

function v4155ApplicableDayOffsForTeacher_(teacherKey, targetDate, tkbSheetName) {
  const ymd = Utilities.formatDate(targetDate,'Asia/Ho_Chi_Minh','yyyy-MM-dd');
  const all = v4155LoadDayOffs_().filter(h => h.date === ymd);
  if (!all.length) return [];
  const sheetName = tkbSheetName || v4155WeekTkbForDate_(targetDate);
  if (!sheetName) return all.filter(h => h.scope !== 'class');
  const before = v4155ScheduleBeforeDayOff_(teacherKey, sheetName);
  return all.filter(h => h.scope !== 'class' || before.some(r => v4155DayOffMatchesRecord_(h,r,sheetName)));
}

function v4155CleanReportSessions_(sessions) {
  const out = {Sáng:[],Chiều:[]};
  ['Sáng','Chiều'].forEach(k => {
    out[k] = ((sessions && sessions[k]) || []).filter(r => {
      const marker = normalizeText_(r && r.note).indexOf(V4155_DAY_OFF_NOTE_PREFIX) === 0;
      const teaching = normalizeText_(r && r.className) || normalizeText_(r && r.subject) || normalizeText_(r && r.ppct) || normalizeText_(r && r.lesson);
      return !(marker && !teaching);
    });
  });
  return out;
}

// Lịch ngày: chỉ đọc Lịch báo giảng. Ngày nghỉ được gắn như metadata để giao diện hiển thị rõ.
function getDayDashboard(payload, offsetDays) {
  if (!payload || !payload.teacherKey) throw new Error('Thiếu giáo viên.');
  const offset = Number(offsetDays || 0);
  const targetDate = addDays_(new Date(), isFinite(offset) ? offset : 0);
  const report = readBaoGiangDashboardForDate_(payload.teacherKey, targetDate);
  report.sessions = v4155CleanReportSessions_(report.sessions);
  const dayOffs = v4155ApplicableDayOffsForTeacher_(payload.teacherKey, targetDate, tkbSheetForDate_(targetDate,payload.tkbSheet));
  const total = dashboardTotal_(report.sessions);
  const fullSchool = dayOffs.some(h => h.scope === 'school');
  return {
    outsideWeek:false,
    source:fullSchool && total===0 ? 'day_off' : (report.foundSheet ? (total>0?'bao_giang':'bao_giang_empty') : 'none'),
    sourceLabel:fullSchool && total===0 ? 'Ngày nghỉ' : (report.foundSheet?'Lịch báo giảng':''),
    sheetName:report.sheetName||'',
    targetYmd:Utilities.formatDate(targetDate,'Asia/Ho_Chi_Minh','yyyy-MM-dd'),
    sessions:report.sessions||{Sáng:[],Chiều:[]},
    dayOffs:dayOffs.map(h=>Object.assign({},h,{scopeLabel:v4155ScopeLabel_(h)}))
  };
}

function getTodayDashboard(payload) { return getDayDashboard(payload, 0); }
function getTomorrowDashboard(payload) { return getDayDashboard(payload, 1); }

function getWeekDashboard(payload) {
  if (!payload || !payload.teacherKey) throw new Error('Thiếu giáo viên.');
  let monday = parseYmd_(payload.monday);
  if (!monday) { const now=new Date(), jsDay=now.getDay(), diff=jsDay===0?-6:1-jsDay; monday=addDays_(now,diff); }
  const names=['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'];
  const days=[];
  for (let i=0;i<6;i++) {
    const targetDate=addDays_(monday,i);
    const report=readBaoGiangDashboardForDate_(payload.teacherKey,targetDate);
    report.sessions=v4155CleanReportSessions_(report.sessions);
    const dayOffs=v4155ApplicableDayOffsForTeacher_(payload.teacherKey,targetDate,tkbSheetForDate_(targetDate,payload.tkbSheet));
    const total=dashboardTotal_(report.sessions), fullSchool=dayOffs.some(h=>h.scope==='school');
    days.push({dayNum:i+2,label:names[i],targetYmd:Utilities.formatDate(targetDate,'Asia/Ho_Chi_Minh','yyyy-MM-dd'),
      source:fullSchool&&total===0?'day_off':(report.foundSheet?(total>0?'bao_giang':'bao_giang_empty'):'none'),
      sourceLabel:fullSchool&&total===0?'Ngày nghỉ':(report.foundSheet?'Lịch báo giảng':''),sheetName:report.sheetName||'',
      sessions:report.sessions||{Sáng:[],Chiều:[]},dayOffs:dayOffs.map(h=>Object.assign({},h,{scopeLabel:v4155ScopeLabel_(h)}))});
  }
  return {mondayYmd:Utilities.formatDate(monday,'Asia/Ho_Chi_Minh','yyyy-MM-dd'),saturdayYmd:Utilities.formatDate(addDays_(monday,5),'Asia/Ho_Chi_Minh','yyyy-MM-dd'),hasExtraPlan:false,days:days};
}

// Ghi Báo giảng vẫn một nút/two-step ở UI: ghi Lịch báo giảng trước, sau đó mới tính Tiến độ.
function ghiBaoGiangStep1(payload) {
  const check = preflightBaoGiang(payload);
  const undoToken = createUndoSnapshot_(payload, check);
  const ss = SpreadsheetApp.openById(BAO_GIANG_SPREADSHEET_ID);
  const sh = ss.getSheetByName(check.sheet);
  if (!sh) throw new Error('Không tìm thấy sheet báo giảng: ' + check.sheet);
  const blockStartZero = findTeacherBlockStart_(sh, check.teacher);
  const metaResult = updateReportMetadata_(sh, blockStartZero, payload);
  const writtenDetails = [];
  check.targets.forEach(t => {
    sh.getRange(t.range).setValues([[t.subject,t.className,t.ppct,t.lesson]]);
    v4141FormatWrittenRow_(sh, blockStartZero, t.row);
    writtenDetails.push({range:t.range,dayLabel:t.dayLabel,period:t.period,className:t.className,ppct:t.ppct,lesson:t.lesson});
  });
  v4155ApplyDayOffMarksToReport_(payload);
  SpreadsheetApp.flush();
  try { PropertiesService.getScriptProperties().setProperty(v4155SyncKey_(payload.teacherKey,payload.tkbSheet),v4155DayOffSignature_(payload.teacherKey,payload.tkbSheet)); } catch(e) {}
  return {ok:true,undoToken:undoToken,teacher:check.teacher,written:writtenDetails.length,skipped:check.skipped,details:writtenDetails,sheet:check.sheet,reportUrl:check.reportUrl,weekInfo:metaResult};
}

function ghiBaoGiang(payload) {
  const report = ghiBaoGiangStep1(payload);
  const progress = capNhatTienDoStep2(payload);
  report.progress = progress;
  return report;
}


const VERCEL_API_ACTIONS = {
  'getInitialData': getInitialData,
  'getPpctSourceConfig': getPpctSourceConfig,
  'savePpctSourceConfig': savePpctSourceConfig,
  'previewPpctRebalance': previewPpctRebalance,
  'applyPpctRebalance': applyPpctRebalance,
  'undoPpctRebalance': undoPpctRebalance,
  'getClassPpctSuggestions': getClassPpctSuggestions,
  'previewBaoGiang': previewBaoGiang,
  'prepareBaoGiangForOpen': prepareBaoGiangForOpen,
  'getTkbClassCheck': getTkbClassCheck,
  'previewWeeklyPlan': previewWeeklyPlan,
  'writeWeeklyPlan': writeWeeklyPlan,
  'preflightBaoGiang': preflightBaoGiang,
  'ghiBaoGiang': ghiBaoGiang,
  'checkExistingWrite': checkExistingWrite,
  'undoLastWrite': undoLastWrite,
  'ghiBaoGiangStep1': ghiBaoGiangStep1,
  'capNhatTienDoStep2': capNhatTienDoStep2,
  'getPrintableBaoGiang': getPrintableBaoGiang,
  'kiemTraTienDoDaCapNhat': kiemTraTienDoDaCapNhat,
  'getDayDashboard': getDayDashboard,
  'getTodayDashboard': getTodayDashboard,
  'getTomorrowDashboard': getTomorrowDashboard,
  'getWeekDashboard': getWeekDashboard,
  'getPpctSourceConfigs': getPpctSourceConfigs,
  'getPpctAuthorizationInfo': getPpctAuthorizationInfo,
  'savePpctSubjectSourceConfig': savePpctSubjectSourceConfig,
  'getMakeupScheduleConfig': getMakeupScheduleConfig,
  'saveMakeupScheduleConfig': saveMakeupScheduleConfig,
  'clearMakeupScheduleConfig': clearMakeupScheduleConfig,
  'getExtraLessonConfig': getExtraLessonConfig,
  'previewExtraLesson': previewExtraLesson,
  'saveExtraLesson': saveExtraLesson,
  'deleteExtraLesson': deleteExtraLesson,
  'clearExtraLessons': clearExtraLessons,
  'getSwapLessonConfig': getSwapLessonConfig,
  'previewSwapLesson': previewSwapLesson,
  'saveSwapLesson': saveSwapLesson,
  'deleteSwapLesson': deleteSwapLesson,
  'getDayOffConfig': getDayOffConfig,
  'saveDayOff': saveDayOff,
  'deleteDayOff': deleteDayOff,
  'v4155EnsureDayOffSync': v4155EnsureDayOffSync,
  'v4137GetPpctSourceStatus': v4137GetPpctSourceStatus
};
function apiOutput_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
function doPost(e) {
  try {
    const raw=e&&e.postData&&e.postData.contents?e.postData.contents:'{}';
    const body=JSON.parse(raw||'{}');
    const expected=PropertiesService.getScriptProperties().getProperty('VERCEL_API_TOKEN')||'';
    if(expected&&String(body.token||'')!==expected) throw new Error('Không có quyền gọi API Báo giảng.');
    const action=String(body.action||'').trim();
    const fn=VERCEL_API_ACTIONS[action];
    if(!fn) throw new Error('Chức năng API không hợp lệ: '+action);
    const args=Array.isArray(body.args)?body.args:[];
    return apiOutput_({ok:true,result:fn.apply(null,args)});
  }catch(err){
    return apiOutput_({ok:false,error:{message:String(err&&err.message?err.message:err),stack:String(err&&err.stack?err.stack:'')}});
  }
}
function setVercelApiToken(token) {
  PropertiesService.getScriptProperties().setProperty('VERCEL_API_TOKEN',String(token||'').trim());
  return {ok:true,configured:!!String(token||'').trim()};
}
