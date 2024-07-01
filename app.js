const express = require("express");
const { ObjectId } = require("mongodb");
const { connectToDb, getDb } = require("./connections");
const port = 3000;
const app = express();
const bodyParser=require("body-parser")
app.use(bodyParser.json())

let db;
connectToDb((error, client) => {
  if (error) {
    console.error("Error connecting to the database:", error);
    return;
  }

  db = getDb(client);

  app.listen(port, () => {
    console.log("Server is running on port", port);
  });
});


app.get("/list", async (req, res) => {
  try {
    const listings = await db.collection("listings").find().sort({ price: 1 }).toArray();
    res.status(200).json(listings);
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: "Error occurred while fetching listings" });
  }
});

  app.post("/add", async (req, res) => {
    try {
      const body = req.body;
      const result = await db.collection("listings").insertOne(body);
      console.log(`A document inserted ${result}`);
      res.status(201).json({ message: "Document inserted successfully" });
    } catch (error) {
      console.error("Error inserting document:", error);
      res.status(500).json({ error: "Error occurred while inserting document" });
    }
  });
  app.put("/update/:id", async (req, res) => {
    try {
      const id = req.params.id; // Get the ID from request parameters
      const updatedData = req.body; // Updated data from request body
  
      // Validate input data or perform any necessary validation checks
  
      // Check if the document exists before updating
      const existingDoc = await db.collection("listings").findOne({ _id: new ObjectId(id) });
      if (!existingDoc) {
        return res.status(404).json({ error: "Document not found" });
      }
  
      // Perform the update operation
      const result = await db.collection("listings").updateOne(
        { _id: new ObjectId(id) }, // Match document by ID
        { $set: updatedData } // Set new values
      );
  
      if (result.modifiedCount === 1) {
        res.status(200).json({ message: "Document updated successfully" });
      } else {
        res.status(500).json({ error: "Error occurred while updating document" });
      }
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ error: "Error occurred while updating document" });
    }
  });
  
  app.delete("/delete/:id", async (req, res) => {
    try {
      const id = req.params.id; 
    
      // Log the ID and constructed ObjectId for debugging
      console.log("Received ID:", id);
      const objectId = new ObjectId(id);
      console.log("Constructed ObjectId:", objectId);
    
      // Perform the delete operation
      const result = await db.collection("listings").deleteOne({ _id: objectId });
  
      if (result.deletedCount === 1) {
        res.status(200).json({ message: "Document deleted successfully" });
      } else {
        res.status(500).json({ error: "Error occurred while deleting document" });
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ error: "Error occurred while deleting document" });
    }
  });
  