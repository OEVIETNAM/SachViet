#!/usr/bin/env node
/**
 * SCRIPT NHẬP SÁCH — tự động tách 1 (hoặc nhiều) file .md lớn thành:
 *   - src/content/sach/{ma-sach}.md            (metadata sách, kèm ảnh bìa nếu có)
 *   - src/content/sach/bia/{ma-sach}.webp       (ảnh bìa — trích từ ảnh base64 đầu file)
 *   - src/content/chuong/{ma-sach}/01-...md     (từng chương)
 *   - src/content/chuong/{ma-sach}/anh/...webp  (ảnh trong nội dung chương, đã nén)
 *
 * CÁCH DÙNG:
 *   Xử lý 1 file, tự đặt tên mã sách:
 *     node scripts/nhap-sach.mjs duong-dan/file-goc.md ma-sach-mong-muon
 *
 *   Xử lý CẢ THƯ MỤC (mỗi file .md trong thư mục = 1 sách, mã sách tự lấy theo tên file):
 *     node scripts/nhap-sach.mjs duong-dan/thu-muc-chua-nhieu-sach/
 *
 * ĐỊNH DẠNG FILE GỐC MONG ĐỢI:
 *   ---
 *   tieu_de: 'Tên sách'
 *   tac_gia: 'Tên tác giả'
 *   mo_ta: 'Mô tả ngắn'
 *   nhom_tuoi: 'thieu-nhi'
 *   the_loai: ['phieu-luu']
 *   ngay_dang: 2026-07-27
 *   ---
 *   ![Ảnh bìa](data:image/png;base64,iVBORw0KG...)      ← ảnh đầu trang, TRƯỚC chương đầu tiên
 *                                                          => script tự hiểu đây là ẢNH BÌA
 *   ## Tên chương 1
 *   Nội dung chương 1... có thể có ảnh:
 *   ![Mô tả ảnh](data:image/png;base64,iVBORw0KG...)
 *
 *   ## Tên chương 2
 *   Nội dung chương 2...
 *
 * Quy tắc:
 *   - Mọi dòng bắt đầu bằng "## " (2 dấu thăng) = điểm bắt đầu 1 chương mới.
 *   - Ảnh base64 nằm TRƯỚC dòng "## " đầu tiên → được xem là ẢNH BÌA, lưu vào
 *     src/content/sach/bia/ và tự điền vào trường "bia" trong metadata.
 *   - Ảnh base64 nằm TRONG một chương → được xem là ảnh minh hoạ của chương đó.
 *   - Ảnh hiểu cả 2 kiểu: Markdown ![]() và thẻ HTML <img src="...">.
 *   - Ảnh luôn được nén về webp (rộng tối đa 1600px, chất lượng 82%).
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import sharp from 'sharp';

const [, , duong_dan_vao, ma_sach_dau_vao] = process.argv;

if (!duong_dan_vao) {
  console.error('Cách dùng:');
  console.error('  node scripts/nhap-sach.mjs duong-dan/file-goc.md ma-sach   (xử lý 1 file)');
  console.error('  node scripts/nhap-sach.mjs duong-dan/thu-muc/              (xử lý cả thư mục)');
  process.exit(1);
}

if (!fs.existsSync(duong_dan_vao)) {
  console.error(`Không tìm thấy: ${duong_dan_vao}`);
  process.exit(1);
}

const goc_du_an = path.resolve(import.meta.dirname, '..');
const thu_muc_sach = path.join(goc_du_an, 'src/content/sach');
const thu_muc_bia = path.join(thu_muc_sach, 'bia');

fs.mkdirSync(thu_muc_sach, { recursive: true });
fs.mkdirSync(thu_muc_bia, { recursive: true });

function bo_dau_tieng_viet(chuoi) {
  return chuoi
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

function tao_slug(chuoi) {
  return bo_dau_tieng_viet(chuoi)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Bắt cả 2 kiểu ảnh base64: Markdown ![alt](data:...) và HTML <img src="data:...">
const REGEX_ANH_MARKDOWN = /!\[([^\]]*)\]\(data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=\s]+)\)/;
const REGEX_ANH_HTML = /<img([^>]*)\ssrc=["']data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=\s]+)["']([^>]*)>/;
const REGEX_ANH_MARKDOWN_G = new RegExp(REGEX_ANH_MARKDOWN, 'g');
const REGEX_ANH_HTML_G = new RegExp(REGEX_ANH_HTML, 'g');

async function nen_anh(base64_data, duong_dan_luu) {
  const buffer_goc = Buffer.from(base64_data.replace(/\s/g, ''), 'base64');
  fs.mkdirSync(path.dirname(duong_dan_luu), { recursive: true });

  await sharp(buffer_goc)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(duong_dan_luu);

  const kich_thuoc_goc = buffer_goc.length;
  const kich_thuoc_moi = fs.statSync(duong_dan_luu).size;
  console.log(
    `  🖼  ${path.basename(duong_dan_luu)} — ${(kich_thuoc_goc / 1024).toFixed(0)}KB → ${(kich_thuoc_moi / 1024).toFixed(0)}KB`
  );
}

/** Trích ẢNH BÌA: tìm ảnh base64 đầu tiên trong đoạn text trước chương 1, nén, lưu vào bia/.
 *  Trả về đường dẫn tương đối để điền vào frontmatter "bia", hoặc null nếu không có ảnh. */
async function trich_anh_bia(phan_dau, ma_sach) {
  const khop_markdown = phan_dau.match(REGEX_ANH_MARKDOWN);
  const khop_html = phan_dau.match(REGEX_ANH_HTML);
  const khop = khop_markdown || khop_html;
  if (!khop) return null;

  const du_lieu_base64 = khop_markdown ? khop_markdown[3] : khop_html[3];
  const duong_dan_luu = path.join(thu_muc_bia, `${ma_sach}.webp`);
  await nen_anh(du_lieu_base64, duong_dan_luu);
  return `./bia/${ma_sach}.webp`;
}

/** Trích + thay toàn bộ ảnh base64 trong nội dung MỘT chương bằng file .webp đã nén. */
async function trich_va_thay_anh_chuong(noi_dung, thu_muc_anh_chuong, ma_chuong) {
  let ket_qua = noi_dung;
  let dem = 0;

  for (const trung of [...noi_dung.matchAll(REGEX_ANH_MARKDOWN_G)]) {
    dem += 1;
    const [toan_bo, alt, , du_lieu] = trung;
    const ten_file = `${String(dem).padStart(2, '0')}-${tao_slug(alt) || ma_chuong}.webp`;
    await nen_anh(du_lieu, path.join(thu_muc_anh_chuong, ten_file));
    ket_qua = ket_qua.replace(toan_bo, `![${alt}](./anh/${ten_file})`);
  }

  for (const trung of [...ket_qua.matchAll(REGEX_ANH_HTML_G)]) {
    dem += 1;
    const [toan_bo, truoc_src, , du_lieu, sau_src] = trung;
    const ten_file = `${String(dem).padStart(2, '0')}-${ma_chuong}.webp`;
    await nen_anh(du_lieu, path.join(thu_muc_anh_chuong, ten_file));
    ket_qua = ket_qua.replace(toan_bo, `<img${truoc_src} src="./anh/${ten_file}"${sau_src}>`);
  }

  return ket_qua;
}

async function xu_ly_mot_sach(duong_dan_file, ma_sach) {
  console.log(`\n📘 ${ma_sach}  (${path.basename(duong_dan_file)})`);

  const noi_dung_file = fs.readFileSync(duong_dan_file, 'utf-8');
  const { data: metadata, content: noi_dung_than } = matter(noi_dung_file);

  // --- Tách phần "đầu trang" (trước chương 1) ra khỏi các chương ---
  const dong = noi_dung_than.split('\n');
  const dong_phan_dau = [];
  const cac_chuong = [];
  let chuong_hien_tai = null;

  for (const dong_hien_tai of dong) {
    const khop_tieu_de = dong_hien_tai.match(/^##\s+(.+)$/);
    if (khop_tieu_de) {
      if (chuong_hien_tai) cac_chuong.push(chuong_hien_tai);
      chuong_hien_tai = { tieu_de: khop_tieu_de[1].trim(), dong_noi_dung: [] };
    } else if (chuong_hien_tai) {
      chuong_hien_tai.dong_noi_dung.push(dong_hien_tai);
    } else {
      dong_phan_dau.push(dong_hien_tai);
    }
  }
  if (chuong_hien_tai) cac_chuong.push(chuong_hien_tai);

  const phan_dau = dong_phan_dau.join('\n');

  // --- Trích ảnh bìa từ phần đầu trang, nếu có ---
  const duong_dan_bia = await trich_anh_bia(phan_dau, ma_sach);
  if (duong_dan_bia) {
    metadata.bia = duong_dan_bia;
  }

  // Cảnh báo nếu phần đầu trang còn chữ đáng kể ngoài ảnh bìa (tránh mất nội dung không để ý)
  const chu_con_lai = phan_dau.replace(REGEX_ANH_MARKDOWN_G, '').replace(REGEX_ANH_HTML_G, '').trim();
  if (chu_con_lai.length > 20) {
    console.warn(
      `  ⚠️  Có ${chu_con_lai.length} ký tự chữ trước chương 1 (ngoài ảnh bìa) đã bị bỏ qua, không đưa vào sách:`
    );
    console.warn(`      "${chu_con_lai.slice(0, 80)}${chu_con_lai.length > 80 ? '...' : ''}"`);
  }

  // --- Ghi metadata sách ---
  const duong_dan_sach = path.join(thu_muc_sach, `${ma_sach}.md`);
  fs.writeFileSync(duong_dan_sach, matter.stringify('', metadata).trim() + '\n');
  console.log(`  ✅ Metadata: ${path.relative(goc_du_an, duong_dan_sach)}${duong_dan_bia ? ' (đã gắn ảnh bìa)' : ''}`);

  if (cac_chuong.length === 0) {
    console.warn('  ⚠️  Không tìm thấy tiêu đề chương nào (dòng bắt đầu bằng "## "). Không có chương nào được tạo.');
    return;
  }

  const thu_muc_chuong = path.join(goc_du_an, 'src/content/chuong', ma_sach);
  const thu_muc_anh_chuong = path.join(thu_muc_chuong, 'anh');
  fs.mkdirSync(thu_muc_anh_chuong, { recursive: true });

  let thu_tu = 0;
  for (const chuong of cac_chuong) {
    thu_tu += 1;
    const slug_chuong = tao_slug(chuong.tieu_de);
    const ma_chuong = `${String(thu_tu).padStart(2, '0')}-${slug_chuong}`;
    let noi_dung_chuong = chuong.dong_noi_dung.join('\n').trim();

    noi_dung_chuong = await trich_va_thay_anh_chuong(noi_dung_chuong, thu_muc_anh_chuong, ma_chuong);

    const front_matter_chuong = matter.stringify(noi_dung_chuong, { tieu_de_chuong: chuong.tieu_de, thu_tu });
    fs.writeFileSync(path.join(thu_muc_chuong, `${ma_chuong}.md`), front_matter_chuong);
    console.log(`  ✅ Chương ${thu_tu}: ${chuong.tieu_de}`);
  }

  console.log(`  🎉 Xong: ${cac_chuong.length} chương.`);
}

async function chay() {
  const la_thu_muc = fs.statSync(duong_dan_vao).isDirectory();

  if (la_thu_muc) {
    const cac_file = fs.readdirSync(duong_dan_vao).filter((f) => f.toLowerCase().endsWith('.md'));
    if (cac_file.length === 0) {
      console.error(`Không thấy file .md nào trong thư mục: ${duong_dan_vao}`);
      process.exit(1);
    }
    console.log(`Tìm thấy ${cac_file.length} file .md, bắt đầu xử lý từng sách...`);
    for (const ten_file of cac_file) {
      const ma_sach = tao_slug(path.basename(ten_file, path.extname(ten_file)));
      await xu_ly_mot_sach(path.join(duong_dan_vao, ten_file), ma_sach);
    }
  } else {
    if (!ma_sach_dau_vao) {
      console.error('Xử lý 1 file thì cần thêm mã sách: node scripts/nhap-sach.mjs file.md ma-sach');
      process.exit(1);
    }
    await xu_ly_mot_sach(duong_dan_vao, ma_sach_dau_vao);
  }

  console.log('\n🏁 Hoàn tất toàn bộ.');
}

chay().catch((loi) => {
  console.error('❌ Có lỗi khi chạy script:', loi);
  process.exit(1);
});
