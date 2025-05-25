// server.js
// A simple Express.js backend for a Todo list API

const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./todos.sqlite');

// Middleware to parse JSON requests
app.use(express.json());

// Middle ware to inlcude static content
app.use(express.static('public'))

// In-memory array to store todo items
// let todos = [
//     {
//         id: 0,
//         name: 'nina',
//         priority: 'high',
//         isComplete: false,
//         isFun: false
//     }
// ];
// let nextId = 1;

db.run(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    priority TEXT NOT NULL,
    isComplete BOOLEAN NOT NULL,
    isFun BOOLEAN NOT NULL
  )
`, (err) => {
    if (err) {
        console.error('Error creating table:', err.message);
    } else {
        console.log('Todos table created successfully.');
    }
});


// server index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

// GET all todo items
app.get('/todos', (req, res) => {
    // res.json(todos);
    db.all('SELECT * FROM todos', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// GET a specific todo item by ID
app.get('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    // const todo = todos.find(item => item.id === id);
    // if (todo) {
    //     res.json(todo);
    // } else {
    //     res.status(404).json({ message: 'Todo item not found' });
    // }
    db.get('SELECT * FROM todos WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!row) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        res.json(row);
    });
});

// POST a new todo item
app.post('/todos', (req, res) => {
    const { name, priority = 'low', isFun } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }

    // const newTodo = {
    //     id: nextId++,
    //     name,
    //     priority,
    //     isComplete: false,
    //     isFun
    // };

    // todos.push(newTodo);
    // res.status(201).json(newTodo);

    db.run(
        `INSERT INTO todos (name, priority, isComplete, isFun) VALUES (?, ?, ?, ?)`,
        [name, priority, false, isFun],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.status(201).json({
                id: this.lastID,
                name,
                priority,
                isComplete: false,
                isFun
            });
        }
    );
});

// DELETE a todo item by ID
app.delete('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    // const index = todos.findIndex(item => item.id === id);

    // if (index !== -1) {
    //     todos.splice(index, 1);
    //     res.json({ message: `Todo item ${id} deleted.` });
    // } else {
    //     res.status(404).json({ message: 'Todo item not found' });
    // }
    db.run('DELETE FROM todos WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        res.json({ message: `Todo ${id} deleted successfully` });
    });
});

console.log("Starting server...")
console.log("Testing if i am in the right place: ")

// Start the server
app.listen(port, () => {
    console.log(`Todo API server running at http://localhost:${port}`);
});