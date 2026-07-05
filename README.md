# AI生产力空间 - 站点

公众号「AI生产力空间」的文章镜像站点,部署在 GitHub Pages。
每篇文章自动同步、自动构建、自动部署,被搜索引擎索引,文末引流回公众号。

## 自动化流程

1. 主项目生成文章 → `articles/topic-XX-date.md`
2. `sync-to-site.js` 把新文章复制到 `posts/` 并 git push
3. GitHub Actions 自动跑 `build-site.js` → 生成 `docs/` 静态页
4. GitHub Pages 自动部署 → 上线,搜索引擎可索引

## 首次配置

1. 在 GitHub 建一个公开仓库,比如 `ai-productivity-notes`
2. 把这个 `site/` 目录的内容推上去:
   ```bash
   cd site
   git init
   git add .
   git commit -m "init site"
   git branch -M main
   git remote add origin https://github.com/你的用户名/ai-productivity-notes.git
   git push -u origin main
   ```
3. 仓库 Settings → Pages → Source 选 **GitHub Actions**
4. 改 `build-site.js` 顶部的 `SITE_URL` 为你的真实地址:
   `https://你的用户名.github.io/ai-productivity-notes`
   (或在 GitHub Actions 里设 SITE_URL 环境变量)
5. push 后等 1-2 分钟,访问 `https://你的用户名.github.io/ai-productivity-notes` 即可

## SEO 提交(免费流量)

站点上线后,把 sitemap 提交到搜索引擎加速收录:
- 百度:https://ziyuan.baidu.com → 添加站点 → 提交 sitemap
- 必应:https://www.bing.com/webmasters
- Google:https://search.google.com/search-console

sitemap 地址:`https://你的用户名.github.io/ai-productivity-notes/sitemap.xml`

## 文章同步

主项目里有 `sync-to-site.js`,跑一次会把 `articles/` 里的新文章同步到 `posts/` 并 push。
已集成进 `daily-publish.bat`。
