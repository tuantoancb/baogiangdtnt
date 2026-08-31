'use client';
import Link from 'next/link';
import {useMemo,useState} from 'react';
import {leadership,teachers,type Teacher} from '../lib/teachers';

const subjectOrderKHTN=['Toán','Vật lí','Hoá học','Sinh học','Tin học','Công nghệ'];
const subjectOrderKHXH=['Ngữ văn','Lịch sử','Địa lí','Tiếng Anh','GDKTPL','GDTC','GDQPAN','GDĐP','HĐTNHN'];
const subjectIcons:Record<string,string>={
  'Toán':'▦','Vật lí':'⚛','Hoá học':'⚗','Sinh học':'◒','Tin học':'▣','Công nghệ':'⚙',
  'Ngữ văn':'▤','Lịch sử':'▥','Địa lí':'●','Tiếng Anh':'Aᴮ','GDKTPL':'⚖','GDTC':'★','GDQPAN':'◆','GDĐP':'♥','HĐTNHN':'♨'
};

function initials(name:string){
  const p=name.trim().split(/\s+/); return p.slice(-2).map(x=>x[0]?.toUpperCase()||'').join('');
}
function norm(v:string){return v.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d')}
function teacherSubjects(t:Teacher){return t.subjects?.length?t.subjects:[t.subject]}
function teacherSubjectLabel(t:Teacher){return teacherSubjects(t).join(' · ')}

function TeacherCard({t,compact=false}:{t:Teacher;compact?:boolean}){
  return <Link href={`/gv/${t.slug}`} className={`teacherCard ${compact?'compact':''}`}>
    <span className="teacherAvatar">{initials(t.fullName)}</span>
    <span className="teacherInfo">
      <b>{t.fullName}</b>
      <small>{teacherSubjectLabel(t)} · {t.team}{t.role?` · ${t.role}`:''}</small>
    </span>
    <span className="teacherGo">→</span>
  </Link>
}

function LeadershipCard({t}:{t:Teacher}){
  return <Link href={`/gv/${t.slug}`} className="leaderCard">
    <span className="leaderAvatar">{initials(t.fullName)}</span>
    <span className="leaderInfo">
      <b>{t.fullName}</b>
      <span><em>{t.role}</em>{t.detail?` · ${t.detail}`:` · ${t.subject}`}</span>
      <small>{t.role==='Hiệu trưởng'?'Quản lý chung · Chỉ đạo chuyên môn':`${teacherSubjectLabel(t)} · ${t.team}`}</small>
    </span>
    <span className="openApp">Mở app →</span>
  </Link>
}

export default function HomePage(){
  const [query,setQuery]=useState('');
  const [team,setTeam]=useState<'ALL'|'KHTN'|'KHXH'>('ALL');
  const [subject,setSubject]=useState('ALL');
  const [sort,setSort]=useState<'AZ'|'SUBJECT'>('AZ');
  const [view,setView]=useState<'grid'|'list'>('grid');

  const subjects=useMemo(()=>Array.from(new Set(teachers.flatMap(t=>teacherSubjects(t)))).sort((a,b)=>a.localeCompare(b,'vi')),[ ]);
  const filtered=useMemo(()=>{
    const q=norm(query.trim());
    const arr=teachers.filter(t=>{
      const matchesTeam=team==='ALL'||t.team===team;
      const matchesSubject=subject==='ALL'||teacherSubjects(t).includes(subject);
      const matchesQuery=!q||norm(`${t.fullName} ${t.key} ${teacherSubjectLabel(t)} ${t.team} ${t.role||''}`).includes(q);
      return matchesTeam&&matchesSubject&&matchesQuery;
    });
    return [...arr].sort((a,b)=>sort==='SUBJECT'?(a.subject.localeCompare(b.subject,'vi')||a.fullName.localeCompare(b.fullName,'vi')):a.fullName.localeCompare(b.fullName,'vi'));
  },[query,team,subject,sort]);

  const leadershipFiltered=leadership.filter(t=>filtered.some(x=>x.slug===t.slug));
  const renderTeam=(teamKey:'KHTN'|'KHXH',title:string,order:string[])=>{
    const teamTeachers=filtered.filter(t=>t.team===teamKey);
    if(!teamTeachers.length)return null;
    const extras=Array.from(new Set(teamTeachers.flatMap(t=>teacherSubjects(t)).filter(s=>!order.includes(s))));
    return <section className={`orgSection ${teamKey==='KHTN'?'natural':'social'}`}>
      <div className="orgHead"><div><span className="orgIcon">{teamKey==='KHTN'?'⚗':'▤'}</span><b>{title}</b></div><span className="orgCount">👥 {teamTeachers.length} giáo viên</span></div>
      <div className="subjectRows">
        {[...order,...extras].map(s=>{
          const list=teamTeachers.filter(t=>teacherSubjects(t).includes(s)); if(!list.length)return null;
          return <div className={`subjectRow ${view==='list'?'listView':''}`} key={`${teamKey}-${s}`}>
            <div className="subjectLabel"><span className="subjectIcon">{subjectIcons[s]||'•'}</span><span><b>{s}</b><small>{list.length} giáo viên</small></span></div>
            <div className="subjectTeachers">{list.map(t=><TeacherCard t={t} compact={view==='list'} key={t.slug}/>)}</div>
          </div>
        })}
      </div>
    </section>
  };

  return <main className="portalShell">
    <section className="portalHero">
      <div><span className="portalLogo">▣</span><div><h1>CỔNG GIÁO VIÊN</h1><p>Hệ thống dùng chung – Tự động nhận diện giáo viên khi mở app</p></div></div>
      <div className="portalStats"><b>👥 {teachers.length} giáo viên</b><span>2 tổ chuyên môn</span></div>
    </section>

    <section className="portalToolbar">
      <label className="searchBox"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm kiếm giáo viên..."/><small>Ví dụ: Phương, Toán, GDĐP...</small></label>
      <label><span>Tổ chuyên môn</span><select value={team} onChange={e=>setTeam(e.target.value as 'ALL'|'KHTN'|'KHXH')}><option value="ALL">Tất cả</option><option value="KHTN">KHTN</option><option value="KHXH">KHXH</option></select></label>
      <label><span>Môn dạy</span><select value={subject} onChange={e=>setSubject(e.target.value)}><option value="ALL">Tất cả</option>{subjects.map(s=><option key={s}>{s}</option>)}</select></label>
      <label><span>Sắp xếp theo</span><select value={sort} onChange={e=>setSort(e.target.value as 'AZ'|'SUBJECT')}><option value="AZ">Tên A - Z</option><option value="SUBJECT">Theo môn</option></select></label>
      <div className="viewSwitch"><button className={view==='grid'?'active':''} onClick={()=>setView('grid')}>▦ Dạng lưới</button><button className={view==='list'?'active':''} onClick={()=>setView('list')}>☷ Danh sách</button></div>
    </section>

    {leadershipFiltered.length>0&&<section className="leadershipSection">
      <div className="leadershipHead"><div><span>★</span><b>BAN GIÁM HIỆU / NHÂN SỰ ĐẶC BIỆT</b></div><small>Các nhân sự giữ chức vụ đặc biệt trong nhà trường</small></div>
      <div className="leaderGrid">{leadershipFiltered.map(t=><LeadershipCard t={t} key={t.slug}/>)}</div>
    </section>}

    {renderTeam('KHTN','TỔ KHOA HỌC TỰ NHIÊN (KHTN)',subjectOrderKHTN)}
    {renderTeam('KHXH','TỔ KHOA HỌC XÃ HỘI (KHXH)',subjectOrderKHXH)}

    {!filtered.length&&<section className="emptyPortal">Không tìm thấy giáo viên phù hợp với bộ lọc.</section>}
    <section className="portalHelp"><div><b>ⓘ Hướng dẫn sử dụng</b><span>Chọn giáo viên để mở đúng app cá nhân. Hệ thống sẽ tự nhận diện giáo viên và nguồn PPCT tương ứng.</span></div><Link href="/admin">Quản trị giáo viên →</Link></section>
  </main>
}
