
const TKB_SPREADSHEET_ID = '1i0-iNIQeETSy__VGcNUmsD0Rj23XV-GaMF4FkNwgu58';

const BAO_GIANG_SPREADSHEET_ID = '1PUckZOOB3SyRp3P-zWuYxvtVRgxYBXGiz-2Prt6hBNU';
const TIEN_DO_SPREADSHEET_ID = '1VCBn0YroVlXDkkwxO7rl4yOM9i-pcehxyWSZ_BuleWE';
const LICH_TUAN_SPREADSHEET_ID = '1Hzq7mouds8EiREs1VBg6a9ciTTVNe3x0dnpjvujr7Kc';
const LICH_TUAN_TEMPLATE_SHEETS = ['Goc', 'Mau'];
const DEFAULT_BAO_GIANG_SHEET_NAME = '17-22.8';

// V4.122: Thêm lịch Hôm nay / Ngày mai / Cả tuần; Cả tuần bám theo tuần Báo giảng đang chọn.
// V4.121: Lịch báo giảng là nguồn tiến độ thực tế. Sau khi người dùng xóa/sửa tiết,
// V4.135 — TKB tự nhận tiết CĐ; PPCT chính khóa và CĐ chạy độc lập; Google Docs đọc cả Chuyên đề lựa chọn.
// chức năng Cập nhật PPCT sẽ dồn lại PPCT theo từng lớp và ghi ngược vào chính Báo giảng.
// Nguồn PPCT là cấu hình ít dùng, chỉ để tra tên bài theo số PPCT.
// Hỗ trợ Google Sheets hoặc Google Docs (bảng có cột PPCT + Tên bài/Nội dung + Khối/Lớp).
const PPCT_SOURCE_DEFAULT = '';
const PPCT_SOURCE_PROPERTY = 'PPCT_SOURCE_URL';

// V4.143 — Một bộ mã dùng chung cho nhiều giáo viên. Mỗi giáo viên mở bằng ?gv=<slug>.
const FIXED_TEACHER_KEY = 'T.Tuấn'; // fallback khi link không có/không hợp lệ
const TEACHER_PROFILES = {
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
  'Lê Thị Lan Phương': {org:'KHXH', team:'KHXH', subject:'Ngữ văn'},
  'Nguyễn Thế Phong': {org:'KHTN', team:'KHTN', subject:'Toán'},
  'Hà Thị Thu Oanh': {org:'KHTN', team:'KHTN', subject:'Toán'},
  'Lưu Công Tuấn': {org:'KHTN', team:'KHTN', subject:'Vật lí'},
  'Hoàng Thị Lan': {org:'KHTN', team:'KHTN', subject:'Toán'},
  'Đàm Thị Diệp': {org:'KHXH', team:'KHXH', subject:'Ngữ văn'},
  'Triệu Thị Đàn': {org:'KHXH', team:'KHXH', subject:'Tiếng Anh'},
  'Nguyễn Thị Ngọc Liễu': {org:'QLHS', team:'', subject:'GDTC'},
  'Hoàng Khánh Diệp': {org:'KHXH', team:'KHXH', subject:'Ngữ văn'},
  'Hoàng Thị Ngọc Hà': {org:'KHXH', team:'KHXH', subject:'GDKTPL'},
  'Nông Thị Thu Bằng': {org:'KHXH', team:'KHXH', subject:'Ngữ văn'},
  'Lương Thị Thanh Thủy': {org:'KHXH', team:'KHXH', subject:'Địa lí'},
  'Trần Thị Vân Anh': {org:'KHXH', team:'KHXH', subject:'Ngữ văn'},
  'Hà Thị Phương Dung': {org:'KHXH', team:'KHXH', subject:'Tiếng Anh'},
  'Nguyễn Hồng Quyên': {org:'KHTN', team:'KHTN', subject:'Sinh học'},
  'Ma Thị Anh': {org:'QLHS', team:'', subject:'Tin học'},
  'Nông Thị Huệ': {org:'KHTN', team:'KHTN', subject:'Sinh học'},
  'Nông Thị Bích Ngọc': {org:'Văn phòng', team:'', subject:'Vật lí'},
  'Nông Hồng Lanh': {org:'Văn phòng', team:'', subject:'Tin học'},
  'Trương Thị Mỹ Ngọc': {org:'KHTN', team:'KHTN', subject:'Vật lí'},
  'Vi Thị Diệp': {org:'KHTN', team:'KHTN', subject:'Toán'},
  'Nguyễn Thanh Tuấn': {org:'KHTN', team:'KHTN', subject:'Toán'},
  'Nông Trung Hiếu': {org:'QLHS', team:'', subject:'GDQPAN'},
  'Trần Chiến Thắng': {org:'QLHS', team:'', subject:'GDTC'},
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
  return {name:name,org:info.org||'',team:team,subject:info.subject||'',leader:TEAM_LEADERS[team]||''};
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

  // 1) Nguồn chính: Lịch báo giảng đã ghi.
  const report = readBaoGiangDashboardForDate_(payload.teacherKey, targetDate);
  if (dashboardTotal_(report.sessions) > 0) {
    return {
      outsideWeek:false,
      source:'bao_giang',
      sourceLabel:'Lịch báo giảng',
      sheetName:report.sheetName,
      targetYmd:Utilities.formatDate(targetDate,'Asia/Ho_Chi_Minh','yyyy-MM-dd'),
      sessions:report.sessions
    };
  }

  // 2) Dự phòng: TKB của đúng tuần/ngày, chỉ khi Báo giảng chưa có dữ liệu.
  const tkb = readTkbDashboardForDate_(payload.teacherKey, targetDate, payload.tkbSheet, payload.starts || {});
  if (dashboardTotal_(tkb.sessions) > 0) {
    return {
      outsideWeek:false,
      source:'tkb_fallback',
      sourceLabel:'TKB dự phòng',
      sheetName:tkb.sheetName,
      targetYmd:Utilities.formatDate(targetDate,'Asia/Ho_Chi_Minh','yyyy-MM-dd'),
      sessions:tkb.sessions
    };
  }

  return {
    outsideWeek:false,
    source:report.foundSheet ? 'bao_giang_empty' : 'none',
    sourceLabel:report.foundSheet ? 'Lịch báo giảng' : '',
    sheetName:report.sheetName || tkb.sheetName || '',
    targetYmd:Utilities.formatDate(targetDate,'Asia/Ho_Chi_Minh','yyyy-MM-dd'),
    sessions:{Sáng:[],Chiều:[]}
  };
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
    const now = new Date();
    const jsDay = now.getDay();
    const diff = jsDay === 0 ? -6 : 1 - jsDay;
    monday = addDays_(now, diff);
  }
  const names = ['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'];
  const days = [];
  for (let i = 0; i < 6; i++) {
    const targetDate = addDays_(monday, i);
    const report = readBaoGiangDashboardForDate_(payload.teacherKey, targetDate);
    let sessions = report.sessions;
    let source = dashboardTotal_(sessions) > 0 ? 'bao_giang' : (report.foundSheet ? 'bao_giang_empty' : 'none');
    let sourceLabel = report.foundSheet ? 'Lịch báo giảng' : '';
    let sheetName = report.sheetName || '';

    // Chỉ dùng TKB dự phòng cho riêng ngày chưa có dữ liệu Báo giảng.
    if (dashboardTotal_(sessions) === 0) {
      const tkb = readTkbDashboardForDate_(payload.teacherKey, targetDate, payload.tkbSheet, payload.starts || {});
      if (dashboardTotal_(tkb.sessions) > 0) {
        sessions = tkb.sessions;
        source = 'tkb_fallback';
        sourceLabel = 'TKB dự phòng';
        sheetName = tkb.sheetName || sheetName;
      }
    }

    days.push({
      dayNum: i + 2,
      label: names[i],
      targetYmd: Utilities.formatDate(targetDate, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd'),
      source: source,
      sourceLabel: sourceLabel,
      sheetName: sheetName,
      sessions: sessions || {Sáng:[],Chiều:[]}
    });
  }
  return {
    mondayYmd: Utilities.formatDate(monday, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd'),
    saturdayYmd: Utilities.formatDate(addDays_(monday, 5), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd'),
    days: days
  };
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

// Ghi đè hàm cũ: tên hàm được giữ để toàn bộ phần còn lại của app tiếp tục hoạt động.
function readMathSchedule_(teacherKey, tkbSheetName) {
  if (!TEACHER_MAP[teacherKey]) throw new Error('Giáo viên không hợp lệ.');
  const ss = SpreadsheetApp.openById(TKB_SPREADSHEET_ID);
  const sh = ss.getSheetByName(getSelectedTkbSheetName_(tkbSheetName));
  if (!sh) throw new Error('Không tìm thấy Thời khóa biểu đã chọn.');

  const lastCol = Math.min(Math.max(sh.getLastColumn(), 18), 80);
  const values = sh.getRange(1, 1, Math.min(sh.getLastRow(), 220), lastCol).getDisplayValues();
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
      const subjects = v4127SubjectsFromCell_(row[c], teacherKey);
      subjects.forEach(subject => {
        records.push({
          dayNum: Number(dayToken),
          dayLabel: 'Thứ ' + dayToken,
          dateLabel: '',
          session: currentSession,
          period: period,
          subject: v4127DisplaySubject_(subject),
          className: headers[c - 3] || ''
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
    throw new Error('Đã mở được file nhưng chưa nhận diện được dữ liệu PPCT của môn ' + subject + '. Hỗ trợ: cột PPCT + Tên bài/Nội dung, hoặc mẫu Kế hoạch dạy học Google Docs có TT + Bài học dưới từng mục Lớp 10/11/12.');
  }
  map[subject] = clean;
  v4127WriteSourceMap_(map);
  CacheService.getScriptCache().remove('ppct_v4134_' + v4127SubjectKey_(subject) + '_' + id);
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

    const grade = Number(String(rec.className).slice(0, 2));
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
        (hasSource ? ('Nguồn PPCT ' + subject + ' chưa có PPCT ' + ppct + ' cho khối ' + grade) : ('Chưa khai báo Nguồn PPCT cho ' + subject))
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
    const grade = Number(String(rec.className).slice(0,2));
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

function v4135ReadGoogleDocCurriculum_(doc, regularTarget, electiveTarget) {
  const body = doc.getBody();
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
      const k = keyText_(text);
      const gm = text.match(/(?:^|\s)(?:\d+\.\s*)?L[oớ]p\s*(10|11|12)(?:\D|$)/i);
      if (gm) { currentGrade = Number(gm[1]); section = ''; }
      if (/chuyen de lua chon/.test(k)) section = 'elective';
      else if (/phan phoi chuong trinh/.test(k)) section = 'regular';
      continue;
    }
    if (type !== DocumentApp.ElementType.TABLE || !currentGrade || !section) continue;

    const table = child.asTable();
    const matrix = [];
    for (let r = 0; r < table.getNumRows(); r++) {
      const tr = table.getRow(r), row = [];
      for (let c = 0; c < tr.getNumCells(); c++) row.push(tr.getCell(c).getText());
      matrix.push(row);
    }
    const target = section === 'elective' ? electiveTarget : regularTarget;
    const added = addCurriculumMatrix_(matrix, doc.getName() + ' Lớp ' + currentGrade, target, {allowTt:true, grade:currentGrade});
    if (added > 0) {
      if (section === 'elective') { electiveEntries += added; electiveTables++; }
      else { regularEntries += added; regularTables++; }
    }
  }
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
  const key = 'ppct_v4135_' + v4127SubjectKey_(baseSubject) + '_' + id;
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

    const grade = Number(String(rec.className).slice(0, 2));
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
        (hasSource ? ('Nguồn PPCT ' + baseSubject + ' chưa có ' + ppctText + ' cho khối ' + grade) : ('Chưa khai báo Nguồn PPCT cho ' + baseSubject))
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
    const grade = Number(String(rec.className).slice(0,2));
    const sk = v4127SubjectKey_(baseSubject);
    if (!curriculums[sk]) curriculums[sk] = loadPpctCurriculum_(baseSubject);
    const ppctNum = counters[pairKey];
    sessions[rec.session].push({
      session:rec.session, period:rec.period, className:rec.className,
      ppct:v4135PpctLabel_(ppctNum, track), ppctNumber:ppctNum,
      subject:subject, baseSubject:baseSubject, track:track, isElective:track === 'elective',
      lesson:lessonFor_(grade, ppctNum, curriculums[sk], baseSubject, track) || 'Chưa có tên bài từ Nguồn PPCT',
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
  return v4136ApplyMakeupRules_(base, rules, true);
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

// Từ V4.136, mọi chức năng dùng TKB cho công việc thực tế đều nhận lịch đã điều chỉnh.
function readTeacherScheduleAll_(teacherKey, tkbSheetName) {
  return v4136ReadEffectiveSchedule_(teacherKey, tkbSheetName).map(x => ({
    dayNum:x.dayNum, session:x.session, period:x.period, className:x.className, subject:x.subject,
    isMakeup:!!x.isMakeup, makeupSource:x.makeupSource||'', originalDayNum:x.originalDayNum||null,
    originalSession:x.originalSession||'', originalPeriod:x.originalPeriod||null
  }));
}

function buildPreview_(teacherKey, starts, mondayYmd, tkbSheetName) {
  const schedule = v4136ReadEffectiveSchedule_(teacherKey, tkbSheetName);
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

    const grade = Number(String(rec.className).slice(0, 2));
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
        (hasSource ? ('Nguồn PPCT ' + baseSubject + ' chưa có ' + ppctText + ' cho khối ' + grade) : ('Chưa khai báo Nguồn PPCT cho ' + baseSubject))
      ),
      lessonSource:ext ? ('PPCT chuẩn · ' + baseSubject + (track === 'elective' ? ' · Chuyên đề' : '')) : (curriculum && curriculum.error ? ('Lỗi Nguồn PPCT · ' + baseSubject) : (hasSource ? ('Thiếu ' + ppctText + ' trong nguồn · ' + baseSubject) : ('Chưa có nguồn PPCT · ' + baseSubject)))
    }));
  });
  return out;
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
      isMakeup:!!rec.isMakeup, makeupSource:rec.makeupSource||''
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


// ===== V4.142: HOÀN THIỆN CĂN GIỮA TIẾT TKB + TỔ TRƯỞNG BÁO GIẢNG =====


// V4.144 — API adapter cho giao diện Vercel.
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
