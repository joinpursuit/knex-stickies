const env = process.env.NODE_ENV || "development";
const config = require("./knexfile")[env];

const db = require("knex")(config);

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
  db.destroy(() => {
    console.log("The connection is closed");
  });
};

const getAllReminders = async () => {
  const query = await db.raw("SELECT * FROM reminders");
  console.log(query.rows);
  return query.rows;
};

const getReminder = async (id) => {
  const query = await db.raw("SELECT * FROM reminders WHERE id=?", [id]);
  console.log(`A reminder with an id of ${id}`, query.rows[0]);
  return query.rows[0];
};

const newReminder = async (newReminder) => {
  const { username, reminder } = newReminder;
  const query = await db.raw(
    "INSERT INTO reminders (username, reminder) VALUES(:username, :reminder) RETURNING *",
    { username, reminder }
  );
  return query.rows[0];
};

const updateReminder = async (id, updatedReminder) => {
  const { username, reminder, completed, likes } = updatedReminder;
  const query = await db.raw(
    "UPDATE reminders SET username=:username, reminder=:reminder, completed=:completed, likes=:likes where id=:id RETURNING *",
    { id, username, reminder, completed, likes }
  );
  console.log(`Updated reminder with id of ${id}`, query.rows[0]);
  return query.rows[0];
};

const deleteReminder = async (id) => {
  const query = await db.raw("DELETE FROM reminders WHERE id=? RETURNING *", [
    id,
  ]);
  console.log("This reminder was deleted", query.rows[0]);
  return query.rows[0];
};

const insertManyReminders = async () => {
  await db("reminders").insert([
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

const createRemindersTable = async () => {
  try {
    await db.schema.createTable("reminders", (table) => {
      table.increments("id").primary;
      table.text("username").notNullable();
      table.text("reminder");
      table.integer("likes").defaultTo(0);
      table.boolean("completed").defaultTo(false);
      table.timestamp("created_at").defaultTo(db.fn.now());
    });
    console.log("Table created");
  } catch (error) {
    console.log("There was an error", error);
  }
};

const dropRemindersTable = async () => {
  return db.schema.dropTable("reminders");
};

// keep the function invokation at the bottom of the file, below all other function expressions
run();
