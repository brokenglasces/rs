(function () {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = (d) => d.replace(/-/g, ".");
  let posts = [], ready = false;
  const cache = {};
  const main = $("#app"), drawer = $("#drawer"), pgBtn = $("#pgBtn");
  const OUT_MS = 230;

  /* markdown-lite */
  function inline(t) {
    return t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
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
      if (b.startsWith("> ")) return "<blockquote>" + inline(esc(b.replace(/^> ?/gm, "")).replace(/\n/g, "<br>")) + "</blockquote>";
      return "<p>" + inline(esc(b)).replace(/\n/g, "<br>") + "</p>";
    }).join("");
  }

  /* header / footer */
  $("#siteTitle").textContent = SITE.title;
  $("#siteDesc").textContent = SITE.desc;
  $("#foot").textContent = SITE.footer;
  if (SITE.profile) {
    const av = $("#avatar");
    av.onload = () => (av.hidden = false);
    av.onerror = () => (av.hidden = true);
    av.src = SITE.profile;
  }

  /* pages drawer (아래로 펼쳐짐) */
  function setDrawer(open) {
    drawer.classList.toggle("open", open);
    pgBtn.setAttribute("aria-expanded", open);
    drawer.querySelectorAll("li").forEach((li, i) => (li.style.transitionDelay = open ? 60 + i * 55 + "ms" : "0ms"));
  }
  pgBtn.addEventListener("click", () => setDrawer(!drawer.classList.contains("open")));

  function drawCats(active) {
    const all = [{ label: "all", href: "#/" }].concat(SITE.categories.map((c) => ({ label: c, href: "#/c/" + encodeURIComponent(c), key: c })));
    $("#cats").innerHTML = all.map((c) =>
      `<li><a href="${c.href}" class="${(c.key || "") === active ? "on" : ""}">${esc(c.label)}</a></li>`).join("");
    $("#pgLabel").textContent = active ? "archive · " + active : "archive";
    setDrawer(drawer.classList.contains("open"));
  }

  /* mp3 player */
  if (SITE.music && SITE.music.src) {
    const audio = new Audio(SITE.music.src); audio.loop = true;
    const btn = $("#player"); btn.hidden = false;
    $("#trackName").textContent = SITE.music.title;
    btn.addEventListener("click", () => {
      if (audio.paused) audio.play().then(() => { btn.classList.add("on"); btn.setAttribute("aria-label", "음악 정지"); }).catch(() => {});
      else { audio.pause(); btn.classList.remove("on"); btn.setAttribute("aria-label", "음악 재생"); }
    });
  }

  /* secret (AES-GCM) */
  const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  async function decrypt(sec, pw) {
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: b64(sec.salt), iterations: 150000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    const buf = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(sec.iv) }, key, b64(sec.data));
    return new TextDecoder().decode(buf);
  }
  const LOCK = '<svg class="lock" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.3" aria-label="비밀글"><rect x="2" y="5.5" width="8" height="5.5"/><path d="M4 5.5V3.8a2 2 0 0 1 4 0v1.7"/></svg>';

  /* views */
  function list(items, page, base, showIntro) {
    const per = SITE.perPage, total = Math.max(1, Math.ceil(items.length / per));
    page = Math.min(Math.max(1, page), total);
    const slice = items.slice((page - 1) * per, page * per);
    let h = "";
    if (showIntro && SITE.intro) h += `<section class="intro"><h2>${esc(SITE.intro.title)}</h2><p>${esc(SITE.intro.text)}</p></section>`;
    h += slice.length
      ? '<ul class="list">' + slice.map((p) => `<li><a href="#/p/${p.slug}"><span class="d">${fmt(p.date)}</span><span class="t">${esc(p.title)}${p.secret ? LOCK : ""}</span></a></li>`).join("") + "</ul>"
      : '<p class="empty">아직 글이 없어요.</p>';
    if (total > 1) h += '<nav class="paging">' +
      (page > 1 ? `<a href="${base}${page - 1}">← prev</a>` : '<span class="off">← prev</span>') +
      (page < total ? `<a href="${base}${page + 1}">next →</a>` : '<span class="off">next →</span>') + "</nav>";
    main.innerHTML = h;
  }

  async function loadPost(p) {
    const box = $("#pb");
    try {
      if (!cache[p.slug]) {
        const r = await fetch("posts/" + encodeURIComponent(p.slug) + ".md", { cache: "no-cache" });
        if (!r.ok) throw new Error(r.status);
        const raw = (await r.text()).replace(/\r\n/g, "\n");
        const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
        const fm = {};
        if (m) m[1].split("\n").forEach((l) => { const i = l.indexOf(":"); if (i > 0) fm[l.slice(0, i).trim()] = l.slice(i + 1).trim(); });
        cache[p.slug] = { fm: fm, body: m ? raw.slice(m[0].length) : raw };
      }
      if (location.hash.indexOf(p.slug) < 0 || !document.body.contains(box)) return;
      const c = cache[p.slug];
      if (c.fm.secret) {
        const t = c.fm.secret.split(".");
        box.innerHTML = `<div class="secret-box"><p>${esc(c.fm.hint || "비밀글입니다. 비밀번호를 입력해 주세요.")}</p><form class="secret-form"><input type="password" placeholder="password" autocomplete="off" aria-label="비밀번호"><button type="submit">열기</button></form><p class="secret-err" role="alert"></p></div>`;
        bindSecret(p, { salt: t[0], iv: t[1], data: t[2] });
      } else box.innerHTML = render(c.body);
    } catch (_) {
      box.innerHTML = '<p class="empty">글을 불러오지 못했어요.</p>';
    }
  }

  function bindSecret(p, sec) {
    const box = $("#pb"), form = box.querySelector("form"), input = form.querySelector("input"), err = box.querySelector(".secret-err");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      err.textContent = "";
      try {
        const text = await decrypt(sec, input.value);
        box.classList.remove("in");
        box.innerHTML = render(text);
        void box.offsetWidth; box.classList.add("in");
      } catch (_) {
        err.textContent = "비밀번호가 맞지 않아요.";
        form.classList.remove("shake"); void form.offsetWidth; form.classList.add("shake");
        input.select();
      }
    });
    input.focus({ preventScroll: true });
  }

  function route() {
    const parts = (location.hash.replace(/^#\/?/, "") || "").split("/").map(decodeURIComponent);
    let active = "";
    if (parts[0] === "p") {
      const p = posts.find((x) => x.slug === parts[1]);
      if (!p) { main.innerHTML = '<p class="empty">글을 찾을 수 없어요.</p>'; }
      else {
        active = p.category; document.title = p.title + " :: " + SITE.title;
        main.innerHTML = `<article><h1 class="post-title">${esc(p.title)}${p.secret ? LOCK : ""}</h1><p class="post-meta">${fmt(p.date)} · ${esc(p.category)}</p>` +
          `<div class="body" id="pb"></div><a class="back" href="#/c/${encodeURIComponent(p.category)}">← ${esc(p.category)}</a></article>`;
        loadPost(p);
      }
    } else if (parts[0] === "c") {
      active = parts[1] || ""; document.title = active + " :: " + SITE.title;
      list(posts.filter((p) => p.category === active), parseInt(parts[2], 10) || 1, "#/c/" + encodeURIComponent(active) + "/", false);
    } else {
      document.title = SITE.title;
      const pg = parts[0] === "page" ? parseInt(parts[1], 10) || 1 : 1;
      list(posts, pg, "#/page/", pg === 1);
    }
    drawCats(active);
    window.scrollTo(0, 0);
    main.classList.remove("out"); void main.offsetWidth; main.classList.add("in");
  }

  /* 링크 클릭 → 블러 아웃 → 이동 → 블러 인 */
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#/"]');
    if (!a || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    const to = a.getAttribute("href");
    if (to === location.hash || (to === "#/" && !location.hash)) { setDrawer(false); return; }
    setDrawer(false);
    main.classList.remove("in"); main.classList.add("out");
    setTimeout(() => { location.hash = to; }, OUT_MS);
  });
  window.addEventListener("hashchange", () => ready && route());
  fetch("posts.json", { cache: "no-cache" })
    .then((r) => r.json())
    .then((j) => { posts = j.sort((x, y) => (x.date < y.date ? 1 : -1)); })
    .catch(() => { posts = []; })
    .then(() => { ready = true; route(); });
})();
