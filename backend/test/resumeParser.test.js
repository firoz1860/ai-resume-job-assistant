import assert from 'node:assert/strict';
import test from 'node:test';
import { buildResumeDiff, parseResumeText } from '../src/utils/resumeParser.js';

test('parseResumeText extracts common resume sections', () => {
  const parsed = parseResumeText(`
Summary
Full stack developer building React and Node.js apps.
Skills
React, Node.js, MongoDB, JWT
Experience
Built APIs for job tracking.
Projects
CareerOS AI with voice interview and application tracker.
Education
B.Tech Computer Science
Links
https://github.com/example
`);

  assert.match(parsed.summary, /Full stack developer/);
  assert.match(parsed.skills, /React/);
  assert.match(parsed.experience, /Built APIs/);
  assert.match(parsed.projects, /CareerOS AI/);
  assert.match(parsed.education, /B.Tech/);
  assert.match(parsed.links, /github/);
});

test('buildResumeDiff reports newly added keywords', () => {
  const diff = buildResumeDiff(
    'Built web apps with React.',
    'Built JWT-secured React and Node.js APIs with MongoDB and measurable dashboard impact.'
  );

  assert.ok(diff.keywordsAdded.length > 0);
  assert.match(diff.reason, /keyword/);
});

