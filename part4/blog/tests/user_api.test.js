const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('assert')

const User = require('../models/user')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
  await Blog.deleteMany({})
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

test('cant add blog without token, returns 401', async () => {
  const newBlog = {
    title: 'new blog',
    author: 'new author',
    url: 'new url',
    likes: 5
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)
})

test('delete blog, deletes from user list', async () => {

  const blogAtStart = await helper.blogsInDb()
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

  const usersAtEnd = await helper.usersInDb()
  assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

  const loginResult = await api.post('/api/login')
    .send({ username: 'mluukkai', password: 'salainen' })
    .expect(200)

  const token = loginResult.body.token
  assert(token)

  const newBlog = {
    title: 'new blog',
    author: 'new author',
    url: 'new url',
    likes: 5
  }
  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, blogAtStart.length + 1)

  const usersAfterBlogCreated = await helper.usersInDb()
  usersAfterBlogCreated.forEach(user => {
    user.blogs.map(blog => blog._id.toString()).includes(blogsAtEnd[0].id.toString())
  })

  await api
    .delete(`/api/blogs/${blogsAtEnd[0].id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  const blogsAfterDelete = await helper.blogsInDb()
  assert.strictEqual(blogsAfterDelete.length, blogAtStart.length)

  const usersAfterBlogsDeleted = await helper.usersInDb()
  usersAfterBlogsDeleted.map(u => assert(!u.blogs.includes(blogsAtEnd[0].id)))

})



after(async () => {
  await User.deleteMany({})
  await mongoose.connection.close()
})