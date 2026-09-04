import type {Teacher} from './teachers';

const trimBase=(value:string|undefined,fallback:string)=>String(value||fallback).replace(/\/+$/,'');

export const PORTAL_LINKS={
  timetable:trimBase(process.env.NEXT_PUBLIC_TKB_BASE_URL,'https://thoikhoabieuntt.vercel.app'),
  report:trimBase(process.env.NEXT_PUBLIC_BAOGIANG_BASE_URL,'https://baogiangdtnt.vercel.app'),
  grades:trimBase(process.env.NEXT_PUBLIC_NHAPDIEM_BASE_URL,'https://nhapdiemntt.vercel.app')
};

export function teacherFeatureHref(feature:'timetable'|'report'|'grades',teacher:Teacher){
  if(feature==='timetable') {
    const params=new URLSearchParams({teacher:teacher.key,slug:teacher.slug,name:teacher.fullName});
    return `${PORTAL_LINKS.timetable}/?${params.toString()}`;
  }
  if(feature==='report') {
    // V4.174: mở trực tiếp app Báo giảng tĩnh và truyền slug bằng ?gv= để tránh 404 /gv/:slug.
    const params=new URLSearchParams({gv:teacher.slug});
    return `${PORTAL_LINKS.report}/app.html?${params.toString()}`;
  }
  // V4.174: truyền thông tin giáo viên cho app Nhập điểm; app đích có thể dùng hoặc bỏ qua tham số.
  const params=new URLSearchParams({teacher:teacher.key,slug:teacher.slug,name:teacher.fullName});
  return `${PORTAL_LINKS.grades}/?${params.toString()}`;
}
