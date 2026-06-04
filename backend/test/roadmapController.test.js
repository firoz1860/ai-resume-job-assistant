import assert from 'node:assert/strict';
import test from 'node:test';
import { createRoadmap } from '../src/controllers/roadmapController.js';

function mockResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test('createRoadmap generates distinct weekly tasks and projects', async () => {
  const req = {
    user: { _id: 'test-user' },
    body: {
      currentSkills: 'HTML, CSS, React, Node, MongoDB, MySQL',
      targetRole: 'Software Developer',
      timePerDay: '1 hour',
      duration: '4 weeks',
      level: 'Intermediate',
    },
  };
  const res = mockResponse();

  await createRoadmap(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.plan.length, 4);

  const taskGroups = res.body.data.plan.map((week) => week.dailyTasks.join('\n'));
  const projects = res.body.data.plan.map((week) => week.miniProject);

  assert.equal(new Set(taskGroups).size, 4);
  assert.equal(new Set(projects).size, 4);
});
