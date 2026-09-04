import type {Teacher} from './teachers';

const trimBase=(value:string|undefined,fallback:string)=>String(value||fallback).replace(/\/+$/,'');

export const PORTAL_LINKS={
  timetable:trimBase(process.env.NEXT_PUBLIC_TKB_BASE_URL,'https://thoikhoabieuntt.vercel.app'),
  report:trimBase(process.env.NEXT_PUBLIC_BAOGIANG_BASE_URL,'https://baogiangdtnt.vercel.app'),
  grades:trimBase(process.env.NEXT_PUBLIC_NHAPDIEM_BASE_URL,'https://nhapdiemntt.vercel.app')
};

function teacherParams(teacher:Teacher){
  // V4.176: chuẩn hóa cùng một bộ tham số cho TKB / Báo giảng / Nhập điểm.
  // App đích chỉ cần đọc một trong các khóa này là tự nhận đúng giáo viên.
  return new URLSearchParams({
    gv:teacher.slug,
    teacher:teacher.key,
    slug:teacher.slug,
    name:teacher.fullName
  });
}

export function teacherFeatureHref(feature:'timetable'|'report'|'grades',teacher:Teacher){
  const params=teacherParams(teacher);
  if(feature==='timetable') return `${PORTAL_LINKS.timetable}/gv/${encodeURIComponent(teacher.slug)}`;
  if(feature==='report') return `${PORTAL_LINKS.report}/gv/${encodeURIComponent(teacher.slug)}`;
  return `${PORTAL_LINKS.grades}/gv/${encodeURIComponent(teacher.slug)}`;
}
