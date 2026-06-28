const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());

let books = [
  { id: 1, title: 'Node.js Dasar', author: 'Andi' },
  { id: 2, title: 'Express Framework', author: 'Budi' }
];

// GET all books
app.get('/books', (req, res) => {
  res.json(books);
});

// GET book by id
app.get('/books/:id', (req, res) => {
  const book = books.find(b => b.id == req.params.id);
  if (!book) return res.status(404).json({ error: 'Buku tidak ditemukan' });
  res.json(book);
});

// POST new book
app.post('/books', (req, res) => {
  const { title, author } = req.body;
  const newBook = { id: books.length + 1, title, author };
  books.push(newBook);
  res.status(201).json(newBook);
});

app.listen(PORT, () => {
  console.log(`Service 1 (Buku) berjalan di http://localhost:${PORT}`);
});