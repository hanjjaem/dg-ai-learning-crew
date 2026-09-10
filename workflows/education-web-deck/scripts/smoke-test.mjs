#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateDeck, renderDeck } from './render-deck.mjs';

const sampleUrl = new URL('../examples/example-deck.json', import.meta.url);
const generatedUrl = new URL('../examples/example-deck.html', import.meta.url);
const sample = JSON.parse(readFileSync(sampleUrl, 'utf8'));
const result = validateDeck(sample);

assert.deepEqual(result.errors, [], `예제 오류: ${result.errors.join('\n')}`);
assert.deepEqual(result.warnings, [], `예제 경고: ${result.warnings.join('\n')}`);
assert.equal(sample.slides.reduce((sum, slide) => sum + slide.minutes, 0), sample.durationMinutes);

const zeroMinutes = structuredClone(sample);
zeroMinutes.slides[0].minutes = 0;
assert.ok(validateDeck(zeroMinutes).errors.some(message => message.includes('slides[0].minutes')));

const duplicateId = structuredClone(sample);
duplicateId.slides[1].id = duplicateId.slides[0].id;
assert.ok(validateDeck(duplicateId).errors.some(message => message.includes('중복 ID')));

const unsafeUrl = structuredClone(sample);
unsafeUrl.slides[0].sources = [{ label: '위험한 링크', url: 'javascript:alert(1)' }];
assert.ok(validateDeck(unsafeUrl).errors.some(message => message.includes('http:// 또는 https://')));

const special = structuredClone(sample);
special.title = '$& {{TITLE}} <script>alert(1)</script>';
special.slides[0].message = '<img src=x onerror=alert(1)>';
const specialHtml = renderDeck(special);
assert.ok(specialHtml.includes('$&amp; {{TITLE}} &lt;script&gt;alert(1)&lt;/script&gt;'));
assert.ok(!specialHtml.includes('<img src=x'));

const generated = readFileSync(generatedUrl, 'utf8');
assert.equal((generated.match(/<section class="slide /g) ?? []).length, sample.slides.length);
assert.ok(!/\{\{(?:TITLE|TOPIC|DURATION|SLIDES|OVERVIEW)\}\}/.test(generated));
assert.ok(!/<script[^>]+src=/i.test(generated));
assert.ok(!/<link[^>]+href=/i.test(generated));
assert.ok(!/@import|url\(\s*['"]?https?:\/\//i.test(generated));
['overview-button', 'notes-button', 'fullscreen-button', 'help-button', 'copy-button'].forEach(value => assert.ok(generated.includes(value)));

console.log(`스모크 테스트 통과: ${sample.slides.length}장 · ${sample.durationMinutes}분 · 오프라인 의존성 없음 · 입력 방어 정상`);
