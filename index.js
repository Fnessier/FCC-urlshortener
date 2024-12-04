require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");
const urlparser = require("url");
const mongoose = require("mongoose");
var Schema = mongoose.Schema;

mongoose.connect(
   process.env.MONGO_URI ,
);

var urlSchema = new Schema({
  original_url: {type:String, required:true},
  short_url: {type:Number, required: true},
});

const urls = mongoose.model("urls", urlSchema);


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", function (req, res) {
  console.log(req.body);
  const url = req.body.url;
  const dnslookup = dns.lookup(
    urlparser.parse(url).hostname,
    async (err, address) => {
      if (!address) {
        res.json({ error: "Invalid URL" });
      } else {
        const urlCount = await urls.countDocuments({});
        const urlDoc = {
          original_url:url,
          short_url: urlCount,
        };

        const result = await urls.create(urlDoc);
        console.log(result);
        res.json({ original_url: url, short_url: urlCount });
      }
    },
  );
});

app.get("/api/shorturl/:short_url", async (req, res) => {
  const shorturl = req.params.short_url;
  const urlDoc = await urls.findOne({ short_url: +shorturl });
  console.log(urlDoc);
  res.redirect(urlDoc.original_url)
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});