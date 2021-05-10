const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { userOneId, userOne, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should signup a new user', async () => {
  const response = await request(app)
    .post('/users')
    .send({
      name: 'JestTest',
      email: 'jest@gmail.com',
      password: 'Testing22342342',
    })
    .expect(201);

  // Assert that the database was changed correctly
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  // Assertions about the response
  expect(response.body).toMatchObject({
    user: {
      name: 'JestTest',
      email: 'jest@gmail.com',
    },
    token: user.tokens[0].token,
  });

  // Assert password in database is not plain text
  expect(user.password).not.toBe('Testing22342342');
});

test('Should not signup user with invalid name/email/password', async () => {
  // Invalid name
  await request(app)
    .post('/users')
    .send({
      name: '',
      email: 'jest@gmail.com',
      password: 'Testing22342342',
    })
    .expect(400);

  // Invalid email
  await request(app)
    .post('/users')
    .send({
      name: 'Testing',
      email: 'jesting',
      password: 'Testing22342342',
    })
    .expect(400);

  // Invalid password
  await request(app)
    .post('/users')
    .send({
      name: 'Testing',
      email: 'jesting@gmail.com',
      password: 'tesing',
    })
    .expect(400);
});

test('Should login existing user', async () => {
  const response = await request(app)
    .post('/users/login')
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  // Assert response token matches users second token
  const user = await User.findById(response.body.user._id);
  expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not login non existent user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      name: 'JestTest',
      email: 'jest@gmail.com',
    })
    .expect(400);
});

test('Should get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should not get profile for unauthenticated user', async () => {
  await request(app).get('/users/me').send().expect(401);
});

test('Should not update user if unauthenticated', async () => {
  await request(app)
    .patch(`/users/${userOneId}`)
    .send({ name: 'Test update' })
    .expect(401);
});

test('Should not update user with invalid name/email/password', async () => {
  // Invalid name
  await request(app)
    .patch(`/users/${userOneId}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: '',
      email: 'jest@gmail.com',
      password: 'Testing22342342',
    })
    .expect(400);

  // Invalid email
  await request(app)
    .patch(`/users/${userOneId}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: 'Testing',
      email: 'jesting',
      password: 'Testing22342342',
    })
    .expect(400);

  // Invalid password
  await request(app)
    .patch(`/users/${userOneId}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: 'Testing',
      email: 'jesting@gmail.com',
      password: 'tesing',
    })
    .expect(400);
});

test('Should delete account for user', async () => {
  const response = await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  // Assert null response
  const user = await User.findById(response.body._id);
  expect(user).toBeNull();
});

test('Should not delete account for unauthenticated user', async () => {
  await request(app).delete('/users/me').send().expect(401);
});

test('Should not delete user if unauthenticated', async () => {
  await request(app).delete(`/users/${userOneId}`).send().expect(401);
});

test('Should upload avatar image', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.png')
    .expect(200);

  // Assert image save in database
  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields', async () => {
  const response = await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: 'Jess',
    })
    .expect(200);

  // Assert name has been changed
  const user = await User.findById(userOneId);
  expect(user.name).toBe('Jess');
});

test('Should not update invalid user fields', async () => {
  const response = await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: 'Cebu',
    })
    .expect(400);
});
