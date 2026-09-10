#!/usr/bin/env node
import { readFileSync, writeFileSync, realpathSync, existsSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const kinds = ['opening', 'agenda', 'concept', 'demo', 'exercise', 'reflection', 'resources', 'qa', 'closing'];
const layouts = ['hero', 'cards', 'split', 'steps', 'prompt'];
const labels = { opening: '시작', agenda: '오늘의 흐름', concept: '핵심 개념', demo: '시연', exercise: '직접 해보기', reflection: '돌아보기', resources: '다시 찾을 자료', qa: '질문과 답변', closing: '다음 행동' };
const rootKeys = ['title', 'topic', 'audience', 'durationMinutes', 'assumptions', 'objectives', 'slides'];
const slideKeys = ['id', 'kind', 'layout', 'title', 'message', 'minutes', 'items', 'prompt', 'success', 'fallback', 'notes', 'sources'];
const plainObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonempty = value => typeof value === 'string' && value.trim().length > 0;

/** Non-mutating validation. Errors block rendering; warnings request editorial review. */
export function validateDeck(data) {
  const errors = [], warnings = [];
  const error = (path, message) => errors.push(`${path}: ${message}`);
  const unknown = (value, keys, path) => Object.keys(value).filter(key => !keys.includes(key)).forEach(key => error(`${path}.${key}`, '지원하지 않는 필드입니다.'));
  const string = (value, path, limit = 0) => {
    if (!nonempty(value)) error(path, '비어 있지 않은 문자열이 필요합니다.');
    else if (limit && value.length > limit) warnings.push(`${path}: ${limit}자를 넘습니다. 분할 또는 축약하고 실제 화면을 확인하세요.`);
  };
  const strings = (value, path, min = 0, limit = 0) => {
    if (!Array.isArray(value)) return error(path, '문자열 배열이 필요합니다.');
    if (value.length < min) error(path, `최소 ${min}개가 필요합니다.`);
    value.forEach((item, index) => string(item, `${path}[${index}]`, limit));
  };
  const number = (value, path, positive = false) => {
    if (typeof value !== 'number' || !Number.isFinite(value) || (positive ? value <= 0 : value < 0)) error(path, positive ? '0보다 큰 유한수가 필요합니다.' : '0 이상의 유한수가 필요합니다.');
  };
  if (!plainObject(data)) return { errors: ['deck: JSON 객체가 필요합니다.'], warnings };
  unknown(data, rootKeys, 'deck');
  ['title', 'topic', 'audience'].forEach(key => string(data[key], key, 120));
  number(data.durationMinutes, 'durationMinutes', true);
  strings(data.assumptions, 'assumptions');
  strings(data.objectives, 'objectives', 1, 160);
  if (!Array.isArray(data.slides) || data.slides.length === 0) return { errors: [...errors, 'slides: 최소 한 장의 슬라이드 배열이 필요합니다.'], warnings };
  const ids = new Set();
  data.slides.forEach((slide, index) => {
    const path = `slides[${index}]`;
    if (!plainObject(slide)) return error(path, '객체가 필요합니다.');
    unknown(slide, slideKeys, path);
    ['id', 'title', 'message'].forEach(key => string(slide[key], `${path}.${key}`, key === 'title' ? 45 : key === 'message' ? 140 : 0));
    if (nonempty(slide.id)) {
      if (ids.has(slide.id)) error(`${path}.id`, '중복 ID입니다.');
      ids.add(slide.id);
    }
    if (!kinds.includes(slide.kind)) error(`${path}.kind`, `다음 중 하나여야 합니다: ${kinds.join(', ')}`);
    if (!layouts.includes(slide.layout)) error(`${path}.layout`, `다음 중 하나여야 합니다: ${layouts.join(', ')}`);
    number(slide.minutes, `${path}.minutes`, true);
    if ('items' in slide) strings(slide.items, `${path}.items`, 0, 100);
    const bounds = { cards: [1, 4], split: [2, 2], steps: [1, 5] }[slide.layout];
    if (bounds && (!Array.isArray(slide.items) || slide.items.length < bounds[0] || slide.items.length > bounds[1])) error(`${path}.items`, `${slide.layout}에는 ${bounds[0]}~${bounds[1]}개 항목이 필요합니다.`);
    ['prompt', 'success', 'fallback'].forEach(key => {
      if (key in slide) string(slide[key], `${path}.${key}`, key === 'prompt' ? 1600 : 140);
    });
    if ((slide.layout === 'prompt' || slide.kind === 'exercise') && !nonempty(slide.prompt)) error(`${path}.prompt`, '프롬프트 레이아웃과 실습에는 실행할 프롬프트가 필요합니다.');
    if (['demo', 'exercise'].includes(slide.kind)) ['success', 'fallback'].forEach(key => {
      if (!nonempty(slide[key])) error(`${path}.${key}`, '시연·실습에는 성공 기준과 실패 시 대안이 필요합니다.');
    });
    if (!plainObject(slide.notes)) error(`${path}.notes`, 'say, ask, transition을 가진 발표자 노트가 필요합니다.');
    else {
      unknown(slide.notes, ['say', 'ask', 'transition'], `${path}.notes`);
      ['say', 'ask', 'transition'].forEach(key => string(slide.notes[key], `${path}.notes.${key}`));
    }
    if ('sources' in slide) {
      if (!Array.isArray(slide.sources)) error(`${path}.sources`, '출처 배열이 필요합니다.');
      else slide.sources.forEach((source, sourceIndex) => {
        const sourcePath = `${path}.sources[${sourceIndex}]`;
        if (!plainObject(source)) return error(sourcePath, 'label, url 객체가 필요합니다.');
        unknown(source, ['label', 'url'], sourcePath);
        string(source.label, `${sourcePath}.label`, 100);
        string(source.url, `${sourcePath}.url`);
        try {
          if (typeof source.url !== 'string' || !/^https?:\/\//i.test(source.url) || !['https:', 'http:'].includes(new URL(source.url).protocol)) throw new Error();
        } catch { error(`${sourcePath}.url`, 'http:// 또는 https:// 주소만 허용합니다.'); }
      });
    }
    if (Array.isArray(slide.items) && slide.items.length > 5) warnings.push(`${path}.items: 항목이 많습니다. 슬라이드 분할을 검토하세요.`);
  });
  const present = new Set(data.slides.filter(plainObject).map(slide => slide.kind));
  ['opening', 'agenda', 'resources', 'qa', 'closing'].forEach(kind => { if (!present.has(kind)) error('slides', `${kind} 슬라이드가 필요합니다.`); });
  const total = data.slides.reduce((sum, slide) => sum + (plainObject(slide) && Number.isFinite(slide.minutes) ? slide.minutes : 0), 0);
  if (Number.isFinite(data.durationMinutes) && Math.abs(total - data.durationMinutes) > 0.01000001) error('durationMinutes', `슬라이드 시간 합계 ${total}분과 일치하지 않습니다 (허용 오차 0.01분).`);
  return { errors, warnings };
}

const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const list = (items, className = '') => `<ul class="${className}">${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;

export function renderDeck(data) {
  const { errors } = validateDeck(data);
  if (errors.length) throw new Error(errors.join('\n'));
  const sections = data.slides.map((slide, index) => {
    const items = slide.items?.length ? (slide.layout === 'steps'
      ? `<ol class="items">${slide.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ol>`
      : list(slide.items, 'items')) : '';
    const prompt = slide.prompt ? `<div class="prompt-block"><div class="prompt-head"><span>에이전트에게 전달할 프롬프트</span><button type="button" class="copy-button js-only" data-copy="prompt-${index}">프롬프트 복사</button></div><pre id="prompt-${index}" tabindex="0">${escapeHtml(slide.prompt)}</pre></div>` : '';
    const outcomes = slide.success || slide.fallback ? `<dl class="outcomes">${slide.success ? `<div><dt>성공 기준</dt><dd>${escapeHtml(slide.success)}</dd></div>` : ''}${slide.fallback ? `<div><dt>막히면 이렇게</dt><dd>${escapeHtml(slide.fallback)}</dd></div>` : ''}</dl>` : '';
    const sources = slide.sources?.length ? `<ul class="sources" aria-label="참고 자료">${slide.sources.map(source => `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)} <span aria-hidden="true">↗</span></a></li>`).join('')}</ul>` : '';
    const context = index === 0 ? `<details class="brief"><summary>교육 목표와 준비 조건</summary><p>대상: ${escapeHtml(data.audience)}</p><h3>교육 목표</h3>${list(data.objectives)}${data.assumptions.length ? `<h3>준비 조건·가정</h3>${list(data.assumptions)}` : ''}</details>` : '';
    return `<section class="slide layout-${slide.layout}" id="slide-${index + 1}" data-kind="${slide.kind}" aria-labelledby="heading-${index}" tabindex="-1">
      <header class="slide-meta"><span>${escapeHtml(labels[slide.kind])}</span><span>${escapeHtml(slide.minutes)}분 · ${String(index + 1).padStart(2, '0')} / ${data.slides.length}</span></header>
      <div class="slide-body"><h${index === 0 ? 1 : 2} id="heading-${index}">${escapeHtml(slide.title)}</h${index === 0 ? 1 : 2}><p class="message">${escapeHtml(slide.message)}</p>${items}${prompt}${outcomes}${sources}${context}</div>
      <details class="speaker-notes"><summary>발표자 노트</summary><dl><dt>이렇게 말하기</dt><dd>${escapeHtml(slide.notes.say)}</dd><dt>청중에게 묻기</dt><dd>${escapeHtml(slide.notes.ask)}</dd><dt>다음 장 연결</dt><dd>${escapeHtml(slide.notes.transition)}</dd></dl></details>
    </section>`;
  }).join('\n');
  const overview = data.slides.map((slide, index) => `<li><button type="button" data-go="${index}"><span>${String(index + 1).padStart(2, '0')} · ${escapeHtml(labels[slide.kind])} · ${escapeHtml(slide.minutes)}분</span><strong>${escapeHtml(slide.title)}</strong></button></li>`).join('');
  const values = { TITLE: escapeHtml(data.title), TOPIC: escapeHtml(data.topic), DURATION: escapeHtml(data.durationMinutes), SLIDES: sections, OVERVIEW: overview };
  const template = readFileSync(new URL('../assets/deck-shell.html', import.meta.url), 'utf8');
  return template.replace(/\{\{(TITLE|TOPIC|DURATION|SLIDES|OVERVIEW)\}\}/g, (_, key) => values[key]);
}

function canonicalPath(path) {
  const absolute = resolve(path);
  const canonical = existsSync(absolute) ? realpathSync(absolute) : resolve(realpathSync(dirname(absolute)), absolute.slice(dirname(absolute).length + 1));
  return process.platform === 'win32' ? canonical.toLowerCase() : canonical;
}

function main(args) {
  if (args.includes('--help') || args.length === 0) {
    console.log('사용법: node scripts/render-deck.mjs <deck.json> <output.html> [--force]\n검증만: node scripts/render-deck.mjs <deck.json> [<output.html>] --check\n기존 출력은 --force 없이는 덮어쓰지 않습니다. 입력과 출력은 항상 달라야 합니다.');
    return;
  }
  const unknown = args.filter(arg => arg.startsWith('--') && !['--check', '--force'].includes(arg));
  if (unknown.length) throw new Error(`알 수 없는 옵션: ${unknown.join(', ')}`);
  const positional = args.filter(arg => !arg.startsWith('--'));
  const [input, output] = positional;
  if (!input || positional.length > 2 || (!args.includes('--check') && !output)) throw new Error('입력 JSON과 출력 HTML 경로가 필요합니다. --help를 참고하세요.');
  if (output) {
    const inputStat = statSync(input), outputStat = existsSync(output) ? statSync(output) : null;
    if (canonicalPath(input) === canonicalPath(output) || (outputStat && inputStat.dev === outputStat.dev && inputStat.ino === outputStat.ino)) throw new Error('입력 JSON과 출력 HTML은 같은 파일일 수 없습니다.');
  }
  const data = JSON.parse(readFileSync(input, 'utf8').replace(/^\uFEFF/, ''));
  const { errors, warnings } = validateDeck(data);
  warnings.forEach(warning => console.warn(`경고: ${warning}`));
  if (errors.length) throw new Error(errors.join('\n'));
  if (args.includes('--check')) return console.log(`검증 완료: ${data.slides.length}장 · ${data.durationMinutes}분 · 경고 ${warnings.length}건 (파일 변경 없음)`);
  writeFileSync(output, renderDeck(data), { encoding: 'utf8', flag: args.includes('--force') ? 'w' : 'wx' });
  console.log(`생성 완료: ${resolve(output)} · ${data.slides.length}장 · ${data.durationMinutes}분`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { main(process.argv.slice(2)); }
  catch (error) { console.error(`발표자료 생성 실패: ${error.message}`); process.exitCode = 1; }
}
