//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  name: String
  };

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Fix AC"
});

const item2 = new Item ({
  name: "Fill out school survey"
});

const item3 = new Item ({
  name: "Pull bamboo roots from pool area"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems){
    if(err){
      console.log(err);
    } else {
      console.log(foundItems);
      if(foundItems.length === 0){
        Item.insertMany(defaultItems,function(err){
          if(err){
            console.log(err);
          } else {
            console.log("successfully added default items to the db");
          }
        });
        res.redirect("/");
      } else {
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
   }
  });
});

app.get("/:customListName", function(req, res){
//  console.log(req.params.customListName);
  const customListName = req.params.customListName;

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        // create a new listTitle
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        console.log("Exists!");
        // Show an existing listTitle
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const item = new Item ({
    name: itemName
  });
  item.save();
  res.redirect("/");
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemId, function(err){
    if (!err){console.log("Item removed!");
    res.redirect("/");
    }
  });
});

//app.get("/work", function(req,res){
//  res.render("list", {listTitle: "Work List", newListItems: workItems});
//});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
