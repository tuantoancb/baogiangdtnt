import type{Metadata}from'next';import'./styles.css';
export const metadata:Metadata={title:'Lịch Báo Giảng – DTNT Cao Bằng',description:'Cổng Báo giảng điện tử đa giáo viên'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="vi"><body>{children}</body></html>}
