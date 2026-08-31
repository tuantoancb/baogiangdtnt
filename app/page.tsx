'use client';
import Link from 'next/link';
import {leadership,teachers,type Teacher} from '../lib/teachers';

const leadershipSlugs=new Set(leadership.map(t=>t.slug));
const subjectOrderKHTN=['Toán','Vật lí','Hoá học','Sinh học','Tin học','Công nghệ'];
const subjectOrderKHXH=['Ngữ văn','Lịch sử','Địa lí','Tiếng Anh','GDTC','GDQPAN','GDKTPL','GDĐP','HĐTNHN'];

const subjectMeta:Record<string,{icon:string;label?:string;tone:string}>={
  'Toán':{icon:'√x',tone:'green'},
  'Vật lí':{icon:'⚛',tone:'cyan'},
  'Hoá học':{icon:'⚗',tone:'violet'},
  'Sinh học':{icon:'DNA',tone:'lime'},
  'Tin học':{icon:'▣',tone:'blue'},
  'Công nghệ':{icon:'⚙',tone:'orange'},
  'Ngữ văn':{icon:'▤',tone:'blue'},
  'Lịch sử':{icon:'◎',tone:'orange'},
  'Địa lí':{icon:'⌖',tone:'violet'},
  'Tiếng Anh':{icon:'A',tone:'green'},
  'GDKTPL':{icon:'⚖',label:'GDKT&PL',tone:'brown'},
  'GDTC':{icon:'★',tone:'amber'},
  'GDQPAN':{icon:'◆',tone:'olive'},
  'GDĐP':{icon:'⌂',tone:'pink'},
  'HĐTNHN':{icon:'◈',tone:'cyan'}
};

function initials(name:string){
  const parts=name.trim().split(/\s+/);
  return parts.slice(-2).map(p=>p[0]?.toUpperCase()||'').join('');
}
function teacherSubjects(t:Teacher){return t.subjects?.length?t.subjects:[t.subject]}

function LeadershipCard({t}:{t:Teacher}){
  const isHead=t.role==='Hiệu trưởng';
  return <Link href={`/gv/${t.slug}`} className={`v4164Leader ${isHead?'head':'vice'}`}>
    <span className="v4164LeaderAvatar">{initials(t.fullName)}</span>
    <span className="v4164LeaderBody">
      <b>{t.fullName}</b>
      <span><em>{t.role}</em><i>·</i>{t.detail||t.subject}</span>
    </span>
    <span className="v4164Arrow" aria-hidden>→</span>
  </Link>
}

function TeacherLine({t,subject}:{t:Teacher;subject:string}){
  const shown=subjectMeta[subject]?.label||subject;
  return <Link href={`/gv/${t.slug}`} className="v4164TeacherLine">
    <span className="v4164MiniAvatar">{initials(t.fullName)}</span>
    <span className="v4164TeacherText"><b>{t.fullName}</b><small>{shown} · {t.team}</small></span>
    <span className="v4164Open">Mở app <b>→</b></span>
  </Link>
}

function SubjectBlock({subject,list}:{subject:string;list:Teacher[]}){
  const meta=subjectMeta[subject]||{icon:'•',tone:'blue'};
  const label=meta.label||subject;
  return <div className="v4164SubjectBlock">
    <div className="v4164SubjectLabel">
      <span className={`v4164SubjectIcon tone-${meta.tone}`}>{meta.icon}</span>
      <span><b>{label}</b><small>{list.length} giáo viên</small></span>
    </div>
    <div className="v4164TeacherStack">{list.map(t=><TeacherLine key={`${subject}-${t.slug}`} t={t} subject={subject}/>)}</div>
  </div>
}

function TeamColumn({team,title,order}:{team:'KHTN'|'KHXH';title:string;order:string[]}){
  const members=teachers.filter(t=>t.team===team&&!leadershipSlugs.has(t.slug));
  const subjects=[...order,...Array.from(new Set(members.flatMap(t=>teacherSubjects(t)).filter(s=>!order.includes(s))))];
  const blocks=subjects.map(subject=>({subject,list:members.filter(t=>teacherSubjects(t).includes(subject))})).filter(x=>x.list.length);
  return <section className={`v4164TeamPanel ${team==='KHTN'?'natural':'social'}`}>
    <header className="v4164TeamHead">
      <div><span className="v4164TeamIcon">{team==='KHTN'?'⚗':'▤'}</span><b>{title}</b></div>
      <span className="v4164TeamCount">👥 {members.length} giáo viên</span>
    </header>
    <div className="v4164SubjectList">{blocks.map(x=><SubjectBlock key={`${team}-${x.subject}`} {...x}/>)}</div>
  </section>
}

export default function HomePage(){
  return <main className="v4164Portal">
    <section className="v4164Hero">
      <div className="v4164Brand">
        <span className="v4164LogoWrap"><img src="/logo-dtnt.png" alt="Logo DTNT tỉnh Cao Bằng"/></span>
        <span><h1>CỔNG GIÁO VIÊN</h1><p>Hệ thống dùng chung – Tự động nhận diện giáo viên khi mở app</p></span>
      </div>
      <div className="v4164HeroMeta">
        <div><b>👥 {teachers.length} giáo viên</b><span>2 tổ chuyên môn</span></div>
        <div><b>▣ Năm học 2026 – 2027</b><span><i className="v4164Dot"/> Đang hoạt động</span></div>
      </div>
    </section>

    <section className="v4164Leadership">
      <header><span>★</span><b>BAN GIÁM HIỆU</b></header>
      <div className="v4164LeaderGrid">{leadership.map(t=><LeadershipCard key={t.slug} t={t}/>)}</div>
    </section>

    <div className="v4164TeamsGrid">
      <TeamColumn team="KHTN" title="TỔ KHOA HỌC TỰ NHIÊN (KHTN)" order={subjectOrderKHTN}/>
      <TeamColumn team="KHXH" title="TỔ KHOA HỌC XÃ HỘI (KHXH)" order={subjectOrderKHXH}/>
    </div>

    <footer className="v4164Footer">
      <span>DTNT tỉnh Cao Bằng · Năm học 2026 – 2027</span>
      <Link href="/admin">Quản trị giáo viên</Link>
    </footer>
  </main>
}
