import sqlite from "sqlite3";
sqlite.verbose();

class Database {
  _db: sqlite.Database;

  constructor(path: string) {
    this._db = new sqlite.Database(path);
    this._db.run("PRAGMA journal_mode = WAL");
  }

  run(query: string, ...params: any) {
    return new Promise((resolve, reject) => {
      this._db.run(
        query,
        params.params,
        function (this: any, err: Error | null) {
          if (err) {
            reject(err);
          } else {
            resolve(this);
          }
        }
      );
    });
  }

  get(query: string, ...params: any) {
    return new Promise((resolve, reject) => {
      this._db.get(query, params.params, (err: Error | null, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(query: string, ...params: any) {
    return new Promise((resolve, reject) => {
      this._db.all(query, params.params, (err: Error | null, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  exec(query: string, ...params: any) {
    return new Promise((resolve, reject) => {
      this._db.exec(query, (err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }
}

export { Database };
