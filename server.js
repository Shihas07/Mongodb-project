



const express = require("express");
const app = express();
const path = require('path');
// const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectId } = require('mongodb');


const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", 'ejs');
app.set("views", path.join(__dirname, "views"));


// Connection URL
const url = 'mongodb://localhost:27017';
const dbName = 'userdatas';

// Create a new MongoClient
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

app.get("/", (req, res) => {
    // res.render("signup");
    res.redirect("/login")
});

//  app.get("/home",(req,res)=>{

//     const { email, password } = req.body;

//             res.render("home", { user:{email,password} });
//         })
// app.get("/home", (req, res) => {
//     const User = req.body
// console.log(User);
//     const user = {
//         name:User.name, // Replace with the actual name
//         email: User.email // Replace with the actual email
//     }
    

//     res.render("home");
//     // res.redirect("home")
// });



app.get("/signup", (req, res) => {
  res.render("signup");
});


app.post("/signup", (req, res) => {

    const { name, email, password } = req.body;
    
    

    // Connect to the server
    client.connect()
        .then(() => {
            console.log('Connected to MongoDB');

            // Specify the database
            const db = client.db(dbName);

            // Specify the collection (assuming a collection named 'users')
            const collection = db.collection('userdata');

            // Insert the form data into the collection
            return collection.insertOne({
                name: name,
                email: email,
                password: password
            });
        })
        .then(() => {
            
            client.close();
            // res.render("home", { user:{name,email,password} });
            // res.render("/home",{})
            res.redirect("login")
        })
        .catch((err) => {
            console.error('Error connecting to MongoDB:', err);
            res.status(500).send('Internal Server Error');
        });
});

app.get("/login", (req, res) => {
    res.render('login');
});

app.post("/login", (req, res) => {
    const { name, password } = req.body;

    // Connect to the server
    client.connect()
        .then(() => {
            console.log('Connected to MongoDB');

            // Specify the database
            const db = client.db(dbName);

            // Specify the collection (assuming a collection named 'users')
            const collection = db.collection('userdata');

            // Find the user by name
            return collection.findOne({ name: name });
        })
        .then((user) => {
          console.log(user);
            // Check if the user exists and the password is correct
            if (user && user.password === password) {
                // res.render('home', { name: user.name, email: user.email, user: user, errorMessage: '' });
                // res.render('home', { name: user.name, mail: user.email }); 
                res.render('home', { user: user }); 


            } else {
                res.render('login', { errorMessage: 'Invalid username or password' });
            }
        })
        .catch((err) => {
            console.error('Error connecting to MongoDB:', err);
            res.status(500).send('Internal Server Error');
        });
});

app.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    console.log(id);

    // Connect to the server
    client.connect()
        .then(() => {
            console.log('Connected to MongoDB');

            // Specify the database
            const db = client.db(dbName);

            // Specify the collection (assuming a collection named 'users')
            const collection = db.collection('userdata');

            // Delete the document by ID
            return collection.deleteOne({ _id: new ObjectId(id) });
        })
        .then(() => {
            console.log('Document deleted successfully');
            res.redirect('/login');  // Redirect to the home page or another appropriate page
        })
        .catch((err) => {
            console.error('Error connecting to MongoDB:', err);
            res.status(500).send('Internal Server Error');
        });
});


    
     
    app.get("/edit/:id", (req, res) => {
        const id = req.params.id;
        console.log(id);
        client.connect()
            .then(() => {
                console.log('Connected to MongoDB');
    
                const db = client.db(dbName);
                const collection = db.collection('userdata');
    
                // Use _id instead of id in the query
                return collection.findOne({ _id: new ObjectId(id) });
            })
            .then((user) => {
                if (user) {
                    // Render the edit form with the user details
                    res.render('edit', { user: user });
                    console.log(user);
                } else {
                    // Handle case when user is not found
                    res.status(404).send('User not found');
                }
            })
            .catch((err) => {
                console.error('Error connecting to MongoDB:', err);
                res.status(500).send('Internal Server Error');
            });
    });
    
    // app.post("/update/:id",(req,res)=>{
    //      const id=req.params.id

    //      client.connect()
    //      .then(() => {
    //          console.log('Connected to MongoDB');
 
    //          const db = client.db(dbName);
    //          const collection = db.collection('userdata');

    //           collection.findeOne({ _id: new ObjectId(id) })

    //           return collection.insertOne({
    //             name: name,
    //             email: email,
    //             password: password
    //         });

    //         res.render("home")
             
    //      })
    // })
    app.post("/update/:id", (req, res) => {
        const id = req.params.id;
        const { name, email, password } = req.body;
    
        let collection; // Declare the collection variable in the outer scope
    
        client.connect()
            .then(() => {
                console.log('Connected to MongoDB');
    
                const db = client.db(dbName);
                collection = db.collection('userdata'); // Assign the collection variable here
    
                return collection.findOne({ _id: new ObjectId(id) });
            })
            .then((user) => {
                if (user) {
                    user.name = name;
                    user.email = email;
                    user.password = password;
    
                    return collection.updateOne({ _id: new ObjectId(id) }, { $set: user });
                } else {
                    res.status(404).send('User not found');
                }
            })
            .then(() => {
                console.log('User updated successfully');
                res.redirect('/login');
            })
            .catch((err) => {
                console.error('Error updating user:', err);
                res.status(500).send('Internal Server Error');
            });
    });
    
    
    

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
