const express = require('express')
var mongoose = require('mongoose');
var bodyParser = require('body-parser')
var bcrypt = require('bcrypt-nodejs');
var cors = require('cors');

const app = express();

// Then use it before your routes are set up:
app.use(cors());

// app.use(function (req, res, next) {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//     res.setHeader("Access-Control-Allow-Headers", "Content-Type");
//     res.setHeader("Access-Control-Allow-Credentials", true);
//     next();
// });
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

var url = "mongodb+srv://lmavaiya:111996A@M@cluster0-ivhjb.mongodb.net/HomeServices?retryWrites=true";
mongoose.connect(url, { useNewUrlParser: true }, () => console.log("Database Connected."));

require('./worker')
const Worker = mongoose.model('Worker');




//-----------------------------------------------------------------------------------------------
// ------------------------------------------Home------------------------------------------------
//-----------------------------------------------------------------------------------------------
app.get('/', (req, res) => res.send('worker service on...'))




//------------------------------------------------------------------------------------------------
// -------------------------------------- worker Login -------------------------------------------
//------------------------------------------------------------------------------------------------

app.post('/login', function (req, res) {
    console.log("HEllo");
    var query = Worker.findOne({ email: req.body.email });
    query.exec(function (err, user) {
        if (err)
            res.send("user not found.");
        if (bcrypt.compareSync(req.body.password, user.password)) {
            // res.send("password Match");
            res.json(user);
        } else {
            res.send("password did not Match");
        }
    });
});



//------------------------------------------------------------------------------------------------
// -------------------------------------- Registration -------------------------------------------
//------------------------------------------------------------------------------------------------

app.post('/register', function (req, res) {

    var new_worker = new Worker();
    new_worker.name = req.body.name;

    new_worker.email = req.body.email;
    new_worker.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);

    new_worker.phone = req.body.phone;
    new_worker.gender = req.body.gender;
    new_worker.address = req.body.address;
    new_worker.work_type = req.body.work_type;
    new_worker.registered_on = Date.now();
    new_worker.date_of_birth = req.body.date_of_birth;

    new_worker.status = 0;
    new_worker.save()
        .then(() => res.send("Registered Successfully"))
        .catch(
            (err) => {
                if (err.code == "11000")
                    res.send("User Already exits");
                else
                    res.send("Something wrong happened Try Again.")
            }
        );
});



//------------------------------------------------------------------------------------------------
// -------------------------------------- Update Profile -----------------------------------------
//------------------------------------------------------------------------------------------------




//------------------------------------------------------------------------------------------------
// -------------------------------------- Find All -----------------------------------------------
//------------------------------------------------------------------------------------------------


app.get('/worker/', (req, res) => {
    var query = Worker.find({});
    query.exec(function (err, docs) {
        if (err)
            res.send({ "msg": "Not Found" });
        console.log(docs);
        res.json(docs);
    });
})



//------------------------------------------------------------------------------------------------
// -------------------------------------- find by Id----------------------------------------------
//------------------------------------------------------------------------------------------------

app.get('/worker/:id', (req, res) => {
    var query = Worker.findById(req.params.id);
    query.exec(function (err, docs) {
        if (err)
            res.send({ "msg": "Not Found" });
        console.log(docs);
        res.json(docs);
    });
})



/*--------------------------------------------------------------------------------------------------
------------------------------------------- Update  Worker Status  ---------------------------------
--------------------------------------------------------------------------------------------------*/


app.post('/update_status/', (req, res) => {
    Worker.findById(req.body.id)
        .then((response) => {
            var new_worker = Worker(response);
            new_worker.status = !new_worker.status;
            // res.json(new_worker);
            Worker.findByIdAndUpdate(new_worker._id, new_worker, { new: true }, function (err, model) {
                if (err)
                    res.send(err);
                else
                    res.send(model);
            });
        })
        .catch((e) => res.send(e));

})



//------------------------------------------------------------------------------------------------
// ---------------------------- Port Config-------------------------------------------------------
//------------------------------------------------------------------------------------------------

// const PORT = process.env.PORT || 4004
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log("server Started"))