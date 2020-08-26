# Bookmarks Server

An API server for the Bookmarks application that was built in React. The code has been modularized for better organization.

## Setup

* Clone this repository to your local computer.
* Install the dependencies for the project.
* Confirm your PostgreSQL server is running.
* Copy the `example.env` file as `.env` and update `.env` with the following fields with your database credentials:

```
API_TOKEN="API_TOKEN"
DB_URL="postgresql://USERNAME@localhost/DATABASE_NAME"
TEST_DB_URL="postgresql://USERNAME@localhost/TEST_DATABASE_NAME"
```

* You can now run the server locally with `npm start`.