const express = require('express');
const bodyParser = require('body-parser');
const BigchainDB = require('bigchaindb-driver');

const { registerUser } = require('./registration');
const app = express();

// Configure BigchainDB connection
const API_PATH = 'http://localhost:9984/api/v1/';
const conn = new BigchainDB.Connection(API_PATH);
const alice = new BigchainDB.Ed25519Keypair();

app.use(express.static('public'));

// Middleware for parsing JSON and urlencoded form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Serve the HTML form for adding a book
app.get('/add-book', (req, res) => {
  res.sendFile(__dirname + '/public/add-book.html');
});

app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/public/registration.html');
});

app.get('/book-list', (req, res) => {
  res.sendFile(__dirname + '/public/book-list.html');
});


// Handle submission of the add book form
app.post('/add-book', async (req, res) => {
  const { title, author, description, isbn, language } = req.body;

  // Create a new asset for the book data
  const assetData = {
    'tag': 'book',
    'title': title,
    'author': author,
    'description': description,
    'isbn': isbn,
    'lang': language
  };
  console.log(assetData);

  // Create a new transaction with the asset data as the payload
  const tx = BigchainDB.Transaction.makeCreateTransaction(
    assetData,
    null,
    [ BigchainDB.Transaction.makeOutput(
        BigchainDB.Transaction.makeEd25519Condition(alice.publicKey))
    ],
    alice.publicKey
  );

  // Sign the transaction with the sender's private key
  const txSigned = BigchainDB.Transaction.signTransaction(tx, alice.privateKey);

  // Send the transaction to the BigchainDB server
  await conn.postTransactionCommit(txSigned);

  // Redirect to success page
  res.redirect('/success');
});


app.post('/register', async (req, res) => {
  const { name, id, email, password} = req.body;
  await registerUser(name, id, email, password); // Call the imported function
  res.status(201).send('User created successfully');
});


app.get('/assets', async (req, res) => {
  try {
    // fetch the assets data from BigchainDB
    const assets = await conn.searchAssets('book');

    // send the assets data to the client side
    console.log(assets);
    res.send(assets);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});



// Serve the success page
app.get('/success', (req, res) => {
  res.send('added successfully!');
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
