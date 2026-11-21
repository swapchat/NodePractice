# DevTinder

This project is part of my learning journey with **Namaste Node.js by Akshay
Saini**.

DevTinder is a small Node.js learning project. It currently starts an Express
server and connects to MongoDB with Mongoose. The project will grow as I learn
Node.js and add features over time.

## Requirements

- Node.js 20.19 or newer
- npm
- A MongoDB Atlas cluster and database user

## Setup

Install the dependencies:

```bash
npm install
```

Create a `.env` file in the project root with your MongoDB Atlas credentials:

```dotenv
MONGODB_USERNAME=your_database_username
MONGODB_PASSWORD=your_database_password
MONGODB_CLUSTER=your-cluster.example.mongodb.net
```

Use the cluster hostname from your Atlas connection string, without the
`mongodb+srv://` prefix. Do not commit `.env`; it is excluded by `.gitignore`.

In MongoDB Atlas, make sure your database user has the required access and your
current IP address is allowed in the project's network access settings.

## Run

Start the app:

```bash
npm start
```

For development with Node's watch mode:

```bash
npm run dev
```

The server listens on port `3000`. There are no application routes yet.

## DNS note

The database configuration currently directs Node.js DNS queries to Google
Public DNS (`8.8.8.8` and `8.8.4.4`) because the local DNS resolver refused
MongoDB Atlas SRV lookups during setup. If your system resolver works normally,
you can remove that override from `src/config/database.js`.
