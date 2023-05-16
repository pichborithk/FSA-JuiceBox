const express = require('express');

const { getAllTags } = require('../db/tag');
const { getPostsByTagName } = require('../db');

const tagsRouter = express.Router();

tagsRouter.use((req, res, next) => {
  console.log('A request is being made to /tags');

  next();
});

tagsRouter.get('/', async (req, res) => {
  const posts = await getAllTags();
  res.send({ posts });
});

tagsRouter.get('/:tagName/posts', async (req, res, next) => {
  const { tagName } = req.params;
  try {
    const allPosts = await getPostsByTagName(tagName);

    const posts = allPosts.filter(
      post => post.active || (req.user && post.author.id === req.user.id)
    );

    res.send({ posts });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = tagsRouter;
