var express = require("express");

var router = express.Router();

var request = require("request");

var cheerio = require("cheerio");

var mongoose = require("mongoose");

var bodyparser = require ("body-parser")

mongoose.Promise = Promise;

var Note = require("../models/Note.js");
var Article = require("../models/Article.js");

router.get("/", function(req, res) {
  res.render("index");
});


router.get("/savedarticles", function(req, res) {
  Article.find({}, function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      var hbsArticleObject = {
        articles: doc
      };

      res.render("savedarticles", hbsArticleObject);
    }
  });
});


router.post("/scrape", function(req, res) {
  request("http://www.nytimes.com/", function(error, response, html) {
    var $ = cheerio.load(html);

    var scrapedArticles = {};
    $("article h2").each(function(i, element) {
      var result = {};

      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      scrapedArticles[i] = result;

    });

    var hbsArticleObject = {
        articles: scrapedArticles
    };

    res.render("index", hbsArticleObject);

  });
});

router.post("/save", function(req, res) {

  // console.log("Title: " + req.body.title);

  var newArticleObject = {};

  newArticleObject.title = req.body.title;

  newArticleObject.link = req.body.link;

  var entry = new Article(newArticleObject);

  entry.save(function(err, doc) {
    if (err) {
      console.log(err);
    }
    else {
      console.log(doc);
    }
  });

  res.redirect("/savedarticles");

});

router.get("/delete/:id", function(req, res) {
  // console.log("ID to delete" + req.params.id);

  Article.findOneAndRemove({"_id": req.params.id}, function (err, offer) {
    if (err) {
      console.log("Not able to delete this article:" + err);
    } else {
      console.log("Deleted");
    }
    res.redirect("/savedarticles");
  });
});

router.get("/notes/:id", function(req, res) {
  Note.findOneAndRemove({"_id": req.params.id}, function (err, doc) {
    if (err) {
      console.log("Not able to delete:" + err);
    } else {
      console.log("Deleted");
    }
    res.send(doc);
  });
});


router.get("/articles/:id", function(req, res) {

  console.log("ID is getting read" + req.params.id);
  Article.findOne({"_id": req.params.id})

  .populate('notes')

  .exec(function(err, doc) {
    if (err) {
      console.log("Not able to find article and get notes.");
    }
    else {
      console.log("We are getting article and maybe notes? " + doc);
      res.json(doc);
    }
  });
});


router.post("/articles/:id", function(req, res) {
  var newNote = new Note(req.body);
  
  newNote.save(function(error, doc) {
    if (error) {
      console.log(error);
    } 
    else {
      Article.findOneAndUpdate({ "_id": req.params.id }, {$push: {notes: doc._id}}, {new: true, upsert: true})

      .populate('notes')

      .exec(function (err, doc) {
        if (err) {
          console.log("Cannot find article.");
        } else {
          res.send(doc);
        }
      });
    }
  });
});

module.exports = router;