const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 4000;

require('dotenv').config();

const todoRoutes = express.Router();
let Todo = require('./todomodel');

app.use(cors());
app.use(bodyParser.json());
app.use('/todos', todoRoutes);

// Atlas uri for communicating with cloud db
const uri = process.env.ATLAS_URI;

// Establish connection to local collection
mongoose.connect(uri, {
  useNewUrlParser: true
});
const connection = mongoose.connection;

connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
})

// Database Main Routes

// Get all todos
todoRoutes.route('/').get(function(req, res) {
  Todo.find(function(err, todos) {
    if (err) {
      console.log('Error getting todos: ', err);
    } else {
      res.json(todos);
    }
  });
});

// Get todo by id
todoRoutes.route('/:id').get(function(req, res) {
  let id = req.params.id;
  Todo.findById(id, function(err, todo) {
    res.json(todo);
  });
});

// Add a new todo to the database
todoRoutes.route('/add').post(function(req, res) {
  let todo = new Todo(req.body);
  console.log('Todo to add: ', todo);
  todo.save()
    .then(todo => {
      res.status(200).json({'todo': 'todo added successfully'});
    })
    .catch(err => {
      res.status(400).send('adding new todo failed');
    });
});

// Update an existing todo
todoRoutes.route('/update/:id').post(function(req, res) {
  Todo.findById(req.params.id, function(err, todo) {
    if (!todo) {
      res.status(404).send('data not found');
    } else {
      todo.todo_description = req.body.todo_description;
      todo.todo_responsible = req.body.todo_responsible;
      todo.todo_priority = req.body.todo_priority;
      todo.todo_completed = req.body.todo_completed;

      todo.save().then(todo => {
        res.json('Todo updated successfully');
      })
      .catch(err => {
        res.status(400).send('Update failed');
      })
    }
  });
});

// Delete an existing todo
todoRoutes.route('/delete/:id').get(function(req, res) {
  Todo.findByIdAndRemove({_id: req.params.id}, (err, todo) => {
    if (err) {
      console.log('Error deleting todo from server: ', err);
    } else {
      res.json('Todo successfully deleted from server');
    }
  });
});

app.listen(PORT, function() {
  console.log('Server running on Port: ' + PORT);
});
