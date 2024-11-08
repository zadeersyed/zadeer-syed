const express = require('express');
const path = require('path');
const { connectToDatabase, getDb } = require('./mogodb'); // Import the connectToDatabase and getDb functions
const app = express();

// Set view engine to Pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Connect to the database
connectToDatabase().catch(console.error);

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/validation', (req, res) => {
    const message = req.query.message || 'No validation message provided.';
    res.render('validation', { message });
});

// Handle registration form submission
app.post('/register', async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.redirect('/validation?message=Passwords%20do%20not%20match');
    }

    try {
        const db = getDb(); // Use the getDb function to access the database
        const usersCollection = db.collection('users');

        // Check if user already exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.redirect('/validation?message=User%20already%20exists');
        }

        // Insert the new user
        await usersCollection.insertOne({ name, email, password });
        res.redirect('/validation?message=Registration%20Successful');
    } catch (error) {
        console.error('Error inserting user:', error);
        res.redirect('/validation?message=Internal%20Server%20Error');
    }
});

// Handle login form submission
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const db = getDb(); // Use the getDb function to access the database
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ email, password });

        if (user) {
            res.redirect('/?message=Login%20Successful');
        } else {
            res.redirect('/validation?message=Invalid%20Credentials');
        }
    } catch (error) {
        console.error('Error finding user:', error);
        res.redirect('/validation?message=Internal%20Server%20Error');
    }
});

// Start the server
app.listen(9000, () => {
    console.log('Server is running on http://localhost:9000');
});
