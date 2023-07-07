const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  publisher: {
    type: String,
    required: true
  },
  publishedDate: {
    type: Date,
    required: true
  },
  genre: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  pages: {
    type: Number,
    required: true
  },
  ISBN: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  height: {
    type: Number,
    required: true
  },
  width: {
    type: Number,
    required: true
  },
  thickness: {
    type: Number,
    required: true
  }
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
