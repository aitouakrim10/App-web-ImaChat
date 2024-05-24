const status = require('http-status')
const userModel = require('../models/users.js')
const Groups = require("../models/groups.js")
const Users_Groups = require("../models/users_groups.js")
const Messages =  require("../models/messages.js")
const has = require('has-keys')
const CodeError = require('../util/CodeError.js')
const bcrypt = require('bcrypt')
const jws = require('jws')
require('mandatoryenv').load(['TOKENSECRET'])
const { TOKENSECRET } = process.env

function validPassword (password) {
  return /^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,}$/.test(password);
}
function validateEmail(email){
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

module.exports = {
  async login (req, res) {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Verify credentials of user using email and password and return token'
    // #swagger.parameters['obj'] = { in: 'body', schema: { $email: 'John.Doe@acme.com', $password: '12345'}}
    if (!has(req.body, ['email', 'password'])) throw new CodeError('You must specify the email and password', status.BAD_REQUEST)
    const { email, password } = req.body
    const user = await userModel.findOne({ where: { email } })
    if (!user) {
      return res.status(status.FORBIDDEN).json({ status: false, message: 'Wrong email/password' })
    }else{
      const id = user.dataValues.id;
      const isAdmin = user.dataValues.isAdmin;
      if (await bcrypt.compare(password, user.passhash)) {
        const token = jws.sign({ header: { alg: 'HS256' }, payload: email, secret: TOKENSECRET })
        return res.json({ status: true, message: 'Login/Password ok', token, id:id , isAdmin: isAdmin})
      }else{
        return res.status(status.FORBIDDEN).json({ status: false, message: 'Wrong email/password' })
      }
    }
    
  },

  async newUser (req, res) {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Create a new user'
    // #swagger.description = 'Creates a new user with provided name, email, and password.'
    // #swagger.parameters['obj'] = { in: 'body', description:'Name and email', schema: { $name: 'John Doe', $email: 'John.Doe@acme.com', $password: '1m02P@SsF0rt!'}}
    if (!has(req.body, ['name', 'email', 'password']) || !req.body.name.trim()) throw new CodeError('You must specify the name, email and password', status.BAD_REQUEST)
    const { name, email, password } = req.body;
    const user = await userModel.findAll({where: { email: req.body.email } });
    if(user.length != 0) {
      return res.json({ status: false, message: "Email address already exists"});
    }
    if (!validateEmail(email)) throw new CodeError('Invalide email', status.BAD_REQUEST); // Check password strength
    if (!validPassword(password)) throw new CodeError('Weak password!', status.BAD_REQUEST); // Check password strength
    await userModel.create({ name, email, passhash: await bcrypt.hash(password, 2),isAdmin : false }); // Create user table row
    return res.json({ status: true, message: 'User Added' });
  },

  async getUsers (req, res) {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Get all users'
    // #swagger.description = 'Retrieve all users from the database.'
    const data = await userModel.findAll({ attributes: ['id', 'name'] }); // get all users
    return res.json({ status: true, message: 'Returning users', data });
  },

  async updateUser (req, res) {
    // request validation is done in middleware
    // #swagger.summary = 'Update user information (for admin users only)'
    // #swagger.tags = ['Users']
    // #swagger.description = 'Updates the information of a user, reserved for admin users.'
    const token = req.get('x-access-token')
    const decodedToken = jws.decode(token)
    const user = await userModel.findOne({where: { email: decodedToken.payload } });
    if(user.isAdmin != true) { // check if user has root rights
      return res.status(403).json({ status: false, message: "You are not an admin" })
    }
    // #swagger.parameters['obj'] = { in: 'body', schema: { $name: 'John Doe', $email: 'John.Doe@acme.com', $password: '1m02P@SsF0rt!' }}
    const userModified = {}
    for (const field of ['name', 'email', 'password', 'isAdmin']) {
      if (has(req.body, field)) {
        if (field === 'password') {
          userModified.passhash = await bcrypt.hash(req.body.password, 2)
        } else {
          userModified[field] = req.body[field]
        }
      }
    }
    if (Object.keys(userModified).length === 0) throw new CodeError('You must specify the name, email or password', status.BAD_REQUEST)
    await userModel.update(userModified, { where: { id: req.params.id } })
    res.json({ status: true, message: 'User updated' })
  },

  async deleteUser (req, res) {
     /// request validation is done in middleware
    // #swagger.summary = 'Delete user (for admin users only)'
    // #swagger.tags = ['Users']
    // #swagger.description = 'Deletes a user from the system. Only admin users can perform this action.'
    // #swagger.parameters['id'] = { description: 'ID of the user to delete',type: 'integer'}
    const token = req.get('x-access-token')
    const decodedToken = jws.decode(token)
    const user = await userModel.findOne({where: { email: decodedToken.payload } });
    if(user.isAdmin != true) { //check if the user is the root 
      return res.status(403).json({ status: false, message: "You are not an admin" })
    }
    // #swagger.summary = 'Delete User'
    const iid = req.params.id;
    if(iid == user.id) {
      return res.status(403).json({ status: false, message:'You cannot delete your self'})
    }
    // delete members from all groups that the user is the admin !!
    const groupAdmin = await Groups.findAll({ attributes: ['id'], where: { ownerId: iid } });
    const groupsIds = groupAdmin.map(group => group.id);// groups ids
    await userModel.destroy({ where: { id :iid }});
    return res.json({ status: true, message: 'User deleted' })
  },
  
  async updatePassword(req, res) {
    // request validation is done in middleware
    // #swagger.summary = 'Update user password'
    // #swagger.tags = ['Users']
    // #swagger.description = 'Updates the password of the logged-in user.'
    // #swagger.parameters['password'] = { in: 'body', description: 'New password'}
    const token = req.get('x-access-token');
    if (!has(req.body, ['password'])) throw new CodeError('You must specify the new password', status.BAD_REQUEST)
    const {password } = req.body
    if (!validPassword(password)) throw new CodeError('Weak password!', status.BAD_REQUEST)
    const hashedPassword = await bcrypt.hash(password, 2) // hashage de mot de pass
    const decodedToken = jws.decode(token)
    const user = await userModel.findOne({where: { email: decodedToken.payload } })
    await user.update({ passhash: hashedPassword }); //update mot de pass dans bd
    res.json({ status: true, message: 'Password updated' });  
  }
}

