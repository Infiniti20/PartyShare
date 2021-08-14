//Database import
import sqlite3 from "sqlite3";
import { open } from "sqlite";

async function loadDB() {
  const db = await open<sqlite3.Database, sqlite3.Statement>({
    driver: sqlite3.Database,
    filename: "../database/partyshare.db",
  });
  db.run("PRAGMA journal_mode = WAL;");
  return db;
}
export default loadDB().then(db => db)