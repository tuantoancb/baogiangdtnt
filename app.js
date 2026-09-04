// CỔNG GIÁO VIÊN NTT — cấu hình liên kết trung tâm.
const LINKS = {
  tkb: 'https://thoikhoabieuntt.vercel.app/gv/',
  report: 'https://baogiangdtnt.vercel.app/?gv=',
  // Khi có app Nhập điểm production, chỉ cần điền URL gốc vào đây.
  // Ví dụ: 'https://ten-app-nhap-diem.vercel.app/?gv='
  score: ''
};

const TEACHERS = [
  ['phuong','Lê Thị Lan Phương','GDĐP','BGH'],
  ['phong','Nguyễn Thế Phong','Toán','KHTN'],
  ['ha-oanh','Hà Thị Thu Oanh','Toán','KHTN'],
  ['l-tuan','Lưu Công Tuấn','Vật lí','KHTN'],
  ['lan','Hoàng Thị Lan','Toán','KHTN'],
  ['d-diep','Đàm Thị Diệp','Ngữ văn','KHXH'],
  ['dan','Triệu Thị Đàn','Tiếng Anh','KHXH'],
  ['lieu','Nguyễn Thị Ngọc Liễu','GDTC','KHXH'],
  ['k-diep','Hoàng Khánh Diệp','Ngữ văn','KHXH'],
  ['ha','Hoàng Thị Ngọc Hà','GDKTPL','KHXH'],
  ['bang','Nông Thị Thu Bằng','Ngữ văn','KHXH'],
  ['l-thuy','Lương Thị Thanh Thủy','Địa lí','KHXH'],
  ['v-anh','Trần Thị Vân Anh','Ngữ văn','KHXH'],
  ['dung','Hà Thị Phương Dung','Tiếng Anh','KHXH'],
  ['quyen','Nguyễn Hồng Quyên','Sinh học','KHTN'],
  ['m-anh','Ma Thị Anh','Tin học','KHTN'],
  ['hue','Nông Thị Huệ','Sinh học','KHTN'],
  ['n-ngoc','Nông Thị Bích Ngọc','Vật lí','KHTN'],
  ['lanh','Nông Hồng Lanh','Tin học','KHTN'],
  ['t-ngoc','Trương Thị Mỹ Ngọc','Vật lí','KHTN'],
  ['v-diep','Vi Thị Diệp','Toán','KHTN'],
  ['t-tuan','Nguyễn Thanh Tuấn','Toán','KHTN'],
  ['hieu','Nông Trung Hiếu','GDQPAN','KHXH'],
  ['thang','Trần Chiến Thắng','GDTC','KHXH'],
  ['na','Nguyễn Thị Na','Hoá học','KHTN'],
  ['chi','Vũ Huyền Chi','Hoá học','KHTN'],
  ['thoa','Lê Kim Thoa','Lịch sử','KHXH'],
  ['hien','Lý Thu Hiền','Ngữ văn','KHXH'],
  ['mai','Lê Thị Mai','Tiếng Anh','KHXH'],
  ['long','Lương Vũ Long','Công nghệ','KHTN'],
  ['huong','Lâm Thị Thu Hường','Toán','KHTN'],
  ['t-oanh','Trần Thị Kim Oanh','Địa lí','KHXH'],
  ['van','Hoàng Thị Thanh Vân','Tiếng Anh','KHXH'],
  ['ng-lieu','Nguyễn Thị Liễu','Lịch sử','KHXH'],
  ['hoai','Nông Thị Thanh Hoài','Lịch sử; GDĐP','KHXH']
].map(([slug,name,subject,team])=>({slug,name,subject,team}));

const $ = (id)=>document.getElementById(id);
const select = $('teacherSelect');
const cards = { tkb:$('tkbCard'), report:$('reportCard'), score:$('scoreCard') };

function safeSlug(value){
  return String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}
function getTeacher(slug){ return TEACHERS.find(t=>t.slug===slug) || TEACHERS.find(t=>t.slug==='t-tuan') || TEACHERS[0]; }
function currentTeacher(){ return getTeacher(select.value); }
function localScoreUrl(t){
  const q = new URLSearchParams({gv:t.slug,name:t.name,subject:t.subject});
  return `nhapdiem.html?${q.toString()}`;
}
function updateLinks(t){
  cards.tkb.href = LINKS.tkb + encodeURIComponent(t.slug);
  cards.report.href = LINKS.report + encodeURIComponent(t.slug);
  cards.score.href = LINKS.score ? LINKS.score + encodeURIComponent(t.slug) : localScoreUrl(t);
}
function renderTeacher(t, persist=true){
  if(!t) return;
  select.value=t.slug;
  $('selectedTeacher').textContent=`${t.name} · ${t.subject}`;
  $('statusText').textContent=`Đang thao tác với ${t.name}. Chọn chức năng để tiếp tục.`;
  updateLinks(t);
  if(persist){ try{localStorage.setItem('ntt.portal.teacher',t.slug)}catch(e){} }
  const url = new URL(location.href);
  url.searchParams.set('gv',t.slug);
  history.replaceState(null,'',url);
  document.title=`Cổng giáo viên NTT · ${t.name}`;
}
function init(){
  TEACHERS.forEach(t=>{
    const o=document.createElement('option');
    o.value=t.slug;
    o.textContent=`${t.name} · ${t.subject}`;
    select.appendChild(o);
  });
  const params=new URLSearchParams(location.search);
  const fromUrl=params.get('gv');
  let remembered=''; try{remembered=localStorage.getItem('ntt.portal.teacher')||''}catch(e){}
  renderTeacher(getTeacher(fromUrl || remembered || 't-tuan'),false);
  select.addEventListener('change',()=>renderTeacher(currentTeacher(),true));
  cards.score.addEventListener('click',()=>{
    if(!LINKS.score) showToast('Nhập điểm đang mở trang kết nối riêng. Khi có URL production chỉ cần khai báo 1 dòng trong app.js.');
  });
}
let toastTimer;
function showToast(msg){
  const el=$('toast'); el.textContent=msg; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),3200);
}
init();
