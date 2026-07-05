/**
 * AI生产力空间 - GitHub Pages 站点构建脚本
 * 把 posts/*.md 转成静态 HTML,输出到 docs/
 * 由 GitHub Actions 在 push 时自动执行
 */
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const ROOT = __dirname;
const POSTS_DIR = path.join(ROOT, 'posts');
const OUT_DIR = path.join(ROOT, 'docs');
const TEMPLATE_DIR = path.join(ROOT, 'template');

// ⚠️ 改成你的站点地址(建好仓库后填,用于 sitemap/SEO)
const SITE_URL = process.env.SITE_URL || 'https://hushui2026.github.io/ai-productivity-notes';

// 文末引流钩子(每篇自动追加,把搜索流量导回公众号)
const HOOK = `<hr>
<p style="text-align:center;color:#666;margin-top:2em;">
本文来自公众号「<strong>AI生产力空间</strong>」<br>
每天一个 AI 技巧,工作效率翻倍。<br>
微信搜索 <strong>AI生产力空间</strong> 关注,回复【资料】领取 AI 工具包。
</p>`;

marked.setOptions({ breaks: true, gfm: true });

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { fm: {}, content: raw };
  const fm = {};
  m[1].split('\n').forEach(line => {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].trim();
  });
  return { fm, content: m[2].trim() };
}

function slugify(fm, file) {
  if (fm.topic_id && fm.date) return `topic-${fm.topic_id}-${fm.date}`;
  return file.replace(/\.md$/, '');
}

function buildPost(raw, file) {
  const { fm, content } = parseFrontmatter(raw);
  const slug = slugify(fm, file);
  const html = marked.parse(content);
  const template = fs.readFileSync(path.join(TEMPLATE_DIR, 'post.html'), 'utf-8');
  const keywords = (fm.keywords || '').split(',').map(k => `<span class="tag">${k.trim()}</span>`).join(' ');
  const full = template
    .replace(/{{title}}/g, (fm.title || file).replace(/</g, '&lt;'))
    .replace(/{{date}}/g, fm.date || '')
    .replace(/{{keywords}}/g, keywords)
    .replace(/{{content}}/g, html + HOOK);
  const outFile = path.join(OUT_DIR, 'posts', `${slug}.html`);
  fs.writeFileSync(outFile, full, 'utf-8');
  const excerpt = content.replace(/[#*`\n>\-]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);
  return { slug, title: fm.title || file, date: fm.date || '', excerpt };
}

function buildIndex(posts) {
  const template = fs.readFileSync(path.join(TEMPLATE_DIR, 'index.html'), 'utf-8');
  const sorted = [...posts].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const list = sorted.map(p =>
    `<li><a href="posts/${p.slug}.html"><span class="date">${p.date}</span><span class="ptitle">${p.title}</span></a><p class="excerpt">${p.excerpt}</p></li>`
  ).join('\n');
  return template.replace(/{{list}}/g, list);
}

function buildSitemap(posts) {
  const urls = ['', ...posts.map(p => `posts/${p.slug}.html`)]
    .map(u => `  <url><loc>${SITE_URL.replace(/\/$/, '')}/${u}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

function main() {
  fs.mkdirSync(path.join(OUT_DIR, 'posts'), { recursive: true });
  fs.copyFileSync(path.join(TEMPLATE_DIR, 'style.css'), path.join(OUT_DIR, 'style.css'));

  const files = fs.existsSync(POSTS_DIR) ? fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md')) : [];
  if (files.length === 0) {
    console.log('⚠️ posts/ 目录没有文章,生成空站点');
  }
  const posts = files.map(f => buildPost(fs.readFileSync(path.join(POSTS_DIR, f), 'utf-8'), f));

  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), buildIndex(posts), 'utf-8');
  fs.writeFileSync(path.join(OUT_DIR, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL.replace(/\/$/,'')}/sitemap.xml\n`, 'utf-8');
  fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), buildSitemap(posts), 'utf-8');

  console.log(`✓ build 完成,${posts.length} 篇文章 → docs/`);
  console.log(`  站点地址:${SITE_URL}`);
}

main();
