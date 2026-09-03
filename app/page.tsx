'use client';

import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import {leadership,teachers,type Teacher} from '../lib/teachers';
import {teacherFeatureHref} from '../lib/portal-links';

type TeamFilter='KHTN'|'KHXH';
const leadershipSlugs=new Set(leadership.map(t=>t.slug));
const viCollator=new Intl.Collator('vi',{sensitivity:'base'});

function fold(text:string){
  return String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().trim();
}
function initials(name:string){
  const parts=name.trim().split(/\s+/);
  return parts.slice(-2).map(p=>p[0]?.toUpperCase()||'').join('');
}
function subjectLabel(t:Teacher){
  if(t.detail&&!t.role)return t.detail;
  if(t.subjects?.length)return t.subjects.join(' · ');
  return t.subject||'Giáo viên';
}
function teamLabel(t:Teacher){return t.team==='KHTN'?'Tổ KHTN':'Tổ KHXH';}
function matches(t:Teacher,q:string){
  if(!q)return true;
  return fold([t.fullName,t.key,t.subject,t.detail,t.team,t.role,...(t.subjects||[])].filter(Boolean).join(' ')).includes(q);
}

function TeamIcon({team}:{team:TeamFilter}){
  return team==='KHTN'?
    <svg viewBox="0 0 24 24" aria-hidden><path d="M9 3h6M10 3v5l-5.2 8.3A3 3 0 0 0 7.3 21h9.4a3 3 0 0 0 2.5-4.7L14 8V3M8.5 14h7"/></svg>:
    <svg viewBox="0 0 24 24" aria-hidden><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3.6 9h16.8M3.6 15h16.8M12 3c2.3 2.4 3.5 5.4 3.5 9S14.3 18.6 12 21c-2.3-2.4-3.5-5.4-3.5-9S9.7 5.4 12 3Z"/></svg>;
}
function SearchIcon(){return <svg viewBox="0 0 24 24" aria-hidden><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>}
function UserIcon(){return <svg viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4.3 3.5-6.5 8-6.5s7.2 2.2 8 6.5"/></svg>}
function CalendarIcon(){return <svg viewBox="0 0 24 24" aria-hidden><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18M8 14h2M14 14h2M8 18h2"/></svg>}
function ClipboardIcon(){return <svg viewBox="0 0 24 24" aria-hidden><path d="M9 5h6M9 3h6a2 2 0 0 1 2 2v1h2v15H5V6h2V5a2 2 0 0 1 2-2Z"/><path d="M9 11h6M9 15h6"/></svg>}
function GradeIcon(){return <svg viewBox="0 0 24 24" aria-hidden><path d="M7 4h10v3h3v14H4V7h3V4Z"/><path d="M8 12h8M8 16h5"/></svg>}

function TeamChoice({team,active,count,onClick}:{team:TeamFilter;active:boolean;count:number;onClick:()=>void}){
  return <button type="button" onClick={onClick} className={`v4168TeamChoice ${active?'active':''}`}>
    <span className={`v4168TeamBadge ${team==='KHTN'?'natural':'social'}`}><TeamIcon team={team}/></span>
    <span><b>TỔ {team}</b><small>{team==='KHTN'?'Khối Khoa học tự nhiên':'Khối Khoa học xã hội'}</small></span>
    <span className="v4168Count">{count}</span>
    {active&&<i className="v4168Check">✓</i>}
  </button>;
}

function TeacherChoice({teacher,selected,onSelect}:{teacher:Teacher;selected:boolean;onSelect:()=>void}){
  return <button type="button" onClick={onSelect} className={`v4168TeacherChoice ${selected?'selected':''}`}>
    <span className="v4168Avatar">{initials(teacher.fullName)}</span>
    <span className="v4168TeacherMeta"><b>{teacher.fullName}</b><small>{subjectLabel(teacher)}</small></span>
    {selected&&<span className="v4168MiniCheck">✓</span>}
  </button>;
}

function FeatureCard({kind,title,description,teacher}:{kind:'timetable'|'report'|'grades';title:string;description:string;teacher:Teacher|null}){
  const href=teacher?teacherFeatureHref(kind,teacher):'#';
  const icon=kind==='timetable'?<CalendarIcon/>:kind==='report'?<ClipboardIcon/>:<GradeIcon/>;
  const disabled=!teacher;
  return <Link href={disabled?'#':href} onClick={e=>{if(disabled)e.preventDefault();}} className={`v4168Feature ${kind} ${disabled?'disabled':''}`} aria-disabled={disabled}>
    <span className="v4168FeatureIcon">{icon}</span>
    <b>{title}</b>
    <small>{description}</small>
    <span className="v4168FeatureGo">→</span>
  </Link>;
}

export default function HomePage(){
  const regular=useMemo(()=>teachers.filter(t=>!leadershipSlugs.has(t.slug)),[]);
  const khtn=useMemo(()=>regular.filter(t=>t.team==='KHTN').sort((a,b)=>viCollator.compare(a.fullName,b.fullName)),[regular]);
  const khxh=useMemo(()=>regular.filter(t=>t.team==='KHXH').sort((a,b)=>viCollator.compare(a.fullName,b.fullName)),[regular]);
  const [team,setTeam]=useState<TeamFilter>('KHTN');
  const [query,setQuery]=useState('');
  const [selectedSlug,setSelectedSlug]=useState('');
  const q=fold(query);

  useEffect(()=>{
    try{const saved=localStorage.getItem('ntt-selected-teacher');if(saved&&teachers.some(t=>t.slug===saved))setSelectedSlug(saved);}catch{}
  },[]);
  const choose=(t:Teacher)=>{
    setSelectedSlug(t.slug);
    setTeam(t.team);
    try{localStorage.setItem('ntt-selected-teacher',t.slug);}catch{}
  };
  const selected=teachers.find(t=>t.slug===selectedSlug)||null;
  const baseMembers=team==='KHTN'?khtn:khxh;
  const visible=q?teachers.filter(t=>matches(t,q)).sort((a,b)=>viCollator.compare(a.fullName,b.fullName)):baseMembers;
  const showingGlobal=q.length>0;

  return <main className="v4168Page">
    <header className="v4168Topbar">
      <div className="v4168TopInner">
        <Link href="/" className="v4168Brand"><img src="/logo-dtnt.png" alt="Logo DTNT tỉnh Cao Bằng"/><span><b>GIÁO VIÊN NTT</b><small>DTNT tỉnh Cao Bằng</small></span></Link>
        <span className="v4168Status"><i/>Đang hoạt động</span>
        <Link className="v4168Admin" href="/admin"><UserIcon/><span>Quản trị hệ thống</span></Link>
      </div>
    </header>

    <div className="v4168Shell">
      <section className="v4168Hero">
        <span className="v4168HeroIcon"><UserIcon/></span>
        <div><h1>GIÁO VIÊN NTT</h1><p>Chọn giáo viên một lần, sau đó mở nhanh các công cụ cá nhân.</p></div>
        <span className="v4168HeroStats"><b>{teachers.length}</b><small>giáo viên</small></span>
      </section>

      <div className="v4168Columns">
        <section className="v4168Picker">
          <header className="v4168SectionHead"><span><UserIcon/></span><div><b>Chọn giáo viên</b><small>Chọn tổ chuyên môn hoặc tìm nhanh theo tên</small></div></header>
          <label className="v4168Search"><SearchIcon/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm kiếm giáo viên theo tên..."/>{query&&<button onClick={()=>setQuery('')} type="button">×</button>}</label>

          <div className="v4168TeamsRow">
            <TeamChoice team="KHTN" active={!showingGlobal&&team==='KHTN'} count={khtn.length} onClick={()=>{setTeam('KHTN');setQuery('');}}/>
            <TeamChoice team="KHXH" active={!showingGlobal&&team==='KHXH'} count={khxh.length} onClick={()=>{setTeam('KHXH');setQuery('');}}/>
          </div>

          {leadership.length>0&&!q&&<div className="v4168LeaderStrip"><span>Ban giám hiệu</span>{leadership.map(t=><TeacherChoice key={t.slug} teacher={t} selected={selectedSlug===t.slug} onSelect={()=>choose(t)}/>)}</div>}

          <div className="v4168RosterHead"><b>{showingGlobal?'Kết quả tìm kiếm':`Giáo viên thuộc Tổ ${team}`}</b><span>{visible.length} giáo viên</span></div>
          <div className="v4168Roster">{visible.map(t=><TeacherChoice key={t.slug} teacher={t} selected={selectedSlug===t.slug} onSelect={()=>choose(t)}/>)}</div>
          {!visible.length&&<div className="v4168Empty">Không tìm thấy giáo viên phù hợp.</div>}
        </section>

        <section className="v4168Workspace">
          <header className="v4168SectionHead"><span><UserIcon/></span><div><b>Giáo viên đã chọn</b><small>Các nút chức năng sẽ chuyển đúng tới hồ sơ giáo viên này</small></div></header>
          {selected?<div className="v4168Selected">
            <span className="v4168SelectedAvatar">{initials(selected.fullName)}</span>
            <div><small>Đã chọn</small><h2>{selected.fullName}</h2><p>{selected.role?`${selected.role} · `:''}{teamLabel(selected)} · {subjectLabel(selected)}</p><span><i/>Đang hoạt động</span></div>
            <b className="v4168SelectedCheck">✓</b>
          </div>:<div className="v4168Selected empty"><span className="v4168SelectedAvatar">?</span><div><small>Chưa chọn giáo viên</small><h2>Hãy chọn một giáo viên</h2><p>Chọn từ danh sách bên trái để bật các chức năng cá nhân.</p></div></div>}

          <div className="v4168Features">
            <FeatureCard kind="timetable" title="Thời khóa biểu cá nhân" description="Xem thời khóa biểu và lịch dạy cá nhân." teacher={selected}/>
            <FeatureCard kind="report" title="Báo giảng" description="Tạo và quản lý báo giảng điện tử." teacher={selected}/>
            <FeatureCard kind="grades" title="Nhập điểm" description="Mở khu vực nhập và quản lý điểm." teacher={selected}/>
          </div>
          <div className="v4168Hint">ⓘ {selected?'Bấm một chức năng để chuyển tới đúng giáo viên đã chọn.':'Vui lòng chọn giáo viên trước khi sử dụng các chức năng.'}</div>
        </section>
      </div>

      <footer className="v4168Footer"><span>DTNT tỉnh Cao Bằng © 2026 – 2027</span><span>GIÁO VIÊN NTT · Phiên bản 4.168</span></footer>
    </div>
  </main>;
}
