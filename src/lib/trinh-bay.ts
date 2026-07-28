// Xử lý cấu hình TRÌNH BÀY của trang đọc: mỗi sách có thể có 1 file JSON riêng
// trong src/content/trinh-bay/{ma-sach}.json để tùy biến font, cỡ chữ, màu sắc...
// Nếu sách không có file này, hệ thống dùng cấu hình mặc định theo nhóm tuổi.

export type NhomTuoi = 'thieu-nhi' | 'thieu-nien' | 'tuoi-teen' | 'nguoi-lon';
export type KieuFontDoc = 'tron' | 'doc' | 'sach';
export type CoChu = 'nho' | 'vua' | 'lon' | 'rat-lon';
export type DoRongNoiDung = 'hep' | 'vua' | 'rong';
export type BoGocDoc = 'vuong' | 'vua' | 'bo-tron';

export interface CauHinhTrinhBay {
  /** Font phần nội dung: 'tron' = Baloo 2 (vui, bo tròn), 'doc' = Be Vietnam Pro (trung tính),
   *  'sach' = Lora (serif, dễ đọc lâu, hợp sách người lớn) */
  font_noi_dung: KieuFontDoc;
  co_chu: CoChu;
  do_rong_noi_dung: DoRongNoiDung;
  bo_goc: BoGocDoc;
  /** Có hiện hoạ tiết nền (chấm/sao trang trí) khi đọc hay không — hợp sách thiếu nhi, không hợp sách người lớn */
  hoa_tiet_nen: boolean;
  mau_nen_doc: string;
  mau_chu_doc: string;
  mau_nhan_doc: string;
}

const MAC_DINH_THEO_NHOM_TUOI: Record<NhomTuoi, CauHinhTrinhBay> = {
  'thieu-nhi': {
    font_noi_dung: 'tron',
    co_chu: 'lon',
    do_rong_noi_dung: 'vua',
    bo_goc: 'bo-tron',
    hoa_tiet_nen: true,
    mau_nen_doc: '#fff8ec',
    mau_chu_doc: '#2a1810',
    mau_nhan_doc: '#0e8c7f',
  },
  'thieu-nien': {
    font_noi_dung: 'doc',
    co_chu: 'lon',
    do_rong_noi_dung: 'vua',
    bo_goc: 'vua',
    hoa_tiet_nen: true,
    mau_nen_doc: '#fff8ec',
    mau_chu_doc: '#2a1810',
    mau_nhan_doc: '#0e8c7f',
  },
  'tuoi-teen': {
    font_noi_dung: 'doc',
    co_chu: 'vua',
    do_rong_noi_dung: 'vua',
    bo_goc: 'vua',
    hoa_tiet_nen: false,
    mau_nen_doc: '#fff8ec',
    mau_chu_doc: '#2a1810',
    mau_nhan_doc: '#0e8c7f',
  },
  'nguoi-lon': {
    font_noi_dung: 'sach',
    co_chu: 'vua',
    do_rong_noi_dung: 'hep',
    bo_goc: 'vuong',
    hoa_tiet_nen: false,
    mau_nen_doc: '#fbf7f0',
    mau_chu_doc: '#241a12',
    mau_nhan_doc: '#7a6a5c',
  },
};

export function layTrinhBayMacDinh(nhom_tuoi: string): CauHinhTrinhBay {
  return MAC_DINH_THEO_NHOM_TUOI[nhom_tuoi as NhomTuoi] ?? MAC_DINH_THEO_NHOM_TUOI['tuoi-teen'];
}

/** Gộp cấu hình mặc định (theo nhóm tuổi) với file tùy chỉnh riêng của sách, nếu có.
 *  Chỉ những trường được khai báo trong file tùy chỉnh mới bị ghi đè. */
export function gopTrinhBay(
  mac_dinh: CauHinhTrinhBay,
  tuy_chinh: Partial<CauHinhTrinhBay> | undefined
): CauHinhTrinhBay {
  return { ...mac_dinh, ...(tuy_chinh ?? {}) };
}

const FONT_THEO_KIEU: Record<KieuFontDoc, string> = {
  tron: "'Baloo 2', 'Be Vietnam Pro', sans-serif",
  doc: "'Be Vietnam Pro', system-ui, sans-serif",
  sach: "'Lora', 'Be Vietnam Pro', serif",
};

const CO_CHU_REM: Record<CoChu, string> = {
  nho: '0.95rem',
  vua: '1.05rem',
  lon: '1.2rem',
  'rat-lon': '1.4rem',
};

const DONG_THEO_CO_CHU: Record<CoChu, string> = {
  nho: '1.7',
  vua: '1.8',
  lon: '1.9',
  'rat-lon': '2',
};

const RONG_THEO_KIEU: Record<DoRongNoiDung, string> = {
  hep: '620px',
  vua: '720px',
  rong: '860px',
};

const BO_GOC_THEO_KIEU: Record<BoGocDoc, string> = {
  vuong: '4px',
  vua: '14px',
  'bo-tron': '26px',
};

/** Chuyển cấu hình đã gộp thành chuỗi CSS custom properties, gắn thẳng vào style="" của trang đọc. */
export function taoBienCssTrinhBay(cau_hinh: CauHinhTrinhBay): string {
  return [
    `--font-doc:${FONT_THEO_KIEU[cau_hinh.font_noi_dung]}`,
    `--co-chu-doc:${CO_CHU_REM[cau_hinh.co_chu]}`,
    `--dong-doc:${DONG_THEO_CO_CHU[cau_hinh.co_chu]}`,
    `--rong-doc:${RONG_THEO_KIEU[cau_hinh.do_rong_noi_dung]}`,
    `--bo-goc-doc:${BO_GOC_THEO_KIEU[cau_hinh.bo_goc]}`,
    `--nen-doc:${cau_hinh.mau_nen_doc}`,
    `--chu-doc:${cau_hinh.mau_chu_doc}`,
    `--nhan-doc:${cau_hinh.mau_nhan_doc}`,
  ].join(';');
}
