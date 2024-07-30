from flask import Flask, request

class User:
    def __init__(self, username, password):
        self.username = password
        self.password = password

    def validate_password(self, input_password):
        return self.password == input_password

app = Flask(__name__)

# SQLite database initialization
import sqlite3
conn = sqlite3.connect('users.db')
conn.execute('''CREATE TABLE IF NOT EXISTS Users
             (username TEXT PRIMARY KEY NOT NULL,
             password TEXT NOT NULL);''')
conn.close()

def get_user_by_username(username):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    # query the user from our sqlite talbe
    cursor.execute(f'SELECT * FROM Users WHERE username = {username}')
    row = cursor.fetchone()
    conn.close()
    if row:
        return User(row[0], row[1])
    else:
        return None

# handle login
@app.route('/', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = get_user_by_username(username)
        message = request.args.get('message', 'Nice Login!')

        if user and user.validate_password(password):
            return f'Welcome, {username}!<br>{message}'
        else:
            # show error for bad password
            return 'Invalid username or password.'

    # GET request (show login form)
    message = request.args.get('message', 'Nice Login!')
    return '''
    <form method="post">
      Username: <input type="text" name="username"><br>
      Password: <input type="password" name="password"><br>
      <input type="submit" value="Login">
    </form>
    '''

if __name__ == '__main__':
    app.run(port=3000)

