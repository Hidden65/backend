require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
} = require("firebase/firestore");

const app = express();
app.use(cors());
app.use(express.json());

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const AUTH_TOKEN = process.env.AUTH_TOKEN;

// Middleware for token authentication
const authenticate = (req, res, next) => {
  const token = req.headers["authorization"];
  if (token !== `Bearer ${AUTH_TOKEN}`) {
    return res.status(403).json({ error: "Unauthorized access" });
  }
  next();
};

// API: Get All Transactions
app.get("/api/transactions", authenticate, async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "User ID is required" });

  try {
    const transactionsRef = collection(db, "users", userId, "transactions");
    const q = query(transactionsRef, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    const transactions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Add a New Transaction
app.post("/api/transactions", authenticate, async (req, res) => {
  const { userId, description, amount, type } = req.body;
  if (!userId || !description || !amount || !type) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const docRef = await addDoc(collection(db, "users", userId, "transactions"), {
      description,
      amount,
      type,
      timestamp: new Date(),
    });
    res.json({ id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Delete a Transaction
app.delete("/api/transactions/:id", authenticate, async (req, res) => {
  const { userId } = req.query;
  const { id } = req.params;

  if (!userId || !id) {
    return res.status(400).json({ error: "User ID and Transaction ID are required" });
  }
  try {
    await deleteDoc(doc(db, "users", userId, "transactions", id));
    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
