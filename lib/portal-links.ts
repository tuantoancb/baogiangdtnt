import type {Teacher} from './teachers';

const trimBase=(value:string|undefined,fallback:string)=>String(value||fallback).replace(/\/+$/,'');

export const PORTAL_LINKS={
  timetable:trimBase(process.env.NEXT_PUBLIC_TKB_BASE_URL,'https://thoikhoabieuntt.vercel.app'),
  report:trimBase(process.env.NEXT_PUBLIC_BAOGIANG_BASE_URL,'https://baogiangdtnt.vercel.app'),
  grades:trimBase(process.env.NEXT_PUBLIC_NHAPDIEM_BASE_URL,'https://nhapdiemntt.vercel.app')
};

export function teacherFeatureHref(feature:'timetable'|'report'|'grades',teacher:Teacher){
  if(feature==='timetable') return `${PORTAL_LINKS.timetable}/gv/${teacher.slug}`;
  if(feature==='report') return `${PORTAL_LINKS.report}/gv/${teacher.slug}`;
  // V4.169: Nhập điểm hiện dùng URL gốc do chưa có quy ước route cá nhân theo giáo viên.
  return PORTAL_LINKS.grades;
}
