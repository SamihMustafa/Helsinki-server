const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('assert')
const Blog = require('../models/blog')
const app = require('../app')

const api = supertest(app)

const listWithOneBlog = [
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
    likes: 5,
    __v: 0
  }
]

beforeEach(async () => {
  await Blog.deleteMany({})
  let noteObject = new Blog(listWithOneBlog[0])
  await noteObject.save()
})

test('blogs are returned as json', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.length, listWithOneBlog.length)
})

test('unique identifier is named id', async () => {
  const response = await api.get('/api/blogs')
  // check no _id is returned
  assert.strictEqual(response.body[0]._id, undefined)
  // check id matches the blog id
  assert.strictEqual(response.body[0].id, listWithOneBlog[0]._id)
})

test('POST /api/blogs creates a new blog', async () => {
  const newBlog = {
    title: 'new blog',
    author: 'new author',
    url: 'new url',
    likes: 5
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, listWithOneBlog.length + 1)

  const contents = response.body.map(r => r.title)
  assert.strictEqual(contents.includes(newBlog.title), true)
})

test('POST /api/blogs defaults likes to 0', async () => {
  const newBlog = {
    title: 'new blog',
    author: 'new author',
    url: 'new url'
  }
  const result = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(result.body.likes, 0)
})

describe('missing data returns bad request', () => {
  test('missing title returns 400', async () => {
    const newBlog = {
      author: 'new author',
      url: 'new url'
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  })

  test('missing url returns 400', async () => {
    const newBlog = {
      title: 'new blog',
      author: 'new author',
      likes: 0
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  })
})

test('DELETE /api/blogs deletes a blog', async () => {
  await api
    .delete(`/api/blogs/${listWithOneBlog[0]._id}`)
    .expect(204)
  const result = await api.get('/api/blogs')
  assert.strictEqual(result.body.length, 0)
})


after(async () => {
  await mongoose.connection.close()
})