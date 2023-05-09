const { Client } = require('pg');

const client = new Client('postgres://localhost:5432/juicebox-dev');
// const client = new Client({
//   user: 'postgres',
//   password: 'postgres',
//   database: 'juicebox-dev',
// });

async function getAllUsers() {
  const { rows } = await client.query(`
    SELECT id, username, name, location 
    FROM users;
  `);

  return rows;
}

async function createUser({ username, password, name, location }) {
  try {
    const { rows } = await client.query(
      `
      INSERT INTO users (username, password, name, location) VALUES ($1, $2, $3, $4)
      ON CONFLICT (username) DO NOTHING 
      RETURNING *;
      `,
      [username, password, name, location]
    );

    const [user] = rows;
    return user;
  } catch (error) {
    throw error;
  }
}

async function updateUser(id, fields = {}) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(', ');

  if (setString.length === 0) {
    return;
  }

  try {
    const { rows } = await client.query(
      `
      UPDATE users
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
      `,
      Object.values(fields)
    );

    const [user] = rows;
    return user;
  } catch (error) {
    throw error;
  }
}

async function getAllPosts() {
  try {
    const { rows } = await client.query(`
    SELECT id, "authorId", title, content 
    FROM posts;
  `);

    return rows;
  } catch (error) {
    throw error;
  }
}

async function createPost({ authorId, title, content }) {
  try {
    const { rows } = await client.query(
      `
      INSERT INTO posts ("authorId", title, content) VALUES ($1, $2, $3)
      RETURNING *;
      `,
      [authorId, title, content]
    );

    const [post] = rows;
    return post;
  } catch (error) {
    throw error;
  }
}

async function updatePost(id, fields = {}) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(', ');

  if (setString.length === 0) {
    return;
  }

  try {
    const { rows } = await client.query(
      `
      UPDATE posts
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
      `,
      Object.values(fields)
    );

    const [post] = rows;
    return post;
  } catch (error) {
    throw error;
  }
}

async function getPostsByUser(userId) {
  try {
    const { rows } = await client.query(`
      SELECT * FROM posts
      WHERE "authorId"=${userId};
    `);

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getUserById(userId) {
  try {
    const { rows } = await client.query(`
      SELECT * FROM users
      WHERE id=${userId};
    `);
    if (!rows || rows.length === 0) {
      return;
    }
    const [user] = rows;
    delete user.password;
    user.posts = await getPostsByUser(user.id);
    return user;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
  getAllPosts,
  createPost,
  updatePost,
  getPostsByUser,
  getUserById,
};
