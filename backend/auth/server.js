//TODO: hash passwords

const express = require("express");
const cors = require('cors');
const basicAuth = require('express-basic-auth');
const fs = require('fs');
const crypto = require('crypto');
// const bodyParser = require('body-parser')
const helmet = require('helmet');
// const http = require("http").Server(app);


let app = express();
if(process.env.DEVELOPMENT){
  console.log('RUNNING AUTH IN DEVELOPMENT MODE');
  console.log('setting CORS for development purposes');
  app.use(cors());
}
app.use(helmet());
let adminRouter = express.Router();


let userRouter = express.Router();

const PORT = process.env.PORT?process.env.PORT:6060;
const adminUser = process.env.ADMIN_USER?process.env.ADMIN_USER:'admin';
const adminPassword = process.env.ADMIN_PASSWORD?process.env.ADMIN_PASSWORD:'gunnarärbäst';
const SHARED_TURN_SECRET = process.env.SHARED_TURN_SECRET?process.env.SHARED_TURN_SECRET:'rihanna is a good singer';
console.log('turn shared secret:', SHARED_TURN_SECRET);
// const adminUser = {};
const fileName = './users/users.json';

//Global paths
app.use(express.json());

let adminAuth = basicAuth({
  users: {
    [adminUser]: adminPassword
  }
});

let userAuth = basicAuth({
  authorizer: userAuthorizer,
  authorizeAsync: true
})

async function userAuthorizer(username, password, cb){
  console.log('user auth triggered', username, password);
  userData = await readUserFile();
  if(!userData[username]){
    console.log('no match for username');
    cb(null, false);
    return;
  }
  const foundPwd = userData[username].password;
  if(foundPwd){
    let passwordMatches = basicAuth.safeCompare(password, foundPwd);
    console.log('passwordMatches:',passwordMatches);
    cb(null, passwordMatches);
    return;
  }
  cb('fuck you', false);
}

app.use('/admin', function(req, res, next){
  // console.log(req.headers);
  console.log('admin request from:', req.ip);
  next();
},adminAuth,adminRouter);

// app.all('/', userAuth, function(req, res){
//   res.send("this is Gunnars auth API");
// })

// ADMIN PATHS **************************
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
    if(userData){
      res.send(userData);
    }else{
      res.status(404).send('no users created');
      return;
    }
  }catch(err){
    res.status(404).send(`the resource was not found`)
  }
})

adminRouter.post('/add-users', async function(req, res){
  console.log('add-user', req.body);
  if(!req.body){
    res.status(400).send(`don't give me SHIT!`);
    return;
  }

  const newUsers = req.body;
  let userData;
  try{
    userData = await readUserFile();
    console.log(userData);
  }catch (err){ 
    // res.status(500).send(`couldn't read/parse current user data... resetting...`);
    userData = {};
  }

  try{
    let response = {createdUsers: [], notCreatedUsers: []};
    for(const [name, data] of Object.entries(newUsers)){
      if(userData[name]){
        console.error('tried to add already existing user');
        response.notCreatedUsers.push(name);
        continue;
      }
      response.createdUsers.push(name);
      userData[name] = data;
    }
    if(response.createdUsers.length){
      writeUserFile(userData);
      res.status(200).send(response);
    }else{
      res.status(409).send(response);
    }
    return;
  }catch(err){
    console.error(`couldn't create/write userdata`);
    console.error(err);
    res.status(500).send(`couldn't create/write userdata`);
    return;
  }
})

adminRouter.post('/update-users', async function (req, res) {
  if(!req.body){
    console.log('received an invalid request: ', req);
    res.status(400).send(`don't give me SHIT!`);
    return;
  }
  console.log('request to update user(s)', req.body);

  const userObject = req.body;
  let userData;
  try{
    userData = await readUserFile();
    // console.log(userData);
  }catch (err){ 
    res.status(500).send(`couldn't read/parse current user data... bailing out!`);
    return;
  }

  try{
    let response = {updatedUsers: [], notUpdatedUsers: []};
    for(const [name, data] of Object.entries(userObject)){
      if(!userData[name]){
        console.error('no such users found:', name);
        response.notUpdatedUsers.push(name);
        continue;
      }
      response.updatedUsers.push(name);
      userData[name] = data;
    }
    if(response.updatedUsers.length){
      writeUserFile(userData);
      res.status(200).send(response);
    }else{
      res.status(404).send(response);
    }
    return;
  } catch(err){
    console.error('failed to update user(s)');
    console.error(err);
    res.status(500).send('crash boom boom');
  }
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
    res.status(500).send(`crash boom boom`);
  }

  // res.send('hello from admin/delete-user. you passed');
});

adminRouter.all('/', function(req, res){
  // console.log('admin login:', req);
  res.send('hello from admin. you passed');
})


// USER PATHS
app.use('/user', function(req, res, next){
  // console.log(req.headers);
  console.log('user route request from:', req.ip);
  next();
},userAuth ,userRouter);



userRouter.get('/', async function(req, res){
  console.log('user request');
  const username = req.auth.user;
  try{
    let userData = await readUserFile();
    if(userData[username]){
      res.send(userData[username]);
    }else{
      res.status(404).send('no userdata found');
      return;
    }
  }catch(err){
    res.status(404).send(`the resource was not found`)
  }

  // res.send("this is Gunnars auth API. Hurraay!");
});

function getTURNCredentials(name, secret){    
  let unixTimeStamp = parseInt(Date.now()/1000) + 2*3600;   // this credential would be valid for the next 24 hours
  let username = [unixTimeStamp, name].join(':');
  let password;
  let hmac = crypto.createHmac('sha1', secret);
  hmac.setEncoding('base64');
  hmac.write(username);
  hmac.end();
  password = hmac.read();
  return {
      username: username,
      password: password
  };
}
userRouter.get('/get-turn-credentials', async function(req, res){
  try{
    const user = req.auth.user;
    console.log('turn API request from: ', user);
    // let password = req.auth;
    const creds = getTURNCredentials(user, SHARED_TURN_SECRET);
    res.send(creds);
    return;
  }catch(err){
    console.error(err);
    res.status(500).send(`crash boom boom`);
  }

  // res.send('hello from admin/delete-user. you passed');
});



app.listen(PORT, function () {
  // var host = http.address().address;
  // var port = http.address().port;

  // console.log("Example app listening at http://%s:%s", host, port);
  console.log('listening on *:' + PORT);
});