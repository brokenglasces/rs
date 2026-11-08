/* ===== 사이트 설정 (여기만 고치면 됩니다) ===== */
const SITE = {
  title: "fallen angel",
  desc: "소녀를 버리는 효과적 소년",
  logo: "images/logo.jpg",              // 프로필 이미지 경로 (없으면 자동으로 숨김)
  links: [                               // 우측 상단 링크
    { label: "dear", href: "#/dear" },
    { label: "mp3",  href: "https://music.apple.com/", external: true }
  ],
  categories: ["for protagonist", "heroine complex", "karma collector", "death driver"],
  intro: {                               // 홈 첫 화면 소개 (null이면 숨김)
    title: "weak hero class 2 (2025)",
    text: "ⓐ just call me heroine ⓑ geum seongje x oc ⓒ adults only"
  },
  footer: "나는 경계 없는 휘둘림을 사랑하는 유전자를 지녔나 봐",
  perPage: 5,
  /* 댓글/방명록: https://giscus.app 에서 발급한 값을 채우세요. 비워두면 안내문만 표시됩니다. */
  giscus: { repo: "", repoId: "", category: "Announcements", categoryId: "" }
};

/* ===== 글 목록 =====
   slug: 주소에 쓰이는 영문/숫자, date: YYYY-MM-DD, category: 위 categories 중 하나
   body: 빈 줄 = 문단, "---" = 구분선, "> " = 인용, **굵게**, *기울임*, ![](이미지), HTML도 가능 */
const POSTS = [
  { slug: "heroweene", title: "heroweene", date: "2026-10-31", category: "heroine complex",
    body: "첫 번째 문단입니다.\n줄바꿈은 이렇게 들어갑니다.\n\n두 번째 문단입니다.\n\n---\n\n> 인용문은 이렇게 씁니다." },
  { slug: "barefoot-angel", title: "맨발의 천사", date: "2026-10-06", category: "for protagonist",
    body: "본문을 여기에 쓰세요." },
  { slug: "sample-3", title: "합격점의 낭만", date: "2026-08-27", category: "karma collector",
    body: "본문을 여기에 쓰세요." }
];
