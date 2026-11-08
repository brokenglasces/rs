/* ===== 사이트 설정 (여기만 고치면 됩니다) ===== */
const SITE = {
  title: "Broken Glasses",
  desc: "한때 태양을 볼 수 있는 눈을 원했지",
  profile: "images/profile.jpg",   // 프로필 사진 경로 (파일이 없으면 자동으로 안 보임, 흑백으로 표시됨)
  categories: ["ventricle", "morgue", "sharp objects"],
  intro: { title: "spirituality", text: "⑴adult female ⑵triggers 사망 · 유혈 · 스톡홀름 증후군 · 폭력 및 살인 동조 · 포르노그래피 ⑶only cbc" },   // null이면 숨김
  footer: "© architect",
  perPage: 6,
  /* mp3 플레이어: src를 비우면 숨겨집니다. 파일은 music/ 폴더에 넣고 경로를 적으세요. */
  music: { src: "", title: "track name" },
};

/* 글은 이제 posts/ 폴더의 .md 파일로 씁니다. (README 참고) */
