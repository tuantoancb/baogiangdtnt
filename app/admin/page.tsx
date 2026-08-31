'use client';
import Link from 'next/link';
import {FormEvent,useEffect,useMemo,useState} from 'react';

type Mode='active'|'readonly'|'locked';
type TeacherAccess={key:string;fullName:string;slug:string;subject:string;team:string;mode:Mode;status:string;firstAccess:string|number|Date|null;lastAccess:string|number|Date|null;lastWrite:string|number|Date|null;useCount:number;note:string;updatedAt:string|number|Date|null};
type Dashboard={stats:{total:number;active:number;readonly:number;locked:number;used:number;neverUsed:number};teachers:TeacherAccess[];sheetName:string};

async function gas(action:string,args:unknown[]=[]){
  const res=await fetch('/api/gas',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action,args}),cache:'no-store'});
  const data=await res.json(); if(!res.ok||!data.ok)throw new Error(data?.error?.message||'Yêu cầu thất bại.'); return data.result;
}
function fmt(v:TeacherAccess['lastAccess']){if(!v)return '—';const d=new Date(v as string);return Number.isNaN(d.getTime())?'—':d.toLocaleString('vi-VN',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});}
function useLabel(t:TeacherAccess){if(!t.firstAccess)return 'Chưa dùng';if(!t.lastAccess)return 'Đã dùng';const diff=Date.now()-new Date(t.lastAccess as string).getTime();if(diff>7*86400000)return 'Lâu chưa dùng';return 'Đã dùng';}

export default function AdminPage(){
  const [token,setToken]=useState(''); const [password,setPassword]=useState(''); const [data,setData]=useState<Dashboard|null>(null);
  const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const [q,setQ]=useState(''); const [mode,setMode]=useState<'ALL'|Mode>('ALL');
  useEffect(()=>{const t=sessionStorage.getItem('v4161AdminToken')||'';if(t){setToken(t);void load(t)}},[]);
  async function load(t=token){if(!t)return;setBusy(true);setError('');try{setData(await gas('adminGetDashboard',[t]));}catch(e){setError(e instanceof Error?e.message:String(e));sessionStorage.removeItem('v4161AdminToken');setToken('');setData(null)}finally{setBusy(false)}}
  async function login(e:FormEvent){e.preventDefault();setBusy(true);setError('');try{const r=await gas('adminLogin',[password]);sessionStorage.setItem('v4161AdminToken',r.token);setToken(r.token);setPassword('');await load(r.token)}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
  async function changeStatus(t:TeacherAccess,newMode:Mode){if(newMode==='locked'&&!confirm(`Khóa app của ${t.fullName}? Giáo viên sẽ không đọc/ghi dữ liệu bằng link này.`))return;setBusy(true);setError('');try{await gas('adminSetTeacherStatus',[token,t.key,newMode,t.note||'']);await load(token)}catch(e){setError(e instanceof Error?e.message:String(e));setBusy(false)}}
  async function logout(){try{if(token)await gas('adminLogout',[token])}catch{}sessionStorage.removeItem('v4161AdminToken');setToken('');setData(null)}
  const filtered=useMemo(()=>{const n=q.trim().toLocaleLowerCase('vi');return (data?.teachers||[]).filter(t=>(mode==='ALL'||t.mode===mode)&&(!n||`${t.fullName} ${t.key} ${t.subject} ${t.team}`.toLocaleLowerCase('vi').includes(n)))},[data,q,mode]);
  if(!token||!data)return <main className="adminShell"><section className="adminLoginCard"><div className="adminShield">🔐</div><span className="adminEyebrow">QUẢN TRỊ GIÁO VIÊN · V4.161</span><h1>Đăng nhập quản trị</h1><p>Quản lý giáo viên đã dùng/chưa dùng, chuyển Chỉ xem hoặc khóa app ở backend.</p><form onSubmit={login}><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mật khẩu quản trị" autoFocus/><button disabled={busy||!password}>{busy?'Đang kiểm tra…':'Đăng nhập'}</button></form>{error&&<div className="adminError">{error}</div>}<Link href="/">← Về Cổng giáo viên</Link></section></main>;
  return <main className="adminShell"><section className="adminTop"><div><span className="adminEyebrow">QUẢN TRỊ GIÁO VIÊN · V4.161</span><h1>Quản lý sử dụng Báo giảng</h1><p>Dữ liệu quản lý lưu trong sheet <b>{data.sheetName}</b>. Khóa/Chỉ xem được kiểm tra ở backend.</p></div><div className="adminTopActions"><button onClick={()=>load()} disabled={busy}>↻ Làm mới</button><button onClick={logout}>Đăng xuất</button><Link href="/">Cổng giáo viên →</Link></div></section>
    <section className="adminStats"><article><b>{data.stats.total}</b><span>Tổng giáo viên</span></article><article><b>{data.stats.used}</b><span>Đã từng dùng</span></article><article><b>{data.stats.neverUsed}</b><span>Chưa dùng</span></article><article><b>{data.stats.readonly}</b><span>Chỉ xem</span></article><article className="danger"><b>{data.stats.locked}</b><span>Đã khóa</span></article></section>
    {error&&<div className="adminError wide">{error}</div>}
    <section className="adminPanel"><div className="adminToolbar"><label className="adminSearch">⌕<input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm giáo viên, môn, tổ…"/></label><select value={mode} onChange={e=>setMode(e.target.value as 'ALL'|Mode)}><option value="ALL">Tất cả trạng thái</option><option value="active">Hoạt động</option><option value="readonly">Chỉ xem</option><option value="locked">Đã khóa</option></select><span>{filtered.length} giáo viên</span></div>
      <div className="adminTableWrap"><table className="adminTable"><thead><tr><th>Giáo viên</th><th>Sử dụng</th><th>Lần truy cập cuối</th><th>Lần ghi cuối</th><th>Lượt</th><th>Quyền</th><th>App</th></tr></thead><tbody>{filtered.map(t=><tr key={t.key} className={t.mode==='locked'?'isLocked':''}><td><b>{t.fullName}</b><small>{t.subject||'—'} · {t.team||'—'} · {t.key}</small></td><td><span className={`useBadge ${t.firstAccess?'used':'never'}`}>{useLabel(t)}</span></td><td>{fmt(t.lastAccess)}</td><td>{fmt(t.lastWrite)}</td><td className="center">{t.useCount||0}</td><td><select className={`modeSelect ${t.mode}`} value={t.mode} disabled={busy} onChange={e=>changeStatus(t,e.target.value as Mode)}><option value="active">Hoạt động</option><option value="readonly">Chỉ xem</option><option value="locked">Đã khóa</option></select></td><td><Link className="openTeacher" href={`/gv/${t.slug}`} target="_blank">Mở ↗</Link></td></tr>)}</tbody></table></div>
    </section></main>;
}
