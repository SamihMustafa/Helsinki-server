const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('assert')

const User = require('../models/user')
const app = require('../app')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
})

test('create user', async () => {
  const usersAtStart = await helper.usersInDb()

  const newUser = {
    username: 'mluukkai',
    name: 'Matti Luukkainen',
    password: 'salainen',
  }

  await api
    .post('/api/users')
    .send(newUser)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const usersAtEnd = await helper.usersInDb()
  assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

  const usernames = usersAtEnd.map(u => u.username)
  assert(usernames.includes(newUser.username))
})

describe('invalid users', async () => {

  test('missing username', async () => {
    const newUser = {
      name: 'Matti Luukkainen',
      password: 'salainen',
    }
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
    assert.strictEqual(result.body.error, 'username is required')
  })

  test('missing password', async () => {
    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
    }
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    assert.strictEqual(result.body.error, 'password is required')
  })

  test('too short username', async () => {
    const newUser = {
      username: 'ma',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    assert.strictEqual(result.body.error, 'username must be at least 3 characters long')
  })

  test('empty password', async () => {
    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: '',
    }
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    assert.strictEqual(result.body.error, 'password must be at least 3 characters long')
  })

  test('duplicate username', async () => {
    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }
    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    assert.strictEqual(result.body.error, 'expected `username` to be unique')
  })

})


after(async () => {
  await User.deleteMany({})
  await mongoose.connection.close()
})