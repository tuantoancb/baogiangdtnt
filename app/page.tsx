'use client';
import Link from 'next/link';
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

function initials(name:string){
  const parts=name.trim().split(/\s+/);
  return parts.slice(-2).map(p=>p[0]?.toUpperCase()||'').join('');
}
function teacherSubjects(t:Teacher){return t.subjects?.length?t.subjects:[t.subject]}

function LeadershipCard({t,index}:{t:Teacher;index:number}){
  const role=t.role||'';
  return <Link href={`/gv/${t.slug}`} className={`v4165Leader leader-${index+1}`}>
    <span className="v4165LeaderAvatar">{initials(t.fullName)}</span>
    <span className="v4165LeaderInfo">
      <b>{t.fullName}</b>
      <span><em>{role}</em>{(t.detail||t.subject)&&<><i>·</i>{t.detail||t.subject}</>}</span>
    </span>
    <span className="v4165LeaderGo" aria-hidden>→</span>
  </Link>
}

function TeacherRow({t,subject}:{t:Teacher;subject:string}){
  const label=subjectMeta[subject]?.label||subject;
  return <Link href={`/gv/${t.slug}`} className="v4165TeacherRow">
    <span className="v4165TeacherAvatar">{initials(t.fullName)}</span>
    <span className="v4165TeacherIdentity">
      <b>{t.fullName}</b>
      <small>Giáo viên {label}</small>
    </span>
    <span className="v4165OpenApp">Mở app <b>↗</b></span>
  </Link>
}

function SubjectAccordion({subject,list,defaultOpen=false}:{subject:string;list:Teacher[];defaultOpen?:boolean}){
  const meta=subjectMeta[subject]||{icon:'•',tone:'blue'};
  const label=meta.label||subject;
  return <details className="v4165Subject" open={defaultOpen}>
    <summary>
      <span className={`v4165SubjectIcon tone-${meta.tone}`}>{meta.icon}</span>
      <span className="v4165SubjectTitle"><b>{label}</b><small>{list.length} giáo viên</small></span>
      <span className="v4165Chevron">⌄</span>
    </summary>
    <div className="v4165TeacherRows">
      {list.map(t=><TeacherRow key={`${subject}-${t.slug}`} t={t} subject={subject}/>)}
    </div>
  </details>
}

function TeamPanel({team,title,order}:{team:'KHTN'|'KHXH';title:string;order:string[]}){
  const members=teachers.filter(t=>t.team===team&&!leadershipSlugs.has(t.slug));
  const subjects=[...order,...Array.from(new Set(members.flatMap(t=>teacherSubjects(t)).filter(s=>!order.includes(s))))];
  const blocks=subjects.map(subject=>({subject,list:members.filter(t=>teacherSubjects(t).includes(subject))})).filter(x=>x.list.length);
  return <section className={`v4165Team ${team==='KHTN'?'natural':'social'}`}>
    <header className="v4165TeamHeader">
      <span className="v4165TeamPeople">👥</span>
      <span><b>{title}</b><small>{members.length} giáo viên</small></span>
    </header>
    <div className="v4165Subjects">
      {blocks.map(x=><SubjectAccordion key={`${team}-${x.subject}`} subject={x.subject} list={x.list} defaultOpen={x.subject==='Toán'||x.subject==='Ngữ văn'||x.subject==='GDĐP'}/>) }
    </div>
  </section>
}

export default function HomePage(){
  return <main className="v4165Page">
    <header className="v4165Topbar">
      <div className="v4165TopbarInner">
        <div className="v4165Brand">
          <img src="/logo-dtnt.png" alt="Logo DTNT tỉnh Cao Bằng"/>
          <span><b>CỔNG GIÁO VIÊN</b><small>DTNT tỉnh Cao Bằng</small></span>
        </div>
        <div className="v4165TopActions">
          <span className="v4165Status"><i/>Đang hoạt động</span>
          <span className="v4165Count">👥 <b>{teachers.length}</b> giáo viên</span>
          <span className="v4165Year">▣ Năm học 2026 – 2027</span>
          <Link href="/admin" className="v4165Admin" title="Quản trị giáo viên">⚙</Link>
        </div>
      </div>
    </header>

    <div className="v4165Shell">
      <section className="v4165Leadership">
        <header><span>👥</span><b>BAN GIÁM HIỆU</b></header>
        <div className="v4165LeaderGrid">{leadership.map((t,i)=><LeadershipCard key={t.slug} t={t} index={i}/>)}</div>
      </section>

      <div className="v4165Teams">
        <TeamPanel team="KHTN" title="TỔ KHOA HỌC TỰ NHIÊN (KHTN)" order={subjectOrderKHTN}/>
        <TeamPanel team="KHXH" title="TỔ KHOA HỌC XÃ HỘI (KHXH)" order={subjectOrderKHXH}/>
      </div>

      <footer className="v4165Footer">
        <span>Chọn môn → chọn giáo viên → mở app</span>
        <span>DTNT tỉnh Cao Bằng · 2026 – 2027</span>
      </footer>
    </div>
  </main>
}
