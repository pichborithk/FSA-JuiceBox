const { client } = require('../config/default');
const { users, posts } = require('./dummy.data');

const {
  getAllUsers,
  createUser,
  updateUser,
  getUserById,
  updatePost,
  getAllPosts,
  createPost,
  createTags,
  addTagsToPost,
  getPostById,
  getPostsByTagName,
} = require('./index');

async function createInitialUsers(users) {
  try {
    console.log('Starting to create users...');

    await Promise.all(users.map(user => createUser(user)));

    console.log('Finished creating users!');
  } catch (error) {
    console.error('Error creating users!');
    throw error;
  }
}

async function createInitialPosts() {
  try {
    const users = await getAllUsers();

    console.log('Starting to create posts...');

    const postsData = posts.map((post, index) => {
      return { ...post, authorId: users[index].id };
    });

    await Promise.all(postsData.map(data => createPost(data)));

    console.log('Finished creating posts!');
  } catch (error) {
    throw error;
  }
}

async function dropTables() {
  try {
    console.log('Starting to drop tables...');

    await client.query(`
      DROP TABLE IF EXISTS post_tags;
      DROP TABLE IF EXISTS tags;
      DROP TABLE IF EXISTS posts;
      DROP TABLE IF EXISTS users;
    `);

    console.log('Finished dropping tables!');
  } catch (error) {
    console.error('Error dropping tables!');
    throw error;
  }
}

async function createTables() {
  try {
    console.log('Starting to build tables...');

    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username varchar(255) UNIQUE NOT NULL,
        password varchar(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT true
      );

      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        "authorId" INTEGER REFERENCES users(id) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        active BOOLEAN DEFAULT true
      );

      CREATE TABLE tags (
        id SERIAL PRIMARY KEY,
        name varchar(255) UNIQUE NOT NULL
      );

      CREATE TABLE post_tags (
        "postId" INTEGER REFERENCES posts(id),
        "tagId" INTEGER REFERENCES tags(id),
        UNIQUE ("postId", "tagId")
      );
    `);

    console.log('Finished building tables!');
  } catch (error) {
    console.error('Error building tables!');
    throw error;
  }
}

async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers(users);
    await createInitialPosts();
  } catch (error) {
    console.error(error);
  }
}

async function testDB() {
  try {
    console.log('Starting to test database...');

    // console.log('Calling getAllUsers');
    // const users = await getAllUsers();
    // console.log('getAllUsers:', users);

    // console.log('Calling updateUser on users[0]');
    // const updateUserResult = await updateUser(users[0].id, {
    //   name: 'Newname Sogood',
    //   location: 'Lesterville, KY',
    // });
    // console.log('Result:', updateUserResult);

    // console.log('Calling getAllPosts');
    // const posts = await getAllPosts();
    // console.log('Result:', posts);

    console.log('Calling getPostsByTagName with #happy');
    const postsWithHappy = await getPostsByTagName('#happy');
    console.log('Result:', postsWithHappy);

    // console.log('Calling updatePost on posts[0]');
    // const updatePostResult = await updatePost(posts[0].id, {
    //   title: 'New Title',
    //   content: 'Updated Content',
    // });
    // console.log('Result:', updatePostResult);

    // console.log('Calling updatePost on posts[1], only updating tags');
    // const updatePostTagsResult = await updatePost(posts[1].id, {
    //   tags: ['#youcandoanything', '#redfish', '#bluefish'],
    // });
    // console.log('Result:', updatePostTagsResult);

    // console.log('Calling getUserById with 1');
    // const albert = await getUserById(1);
    // console.log('Result:', albert);

    // console.log('Calling getPostById with 1');
    // const post1 = await getPostById(1);
    // console.log('Result:', post1);

    console.log('Finished database tests!');
  } catch (error) {
    console.error('Error testing database!');
    throw error;
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
