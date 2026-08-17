import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./openapi.json" with { type: "json" };

import {
    initializeDatabase,
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
} from "./repository.js";

const app = express();
const port = 3000;

app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.send({
        name: "Task API",
        version: "1.0",
        endpoints: ["/tasks"]
    });
});

// Swagger documentation
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get("/health", (req, res) => {
    res.send({
        status: "ok"
    });
});

// Stage 2 and Stage 3 will convert these routes
// from SQLite to PostgreSQL.

// GET all tasks
app.get("/tasks", async (req, res) => {
    try {
        const tasks = await getAllTasks();

        res.json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);

        res.status(500).json({
            error: "Failed to fetch tasks"
        });
    }
});

// GET task by ID
app.get("/tasks/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {
        const task = await getTaskById(id);

        if (!task) {
            return res.status(404).json({
                error: `Task ${id} not found`
            });
        }

        res.json(task);
    } catch (error) {
        console.error("Error fetching task:", error);

        res.status(500).json({
            error: "Failed to fetch task"
        });
    }
});

// POST task
app.post("/tasks", async (req, res) => {
    const { title } = req.body;

    // Validate title
    if (!title || typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({
            error: "Title is required"
        });
    }

    try {
        const newTask = await createTask(title.trim(), false);

        res.status(201).json(newTask);
    } catch (error) {
        console.error("Error creating task:", error);

        res.status(500).json({
            error: "Failed to create task"
        });
    }
});

// PUT task
app.put("/tasks/:id", async (req, res) => {
    const id = Number(req.params.id);

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

    try {
        // First get existing task
        const existingTask = await getTaskById(id);

        if (!existingTask) {
            return res.status(404).json({
                error: `Task ${id} not found`
            });
        }

        // Keep existing values when a field isn't provided
        const newTitle =
            title !== undefined
                ? title.trim()
                : existingTask.title;

        const newDone =
            done !== undefined
                ? done
                : existingTask.done;

        const updatedTask = await updateTask(
            id,
            newTitle,
            newDone
        );

        res.json(updatedTask);

    } catch (error) {
        console.error("Error updating task:", error);

        res.status(500).json({
            error: "Failed to update task"
        });
    }
});

// DELETE task
app.delete("/tasks/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {
        const deletedTask = await deleteTask(id);

        if (!deletedTask) {
            return res.status(404).json({
                error: `Task ${id} not found`
            });
        }

        res.sendStatus(204);

    } catch (error) {
        console.error("Error deleting task:", error);

        res.status(500).json({
            error: "Failed to delete task"
        });
    }
});

// Initialize PostgreSQL first, then start Express
initializeDatabase()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error("Database initialization failed:", error);
        process.exit(1);
    });