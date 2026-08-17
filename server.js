import express from "express";
import Database from "better-sqlite3";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./openapi.json" with { type: "json" };

const db = new Database("tasks.db");
db.exec(`
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    done BOOLEAN NOT NULL
);
`);

const row = db.prepare("SELECT COUNT(*) AS count FROM tasks").get();

if (row.count === 0) {

    const insert = db.prepare(`
        INSERT INTO tasks (title, done)
        VALUES (?, ?)
    `);
    insert.run("Learn Express", 0);
    insert.run("Build CRUD API", 0);
    insert.run("Learn SQLite", 1);
}

const app = express()
const port = 3000
app.use(express.json()); // Parses incoming JSON

//task object



app.get('/', (req, res) => {
    res.send({ "name": "Task API", "version": "1.0", "endpoints": ["/tasks"] })
})

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.listen(port, () => {
    console.log(`Server running at http://localhost:3000 `)
})

app.get('/health', (req, res) => {

    res.send({ "status": "ok" })
})

app.get("/tasks", (req, res) => {
    const tasks = db
        .prepare("SELECT * FROM tasks")
        .all();

    res.json(tasks);
});

app.get('/tasks/:id', (app.get("/tasks/:id", (req, res) => {
    const id = Number(req.params.id);

    const task = db
        .prepare("SELECT * FROM tasks WHERE id = ?")
        .get(id);

    if (!task) {
        return res.status(404).json({
            error: `Task ${id} not found`
        });
    }

    res.json(task);
})))

app.post("/tasks", (req, res) => {
    const { title } = req.body;

    // Validate title
    if (!title || typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({
            error: "Title is required"
        });
    }

    // Insert task into database
    const result = db.prepare(`
        INSERT INTO tasks (title, done)
        VALUES (?, ?)
    `).run(title.trim(), 0);

    // Get the newly created task
    const newTask = db
        .prepare("SELECT * FROM tasks WHERE id = ?")
        .get(result.lastInsertRowid);

    res.status(201).json(newTask);
});

app.put("/tasks/:id", (req, res) =>app.put("/tasks/:id", (req, res) => {
    const id = Number(req.params.id);

    // Find the existing task
    const task = db
        .prepare("SELECT * FROM tasks WHERE id = ?")
        .get(id);

    // Task doesn't exist
    if (!task) {
        return res.status(404).json({
            error: `Task ${id} not found`
        });
    }

    const { title, done } = req.body;

    // Empty body
    if (title === undefined && done === undefined) {
        return res.status(400).json({
            error: "Provide a valid title and/or done value."
        });
    }

    // Validate title
    if (
        title !== undefined &&
        (typeof title !== "string" || title.trim() === "")
    ) {
        return res.status(400).json({
            error: "Title must not be empty."
        });
    }

    // Validate done
    if (
        done !== undefined &&
        typeof done !== "boolean"
    ) {
        return res.status(400).json({
            error: "Done must be a boolean."
        });
    }

    // Keep existing values if they weren't provided
    const newTitle =
        title !== undefined
            ? title.trim()
            : task.title;

    const newDone =
        done !== undefined
            ? done ? 1 : 0
            : task.done;

    // Update database
    db.prepare(`
        UPDATE tasks
        SET title = ?, done = ?
        WHERE id = ?
    `).run(newTitle, newDone, id);

    // Get updated task
    const updatedTask = db
        .prepare("SELECT * FROM tasks WHERE id = ?")
        .get(id);

    res.json(updatedTask);
}));

app.delete("/tasks/:id", (req, res) => {
    const id = Number(req.params.id);

    const result = db
        .prepare("DELETE FROM tasks WHERE id = ?")
        .run(id);

    if (result.changes === 0) {
        return res.status(404).json({
            error: `Task ${id} not found`
        });
    }

    res.sendStatus(204);
});