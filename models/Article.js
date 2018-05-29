// Require mongoose
var mongoose = require("mongoose");
// Create Schema 
var Schema = mongoose.Schema;

// Create article schema
var ArticleSchema = new Schema({

  title: {
    type: String,
    required: true
  },

  link: {
    type: String,
    required: true
  },

  notes: [{
    type: Schema.Types.ObjectId,
    ref: "Note"
  }]
});

var Article = mongoose.model("Article", ArticleSchema);


module.exports = Article;
