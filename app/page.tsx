'use client';

import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import {teachers,type Teacher} from '../lib/teachers';
import {teacherFeatureHref} from '../lib/portal-links';

const viCollator=new Intl.Collator('vi',{sensitivity:'base'});

function PeopleIcon(){return <svg viewBox="0 0 24 24" aria-hidden><circle cx="9" cy="8" r="4"/><path d="M2.5 20c.7-4 3-6 6.5-6s5.8 2 6.5 6M16 5.5a3 3 0 0 1 0 5.8M16.5 14c2.8.3 4.5 2.2 5 5"/></svg>}
function UserIcon(){return <svg viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4.3 3.5-6.5 8-6.5s7.2 2.2 8 6.5"/></svg>}
function CalendarIcon(){return <svg viewBox="0 0 24 24" aria-hidden><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18M8 14h2M14 14h2M8 18h2"/></svg>}
function ClipboardIcon(){return <svg viewBox="0 0 24 24" aria-hidden><path d="M9 5h6M9 3h6a2 2 0 0 1 2 2v1h2v15H5V6h2V5a2 2 0 0 1 2-2Z"/><path d="M9 11h6M9 15h6"/></svg>}
function GradeIcon(){return <svg viewBox="0 0 24 24" aria-hidden><path d="M7 4h10v3h3v14H4V7h3V4Z"/><path d="M8 12h8M8 16h5"/></svg>}
function NoteArt(){return <svg viewBox="0 0 180 110" aria-hidden><path d="M54 91c18-2 32-15 36-34 5 17 18 29 37 33"/><path d="M70 82c-18-18-17-45-8-62 14 14 18 34 9 53M115 76c5-24 21-40 39-48 2 23-10 43-31 52"/><rect x="89" y="15" width="60" height="72" rx="10" transform="rotate(5 119 51)"/><path d="M101 35h34M100 48h34M99 61h25"/><path d="m130 78 32-36 9 8-34 34-10 3Z"/></svg>}

function FeatureCard({kind,title,description,teacher}:{kind:'timetable'|'report'|'grades';title:string;description:string;teacher:Teacher|null}){
  const href=teacher?teacherFeatureHref(kind,teacher):'#';
  const disabled=!teacher;
  const icon=kind==='timetable'?<CalendarIcon/>:kind==='report'?<ClipboardIcon/>:<GradeIcon/>;
  return <Link
    href={disabled?'#':href}
    onClick={e=>{if(disabled)e.preventDefault();}}
    className={`v4170Feature ${kind} ${disabled?'disabled':''}`}
    aria-disabled={disabled}
  >
    <span className="v4170FeatureIcon">{icon}</span>
    <h2>{title}</h2>
    <p>{description}</p>
    <span className="v4170FeatureGo">→</span>
  </Link>;
}

export default function HomePage(){
  const sorted=useMemo(()=>[...teachers].sort((a,b)=>viCollator.compare(a.fullName,b.fullName)),[]);
  const [selectedSlug,setSelectedSlug]=useState('');

  useEffect(()=>{
    try{
      const saved=localStorage.getItem('ntt-selected-teacher');
      if(saved&&teachers.some(t=>t.slug===saved))setSelectedSlug(saved);
    }catch{}
  },[]);

  const selected=teachers.find(t=>t.slug===selectedSlug)||null;
  const onSelect=(slug:string)=>{
    setSelectedSlug(slug);
    try{
      if(slug)localStorage.setItem('ntt-selected-teacher',slug);
      else localStorage.removeItem('ntt-selected-teacher');
    }catch{}
  };

  return <main className="v4170Page">
    <div className="v4170Shell">
      <section className="v4170Hero">
        <span className="v4170HeroIcon"><PeopleIcon/></span>
        <div className="v4170HeroCopy">
          <h1>GIÁO VIÊN NTT</h1>
          <p>Chào mừng thầy cô! Chọn giáo viên và mở nhanh công cụ cần sử dụng.</p>
        </div>
        <span className="v4170HeroArt"><NoteArt/></span>
      </section>

      <section className="v4170Picker" aria-label="Chọn giáo viên">
        <label htmlFor="teacher-select">CHỌN GIÁO VIÊN</label>
        <div className="v4170SelectWrap">
          <span className="v4170SelectIcon"><UserIcon/></span>
          <select id="teacher-select" value={selectedSlug} onChange={e=>onSelect(e.target.value)}>
            <option value="">-- Chọn giáo viên --</option>
            {sorted.map(t=><option key={t.slug} value={t.slug}>{t.fullName}{t.subject?` · ${t.subject}`:''}</option>)}
          </select>
          <span className="v4170Chevron">⌄</span>
        </div>
        {selected&&<div className="v4170SelectedLine"><span>Đã chọn</span><b>{selected.fullName}</b><small>{selected.role?`${selected.role} · `:''}{selected.subject}</small></div>}
      </section>

      <section className="v4170Features">
        <FeatureCard kind="timetable" title="THỜI KHÓA BIỂU CÁ NHÂN" description="Xem thời khóa biểu và lịch dạy của cá nhân." teacher={selected}/>
        <FeatureCard kind="report" title="BÁO GIẢNG" description="Tạo và quản lý báo giảng điện tử." teacher={selected}/>
        <FeatureCard kind="grades" title="NHẬP ĐIỂM" description="Mở khu vực nhập và quản lý điểm." teacher={selected}/>
      </section>

      <div className="v4170Hint">ⓘ {selected?`Đang thao tác với ${selected.fullName}. Chọn chức năng để tiếp tục.`:'Hãy chọn giáo viên trước khi mở các chức năng.'}</div>

      <footer className="v4170Footer">© 2026 GIÁO VIÊN NTT · DTNT tỉnh Cao Bằng <span>♥</span></footer>
    </div>
  </main>;
}
