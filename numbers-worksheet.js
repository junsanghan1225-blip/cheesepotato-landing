/* 수사(숫자) 학습지(운영자 2026-10-14 「수사 조금 정리해서 학습지로」) — 손으로 쓴 쪽 numbers-worksheet/ 의 손잡이.
   인쇄는 브라우저 인쇄(PDF 로 저장). 「정답지」를 누르면 정답 쪽만 인쇄한다. CSP 때문에 인라인 스크립트 대신 이 파일. */
(function () {
  const body = document.body;
  const go = (ans) => { body.classList.toggle('show-ans', ans); window.print(); };
  document.getElementById('nwPrint')?.addEventListener('click', () => go(false));
  document.getElementById('nwAns')?.addEventListener('click', () => go(true));
  window.addEventListener('afterprint', () => body.classList.remove('show-ans'));
})();
