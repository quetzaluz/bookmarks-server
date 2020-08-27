# Bookmarks Server

An API server for the Bookmarks application that was built in React. The code has been modularized for better organization.

## Setup

* Clone this repository to your local computer.
* Install the dependencies for the project.
* Confirm your PostgreSQL server is running.
* If you want to seed your database, you can use this seed script: 

```
psql -U YOUR_USERNAME -d bookmarks -f ./seeds/seed.bookmarks_list.sql
```

* Copy the `example.env` file as `.env` and update `.env` with the following fields with your database credentials:

```
API_TOKEN="YOUR_API_TOKEN"
DB_URL="postgresql://YOUR_USERNAME@localhost/YOUR_DATABASE_NAME"
TEST_DB_URL="postgresql://YOUR_USERNAME@localhost/YOUR_TEST_DATABASE_NAME"
```

* You can now run the server locally with `npm start`.