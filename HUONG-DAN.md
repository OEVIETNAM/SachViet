# Sách Việt — hướng dẫn sử dụng khung dự án

Khung dự án Astro dùng để đăng sách đã dịch tiếng Việt, phân loại theo **độ tuổi** và **thể loại**, có **tìm kiếm toàn văn** bằng Pagefind.

## Chạy thử trên máy

```bash
npm install
npm run dev
```

Mở `http://localhost:4321`.

> Lưu ý: Pagefind chỉ tạo index khi **build**, nên trang `/tim-kiem/` sẽ không tìm ra gì khi chạy `dev`. Muốn thử tìm kiếm, chạy:

```bash
npm run build
npm run preview
```

## Cách thêm một cuốn sách mới (cấu trúc chương)

Sách giờ tách làm 2 phần: **thông tin sách** (`src/content/sach/`) và **từng chương** (`src/content/chuong/`).

### Bước 1 — Thông tin sách

Tạo file `.md` trong `src/content/sach/`, ví dụ `ten-sach-cua-ban.md`:

```md
---
tieu_de: 'Tên sách'
tac_gia: 'Tên tác giả'
nguoi_dich: 'Tên người dịch (nếu có)'
mo_ta: 'Mô tả ngắn — hiện khi hover vào bìa sách ở trang chủ.'
bia: './bia/ten-sach.jpg'   # để trong src/content/sach/bia/
nhom_tuoi: 'thieu-nhi'      # thieu-nhi | thieu-nien | tuoi-teen | nguoi-lon
the_loai: ['phieu-luu', 'co-tich']
so_trang: 120
ngay_dang: 2026-07-27
noi_bat: true
---
```

File này **không cần nội dung** bên dưới frontmatter, vì nội dung nằm ở các chương.

### Bước 2 — Từng chương

Tạo thư mục `src/content/chuong/ten-sach-cua-ban/` (**tên thư mục phải trùng tên file sách ở bước 1**, bỏ đuôi `.md`), rồi thêm mỗi chương 1 file, ví dụ `01-mo-dau.md`:

```md
---
tieu_de_chuong: 'Mở đầu'
thu_tu: 1
---

Nội dung chương viết ở đây bằng Markdown bình thường.
```

`thu_tu` quyết định thứ tự chương — dùng để xếp mục lục và biết chương nào là "trước", chương nào là "kế tiếp". Đặt số 1, 2, 3... không cần trùng với số trong tên file, nhưng nên trùng cho dễ theo dõi.

Xong, sách sẽ tự xuất hiện ở trang chủ, bấm vào là vào thẳng chương 1.

## Tuỳ chỉnh cách trình bày riêng từng sách

Trang đọc tự chọn font, cỡ chữ, màu sắc... theo **nhóm tuổi** của sách. Nếu muốn một cuốn cụ thể trông khác với mặc định của nhóm tuổi (ví dụ một cuốn thiếu nhi muốn chữ to hơn nữa, hoặc một cuốn người lớn muốn nền ấm hơn), tạo file JSON cùng tên với sách trong `src/content/trinh-bay/`:

```
src/content/sach/ten-sach.md        ← thông tin sách
src/content/trinh-bay/ten-sach.json ← (tuỳ chọn) tuỳ chỉnh cách hiển thị riêng
```

File này **không bắt buộc** — sách nào không có sẽ tự dùng cấu hình mặc định theo nhóm tuổi. Chỉ cần khai báo những trường muốn ghi đè, không cần khai báo đủ:

```json
{
  "co_chu": "rat-lon",
  "hoa_tiet_nen": true,
  "mau_nhan_doc": "#ff6f91"
}
```

### Các trường có thể tuỳ chỉnh

| Trường | Giá trị | Ý nghĩa |
|---|---|---|
| `font_noi_dung` | `tron` \| `doc` \| `sach` | `tron` = Baloo 2 (vui, bo tròn — hợp thiếu nhi); `doc` = Be Vietnam Pro (trung tính); `sach` = Lora, serif — dễ đọc lâu, hợp sách người lớn |
| `co_chu` | `nho` \| `vua` \| `lon` \| `rat-lon` | Cỡ chữ nội dung, cũng tự kéo giãn dòng theo |
| `do_rong_noi_dung` | `hep` \| `vua` \| `rong` | Độ rộng cột đọc — cột hẹp giúp mắt người lớn đọc lâu đỡ mỏi |
| `bo_goc` | `vuong` \| `vua` \| `bo-tron` | Bo góc khung mục lục, nút điều hướng — bo tròn trẻ trung, vuông nghiêm túc |
| `hoa_tiet_nen` | `true` \| `false` | Có hiện chấm trang trí trên nền khi đọc không |
| `mau_nen_doc` | mã màu hex | Màu nền trang đọc |
| `mau_chu_doc` | mã màu hex | Màu chữ chính |
| `mau_nhan_doc` | mã màu hex | Màu nhãn nhỏ (tên sách, nút chương trước/kế) |

### Mặc định theo nhóm tuổi (khi không có file riêng)

- **Thiếu nhi**: font bo tròn, chữ lớn, bo góc tròn, có hoạ tiết, màu tươi
- **Thiếu niên**: font trung tính, chữ lớn, có hoạ tiết nhẹ
- **Tuổi teen**: font trung tính, chữ vừa, không hoạ tiết
- **Người lớn**: font Lora (serif), cột hẹp để đọc lâu đỡ mỏi, bo góc vuông vắn, không hoạ tiết, tông màu trầm ấm

Muốn đổi mặc định cho cả nhóm tuổi (thay vì từng cuốn), sửa trong `src/lib/trinh-bay.ts`.


- **Xáo trộn ngẫu nhiên**: mỗi lần tải trang chủ, thứ tự sách trong từng kệ được xáo lại bằng JS phía trình duyệt (không ảnh hưởng SEO vì HTML gốc vẫn có đủ sách).
- **Hover xem mô tả**: rê chuột vào bìa sách hiện lớp phủ mô tả (`mo_ta`) + nút "Đọc ngay".
- **Bấm vào sách → vào thẳng trang đọc chương 1**, không qua trang giới thiệu riêng.
- **Mục lục ẩn mặc định**: dùng thẻ `<details>`, người đọc bấm mới xổ ra — không cần JS, vẫn dùng bàn phím/đọc màn hình được.
- **Điều hướng chương trước/kế** ở cuối mỗi trang đọc, tự ẩn nút khi đang ở chương đầu/cuối.


## Cấu trúc thư mục chính

```
src/
  content.config.ts        # khai báo schema cho "sach", "chuong", "trinh-bay"
  content/sach/*.md         # thông tin từng cuốn sách (không có nội dung)
  content/sach/bia/*.jpg    # ảnh bìa sách
  content/chuong/{ten-sach}/*.md   # nội dung từng chương của mỗi sách
  content/trinh-bay/{ten-sach}.json # (tuỳ chọn) tuỳ chỉnh trình bày riêng từng sách
  lib/trinh-bay.ts          # mặc định theo nhóm tuổi + hàm gộp cấu hình
  layouts/LayoutChinh.astro # khung trang, favicon, font, header/footer
  components/
    PhanMoDau.astro         # phần mở đầu trang chủ (hero)
    KeSach.astro            # kệ sách cuộn ngang + xáo trộn ngẫu nhiên
    TheSach.astro           # thẻ sách, overlay mô tả khi hover
  pages/
    index.astro             # trang chủ, nhóm sách theo độ tuổi
    doc/[...id].astro        # trang đọc chương: mục lục + điều hướng trước/kế + trình bày riêng
    tim-kiem.astro           # trang tìm kiếm (Pagefind)
  styles/toan-cuc.css        # bảng màu, font, token thiết kế chung
public/
  favicon*, apple-touch-icon.png, manifest.json  # đã tạo sẵn từ logo bạn gửi
```

## Bảng màu & font đang dùng

- Đỏ chính `#d6293c`, vàng kim `#f0b429` — lấy cảm hứng từ logo ngôi sao vàng nền đỏ bạn gửi.
- Ngọc bích `#0e8c7f` — màu nhấn mát để nhãn độ tuổi và thể loại không bị "nặng" vì chỉ có đỏ/vàng.
- Font tiêu đề: Baloo 2 (bo tròn, trẻ trung). Font nội dung: Be Vietnam Pro (đọc tiếng Việt rõ, đủ dấu).

Muốn đổi màu/font, sửa trong `src/styles/toan-cuc.css` (phần `:root`).

## Triển khai lên GitHub Pages (đã cấu hình sẵn cho bạn)

Dự án đã được set cho repo `SachViet` của tài khoản `trungtin87`:

- `astro.config.mjs` → `site: 'https://trungtin87.github.io'`, `base: '/SachViet/'`
- `.github/workflows/deploy.yml` → tự build và deploy mỗi khi bạn push lên nhánh `main`

**Các bước làm trên GitHub:**

1. Tạo repo tên chính xác là `SachViet` trên tài khoản `trungtin87`.
2. Đẩy (push) toàn bộ thư mục dự án này lên nhánh `main`.
3. Vào repo → **Settings → Pages → Build and deployment → Source** → chọn **GitHub Actions**.
4. Push xong, vào tab **Actions** xem workflow chạy. Chạy xong, site sẽ có ở:
   `https://trungtin87.github.io/SachViet/`

> Nếu sau này bạn đổi tên repo, nhớ sửa lại `base` trong `astro.config.mjs` cho khớp.

## Triển khai thay thế: Cloudflare Pages / Netlify

Nếu sau này muốn chuyển, cả hai đều tự nhận diện Astro: lệnh build `npm run build`, thư mục output `dist`. Lúc đó nên **bỏ `base`** trong config (vì domain riêng không cần đường dẫn con).

## Việc gợi ý làm tiếp

- Thêm trang lọc riêng theo thể loại (`/the-loai/phieu-luu/`) nếu số sách nhiều.
- Thêm sitemap + RSS (`@astrojs/sitemap`, `@astrojs/rss`) khi lên domain thật.
- Nếu sau này có hàng trăm sách, cân nhắc thêm phân trang cho từng kệ.
