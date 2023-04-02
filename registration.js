const bcrypt = require('bcrypt');
const BigchainDB = require('bigchaindb-driver')
const bip39 = require('bip39')
const mongoose = require('mongoose');
const User = require('./models/user');


async function connectToDatabase() {
  try {
    await mongoose.connect('mongodb://localhost/c_database', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to database');
  } catch (error) {
    console.error('Error connecting to database:', error.message);
  }
}

async function registerUser(name, id, email, password) {
    // Generate a random seed phrase
    const seedPhrase = bip39.generateMnemonic()

    // Derive a BigchainDB keypair from the seed phrase
    const seed = bip39.mnemonicToSeedSync(seedPhrase)
    const keyPair = new BigchainDB.Ed25519Keypair(seed.slice(0, 32))
    console.log(seedPhrase);
    console.log(keyPair);
    await connectToDatabase(); // Connect to database dynamically
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, id, email, password: hashedPassword, publicKey: keyPair.publicKey, privateKey: keyPair.privateKey });
    await user.save();
    console.log('User saved to database');
    mongoose.disconnect(); // Disconnect from database after saving user
}

module.exports = { registerUser };
