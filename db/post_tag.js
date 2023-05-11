const { client } = require('../config/default');

async function createPostTag(postId, tagId) {
  try {
    await client.query(
      `
      INSERT INTO post_tags("postId", "tagId")
      VALUES ($1, $2)
      ON CONFLICT ("postId", "tagId") DO NOTHING;
      `,
      [postId, tagId]
    );
  } catch (error) {
    throw error;
  }
}

module.exports = { createPostTag };
