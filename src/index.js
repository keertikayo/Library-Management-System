

const express = require("express")
const app = express()
const path = require("path")
const hbs = require("hbs")

const Student_collection = require("./student_mongo");
const Books_collection = require("./books_mongo");


const templatePath = path.join(__dirname, "../templates");


app.use(express.json())
app.use(express.urlencoded({extended: true})) 

app.set("view engine", "hbs")
app.set("views", templatePath)


app.get("/", (req, res) => {
    res.render("signup")
});



app.get("/login",(req,res)=> {
    res.render("login")
});

app.get("/signup",(req,res)=> {
    res.render("signup")
});



app.post("/signup", async (req, res) => {
    console.log("Signup request received:", req.body);
        
        if (!req.body.username || !req.body.password || !req.body.email) {
            return res.status(400).send("Name, email and password are required");
        }

        const data = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        }

        console.log("Attempting to insert data:", data);

        const result = await Student_collection.create(data);
        
        console.log("Data inserted successfully:", result);
    
        res.redirect('/login')
    
})


app.post("/login", async (req, res) => {
    try {
        console.log("Login request received");
        console.log("Request body:", req.body);
        console.log("Username:", req.body.username);
        console.log("Password:", req.body.password);

        if (!req.body.username || !req.body.password) {
            console.error("Missing name or password");
            return res.status(400).send("Name and password are required");
        }
        

        const check = await Student_collection.findOne({username: req.body.username})
        console.log("Found user:", check)
    
        if (req.body.username==='admin' && req.body.password==='admin1'){
            res.render("admin")
            return;
         }
        
        if (!check) {
            return res.send("User not found");
        }


        
        if(check.password === req.body.password){
            res.render("dashboard")
        } else {
            res.send("wrong password")
        }
    }
    catch(error) {
        console.error("Login error:", error);
        res.status(500).send("An error occurred during login");
    }
})


app.post("/addnew", async (req, res) => {
    console.log("New Book request received:", req.body);

    if (!req.body.bookTitle || !req.body.bookID) {
        return res.status(400).send("Book ID and Title are required");
    }

    const data1 = {
        bookTitle: req.body.bookTitle,
        bookID: req.body.bookID,
        issueStatus: false,
        username: null,
        date: null
    };

    console.log("Attempting to insert data:", data1);

    try {
        const result1 = await Books_collection.create(data1);
        console.log("Data inserted successfully:", result1);

        res.status(201).send("Book added successfully!");
    } catch (err) {
        if (err.code === 11000) {
            console.error("Duplicate Key Error:", err.message);
            res.status(400).send("Book ID already exists. Please use a unique Book ID.");
        } else {
            console.error("An unexpected error occurred:", err.message);
            res.status(500).send("Internal Server Error");
        }
    }
});


app.post("/issue", async (req, res) => {
    try {
        const { username, bookTitle, bookID, date } = req.body;
        console.log(req.body)
        if (!username || !bookID || !bookTitle || !date) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const book = await Books_collection.findOne({ bookTitle, bookID });
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (book.username !== null) {
            return res.status(400).json({ message: "This book is already issued to someone else" });
        }

        book.username = username;
        book.issueStatus = true;
        book.date = date;
        await book.save();

        res.status(200).json({ message: "Book issued successfully" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "An error occurred while processing your request" });
    }
});

app.post("/return", async (req, res) => {
    try {
        const { usernameReturn, bookTitleReturn, bookIDReturn } = req.body;

        if (!usernameReturn || !bookIDReturn || !bookTitleReturn) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const book = await Books_collection.findOne({ bookTitle: bookTitleReturn, bookID: bookIDReturn });
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (book.username !== usernameReturn) {
            return res.status(400).json({ message: "This book is not issued to the provided user" });
        }

        const issuedDate = book.date;
        const dueDate = new Date(issuedDate.getTime() + (14 * 24 * 60 * 60 * 1000)); // 14 days from issued date
        const today = new Date();
        const daysPastDue = Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / (24 * 60 * 60 * 1000)));

        book.username = null;
        book.date = null;
        book.issueStatus = false;
        await book.save();

        res.status(200).json({ dueDate: dueDate.toLocaleDateString(), daysPastDue });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "An error occurred while processing your request" });
    }
});


app.get('/books', async (req, res) => {
    try {
        const books = await Books_collection.find({});
        res.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'Error fetching books data' });
    }
});



app.get('/logout', (req, res) => {
    res.redirect('/login');
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
})

