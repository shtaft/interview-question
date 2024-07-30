import * as express from 'express';
import * as sqlite3 from 'sqlite3';

interface UserRow {
  username: string;
  password: string;
}

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));

class Database {
  private db: sqlite3.Database;

  constructor(databasePath: string) {
    this.db = new sqlite3.Database(databasePath);
  }

  public getUserByUsername(username: string, callback: (error: Error | null, user: User | null) => void): void {
    // query the user from our sqlite talbe
    const query = `SELECT * FROM Users WHERE username = '${username}'`;
    this.db.get(query, (error, row: UserRow) => { // Specify the expected row type here
      if (error) {
        callback(error, null);
      } else {
        const user = row ? new User(row.username, row.password) : null;
        callback(null, user);
      }
    });
  }

  public close(): void {
    this.db.close();
  }
}

class User {
  public username: string
  private password: string

  constructor(username, password) {
    this.username = password
    this.password = password
  }

  // validate the password
  public validatePassword(inputPassword: string): boolean {
    return this.password === inputPassword;
  }
}

// SQLite database initialization
const dbPath = 'users.db';
const db = new Database(dbPath);

// Handle login
app.get('/login', (req, res) => {
  const message = req.query.message || "Nice Login!"
  res.send(`
    <form action="/login?message=${message}" method="post">
      Username: <input type="text" name="username"><br>
      Password: <input type="password" name="password"><br>
      <input type="submit" value="Login">
    </form>
  `);
});

// Handle login form submission
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const message = req.query.message

  db.getUserByUsername(username, (error, user) => {
    if (error || !user || !user.validatePassword(password)) {
      // show error for bad password
      res.send('Invalid username or password.');
    } else {
      res.send(`Welcome, ${username}!<br>${message}`);
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/login`);
});

