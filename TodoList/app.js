const bodyParser = require('body-parser');
let express = require('express');
const mongoose = require('mongoose');
const _ = require('lodash');

let app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect('mongodb://127.0.0.1/todolistDb').then(() => {
  console.log('successfully connected');
});

const itemSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  }
});

const Item = mongoose.model("items", itemSchema);

const item = new Item({ name: "Lux Soap" });
const item2 = new Item({ name: "Cerels" });
const item3 = new Item({ name: "Eggs" });

const itemArray = [item, item2, item3];
const ListSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  items: [itemSchema]
});

const List = mongoose.model("customlists", ListSchema);

app.get('/', (req, res) => {
  Item.find({}).then((rest) => {
    if (rest.length === 0) {
      Item.insertMany(itemArray).then((res) => {
        console.log("successfully added");
      }).catch((err) => {
        console.log('error' + ' is  ' + err);
      });
      res.redirect('/');
    } else {
      res.render('list', { todoItems: rest, listTitle: "today" });
    }
  });
});

app.get('/:customListName', (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }).then((x) => {
    if (!x) {
      const newList = List({
        name: customListName,
        items: itemArray
      });
      newList.save();
      res.redirect('/' + customListName);
    } else {
      res.render('list', { todoItems: x.items, listTitle: x.name });
    }
  });
});

app.post('/', (req, res) => {
  const item = req.body.item;
  const itemTitle = req.body.list;
  console.log(itemTitle);
  const p_item = new Item({ name: item });

  if (itemTitle === "today") {
    p_item.save().then(() => console.log('successfully added'));
    res.redirect('/');
  } else {
    List.findOne({ name: itemTitle }).then((x) => {
      x.items.push(p_item);
      x.save();
      res.redirect('/' + itemTitle);
    });
  }
});

app.post('/delete', (req, res) => {
  const _id = req.body.deleteid;
  const listName = req.body.listName;
  if (listName === 'item') {
    Item.findByIdAndDelete({ _id }).then(() => {
      console.log("successfully deleted");
    });
    res.redirect('/');
  } else {
    List.findOneAndUpdate({ name: listName }, {
      $pull: { items: { _id: _id } }
    }).then(() => {
      console.log("successfully deleted");
    });
    res.redirect('/' + listName);
  }
});

app.listen(4000, () => console.log('Example app listening on port 4000!'));
