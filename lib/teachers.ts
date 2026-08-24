export type Teacher={
  key:string;
  slug:string;
  fullName:string;
  subject:string;
  team:'KHTN'|'KHXH';
  role?:'Hiệu trưởng'|'Phó Hiệu trưởng';
  detail?:string;
};

export const teachers:Teacher[]=[
{key:'Phương',slug:'phuong',fullName:'Lê Thị Lan Phương',subject:'GDĐP',team:'KHXH',role:'Hiệu trưởng',detail:'GDĐP 10, 11, 12'},
{key:'Phong',slug:'phong',fullName:'Nguyễn Thế Phong',subject:'Toán',team:'KHTN',role:'Phó Hiệu trưởng'},
{key:'Hà Oanh',slug:'ha-oanh',fullName:'Hà Thị Thu Oanh',subject:'Toán',team:'KHTN',role:'Phó Hiệu trưởng'},
{key:'T.Tuấn',slug:'t-tuan',fullName:'Nguyễn Thanh Tuấn',subject:'Toán',team:'KHTN'},
{key:'V.Diệp',slug:'v-diep',fullName:'Vi Thị Diệp',subject:'Toán',team:'KHTN'},
{key:'Hường',slug:'huong',fullName:'Lâm Thị Thu Hường',subject:'Toán',team:'KHTN'},
{key:'L.Tuấn',slug:'l-tuan',fullName:'Lưu Công Tuấn',subject:'Vật lí',team:'KHTN'},
{key:'N.Ngọc',slug:'n-ngoc',fullName:'Nông Thị Bích Ngọc',subject:'Vật lí',team:'KHTN'},
{key:'T.Ngọc',slug:'t-ngoc',fullName:'Trương Thị Mỹ Ngọc',subject:'Vật lí',team:'KHTN'},
{key:'Chi',slug:'chi',fullName:'Vũ Huyền Chi',subject:'Hoá học',team:'KHTN'},
{key:'Na',slug:'na',fullName:'Nguyễn Thị Na',subject:'Hoá học',team:'KHTN'},
{key:'Quyên',slug:'quyen',fullName:'Nguyễn Hồng Quyên',subject:'Sinh học',team:'KHTN'},
{key:'Huệ',slug:'hue',fullName:'Nông Thị Huệ',subject:'Sinh học',team:'KHTN'},
{key:'M.Anh',slug:'m-anh',fullName:'Ma Thị Anh',subject:'Tin học',team:'KHTN'},
{key:'Lanh',slug:'lanh',fullName:'Nông Hồng Lanh',subject:'Tin học',team:'KHTN'},
{key:'Long',slug:'long',fullName:'Lương Vũ Long',subject:'Công nghệ',team:'KHTN'},
{key:'Đ.Diệp',slug:'d-diep',fullName:'Đàm Thị Diệp',subject:'Ngữ văn',team:'KHXH'},
{key:'K.Diệp',slug:'k-diep',fullName:'Hoàng Khánh Diệp',subject:'Ngữ văn',team:'KHXH'},
{key:'V.Anh',slug:'v-anh',fullName:'Trần Thị Vân Anh',subject:'Ngữ văn',team:'KHXH'},
{key:'Hiền',slug:'hien',fullName:'Lý Thu Hiền',subject:'Ngữ văn',team:'KHXH'},
{key:'Bằng',slug:'bang',fullName:'Nông Thị Thu Bằng',subject:'Ngữ văn',team:'KHXH'},
{key:'Thoa',slug:'thoa',fullName:'Lê Kim Thoa',subject:'Lịch sử',team:'KHXH'},
{key:'Ng.Liễu',slug:'ng-lieu',fullName:'Nguyễn Thị Liễu',subject:'Lịch sử',team:'KHXH'},
{key:'L.Thủy',slug:'l-thuy',fullName:'Lương Thị Thanh Thủy',subject:'Địa lí',team:'KHXH'},
{key:'T.Oanh',slug:'t-oanh',fullName:'Trần Thị Kim Oanh',subject:'Địa lí',team:'KHXH'},
{key:'Hà',slug:'ha',fullName:'Hoàng Thị Ngọc Hà',subject:'GDKTPL',team:'KHXH'},
{key:'Mai',slug:'mai',fullName:'Lê Thị Mai',subject:'Tiếng Anh',team:'KHXH'},
{key:'Dung',slug:'dung',fullName:'Hà Thị Phương Dung',subject:'Tiếng Anh',team:'KHXH'},
{key:'Vân',slug:'van',fullName:'Hoàng Thị Thanh Vân',subject:'Tiếng Anh',team:'KHXH'},
{key:'Đàn',slug:'dan',fullName:'Triệu Thị Đàn',subject:'Tiếng Anh',team:'KHXH'},
{key:'Liễu',slug:'lieu',fullName:'Nguyễn Thị Ngọc Liễu',subject:'GDTC',team:'KHXH'},
{key:'Thắng',slug:'thang',fullName:'Trần Chiến Thắng',subject:'GDTC',team:'KHXH'},
{key:'Hiếu',slug:'hieu',fullName:'Nông Trung Hiếu',subject:'GDQPAN',team:'KHXH'}
];

export const leadership=teachers.filter(t=>Boolean(t.role));
