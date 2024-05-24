const User = require('../models/users.js');
const Messages = require('../models/messages.js');
const CodeError = require('../util/CodeError.js');
const has = require('has-keys')
const jws = require('jws');
const status = require('http-status');
require('mandatoryenv').load(['TOKENSECRET']);
const { TOKENSECRET } = process.env ;


module.exports = {
  async getGroupMessages(req, res) {
    /*
    #swagger.tags = ['Messages']
    #swagger.summary = 'Get messages of a group'
    #swagger.description = 'Retrieve all messages belonging to a specific group.'
    #swagger.parameters['gid'] = {in: 'path',description: 'ID of the group'}
    */
    const gid = req.params.gid;
    const messages = await Messages.findAll({ where: { groupId: gid } });
    for (const element of messages) {
        const user = await User.findOne({ where: { id: element.userId} });
        element.dataValues["name"] = user.name
    };
    res.json({ status: true, message : "Messages retrieved successfully" , data: messages });
  },

  async createGroupMessage(req, res) {
    /*
    #swagger.tags = ['Messages']
    #swagger.summary = 'Create a group message'
    #swagger.description = 'Create a new message for a specific group.'
    #swagger.parameters['gid'] = {in: 'path',description: 'ID of the group'}
    #swagger.parameters['Content'] = {in: 'body',description: 'Content of the message'}
    */
    const token = req.get('x-access-token');
    const gid = req.params.gid;
    if (!has(req.body, ['Content']) || !req.body.Content.trim()) throw new CodeError('You must specify the Content of message : Invalide message', status.BAD_REQUEST)
    const decodedToken = jws.decode(token);
    const { Content } = req.body;
    const user = await User.findOne({where: { email: decodedToken.payload } });
    const id = user.id;
    await Messages.create({ content: Content, userId : id , groupId: gid });
    res.json({ status: true, message: 'Message sent'});
  }
};

