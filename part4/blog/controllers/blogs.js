const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', middleware.userExtractor, async (request, response, next) => {
  try{

    const { title, author, url, likes } = request.body

    if (!title || !url) {
      return response.status(400).json({
        error: 'title and url are required'
      })
    }
    const user = request.user

    const blog = new Blog({
      title,
      author,
      url,
      likes: likes || 0,
      user: user._id
    })
    console.log('blog getting created', blog)
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)

  } catch (error) {
    next(error)
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body
  const blog = {
    title,
    author,
    url,
    likes
  }
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.json(updatedBlog)
})

blogsRouter.get('/:id', (request, response, next) => {
  Blog
    .findById(request.params.id)
    .then(blog => {
      if (blog) {
        response.json(blog)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response, next) => {

  try{

    const blog = await Blog.findById(request.params.id)

    if(!blog) {
      return response.status(404).end()
    }

    const user = request.user
    if(blog.user.toString() !== user.id) {
      return response.status(401).json({ error: 'Unauthorized' })
    }

    await Blog.findByIdAndDelete(request.params.id)
    user.blogs = user.blogs.filter(blog => blog.id !== request.params.id)
    await user.save()
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter