# Sticky Notes App

## Introduction

We will build an app that interacts with a Postgres database using the query-builder library Knex.

We'll be creating an npm project from scratch and using it to:

- Connecting to a database that was already created
- Reading from a table that was already created
- Dropping a table
- Creating a table with a schema
- Inserting data into the table
- Reading data from the table
- Updating data from the table
- Deleting data from the table

## Getting Started

### Set Up a New Database and Table

- open a new terminal tab. This tab will be dedicated to interacting with your psql command line:
- `createdb stickies_dev`
  - This will create a sub-database called `stickies_dev` belonging to the user `postgres`
  - The user `postgres` was created by default when you installed `postgres`
  - By default, it has no password associated with it
  - If you have updated any of the defaults, please adjust the steps according to your setup
  - If you want to learn more about the `createdb` command, you can type `man createdb` to see a manual
- `psql stickies_dev` - this will open up a Postgres shell that is already connected to the `stickies_dev` database

- Run the following in the Postgres shell:
- Create a reminders table:

```SQL
CREATE TABLE reminders (username TEXT, reminder TEXT, likes INTEGER DEFAULT 0, completed BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT NOW());
```

- Insert some data into the reminders table:

```SQL
 INSERT INTO reminders (username, reminder) VALUES ('Dustin', 'Dust the furniture'), ('Velma', 'Vacuum the floors'), ('Waldo', 'Wash the dishes');
```

- Query the reminders table:

```SQL
SELECT * FROM reminders;
```

### Start a New Project

- Navigate to a location on your computer that is not a git repository
- `mkdir stickies`
- `cd stickies`
- `npm init -y` - start a new npm project, `-y` for default options for `package.json`
- `npm install dotenv` - to set up and use environmental variables
- `npm install pg` - to be able to use Postgres with this project
- `npm install knex` - to serve as the interface between the app and Postgres
- `touch .env` - to store our environmental variables
- `touch .gitignore` - so that we can ignore the correct files if/when we set this up as a git project
- `touch knexfile.js` - where we will set up our configurations
- `touch app.js` - where we will write our queries

**.gitignore**

```
.DS_Store
node_modules
.env
```

### Configure the App

**.env**

```
DATABASE_URL=postgres://postgres@localhost:5432/stickies_dev
```

**knexfile.js**

This file will store the configuration information for our app to be able to connect with the database.

For now, we have one environment, `development`. But as our apps grow more complex, we will have more environments. For example, we will have a `test` environment set up to allow unit tests to run on a continuous integration platform like CircleCI. We will also have a `production` environment for when we are ready to deploy our apps to the cloud so they can be live on the internet for anyone to use.

Remember, Knex can connect to several different SQL databases. We are using `pg` (Postgres) as our client.

The `DATABASE_URL` is stored in the `.env` file. The `URL` will vary depending on the environment. For now, we just have one. For more information about the `URL`, check the pre-reading.

```js
// Configuration
require("dotenv").config();

module.exports = {
  development: {
    client: "pg",
    connection: process.env.DATABASE_URL,
  },
};
```

So far, we have created the required configurations and set them up to connect our database to the app. We have split the configuration across two files: -`.env` - stores variables specific to the environment (currently, your computer)

- `knexfile.js` - stores the overall setup so that if you want to bring on new members or add new environments to the project, they can find the needed configurations here.

Let's first determine the environment.

**app.js**

**REMEMBER:** to run your app with `node app.js`. Since we are not using an express server at the moment, let's avoid using `nodemon`.

```js
const env = process.env.NODE_ENV;
console.log(env);
```

This defaults to `undefined`. So let's set `development` as the default.

```js
const env = process.env.NODE_ENV || "development";
console.log(env);
```

Why does `env` now log `development`? How does `||` work in this case?

Next, we want to require the configuration we set up in the `knexfile.js`.

```js
const env = process.env.NODE_ENV || "development";
const config = require("./knexfile");

console.log(config);
```

`config` gives us back the entire object, but we just want the development configuration. Remember that we can access object keys using bracket `[]` notation. So `[env]` will be the equivalent of `.development` in this case.

```js
const env = process.env.NODE_ENV || "development";
const config = require("./knexfile")[env];

console.log(config);
```

config should now result in:

```js
{
 client: 'pg',
 connection: 'postgres://postgres@localhost:5432/stickies_dev'
}
```

Now let's open a connection:

```js
// Select the correct environment that the app is running in
// By default, select "development"
const env = process.env.NODE_ENV || "development";
// Require the configuration set in the knexfile, access
// the correct configuration for the environment selected
const config = require("./knexfile")[env];

// Create a connection called knex
const knex = require("knex")(config);
```

## Use the App to Interact with the Database

Create an asynchronous function called `run` and call it.

**app.js**

```js
const run = async () => {
  console.log("app is running");
};

// keep the function invokation at the bottom of the file, below all other function expressions
run();
```

Create a function to select all reminders and console log them. `query` is a complex object that contains a lot of metadata. To see just the data we created, use `query.rows`.

```js
const getAllReminders = async () => {
  const query = await knex.raw("SELECT * FROM reminders");
  console.log(query.rows);
};
```

Call this function inside of `run`:

```js
const run = async () => {
  console.log("app is running");
  await getAllReminders();
};

run();
```

We should see something like this:

```js
[
 {
 username: 'Dustin',
 reminder: 'Dust the furniture',
 likes: 0,
 completed: false,
 created_at: 2022-06-07T18:40:33.050Z
 },
 {
 username: 'Velma',
 reminder: 'Vacuum the floors',
 likes: 0,
 completed: false,
 created_at: 2022-06-07T18:40:33.050Z
 },
 {
 username: 'Waldo',
 reminder: 'Wash the dishes',
 likes: 0,
 completed: false,
 created_at: 2022-06-07T18:40:33.050Z
 }
]
```

And that our terminal is just hanging. We can press <kbd>control</kbd> <kbd>c</kbd> to get control of our terminal back.

This is the typical default behavior of our app because of our configuration from Knex. Once a connection is made, it stays open until we close it.

We can close the connection in our `run` function for convenience.

```js
const run = async () => {
  console.log("App is running");
  await getAllReminders();
  knex.destroy();
};
```

**Bonus:** We can pass a callback to our `destroy` function so that we can get some feedback when the connection is closed

```js
knex.destroy(() => {
  console.log("The connection is closed");
});
```

## Create and Drop a Table

We can create a table using Knex. This functionality will be helpful for keeping track of changes to the database and getting the app running on other platforms (like testing or in the cloud) or for adding new members to the project.

First, let's drop the table. Go to the command line where you ran `createdb stickies` and run the following two commands for a full reset:

- `dropdb stickies_dev`
- `createdb stickies_dev`

Remember, there is no `undo` when it comes to databases. So be very careful with your destructive activities. When working at a company, there are usually backup strategies employed.

Let's create a table with Knex. The function `knex` is a promise. It's crucial that we wait for a response from the database before moving on to the next part of our app's functionality.

When using `async`/`await` syntax, we can use `try`/`catch` syntax to handle errors.

**app.js**

```js
const createRemindersTable = async () => {
  try {
    await knex.schema.createTable("reminders", (table) => {
      table.increments("id").primary;
      table.text("username");
      table.text("reminder");
      table.integer("likes").defaultTo(0);
      table.boolean("completed").defaultTo(false);
      table.timestamp("created_at").defaultTo(knex.fn.now());
    });
    console.log("Table created");
  } catch (error) {
    console.log("There was an error", error);
  }
};
```

Add it to the run function:

```js
const run = async () => {
  console.log("App is running");
  await createRemindersTable();
  await getAllReminders();
  knex.destroy();
};
```

**Note:** `getAllReminders()` should return an empty array now.

We can also write a function to drop a table:

```js
const dropRemindersTable = async () => {
  return knex.schema.dropTable("reminders");
};
```

Add to the `run` function. Be mindful of the order:

```js
const run = async () => {
  console.log("App is running");
  await dropRemindersTable();
  await createRemindersTable();

  knex.destroy(() => {
    console.log("The connection is closed");
  });
};
```

## Insert into Table

It is important to remember that the `knex` function is a promise. If you run it without aysnc/await (or the alternative `.then().catch()`) syntax, you can run into unexpected errors sometimes. If you find inconsistent errors, make sure you are awaiting the correct code to complete/return a value and execute your functions in the correct order.

Try it! Remove the `async` and `await` keywords from the following function and see what happens.

```js
const insertManyReminders = async () => {
  await knex("reminders").insert([
    {
      username: "Dustin",
      reminder: "Dust the furniture",
    },
    {
      username: "Velma",
      reminder: "Vacuum the floors",
    },
    {
      username: "Waldo",
      reminder: "Wash the dishes",
    },
  ]);
};
```

```js
const run = async () => {
  console.log("App is running");
  await dropRemindersTable();
  await createRemindersTable();
  await insertManyReminders();
  await getAllReminders();
  knex.destroy(() => {
    console.log("The connection is closed");
  });
};
```

We can create new reminders by passing an argument to the function. We can imagine this data coming from the request body after form submission.

Typically, we would want to return the object we created. To do that, we access it through `query.rows[0]`. This is because what is returned is always an array, but we just want the one object created.

We will `inject` these values by using `:username` and `:reminder` in the SQL query, which will access the keys `username` and `reminder` inside our `newReminder` object.

```js
const newReminder = async (newReminder) => {
  const query = await knex.raw(
    "INSERT INTO reminders (username, reminder) VALUES(:username, :reminder) RETURNING *",
    newReminder
  );
  return query.rows[0];
};
```

```js
const run = async () => {
  console.log("App is running");
  await dropRemindersTable();
  await createRemindersTable();
  await insertManyReminders();
  await newReminder({ username: "Freddy", reminder: "Feed the cat" });
  await getAllReminders();
  knex.destroy(() => {
    console.log("The connection is closed");
  });
};
```

## Show One Reminder

Showing one reminder shows another way to pass variables to the SQL statement.

```js
const getReminder = async (id) => {
  const query = await knex.raw("SELECT * FROM reminders WHERE id=?", [id]);
  console.log(`A reminder with an id of ${id}`, query.rows[0]);
  return query.rows[0];
};
```

```js
const run = async () => {
  console.log("App is running");
  await dropRemindersTable();
  await createRemindersTable();
  await insertManyReminders();
  await newReminder({ username: "Freddy", reminder: "Feed the cat" });
  await getAllReminders();
  await getReminder(2);
  knex.destroy(() => {
    console.log("The connection is closed");
  });
};
```

## Update a Reminder

```js
const updateReminder = async (id, reminder) => {
  const query = await knex.raw(
    "UPDATE reminders SET username=:username, reminder=:reminder, completed=:completed, likes=:likes where id=:id RETURNING *",
    { id, ...reminder }
  );
  console.log(`Updated reminder with id of ${id}`, query.rows[0]);
  return query.rows[0];
};
```

```js
const run = async () => {
  console.log("App is running");
  await dropRemindersTable();
  await createRemindersTable();
  await insertManyReminders();
  await newReminder({ username: "Freddy", reminder: "Feed the cat" });
  await getAllReminders();
  await getReminder(2);
  await updateReminder(3, {
    username: "Waldo",
    reminder: "Wash the dishes",
    likes: 700,
    completed: true,
  });
  knex.destroy(() => {
    console.log("The connection is closed");
  });
};
```

## Delete a Reminder

```js
const deleteReminder = async (id) => {
  const query = await knex.raw(
    "DELETE FROM reminders WHERE id = ? RETURNING *",
    [id]
  );
  console.log("This reminder was deleted", query.rows[0]);
  return query.rows[0];
};
```


```js
const run = async () => {
  console.log("App is running");
  await dropRemindersTable();
  await createRemindersTable();
  await insertManyReminders();
  await newReminder({ username: "Freddy", reminder: "Feed the cat" });
  await getAllReminders();
  await getReminder(2);
  await updateReminder(3, {
    username: "Waldo",
    reminder: "Wash the dishes",
    likes: 700,
    completed: true,
  });
  await deleteReminder(1);
  knex.destroy(() => {
    console.log("The connection is closed");
  });
};

```

## Summary

We've built a JavaScript app that uses the pg and knex libraries to interact with a Postgres database through the app. We have demonstrated how to use Knex to perform CRUD operations.

In the next lesson, you'll learn about managing your databases to be controlled and maintainable.

Finally, we'll move on to incorporating knex into an Express app.
