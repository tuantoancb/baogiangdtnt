'use client';

import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import {teachers,type Teacher} from '../lib/teachers';
import {teacherFeatureHref} from '../lib/portal-links';

const viCollator=new Intl.Collator('vi',{sensitivity:'base'});

function UserIcon(){return <svg viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4.3 3.5-6.5 8-6.5s7.2 2.2 8 6.5"/></svg>}
function CalendarIcon(){return <svg viewBox="0 0 24 24" aria-hidden><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18M8 14h2M14 14h2M8 18h2"/></svg>}
function ClipboardIcon(){return <svg viewBox="0 0 24 24" aria-hidden><path d="M9 5h6M9 3h6a2 2 0 0 1 2 2v1h2v15H5V6h2V5a2 2 0 0 1 2-2Z"/><path d="M9 11h6M9 15h6"/></svg>}
function GradeIcon(){return <svg viewBox="0 0 24 24" aria-hidden><path d="M7 4h10v3h3v14H4V7h3V4Z"/><path d="M8 12h8M8 16h5"/></svg>}
function InfoIcon(){return <svg viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="9"/><path d="M12 10v6M12 7.2h.01"/></svg>}
function ShieldIcon(){return <svg viewBox="0 0 24 24" aria-hidden><path d="M12 3 4.5 6v5.2c0 4.7 2.8 8.2 7.5 9.8 4.7-1.6 7.5-5.1 7.5-9.8V6L12 3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></svg>}

function FeatureCard({kind,title,description,cta,teacher}:{kind:'timetable'|'report'|'grades';title:string;description:string;cta:string;teacher:Teacher|null}){
  const href=teacher?teacherFeatureHref(kind,teacher):'#';
  const disabled=!teacher;
  const icon=kind==='timetable'?<CalendarIcon/>:kind==='report'?<ClipboardIcon/>:<GradeIcon/>;
  return <a
    href={disabled?'#':href}
    target={disabled?undefined:'_blank'}
    rel={disabled?undefined:'noopener noreferrer'}
    onClick={e=>{if(disabled)e.preventDefault();}}
    className={`v4173Feature ${kind} ${disabled?'disabled':''}`}
    aria-disabled={disabled}
  >
    <span className="v4173FeatureIcon">{icon}</span>
    <h2>{title}</h2>
    <span className="v4173Rule"/>
    <p>{description}</p>
    <span className="v4173FeatureCta"><b>→</b>{cta}</span>
  </a>;
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

  return <main className="v4173Page">
    <header className="v4173Topbar">
      <div className="v4173TopInner">
        <div className="v4173Brand">
          <img src="/logo-dtnt.png" alt="Logo DTNT Cao Bằng"/>
          <div><b>GIÁO VIÊN NTT</b><span>DTNT tỉnh Cao Bằng</span></div>
        </div>
        <div className="v4173TopTools">
          <span className="v4173Online"><i/>Đang hoạt động</span>
          <Link className="v4173Admin" href="/admin">⚙ Quản trị hệ thống</Link>
        </div>
      </div>
    </header>

    <div className="v4173Shell">
      <section className="v4173Welcome">
        <h1>Xin chào! Chọn giáo viên để bắt đầu làm việc</h1>
        <span className="v4173WelcomeRule"/>
        <div className="v4173CompactPicker">
          <span className="v4173PickerIcon"><UserIcon/></span>
          <select aria-label="Chọn giáo viên" value={selectedSlug} onChange={e=>onSelect(e.target.value)}>
            <option value="">-- Chọn giáo viên --</option>
            {sorted.map(t=><option key={t.slug} value={t.slug}>{t.fullName}{t.subject?` · ${t.subject}`:''}</option>)}
          </select>
          <span className="v4173Chevron">⌄</span>
        </div>
        <div className="v4173Remember"><InfoIcon/><span>{selected?`Đã chọn ${selected.fullName}. Hệ thống sẽ ghi nhớ cho lần sau.`:'Hệ thống sẽ ghi nhớ giáo viên bạn đã chọn cho lần sau.'}</span></div>
      </section>

      <section className="v4173Features">
        <FeatureCard kind="timetable" title="THỜI KHÓA BIỂU" description="Xem thời khóa biểu của giáo viên." cta="MỞ TKB" teacher={selected}/>
        <FeatureCard kind="report" title="BÁO GIẢNG" description="Tạo và quản lý báo giảng điện tử." cta="MỞ BÁO GIẢNG" teacher={selected}/>
        <FeatureCard kind="grades" title="NHẬP ĐIỂM" description="Mở khu vực nhập và quản lý điểm." cta="NHẬP ĐIỂM" teacher={selected}/>
      </section>

      <div className="v4173Hint"><InfoIcon/><span>{selected?`Đang thao tác với ${selected.fullName}. Chọn một chức năng để tiếp tục.`:'Hãy chọn giáo viên trước khi mở các chức năng.'}</span></div>
    </div>

    <footer className="v4173Footer">
      <div className="v4173FooterInner">
        <div className="v4173System"><span><ShieldIcon/></span><div><b>HỆ THỐNG GIÁO VIÊN NTT</b><small>Đơn giản · Nhanh chóng · Hiệu quả</small></div></div>
        <div>© 2026 Giáo viên NTT · DTNT tỉnh Cao Bằng <span className="v4173Heart">♥</span></div>
      </div>
    </footer>
  </main>;
}
