import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./openapi.json" with { type: "json" };

import {
    initializeDatabase,
    getAllTasks,
    getTaskById
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
app.post("/tasks", (req, res) => {
    res.status(501).json({
        error: "POST /tasks will be implemented in Stage 3"
    });
});

// PUT task
app.put("/tasks/:id", (req, res) => {
    res.status(501).json({
        error: "PUT /tasks/:id will be implemented in Stage 3"
    });
});

// DELETE task
app.delete("/tasks/:id", (req, res) => {
    res.status(501).json({
        error: "DELETE /tasks/:id will be implemented in Stage 3"
    });
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