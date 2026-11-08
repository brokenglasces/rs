// posts/*.md 를 읽어 posts.json(목록)을 만든다. GitHub Actions가 자동 실행하며, 로컬에서는 `node scripts/build.js`
const fs = require("fs"), path = require("path");
const dir = path.join(__dirname, "..", "posts");
const out = [];
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".md") || f.startsWith("_")) continue;
  const raw = fs.readFileSync(path.join(dir, f), "utf8").replace(/\r\n/g, "\n");
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) { console.warn("front matter 없음:", f); continue; }
  const fm = {};
  m[1].split("\n").forEach((l) => { const i = l.indexOf(":"); if (i > 0) fm[l.slice(0, i).trim()] = l.slice(i + 1).trim(); });
  if (fm.draft === "true") continue;
  const item = { slug: f.replace(/\.md$/, ""), title: fm.title || f, date: fm.date || "", category: fm.category || "" };
  if (fm.secret) { item.secret = true; if (fm.hint) item.hint = fm.hint; }
  out.push(item);
}
out.sort((a, b) => (a.date < b.date ? 1 : -1));
fs.writeFileSync(path.join(__dirname, "..", "posts.json"), JSON.stringify(out, null, 2));
console.log(out.length + "개 글 → posts.json");
