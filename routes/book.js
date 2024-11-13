const router = require("express").Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./userAuth");
const Book = require("../models/book");

//Add book-admin
router.post("/add-book", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const user = await User.findById(id);

    // Check if user is admin
    if (user.role !== "admin") {
      return res
        .status(400)
        .json({ message: "You are not authorized to perform admin tasks" });
    }

    // Check if the book already exists by title and author
    const existingBook = await Book.findOne({
      title: req.body.title,
      author: req.body.author,
    });

    
    if (existingBook) {
      return res
        .status(400)
        .json({ message: "This book already exists in the collection" });
    }

    // Create and save the new book
    const book = new Book({
      url: req.body.url,
      title: req.body.title,
      author: req.body.author,
      price: req.body.price,
      desc: req.body.desc,
      language: req.body.language,
    });

    await book.save();
    res.status(200).json({ message: "Book Added Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});


//Update Book-admin
router.put("/update-book", authenticateToken, async (req, res) => {
  try {
    const { bookid } = req.headers;
    await Book.findByIdAndUpdate(bookid, {
      url: req.body.url,
      title: req.body.title,
      author: req.body.author,
      price: req.body.price,
      desc: req.body.desc,
      language: req.body.language,
    });

    return res.status(200).json({ message: "Book updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "An error occured" });
  }
});

//DELETE BOOK
router.delete("/delete-book", authenticateToken, async (req, res) => {
  try {
    const { bookid } = req.headers;
    await Book.findByIdAndDelete(bookid);
    return res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "An error occured" });
  }
});

//Get all books
router.get("/get-all-books", async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    return res.json({ status: "Success", data: books });
  } catch (error) {
    return res.status(500).json({ message: "An error occured" });
  }
});



//Get recently added books limit 4
router.get("/get-recent-books", async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 }).limit(2);
    return res.json({
      status: "Success",
      data: books,
    });
  } catch (error) {
    return res.status(500).json({ message: "An error occured" });
  }
});


//Get 1(particular) book details by id
router.get("/get-book-by-id/:id", async(req,res)=>{
  try{
      const {id} = req.params
      const book = await Book.findById(id)
      return res.json({status:"Success", data:book})
  }
  catch(error){
    return res.status(500).json({ message: "An error occured" });

  }
})

module.exports = router;