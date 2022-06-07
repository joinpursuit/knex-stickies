// Select the correct environment that the app is running in
// By default, select "development"
const env = process.env.NODE_ENV || "development";
// Require the configuration set in the knexfile, access
// the correct configuration for the environment selected
const config = require("./knexfile")[env];

// Create a connection called knex
const knex = require("knex")(config);

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

const dropRemindersTable = async () => {
  return knex.schema.dropTable("reminders");
};

const getAllReminders = async () => {
  const query = await knex.raw("SELECT * FROM reminders");
  console.log(query.rows);
};

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

const getReminder = async (id) => {
  const query = await knex.raw("SELECT * FROM reminders WHERE id=?", [id]);
  console.log(`A reminder with an id of ${id}`, query.rows[0]);
  return query.rows[0];
};

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

const newReminder = async (newReminder) => {
  const query = await knex.raw(
    "INSERT INTO reminders (username, reminder) VALUES(:username, :reminder) RETURNING *",
    newReminder
  );
  return query.rows[0];
};

const updateReminder = async (id, reminder) => {
  console.log({ id, ...reminder });
  const query = await knex.raw(
    "UPDATE reminders SET username=:username, reminder=:reminder, completed=:completed, likes=:likes where id=:id RETURNING *",
    { id, ...reminder }
  );
  console.log(`Updated reminder with id of ${id}`, query.rows[0]);
  return query.rows[0];
};

const deleteReminder = async (id) => {
  const query = await knex.raw(
    "DELETE FROM reminders WHERE id = ? RETURNING *",
    [id]
  );
  console.log("This reminder was deleted", query.rows[0]);
  return query.rows[0];
};

run();
