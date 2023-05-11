const { client } = require('../config/default');
const { createPostTag } = require('./post_tag');

async function createTags(tagList) {
  if (tagList.length === 0) {
    return;
  }

  const insertValues = tagList.map((_, index) => `$${index + 1}`).join('), (');

  const selectValues = tagList.map((_, index) => `$${index + 1}`).join(', ');

  try {
    await client.query(
      `
      INSERT INTO tags (name)
      VALUES (${insertValues})
      ON CONFLICT (name) DO NOTHING;
    `,
      tagList
    );

    const { rows } = await client.query(
      `
      SELECT * FROM tags
      WHERE name
      IN (${selectValues});
    `,
      tagList
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

async function addTagsToPost(postId, tagList) {
  try {
    // const createPostTagPromises = tagList.map(tag =>
    //   createPostTag(postId, tag.id)
    // );

    // await Promise.all(createPostTagPromises);
    await Promise.all(tagList.map(tag => createPostTag(postId, tag.id)));

    return;
  } catch (error) {
    throw error;
  }
}

module.exports = { createTags, addTagsToPost };
