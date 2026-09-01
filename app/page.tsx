'use client';
import Link from 'next/link';
import {useMemo,useState} from 'react';
import {leadership,teachers,type Teacher} from '../lib/teachers';

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
function matches(t:Teacher,q:string){
  if(!q)return true;
  return fold([t.fullName,t.key,t.subject,t.detail,t.team,...(t.subjects||[])].filter(Boolean).join(' ')).includes(q);
}

function LeaderCard({t,index}:{t:Teacher;index:number}){
  return <Link href={`/gv/${t.slug}`} className={`v4167Leader leader-${index+1}`}>
    <span className="v4167LeaderAvatar">{initials(t.fullName)}</span>
    <span className="v4167LeaderText">
      <b>{t.fullName}</b>
      <small><strong>{t.role}</strong>{(t.detail||t.subject)&&<> · {t.detail||t.subject}</>}</small>
    </span>
    <span className="v4167Arrow" aria-hidden>→</span>
  </Link>;
}

function TeacherCard({t}:{t:Teacher}){
  return <Link href={`/gv/${t.slug}`} className="v4167TeacherCard">
    <span className="v4167Avatar">{initials(t.fullName)}</span>
    <span className="v4167TeacherText">
      <b>{t.fullName}</b>
      <small>{subjectLabel(t)}</small>
    </span>
    <span className="v4167Open">Mở app <b>→</b></span>
  </Link>;
}

function TeamPanel({team,title,members,query}:{team:'KHTN'|'KHXH';title:string;members:Teacher[];query:string}){
  const visible=members.filter(t=>matches(t,query));
  return <section className={`v4167Team ${team==='KHTN'?'natural':'social'}`}>
    <header className="v4167TeamHead">
      <span className="v4167TeamIcon">{team==='KHTN'?'⚗':'▤'}</span>
      <span className="v4167TeamTitle"><b>{title}</b><small>{query?`${visible.length} phù hợp`:`${members.length} giáo viên`}</small></span>
    </header>
    {visible.length?<div className="v4167TeacherGrid">{visible.map(t=><TeacherCard key={t.slug} t={t}/>)}</div>:<div className="v4167Empty">Không có giáo viên phù hợp.</div>}
  </section>;
}

export default function HomePage(){
  const [query,setQuery]=useState('');
  const q=fold(query);
  const leaders=useMemo(()=>leadership.filter(t=>matches(t,q)),[q]);
  const khtn=useMemo(()=>teachers.filter(t=>t.team==='KHTN'&&!leadershipSlugs.has(t.slug)).sort((a,b)=>viCollator.compare(a.fullName,b.fullName)),[]);
  const khxh=useMemo(()=>teachers.filter(t=>t.team==='KHXH'&&!leadershipSlugs.has(t.slug)).sort((a,b)=>viCollator.compare(a.fullName,b.fullName)),[]);
  const regularHits=khtn.filter(t=>matches(t,q)).length+khxh.filter(t=>matches(t,q)).length;
  const hasAny=leaders.length+regularHits>0;

  return <main className="v4167Page">
    <header className="v4167Topbar">
      <div className="v4167TopInner">
        <Link href="/" className="v4167Brand">
          <img src="/logo-dtnt.png" alt="Logo DTNT tỉnh Cao Bằng"/>
          <span><b>CỔNG GIÁO VIÊN</b><small>DTNT tỉnh Cao Bằng</small></span>
        </Link>
        <label className="v4167Search">
          <span>⌕</span>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm nhanh tên giáo viên..." aria-label="Tìm giáo viên"/>
          {query&&<button type="button" onClick={()=>setQuery('')} aria-label="Xóa tìm kiếm">×</button>}
        </label>
        <div className="v4167Meta">
          <span className="v4167Active"><i/>Đang hoạt động</span>
          <span className="v4167Total">👥 <b>{teachers.length}</b> giáo viên</span>
          <Link href="/admin" className="v4167Admin" title="Quản trị">⚙</Link>
        </div>
      </div>
    </header>

    <div className="v4167Content">
      <section className="v4167Welcome">
        <div><b>Chọn giáo viên để mở Báo giảng</b><small>Toàn bộ giáo viên được xếp theo tổ — chỉ một lần bấm để vào app cá nhân.</small></div>
        <span>Năm học <b>2026 – 2027</b></span>
      </section>

      {leaders.length>0&&<section className="v4167Leadership">
        <header><span>★</span><b>BAN GIÁM HIỆU</b>{q&&<small>{leaders.length} phù hợp</small>}</header>
        <div className="v4167LeaderGrid">{leaders.map((t,i)=><LeaderCard key={t.slug} t={t} index={leadership.findIndex(x=>x.slug===t.slug)}/>)}</div>
      </section>}

      {hasAny?<div className="v4167Teams">
        <TeamPanel team="KHTN" title="TỔ KHOA HỌC TỰ NHIÊN (KHTN)" members={khtn} query={q}/>
        <TeamPanel team="KHXH" title="TỔ KHOA HỌC XÃ HỘI (KHXH)" members={khxh} query={q}/>
      </div>:<section className="v4167NoResult"><b>Không tìm thấy giáo viên.</b><span>Thử nhập một phần họ tên, ví dụ “Hiền”, “Hoài”, “Lan”.</span><button onClick={()=>setQuery('')}>Hiện tất cả</button></section>}

      <footer className="v4167Footer"><span>35 giáo viên · 2 tổ chuyên môn</span><span>DTNT tỉnh Cao Bằng · 2026 – 2027</span></footer>
    </div>
  </main>;
}
