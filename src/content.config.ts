import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Bộ sưu tập "sach": mỗi file md trong src/content/sach/ là một cuốn sách
const bo_suu_tap_sach = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sach' }),
  schema: ({ image }) =>
    z.object({
      tieu_de: z.string(),
      tac_gia: z.string(),
      nguoi_dich: z.string().optional(),
      mo_ta: z.string(),
      bia: image().optional(),
      // Nhóm tuổi: dùng để lọc theo độ tuổi trên trang chủ
      nhom_tuoi: z.enum(['thieu-nhi', 'thieu-nien', 'tuoi-teen', 'nguoi-lon']),
      // Có thể gắn nhiều thể loại cho một cuốn sách
      the_loai: z.array(z.string()),
      so_trang: z.number().optional(),
      ngay_dang: z.date(),
      noi_bat: z.boolean().default(false),
    }),
});

// Bộ sưu tập "chuong": mỗi file là một chương sách.
// Tổ chức theo thư mục: src/content/chuong/{ma-sach}/{thu-tu}-{ten-chuong}.md
// => id sinh ra có dạng "ma-sach/thu-tu-ten-chuong", dùng để biết chương thuộc sách nào.
const bo_suu_tap_chuong = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/chuong' }),
  schema: z.object({
    tieu_de_chuong: z.string(),
    thu_tu: z.number(),
  }),
});

// Bộ sưu tập "trinh_bay": file JSON tùy chỉnh cách hiển thị trang đọc của TỪNG sách.
// Tên file phải trùng với id của sách trong "sach", ví dụ:
// src/content/sach/ten-sach.md  <-->  src/content/trinh-bay/ten-sach.json
// Không bắt buộc phải có — sách nào không có file này sẽ dùng cấu hình mặc định theo nhóm tuổi.
const bo_suu_tap_trinh_bay = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/trinh-bay' }),
  schema: z.object({
    font_noi_dung: z.enum(['tron', 'doc', 'sach']).optional(),
    co_chu: z.enum(['nho', 'vua', 'lon', 'rat-lon']).optional(),
    do_rong_noi_dung: z.enum(['hep', 'vua', 'rong']).optional(),
    bo_goc: z.enum(['vuong', 'vua', 'bo-tron']).optional(),
    hoa_tiet_nen: z.boolean().optional(),
    mau_nen_doc: z.string().optional(),
    mau_chu_doc: z.string().optional(),
    mau_nhan_doc: z.string().optional(),
  }),
});

export const collections = {
  sach: bo_suu_tap_sach,
  chuong: bo_suu_tap_chuong,
  'trinh-bay': bo_suu_tap_trinh_bay,
};

