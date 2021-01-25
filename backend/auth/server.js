//TODO: hash passwords

const express = require("express");
const basicAuth = require('express-basic-auth');
const fs = require('fs');
const bodyParser = require('body-parser')
const helmet = require('helmet');
// const http = require("http").Server(app);

let app = express();
app.use(helmet());
let adminRouter = express.Router();

const PORT = process.env.PORT?process.env.PORT:3000;
const adminPassword = process.env.ADMINPASSWORD?process.env.ADMINPASSWORD:'gunnarärbäst';
const fileName = 'users.json';

//Global paths
app.use(bodyParser.json());

let adminAuth = basicAuth({
  users: {
    'admin': adminPassword
  }
});

let userAuth = basicAuth({
  authorizer: userAuthorizer,
  authorizeAsync: true
})

async function userAuthorizer(username, password, cb){
  // console.log('user auth triggered', username, password);
  userData = await readUserFile();
  if(!userData[username]){
    console.log('no match for username');
    cb(null, false);
    return;
  }
  let passwordMatches = basicAuth.safeCompare(password, userData[username]);
  console.log('passwordMatches:',passwordMatches);
  cb(null, passwordMatches);
}

app.use('/admin', adminAuth,adminRouter);
app.all('/', userAuth, function(req, res){
  res.send("this is Gunnars auth API");
})

// ADMIN Paths
// adminRouter.all('/', function(req, res, next){
//   // res.status(200).send('You passed')
//   next()
// });
async function readUserFile(){
  try{
    let fileData = fs.readFileSync(fileName);
    return JSON.parse(fileData); 
  }catch(err){
    console.error('error reading/parsing user file');
    console.error(err);
    throw err;
  }
}

function writeUserFile(userData){
  fs.writeFileSync(fileName, JSON.stringify(userData));
}

adminRouter.post('/set-users', function(req, res) {
  console.log(req.body);
  if(!req.body){
    res.status(400).send(`don't give me SHIT!`)
  }else{
    fs.writeFileSync(fileName, JSON.stringify(req.body));
    res.status(200).send('user data set');
  }
});

adminRouter.get('/get-users', async function(req, res) {
  try{
    let userData = await readUserFile();
    res.send(userData);
  }catch(err){
    res.status(500).send(`Crash boom boooom`)
  }
})

adminRouter.post('/add-users', async function(req, res){
  console.log('add-user', req.body);
  if(!req.body){
    res.status(400).send(`don't give me SHIT!`)
  }else{
    const creds = req.body;
    let userData;
    try{
      userData = await readUserFile();
      console.log(userData);
    }catch (err){ 
      res.status(500).send(`couldn't read/parse current user data...`);
    }
    try{
      let createdUsers = [];
      for(const [name, password] of Object.entries(creds)){
        createdUsers.push(name);
        userData[name] = password;
      }
      writeUserFile(userData);
      res.status(200).send(createdUsers);
      return;
    }catch(err){
      console.error(`couldn't create/write userdata`);
      console.error(err);
      res.status(500).send(`couldn't create/write userdata`);
    }
  }
  // res.status(200).send('hello add user');
})

adminRouter.post('/delete-users', async function(req, res){
  try{
    let userData = await readUserFile();
    let deletedUsers = [];
    req.body.forEach(username => {
      if(!userData[username]){
        return;
      }
      deletedUsers.push(username);
      delete userData[username];
    });
    writeUserFile(userData);
    res.send(deletedUsers)
  }catch(err){
    console.error(err);
    res.status(500).send(`crash bom bom`);
  }

  // res.send('hello from admin/delete-user. you passed');
});

adminRouter.all('/', function(req, res){
  res.send('hello from admin. you passed');
})



app.listen(PORT, function () {
  // var host = http.address().address;
  // var port = http.address().port;

  // console.log("Example app listening at http://%s:%s", host, port);
  console.log('listening on *:' + PORT);
});