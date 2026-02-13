const BLOG_ID = 'eastlaw-oh';
const CATEGORY_NO = '9';
const PER_PAGE = 30;

interface NaverPost {
  logNo: string;
  title: string;
  addDate: string;
  categoryNo: string;
}

interface NaverResponse {
  postList: NaverPost[];
  totalCount: string;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') || '1';

  try {
    const url = `https://blog.naver.com/PostTitleListAsync.naver?blogId=${BLOG_ID}&categoryNo=${CATEGORY_NO}&currentPage=${page}&countPerPage=${PER_PAGE}`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', Referer: `https://blog.naver.com/${BLOG_ID}` },
    });

    if (!res.ok) throw new Error('Naver API error');

    // Naver returns invalid JSON with \' escapes — fix before parsing
    const raw = await res.text();
    const fixed = raw.replace(/\\'/g, "'");
    const data: NaverResponse = JSON.parse(fixed);

    const posts = data.postList.map((p) => {
      const title = decodeURIComponent(p.title.replace(/\+/g, ' '));
      const categoryMatch = title.match(/^\[([^\]]+)\]/);
      return {
        id: p.logNo,
        title: categoryMatch ? title.replace(categoryMatch[0], '').trim() : title,
        category: categoryMatch ? categoryMatch[1] : '기타',
        date: p.addDate.trim(),
        url: `https://blog.naver.com/${BLOG_ID}/${p.logNo}`,
      };
    });

    return Response.json({
      posts,
      totalCount: Number(data.totalCount),
      page: Number(page),
      totalPages: Math.ceil(Number(data.totalCount) / PER_PAGE),
    });
  } catch {
    return Response.json({ error: 'Failed to fetch cases' }, { status: 500 });
  }
}
