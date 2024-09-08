const { test, after, beforeEach } = require('node:test')
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

after(async () => {
  await mongoose.connection.close()
})