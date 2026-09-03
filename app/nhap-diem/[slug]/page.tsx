import Link from 'next/link';
import {teachers} from '../../../lib/teachers';

export default async function GradesPlaceholder({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const teacher=teachers.find(t=>t.slug===slug);
  return <main className="v4168ComingPage"><section className="v4168ComingCard"><div className="v4168ComingIcon">✓</div><small>GIÁO VIÊN NTT</small><h1>Nhập điểm</h1><p>{teacher?<>Đã chọn: <b>{teacher.fullName}</b></>:'Giáo viên chưa xác định.'}</p><div className="v4168ComingNotice">Chức năng Nhập điểm đã được chuẩn bị vị trí trong cổng. Khi có đường dẫn hệ thống Nhập điểm, chỉ cần cấu hình <code>NEXT_PUBLIC_NHAPDIEM_BASE_URL</code> là nút sẽ chuyển trực tiếp tới giáo viên tương ứng.</div><Link href="/">← Quay lại GIÁO VIÊN NTT</Link></section></main>;
}
