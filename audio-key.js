/* 녹음 파일의 바깥 저장소(Supabase Storage) 주소.

   Supabase 저장소는 파일 이름에 **영문 · 숫자 · 일부 기호만** 받는다(한글을 넣으면 「Invalid key」).
   우리 녹음은 `dict/먹다.mp3` 처럼 한글 이름이 많다. 그래서 올릴 때와 틀 때 **같은 규칙으로** 이름을 바꾼다 —
   경로 조각마다 encodeURIComponent 를 하고 `%` 를 `!` 로 바꾼다(`%` 는 못 쓰고 `!` 는 쓸 수 있다).
     dict/먹다.mp3  →  dict/!EB!A8!B9!EB!8B!A4.mp3
   우리 파일 이름에는 원래 `!` 가 없어서(audioSlug 가 기호를 `_` 로 바꾼다) 겹치지 않는다.

   이 파일은 **사이트(app.module.js)와 올리는 도구(tools/upload-audio.mjs)가 같이** 쓴다 — 규칙이 두 군데로
   갈리면 올린 파일을 사이트가 못 찾는다.

   AUDIO_REMOTE 가 비어 있으면 바깥 저장소를 안 쓴다(사이트에 있는 사본만). 파일을 다 올린 뒤에 주소를 넣는다.
   넣은 뒤에도 바깥에 없는 파일은 사이트 사본으로, 그것도 없으면 브라우저 목소리로 물러선다(app.module.js 의 audioSrcs). */
export const AUDIO_REMOTE = 'https://tjgoevtvobvmlyefgxel.supabase.co/storage/v1/object/public/audio/';

export const audioKey = (path) => String(path).split('/')
  .map((s) => encodeURIComponent(s).replace(/%/g, '!').replace(/~/g, '!7E'))
  .join('/');
