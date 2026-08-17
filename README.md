# W4 - Containerize Your Stack

A containerized Task CRUD API built with Node.js, Express, and PostgreSQL.

This project extends the previous CRUD API by replacing SQLite with PostgreSQL and containerizing the complete application stack using Docker and Docker Compose.

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Docker
- Docker Compose
- Swagger UI
- `pg` PostgreSQL client

## Project Structure

```text
.
├── docs/
│   └── postgres-data.png
├── .dockerignore
├── .env.example
├── .gitignore
├── compose.yaml
├── Dockerfile
├── openapi.json
├── package.json
├── package-lock.json
├── repository.js
└── server.js
```

## Environment Variables

The application uses environment variables for the PostgreSQL connection.

Create a `.env` file from `.env.example`.

Example:

```env
DATABASE_URL=postgres://postgres:dev@postgres:5432/tasks
```

The `.env` file contains local configuration and is ignored by Git.

The `.env.example` file is included in the repository as a template.

## Run the Application

The complete application stack can be started with one command:

```bash
docker compose up
```

Docker Compose starts:

- The Express API container
- The PostgreSQL database container

PostgreSQL has a health check configured so that the API waits for the database to become ready before attempting to connect.

The API is available at:

```text
http://localhost:3000
```

Swagger API documentation is available at:

```text
http://localhost:3000/docs
```

## API Endpoints

| Method | Endpoint     | Description                    |
| ------ | ------------ | ------------------------------ |
| GET    | `/`          | Get API information            |
| GET    | `/health`    | Check API health                |
| GET    | `/tasks`     | Get all tasks                  |
| GET    | `/tasks/:id` | Get a task by ID               |
| POST   | `/tasks`     | Create a new task               |
| PUT    | `/tasks/:id` | Update an existing task        |
| DELETE | `/tasks/:id` | Delete a task                  |
| GET    | `/docs`      | Open Swagger API documentation |

## Example: Health Check

The API health endpoint can be tested using:

```bash
curl -i http://localhost:3000/health
```

Example output:

```text
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 15
ETag: W/"f-VaSQ4oDUiZblZNAEkkN+sX+q3Sg"
Date: Mon, 17 Aug 2026 06:54:48 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"status":"ok"}
```

## PostgreSQL Database

The application uses PostgreSQL as its database.

PostgreSQL runs inside its own Docker container and is accessed by the API through the Docker Compose service name.

The database connection uses:

```text
postgres:5432
```

rather than `localhost:5432` because the API and PostgreSQL are running in separate Docker containers.

The application automatically creates the `tasks` table and inserts the initial seed data when the database is empty.

### Database Screenshot

![PostgreSQL task data](docs/postgres-data.png)

The screenshot shows the `tasks` table and the task records stored in PostgreSQL.

## Testing the API

Start the complete stack:

```bash
docker compose up
```

Check the running containers:

```bash
docker compose ps
```

Check the API health:

```bash
curl -i http://localhost:3000/health
```

Get all tasks:

```bash
curl -i http://localhost:3000/tasks
```

Create a task:

```bash
curl -i -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Learn Docker\"}"
```

Get a specific task:

```bash
curl -i http://localhost:3000/tasks/1
```

Update a task:

```bash
curl -i -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Learn Docker Compose\",\"done\":true}"
```

Delete a task:

```bash
curl -i -X DELETE http://localhost:3000/tasks/1
```

## Swagger Documentation

Swagger UI is available at:

```text
http://localhost:3000/docs
```

It provides an interactive interface for viewing and testing the available API endpoints.

## Stopping the Application

Stop the running containers with:

```bash
docker compose down
```

The PostgreSQL named volume is preserved when using `docker compose down`.

To start the application again:

```bash
docker compose up
```

The database data remains available because it is stored in the Docker named volume.

> Do not use `docker compose down -v` if you want to preserve the PostgreSQL data.

## Database Persistence

PostgreSQL data is stored in a Docker named volume.

The volume allows the database data to survive container removal.

The normal workflow is:

```bash
docker compose down
```

followed by:

```bash
docker compose up
```

The PostgreSQL database and its data are available again after the containers restart.

## Clean Clone

A fresh clone should be able to run the complete stack without manually installing or configuring PostgreSQL.

The expected workflow is:

```bash
git clone https://github.com/talalvirk/w4---Containerize-your-stack
cd w4---Containerize-your-stack
```

Create the local environment file from the provided example:

```bash
copy .env.example .env
```

Then start the complete stack:

```bash
docker compose up
```

After the containers start, the API should be available at:

```text
http://localhost:3000
```

The seeded tasks can be accessed at:

```text
http://localhost:3000/tasks
```

No manual PostgreSQL installation or database setup is required.

## Docker Services

### API

The API is built from the local `Dockerfile` using Node.js.

The Express server listens on port `3000`.

### PostgreSQL

PostgreSQL runs using the official PostgreSQL Docker image.

The database is configured with:

- Database: `tasks`
- User: `postgres`
- Password: `dev`
- Port: `5432`

The PostgreSQL container includes a health check using `pg_isready`.

The API depends on PostgreSQL becoming healthy before starting.

## Docker Compose

The complete stack is defined in:

```text
compose.yaml
```

The Compose configuration provides:

- API service
- PostgreSQL service
- API-to-database networking
- PostgreSQL health check
- Persistent PostgreSQL volume
- Port mapping for the API

The API is exposed to the host through:

```text
localhost:3000
```

PostgreSQL is available to other Compose services through:

```text
postgres:5432
```

## Assignment Progress

- Stage 0: Postgres in Docker + Git configuration
- Stage 1: Connect API to PostgreSQL
- Stage 2: Read from PostgreSQL
- Stage 3: Full CRUD on PostgreSQL
- Stage 4: Docker Compose the whole stack
- Stage 5: One-command stack + documentation