'use client';
import Link from 'next/link';
import {useMemo,useState} from 'react';
import {leadership,teachers,type Teacher} from '../lib/teachers';

const leadershipSlugs=new Set(leadership.map(t=>t.slug));
const subjectOrderKHTN=['Toán','Vật lí','Hoá học','Sinh học','Tin học','Công nghệ'];
const subjectOrderKHXH=['Ngữ văn','Lịch sử','Địa lí','Tiếng Anh','GDKTPL','GDTC','GDQPAN','GDĐP','HĐTNHN'];

const subjectMeta:Record<string,{icon:string;label?:string;tone:string}>= {
  'Toán':{icon:'√Σ',tone:'green'},
  'Vật lí':{icon:'⚛',tone:'cyan'},
  'Hoá học':{icon:'⚗',tone:'violet'},
  'Sinh học':{icon:'◉',tone:'lime'},
  'Tin học':{icon:'▣',tone:'blue'},
  'Công nghệ':{icon:'⚙',tone:'orange'},
  'Ngữ văn':{icon:'▤',tone:'blue'},
  'Lịch sử':{icon:'◉',tone:'orange'},
  'Địa lí':{icon:'⌖',tone:'violet'},
  'Tiếng Anh':{icon:'A',tone:'blue'},
  'GDKTPL':{icon:'⚖',label:'GDKT & PL',tone:'green'},
  'GDTC':{icon:'🏃',tone:'orange'},
  'GDQPAN':{icon:'◇',tone:'green'},
  'GDĐP':{icon:'◇',tone:'blue'},
  'HĐTNHN':{icon:'◈',label:'HĐTNHN',tone:'cyan'}
};

function fold(text:string){
  return String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().trim();
}
function initials(name:string){
  const parts=name.trim().split(/\s+/);
  return parts.slice(-2).map(p=>p[0]?.toUpperCase()||'').join('');
}
function teacherSubjects(t:Teacher){return t.subjects?.length?t.subjects:[t.subject]}
function matchTeacher(t:Teacher,q:string){
  if(!q)return true;
  return fold([t.fullName,t.key,t.subject,t.detail,t.team,...teacherSubjects(t)].filter(Boolean).join(' ')).includes(q);
}

function LeadershipCard({t,index}:{t:Teacher;index:number}){
  return <Link href={`/gv/${t.slug}`} className={`v4166Leader leader-${index+1}`}>
    <span className="v4166LeaderAvatar">{initials(t.fullName)}</span>
    <span className="v4166LeaderInfo">
      <b>{t.fullName}</b>
      <span><em>{t.role}</em>{(t.detail||t.subject)&&<><i>·</i>{t.detail||t.subject}</>}</span>
    </span>
    <span className="v4166LeaderOpen">Mở app <b>↗</b></span>
  </Link>
}

function TeacherRow({t,subject}:{t:Teacher;subject:string}){
  const label=subjectMeta[subject]?.label||subject;
  return <Link href={`/gv/${t.slug}`} className="v4166TeacherRow">
    <span className="v4166TeacherAvatar">{initials(t.fullName)}</span>
    <span className="v4166TeacherIdentity"><b>{t.fullName}</b><small>Giáo viên {label}</small></span>
    <span className="v4166OpenApp">Mở app <b>↗</b></span>
  </Link>
}

function SubjectAccordion({subject,list,defaultOpen=false,forceOpen=false}:{subject:string;list:Teacher[];defaultOpen?:boolean;forceOpen?:boolean}){
  const [open,setOpen]=useState(defaultOpen);
  const meta=subjectMeta[subject]||{icon:'•',tone:'blue'};
  const label=meta.label||subject;
  const expanded=forceOpen||open;
  return <section className={`v4166Subject ${expanded?'is-open':''}`}>
    <button className="v4166SubjectHead" onClick={()=>setOpen(v=>!v)} aria-expanded={expanded}>
      <span className={`v4166SubjectIcon tone-${meta.tone}`}>{meta.icon}</span>
      <span className="v4166SubjectTitle"><b>{label}</b><small>{list.length} giáo viên</small></span>
      <span className="v4166Chevron">⌄</span>
    </button>
    {expanded&&<div className="v4166TeacherRows">{list.map(t=><TeacherRow key={`${subject}-${t.slug}`} t={t} subject={subject}/>)}</div>}
  </section>
}

function TeamPanel({team,title,order,query}:{team:'KHTN'|'KHXH';title:string;order:string[];query:string}){
  const allMembers=teachers.filter(t=>t.team===team&&!leadershipSlugs.has(t.slug));
  const subjects=[...order,...Array.from(new Set(allMembers.flatMap(t=>teacherSubjects(t)).filter(s=>!order.includes(s))))];
  const blocks=subjects.map(subject=>{
    const subjectTeachers=allMembers.filter(t=>teacherSubjects(t).includes(subject));
    const subjectHit=query&&fold(`${subject} ${subjectMeta[subject]?.label||''} ${team}`).includes(query);
    const list=query?subjectTeachers.filter(t=>subjectHit||matchTeacher(t,query)):subjectTeachers;
    return {subject,list};
  }).filter(x=>x.list.length);
  const visibleCount=query?new Set(blocks.flatMap(x=>x.list.map(t=>t.slug))).size:allMembers.length;
  return <section className={`v4166Team ${team==='KHTN'?'natural':'social'}`}>
    <header className="v4166TeamHeader">
      <span className="v4166TeamPeople">👥</span>
      <span><b>{title}</b><small>{query?`${visibleCount} phù hợp`:`${allMembers.length} giáo viên`}</small></span>
    </header>
    <div className="v4166Subjects">
      {blocks.map(x=><SubjectAccordion key={`${team}-${x.subject}`} subject={x.subject} list={x.list} defaultOpen={x.subject==='Toán'||x.subject==='Ngữ văn'} forceOpen={Boolean(query)}/>) }
      {!blocks.length&&<div className="v4166Empty">Không có giáo viên phù hợp trong tổ này.</div>}
    </div>
  </section>
}

export default function HomePage(){
  const [query,setQuery]=useState('');
  const [menuOpen,setMenuOpen]=useState(false);
  const q=fold(query);
  const leaders=useMemo(()=>q?leadership.filter(t=>matchTeacher(t,q)):leadership,[q]);
  const normalTeacherMatches=useMemo(()=>teachers.filter(t=>!leadershipSlugs.has(t.slug)&&matchTeacher(t,q)),[q]);
  const hasResults=!q||leaders.length>0||normalTeacherMatches.length>0||['toán','vật lí','hoá học','sinh học','tin học','công nghệ','ngữ văn','lịch sử','địa lí','tiếng anh','gdktpl','gdtc','gdqpan','gdđp'].some(s=>fold(s).includes(q));

  return <main id="top" className="v4166Page">
    <aside className={`v4166Sidebar ${menuOpen?'is-open':''}`}>
      <div className="v4166SideBrand">
        <img src="/logo-dtnt.png" alt="Logo DTNT tỉnh Cao Bằng"/>
        <span><b>DTNT TỈNH CAO BẰNG</b><small>Cổng giáo viên</small></span>
      </div>
      <nav>
        <a href="#top" className="active" onClick={()=>setMenuOpen(false)}><span>⌂</span>Trang chủ</a>
        <a href="#teachers" onClick={()=>setMenuOpen(false)}><span>♙</span>Giáo viên</a>
        <Link href="/admin" onClick={()=>setMenuOpen(false)}><span>⚙</span>Quản trị</Link>
      </nav>
      <div className="v4166SideBottom"><i/>Hệ thống đang hoạt động<small>Năm học 2026 – 2027</small></div>
    </aside>
    {menuOpen&&<button className="v4166Backdrop" onClick={()=>setMenuOpen(false)} aria-label="Đóng menu"/>}

    <div className="v4166Main">
      <header className="v4166Topbar">
        <button className="v4166MenuButton" onClick={()=>setMenuOpen(true)} aria-label="Mở menu">☰</button>
        <div className="v4166MobileBrand"><img src="/logo-dtnt.png" alt=""/><span><b>CỔNG GIÁO VIÊN</b><small>DTNT tỉnh Cao Bằng</small></span></div>
        <label className="v4166Search">
          <span>⌕</span>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm giáo viên, môn học..." aria-label="Tìm giáo viên hoặc môn học"/>
          {query&&<button onClick={()=>setQuery('')} type="button" aria-label="Xóa tìm kiếm">×</button>}
        </label>
        <div className="v4166TopMeta">
          <span className="v4166Status"><i/>Đang hoạt động</span>
          <span className="v4166Count">👥 <b>{teachers.length}</b> giáo viên</span>
          <span className="v4166Year">▣ 2026 – 2027</span>
        </div>
      </header>

      <div className="v4166Content">
        {leaders.length>0&&<section className="v4166Leadership">
          <header><span>♜</span><b>BAN GIÁM HIỆU</b>{q&&<small>{leaders.length} phù hợp</small>}</header>
          <div className="v4166LeaderGrid">{leaders.map((t,i)=><LeadershipCard key={t.slug} t={t} index={leadership.findIndex(x=>x.slug===t.slug)}/>)}</div>
        </section>}

        <section id="teachers" className="v4166DirectoryHead">
          <div><span>👥</span><span><b>CHỌN GIÁO VIÊN THEO MÔN</b><small>Bấm môn để mở danh sách, hoặc tìm theo tên ở phía trên</small></span></div>
          {q&&<button onClick={()=>setQuery('')}>Xóa lọc</button>}
        </section>

        {hasResults?<div className="v4166Teams">
          <TeamPanel team="KHTN" title="TỔ KHOA HỌC TỰ NHIÊN (KHTN)" order={subjectOrderKHTN} query={q}/>
          <TeamPanel team="KHXH" title="TỔ KHOA HỌC XÃ HỘI (KHXH)" order={subjectOrderKHXH} query={q}/>
        </div>:<div className="v4166NoResult"><b>Không tìm thấy giáo viên hoặc môn học phù hợp.</b><span>Thử nhập một phần họ tên, ví dụ “Hiền”, “Hoài”, “Toán”, “GDĐP”.</span></div>}

        <footer className="v4166Footer"><span>Chọn nhanh: Tìm tên → Mở app</span><span>DTNT tỉnh Cao Bằng · 2026 – 2027</span></footer>
      </div>
    </div>
  </main>
}
