import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

export async function initializeDatabase() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            done BOOLEAN NOT NULL
        );
    `);

    const result = await pool.query(
        "SELECT COUNT(*) AS count FROM tasks"
    );

    if (Number(result.rows[0].count) === 0) {
        await pool.query(`
            INSERT INTO tasks (title, done)
            VALUES
                ($1, $2),
                ($3, $4),
                ($5, $6)
        `, [
            "Learn Express",
            false,
            "Build CRUD API",
            false,
            "Learn PostgreSQL",
            true
        ]);
    }
}

export async function getAllTasks() {
    const result = await pool.query(
        "SELECT * FROM tasks"
    );

    return result.rows;
}

export async function getTaskById(id) {
    const result = await pool.query(
        "SELECT * FROM tasks WHERE id = $1",
        [id]
    );

    return result.rows[0];
}

export async function createTask(title, done = false) {
    const result = await pool.query(
        `
        INSERT INTO tasks (title, done)
        VALUES ($1, $2)
        RETURNING *
        `,
        [title, done]
    );

    return result.rows[0];
}

export async function updateTask(id, title, done) {
    const result = await pool.query(
        `
        UPDATE tasks
        SET title = $1, done = $2
        WHERE id = $3
        RETURNING *
        `,
        [title, done, id]
    );

    return result.rows[0];
}

export async function deleteTask(id) {
    const result = await pool.query(
        `
        DELETE FROM tasks
        WHERE id = $1
        RETURNING *
        `,
        [id]
    );

    return result.rows[0];
}