
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js")
const mongoose = require("mongoose");
const _=require("lodash");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.set("strictQuery", false);
mongoose.connect("mongodb+srv://gaurav24:552001@cluster0.pqvnddw.mongodb.net/todolistDB",{ useNewUrlParser: true });



app.set('view engine', 'ejs');

const itemsShema = {
    name: String
}

const topicShema = {
    name: String,
    items: [itemsShema]
}

const Topic = mongoose.model("Topic", topicShema); 

const Item = mongoose.model("Item", itemsShema);

const item1 = new Item({
    name: "Welcome"
});

const item2 = new Item({
    name: "Add your Todo items"
});

const allitems = [item1, item2];




// Item.deleteMany({ name:"Add your Todo items" }, function (err) {
//     if (err) {
//         console.log("Error");
//     } else {
//         console.log("Successfull");
//     }
// })


app.post("/", function (req, res) {
    let item = req.body.listitem;
    const title = req.body.list;

    const itemx = new Item({
        name: item
    })

    if (title === "Today") {
        itemx.save();
        res.redirect("/");
    } else {
        Topic.findOne({ name: title }, function (err, foundlist) {
            foundlist.items.push(itemx);
            foundlist.save();
            res.redirect("/" + title);
        });
    }



});

app.post("/delete", function (req, res) {

    const listname = req.body.listname;

    if (listname === "Today") {
        Item.deleteOne({ _id: req.body.checkbox }, function (err) {
            if (err) {
                console.log("Error");
            } else {
                console.log("Successfull");
            }
        });

        res.redirect("/");
    }else{
        Topic.findOneAndUpdate({name:listname},{$pull:{items:{ _id: req.body.checkbox}}},function(err,foundlist){
            if(!err){
                res.redirect("/"+listname);
            }
        });
    }

});

app.get("/", function (req, res) {

    Item.find({}, function (err, allt) {
        if (allt.length === 0) {
            Item.insertMany(allitems, function (err) {
                if (err) {
                    console.log("Error");
                } else {
                    console.log("Successfull");
                }
            });
            res.redirect("/");
        } else {

            res.render("list", { kindofday: "Today", newitems: allt });
        }

    });




});

app.get("/:way", function (req, res) {
    const way = _.capitalize(req.params.way);


    Topic.findOne({ name: way }, function (err, foundlist) {
        if (!err) {
            if (!foundlist) {
                const topic1 = new Topic({
                    name: way,
                    items: allitems
                });
                topic1.save();
                res.redirect("/" + way);
            } else {
                res.render("list", { kindofday: foundlist.name, newitems: foundlist.items })
            }
        }

    })


});

app.get("/about", function (req, res) {
    res.render("about");
});
const port=process.env.PORT || 3000;

app.listen(port, function () {
    console.log("server is started on port 3000");
});
