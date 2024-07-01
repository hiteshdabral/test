const express = require("express");
const mongoose = require("mongoose");
const cors=require('cors')
mongoose
  .connect("mongodb://127.0.0.1:27017/exp-app-2023")
  .then(() => {
    console.log("connected");
  })
  .catch(() => {
    console.log("error");
  });
const app = express();
const port = 8080;

app.use(express.json()); //enable to parse JSON
app.use(cors())

const { Schema, model } = mongoose;
//express valdator functons
const { checkSchema, validationResult, check } = require("express-validator");

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

//category validation
const validationSchema = {
  name: {
    in: ["body"],
    notEmpty: {
      errorMessage: "not to be emty",
    },
    trim: true,
    custom: {
      options: function (value) {
        return Category.findOne(
          { name: value }).then((obj) => {
            if (!obj) {
              return true;
            }
            throw new Error("category  name already taknem");
          })
        ;
      },
    },
  },
};

const idValidationSchema = {
  id: {
    in: ["params"],
    isMongoId: {
      errorMessage: "should be a valid mongoid",
    },
  },
};

const Category = model("Category", categorySchema);

//request handler
app.get("/all-categories", (req, res) => {
  Category.find()
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.json(err);
    });
});

//another request
app.post("/create-category", checkSchema(validationSchema), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // console.log(errors)
    return res.status(400).json({ errors: errors.array() });
  }
  const body = req.body;
  const categoryObj = new Category();
  categoryObj.name = body.name;
  categoryObj
    .save()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

//for find+ing it by id
app.get("/single-find/:id", checkSchema(idValidationSchema), (req, res) => {
  const id = req.params.id;
  Category.findOne(id)
    .then((category) => {
      if (!category) {
        return res.status(404).json({});
      }
      res.json(category);
    })
    .catch((err) => {
      res.json(err);
    });
});

//for finding it by name
app.get("/single-find/:name", (req, res) => {
  const name = req.params.name;
  Category.findOne({ name: name })
    .then((category) => {
      if (!category) {
        return res.status(404).json({});
      }
      res.json(category);
    })
    .catch((err) => {
      res.json(err);
    });
});

//update
app.put(
  "/update-route/:id",
  checkSchema(validationSchema),
  checkSchema(idValidationSchema),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const id = req.params.id;
    const body = req.body;
    Category.findByIdAndUpdate(id, body, { new: true })
      .then((category) => {
        if (!category) {
          return res.status(404).json({});
        }
        res.json(category);
      })
      .catch((err) => {
        res.json(err);
      });
  }
);

app.delete("/delete-route/:id", checkSchema(idValidationSchema), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const id = req.params.id;
  Category.findByIdAndDelete(id)
    .then((category) => {
      if (!category) {
        return res.status(404).json({});
      }
      res.json(category);
    })
    .catch((err) => {
      res.json(err);
    });
});

//expense schema
const expenseSchema = new Schema(
  {
    expenseDate: Date,
    amount: Number,
    description: String,
    Category:{
  
      type: Schema.Types.ObjectId,
      ref: "Category",
    
    }
  },
  { timestamps: true }
);

const expenseValidator = {
  expenseDate: {
    in: ["body"],
    exists: {
      notEmpty: "Expense cannot be emty",
    },
    isDate: {
      errorMessage: "date s not valid",
    },
    custom: {
      options: function (value) {
        if (new Date(value) > new Date()) {
          throw new Error("invalid");
        }
        return true;
      },
    },
  },
  amount: {
    in: ["body"],
    exists: {
      errorMessage: "amount required",
    },
    isInt: {
      errorMessage: "should be a number",
    },
    custom: {
      options: function (value, { req }) {
        if (value < 1) {
          throw new Error("not a integer");
        }
        return true;
      },
    },
  },
};

//expense for practice
const Expense = model("Expense", expenseSchema);

app.get("/expense", (req, res) => {
  Expense.find()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

app.post("/create-expense", (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const body = req.body;
  const expenseObj = new Expense(body);
  expenseObj
    .save()
    .then(() => {
      res.json(body);
    })
    .catch((err) => {
      res.json(err);
    });
});


app.get("/single/:id", checkSchema(idValidationSchema), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const id = req.params.id;
  Expense.findOne(id)
    .then((category) => {
      if (!category) {
        return res.status(404).json({});
      }
      res.json(category);
    })
    .catch((err) => {
      res.json(err);
    });
});

app.put(
  "/update-expense/:id",
  checkSchema(expenseValidator),
  checkSchema(idValidationSchema),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const id = req.params.id;
    const body = req.body;

    Expense.findByIdAndUpdate(id, body, { new: true })
      .then((category) => {
        if (!category) {
          return res.status(404).json({});
        }
        res.json(category);
      })
      .catch((err) => {
        res.json(err);
      });
  }
);

app.delete("/delete-expense/:id", checkSchema(idValidationSchema), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const id = req.params.id;
  Expense.findByIdAndDelete(id)
    .then((expense) => {
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json({ message: "Expense deleted successfully", expense });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Server error", error: err.message });
    });
});



app.listen(port, () => {
  console.log(port);
});
