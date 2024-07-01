const { MongoClient } = require("mongodb");

module.exports = {
  connectToDb: (cb) => {
    MongoClient.connect("mongodb://localhost:27017/wanderlust")
      .then((client) => {
        dbConnection = client.db();
        return cb();
      })
      .catch((error) => {
        console.log(error);
        return cb(error);
      });
  },
  getDb: () => dbConnection,
};

// const uri = "mongodb://localhost:27017";
// connect()
// async function connect() {
//   const client = new MongoClient(uri);
//   try {
//     await client.connect();
//     const db = client.db("wanderlust");
//     console.log("connected to db " + db.databaseName);
//     console.log("connected to db " + db.collections);
//   } catch (error) {
//     console.log("error");
//   } finally {
//     client.close();
//   }
// }
