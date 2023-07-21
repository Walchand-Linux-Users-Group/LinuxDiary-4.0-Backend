const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const app = express();
const connectMongoDB = require("./db");
const user = require("./user");
const path = require("path");
const sendEmail = require("./email");


dotenv.config();
connectMongoDB();

const port = process.env.PORT || 5000;
app.use(express.json());


app.use(express.urlencoded({ extended: false }));
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

const corsOptions = {
  origin: "*",
};
app.use(cors(corsOptions));

app.get("/listOfUsers", async (req, res) => {
  const users = await user.find();
  res.send({ Users: users });
});

app.get("/registeredUsers", async (req, res) => {
  const count = await user.find().count();
  res.send({ "No Of Users": count });
});

app.post("/createUser", async (req, res) => {
  try {
    // console.log(req.body);
    const existing = await user.findOne({ email: req.body.email });

    if (existing != null) {
      console.log("invalid email");
      return res.status(403).send({
        success: "false",
        message: "Email Already Registered",
      });
    }
    const existing2 = await user.findOne({
      transactionId: req.body.transactionId,
    });

    if (existing2 != null) {
      return res.status(402).send({
        success: "false",
        message: "Transaction id already used",
      });
    }

    if (req.body.phone.toString().length !== 10) {
      return res.status(401).send({
        success: "false",
        message: "Invalid mobile number",
      });
    }

    let User = new user({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      transactionId: req.body.transactionId,
      collegeName: req.body.collegeName,
      yearOfStudy: req.body.yearOfStudy,
      isDualBooted: req.body.isDualBooted,
      branch: req.body.branch,
      referalCode: req.body.referalCode,
    });
    const postdata = await User.save();
    try {
      sendEmail(User.email, "Thank You for registering", "Have a safe journey");
    } catch (error) {
      console.log(error);
    }
    console.log(postdata);
    return res
      .status(201)
      .json({
        success: true,
        message: "User Registered Successfully",
        postdata,
      });
  } catch (error) {
    res.status(500).send("Failed to submit!!! Try Again");
    console.log(error);
  }
});

app.listen(port, () => {
  console.log("Listening to port 5000");
});
