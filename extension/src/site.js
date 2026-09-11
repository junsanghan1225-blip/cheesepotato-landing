/* 사이트로 잇는 주소를 한 군데서 만든다.
 *
 * 익스텐션 화면 네 군데(말풍선·팝업·새 탭·설정)가 다 「사이트에서 보기」를
 * 낸다. 주소를 각자 이어 붙이면 사이트 구조가 바뀌었을 때 세 군데만 고치고
 * 한 군데를 빠뜨린다 — 그 한 군데는 눌러 보기 전에는 깨진 줄 모른다. */
export const SITE = 'https://everykoreans.com';

const e = encodeURIComponent;

/* 낱말 — 뜻풀이·예문이 다 있는 정적 쪽. 검색에서 들어오는 쪽과 같다. */
export const dictUrl = (head) => `${SITE}/dictionary/${e(head)}.html`;

/* 낱말 — 앱 사전. 발음을 듣고 단어장에 담을 수 있다. */
export const dictAppUrl = (head) => `${SITE}/#dictionary/${e(head)}`;

/* 문법 표현 — 뜻풀이·예문·대화문이 있는 정적 쪽. */
export const pointUrl = (id) => `${SITE}/sentence/${e(id)}.html`;

/* 문법 표현 — 앱. 그 표현으로 제 문장을 써 보는 자리다. */
export const pointAppUrl = (id) => `${SITE}/#learn/sentence/${e(id)}`;

/* 녹음된 발음. 사전 표제어 4,200여 개에만 있다.
   `-ex` 가 붙은 것은 그 낱말의 예문을 읽은 것이다.
   assets/audio/00-README.txt 의 audioSlug 규칙을 그대로 따른다. */
const slug = (s) => String(s).replace(/[^가-힣ㄱ-ㅎㅏ-ㅣA-Za-z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '').slice(0, 64);
export const sayUrl = (head, kind) =>
  `${SITE}/assets/audio/dict/${e(slug(head))}${kind === 'ex' ? '-ex' : ''}.mp3`;
