const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));


/** server settings */
const http = require('http');
const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World!\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});


require('dotenv').config();
const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;


mongoose.connect(`mongodb+srv://${dbUsername}:${dbPassword}@cluster0.tda7zzr.mongodb.net/`);

const itemsSchema = {
  name: String
}

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({name: "Who do you want to be today?"});
const item2 = new Item({name: "The world will ask you who you are, and if you don't know, the world will tell you. -Carl Jung"});
const item3 = new Item({name: "Your TO DO LIST."});

let defaultItems = [item1, item2, item3];

const listScheme = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("list", listScheme);

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


app.get('/:customListName', function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  
  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect('/' + customListName);
      }
      else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});

app.post("/", function(req, res){

  const newItem = new Item({name: req.body.newItem});
  const listName = req.body.list;

  if(listName == "Today"){
    newItem.save();
    res.redirect('/');
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect('/' + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName == "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err){
        console.log(err);
      } else {
        console.log("Successfully removed checked item");
        res.redirect('/');
      }
    });
  } else {
    List.findOneAndUpdate({name: listName},{$pull: {items:{_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect('/' + listName);
      }
    });
  }

});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});





