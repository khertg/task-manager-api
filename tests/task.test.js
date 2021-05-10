const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const {
  userOneId,
  userOne,
  userTwoId,
  userTwo,
  taskOne,
  taskTwo,
  taskThree,
  setupDatabase,
} = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should create task for user', async () => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: 'From my test',
    })
    .expect(201);

  // Assert task is save in database
  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
  expect(task.completed).toEqual(false);
});

test('Should not create task with invalid description/completed', async () => {
  // Invalid description
  await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: '',
    })
    .expect(400);

  // Invalid completed
  await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: 'Testing',
      completed: 'testing',
    })
    .expect(400);
});

test('Should fetch users task', async () => {
  const response = await request(app)
    .get('/tasks/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .expect(200);

  expect(response.body.length).toEqual(2);
});

test('Should delete user task', async () => {
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .expect(200);
});

test('Should not delete task if unauthenticated', async () => {
  await request(app).delete(`/tasks/${taskOne._id}`).expect(401);
});

test('Should not update other users task', async () => {
  await request(app)
    .patch(`/tasks/${taskThree._id}/me`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ description: 'test update' })
    .expect(404);
});

test('Should fetch user task by id', async () => {
  await request(app)
    .get(`/tasks/${taskThree._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .expect(200);
});

test('Should not fetch user task by id if unauthenticated', async () => {
  await request(app).get(`/tasks/${taskThree._id}`).expect(401);
});

test('Should not fetch other users task by id', async () => {
  await request(app)
    .get(`/tasks/${taskThree._id}/me`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .expect(404);
});

test('Should fetch only completed tasks', async () => {
  const response = await request(app)
    .get('/tasks/me?completed=true')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .expect(200);

  response.body.map((task) => {
    expect(task.completed).toBe(true);
  });
});

test('Should fetch only incomplete tasks', async () => {
  const response = await request(app)
    .get('/tasks/me?completed=false')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .expect(200);

  response.body.map((task) => {
    expect(task.completed).toBe(false);
  });
});

test('Should fetch page of tasks', async () => {
  const response = await request(app)
    .get('/tasks/me?limit=1&skip=1')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .expect(200);
});

test('Should not delete other users task', async () => {
  const response = await request(app)
    .delete(`/tasks/${taskOne._id}/me`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);

  const task = await Task.findById(taskOne._id);
  expect(task).not.toBeNull();
});
