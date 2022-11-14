const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const itemsSchema = {
  name: String
}

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({name: "Who do you want to be today?"});
const item2 = new Item({name: "The world will ask you who you are. If you don't have a response, the world will tell you."});
const item3 = new Item({name: "Your TO DO LIST."});

let defaultItems = [item1, item2, item3];

app.get("/", function(req, res) {

  Item.find({},function(err, foundItems){
    if(err){
      console.log(err);
    } else {
      if(foundItems.length == 0){
        Item.insertMany(defaultItems, function(err){
          if (err){
            console.log(err);
          } else {
            console.log("Successfully saved items to database.")
            res.redirect("/");
          }
        });
      } else {
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
    }
  });
  
});

app.post("/", function(req, res){

  const newItem = new Item({name: req.body.newItem});
  newItem.save();
  res.redirect('/');
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(err){
      console.log(err);
    } else {
      console.log("Successfully removed checked item");
      res.redirect('/');
    }
  });
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
