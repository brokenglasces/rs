/* ===== 사이트 설정 (여기만 고치면 됩니다) ===== */
const SITE = {
  title: "my blog",
  desc: "한 줄 소개를 적어주세요",
  categories: ["category A", "category B", "category C"],
  intro: { title: "hello", text: "소개 문구를 적어주세요." },   // null이면 숨김
  footer: "© my blog",
  perPage: 6,
  /* mp3 플레이어: src를 비우면 숨겨집니다. 파일은 music/ 폴더에 넣고 경로를 적으세요. */
  music: { src: "", title: "track name" },
};

/* ===== 글 목록 =====
   slug: 주소용 영문/숫자(겹치지 않게), date: YYYY-MM-DD, category: 위 categories 중 하나
   secret: 비밀글은 encrypt.html 로 만든 결과를 붙여넣으세요 (body 대신 secret 사용)
   body: 빈 줄=문단, "---"=구분선, "> "=인용, "## "=소제목, **굵게**, *기울임*, ![](이미지), HTML 가능 */
const POSTS = [
  { slug: "secret-sample", title: "비밀글 예시 (비밀번호: 1234)", date: "2026-11-01", category: "category A",
    secret: { salt: "6MXjJKgofgYuilDg/X5vDw==", iv: "mTx5cn5MS5IZHygG", data: "wGPCxO8OBX2QIEgYzoeMwmZCuLi4sm15V41mqhZsxiTx3NbWXnkA3r1pdabmqJLIs4M/NLC8PeTKiR4HtD4HDgX8rAkJWuH42maNYGqQCVVX4/bhMB7CFopsyijcVLUMzA==", hint: "비밀번호는 1234 입니다. (예시)" } },
  { slug: "first", title: "첫 번째 글", date: "2026-10-31", category: "category A",
    body: "본문을 여기에 쓰세요.\n줄바꿈은 이렇게 들어갑니다.\n\n새 문단은 빈 줄로 나눕니다.\n\n---\n\n> 인용문은 이렇게 씁니다." },
  { slug: "second", title: "두 번째 글", date: "2026-10-06", category: "category B",
    body: "본문을 여기에 쓰세요." },
  { slug: "third", title: "세 번째 글", date: "2026-08-27", category: "category C",
    body: "본문을 여기에 쓰세요." }
];
