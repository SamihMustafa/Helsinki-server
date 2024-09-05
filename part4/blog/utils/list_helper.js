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

module.exports = {
  dummy, totalLikes, favoriteBlog
}