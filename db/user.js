const bcrypt = require('bcrypt');

const { client } = require('../config/default');
const { getPostsByUser } = require('./post');

async function createUser({ username, password, name, location }) {
  const salt = await bcrypt.genSalt(Number(process.env.SALT));

  const hash = await bcrypt.hash(password, salt);

  try {
    const { rows } = await client.query(
      `
      INSERT INTO users (username, password, name, location)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (username) DO NOTHING
      RETURNING *;
      `,
      [username, hash, name, location]
    );

    const [user] = rows;
    return user;
  } catch (error) {
    throw error;
  }
}

async function getAllUsers() {
  const { rows } = await client.query(`
    SELECT id, username, name, location, active
    FROM users;
  `);

  return rows;
}

async function getUserById(userId) {
  try {
    const { rows } = await client.query(`
      SELECT id, username, name, location, active
      FROM users
      WHERE id=${userId};
    `);

    if (!rows || rows.length === 0) {
      return null;
    }

    const [user] = rows;
    // delete user.password;
    user.posts = await getPostsByUser(user.id);
    return user;
  } catch (error) {
    throw error;
  }
}

async function getUserByUsername(username) {
  try {
    const { rows } = await client.query(
      `
      SELECT *
      FROM users
      WHERE username=$1;
      `,
      [username]
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

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  getUserByUsername,
  updateUser,
};
