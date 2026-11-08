(function () {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = (d) => d.replace(/-/g, ".");
  const posts = POSTS.slice().sort((a, b) => (a.date < b.date ? 1 : -1));

  /* 마크다운 라이트 */
  function inline(t) {
    return t
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  }
  function render(src) {
    return src.split(/\n\s*\n/).map((b) => {
      b = b.trim();
      if (!b) return "";
      if (b[0] === "<") return b;
      if (/^-{3,}$/.test(b)) return "<hr>";
      if (b.startsWith("## ")) return "<h2>" + inline(esc(b.slice(3))) + "</h2>";
      if (b.startsWith("### ")) return "<h3>" + inline(esc(b.slice(4))) + "</h3>";
      if (b.startsWith("> ")) return "<blockquote>" + inline(esc(b.replace(/^> ?/gm, "")).replace(/\n/g, "<br>")) + "</blockquote>";
      return "<p>" + inline(esc(b)).replace(/\n/g, "<br>") + "</p>";
    }).join("");
  }

  /* 헤더 */
  document.title = SITE.title;
  $("#siteTitle").textContent = SITE.title;
  $("#siteDesc").textContent = SITE.desc;
  $("#foot").textContent = SITE.footer;
  const img = $("#logoImg");
  img.onerror = () => $("#logo").classList.add("none");
  img.src = SITE.logo;
  $("#links").innerHTML = SITE.links.map((l) =>
    `<a href="${l.href}"${l.external ? ' target="_blank" rel="noopener"' : ""}>${esc(l.label)}</a>`
  ).join('<span class="dot">·</span>');

  function drawCats(active) {
    $("#cats").innerHTML = "<ul>" + SITE.categories.map((c) =>
      `<li><a href="#/c/${encodeURIComponent(c)}" class="${c === active ? "on" : ""}">${esc(c)}</a></li>`).join("") + "</ul>";
  }

  /* 댓글/방명록 (giscus) */
  function giscus(el, term) {
    const g = SITE.giscus;
    if (!g.repo || !g.repoId) {
      el.innerHTML = '<p class="note">댓글이 아직 설정되지 않았어요. README의 giscus 설정을 따라 data.js에 값을 채워주세요.</p>';
      return;
    }
    const s = document.createElement("script");
    s.src = "https://giscus.app/client.js";
    const attrs = { repo: g.repo, "repo-id": g.repoId, category: g.category, "category-id": g.categoryId,
      mapping: "specific", term: term, strict: "0", "reactions-enabled": "0", "emit-metadata": "0",
      "input-position": "top", theme: "light", lang: "ko", loading: "lazy" };
    Object.keys(attrs).forEach((k) => s.setAttribute("data-" + k, attrs[k]));
    s.crossOrigin = "anonymous"; s.async = true;
    el.appendChild(s);
  }

  /* 화면들 */
  function list(items, page, base, showIntro) {
    const per = SITE.perPage, total = Math.max(1, Math.ceil(items.length / per));
    page = Math.min(Math.max(1, page), total);
    const slice = items.slice((page - 1) * per, page * per);
    let h = "";
    if (showIntro && SITE.intro)
      h += `<section class="intro"><h2>${esc(SITE.intro.title)}</h2><p>${esc(SITE.intro.text)}</p></section>`;
    h += slice.length
      ? '<ul class="list">' + slice.map((p) =>
          `<li><a href="#/p/${p.slug}"><span class="t">${esc(p.title)}</span><span class="d">${fmt(p.date)}</span></a></li>`).join("") + "</ul>"
      : '<p class="empty">아직 글이 없어요.</p>';
    h += '<nav class="paging">' +
      (page > 1 ? `<a href="${base}${page - 1}">prev</a>` : '<span class="off">prev</span>') +
      (page < total ? `<a href="${base}${page + 1}">next</a>` : '<span class="off">next</span>') + "</nav>";
    $("#app").innerHTML = h;
  }

  function route() {
    const parts = (location.hash.replace(/^#\/?/, "") || "").split("/").map(decodeURIComponent);
    $("#pages").open = false;
    window.scrollTo(0, 0);
    let active = "";
    if (parts[0] === "p") {
      const p = posts.find((x) => x.slug === parts[1]);
      if (!p) { $("#app").innerHTML = '<p class="empty">글을 찾을 수 없어요.</p>'; drawCats(""); return; }
      active = p.category;
      document.title = p.title + " :: " + SITE.title;
      $("#app").innerHTML = `<article><h1 class="post-title">${esc(p.title)}</h1><p class="post-meta">${fmt(p.date)}</p>` +
        `<div class="body">${render(p.body)}</div><section class="comments" id="cm"></section></article>`;
      giscus($("#cm"), "post-" + p.slug);
    } else if (parts[0] === "dear") {
      document.title = "dear :: " + SITE.title;
      $("#app").innerHTML = '<section class="comments" id="cm"></section>';
      giscus($("#cm"), "guestbook");
    } else if (parts[0] === "c") {
      active = parts[1] || "";
      document.title = active + " :: " + SITE.title;
      list(posts.filter((p) => p.category === active), parseInt(parts[2], 10) || 1, "#/c/" + encodeURIComponent(active) + "/", false);
    } else {
      document.title = SITE.title;
      const pg = parts[0] === "page" ? parseInt(parts[1], 10) || 1 : 1;
      list(posts, pg, "#/page/", pg === 1);
    }
    drawCats(active);
  }
  window.addEventListener("hashchange", route);
  route();
})();
