const lodash = require('lodash')
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((accumulator, blog) => accumulator + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  return blogs.reduce((a, b) => {
    return (a.likes > b.likes) ? a : b
  }, blogs.length === 0 ? undefined : blogs[0])
}

const mostBlogs = (blogs) => {
  if(blogs.length === 0){
    return undefined
  }

  const topBlogs = lodash.groupBy(blogs, 'author')
  const authorBlogCounts = lodash.map(topBlogs, (authorBlogs, author) => ({
    author: author,
    blogs: authorBlogs.length
  }))

  const topAuthor = lodash.maxBy(authorBlogCounts, 'blogs')
  return topAuthor
}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs
}