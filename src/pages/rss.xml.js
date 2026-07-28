import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const goc = import.meta.env.BASE_URL;
  const tat_ca_sach = await getCollection('sach');
  const tat_ca_chuong = await getCollection('chuong');

  function duong_dan_doc_dau_tien(ma_sach) {
    const cac_chuong_cua_sach = tat_ca_chuong
      .filter((c) => c.id.startsWith(`${ma_sach}/`))
      .sort((a, b) => a.data.thu_tu - b.data.thu_tu);
    return cac_chuong_cua_sach[0] ? `doc/${cac_chuong_cua_sach[0].id}/` : '';
  }

  const sach_sap_xep = [...tat_ca_sach].sort(
    (a, b) => b.data.ngay_dang.getTime() - a.data.ngay_dang.getTime()
  );

  return rss({
    title: 'Sách Việt — sách mới đăng',
    description: 'Truyện dịch tiếng Việt mới đăng cho mọi lứa tuổi.',
    site: new URL(goc, context.site),
    items: sach_sap_xep.map((sach) => ({
      title: sach.data.tieu_de,
      description: sach.data.mo_ta,
      pubDate: sach.data.ngay_dang,
      link: `${goc}${duong_dan_doc_dau_tien(sach.id)}`,
      author: sach.data.tac_gia,
      categories: sach.data.the_loai,
    })),
  });
}
