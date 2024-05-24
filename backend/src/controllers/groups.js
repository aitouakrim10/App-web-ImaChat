const status = require('http-status');
const Group = require('../models/groups.js');
const User = require('../models/users.js');
const User_Group = require('../models/users_groups.js');
const express = require('express');
const has = require('has-keys')
const CodeError = require('../util/CodeError.js')
const bcrypt = require('bcrypt')
const jws = require('jws');
require('mandatoryenv').load(['TOKENSECRET'])
const { TOKENSECRET } = process.env



module.exports = {
  async getUserGroups(req, res) {
    // récupérer les groupes de l'utilisateur (owner)
    // #swagger.summary = 'Get user groups'
    // #swagger.tags = ['Groups']
    // #swagger.description = 'Retrieves all groups owned by the logged-in user.'
    const token = req.get('x-access-token');
    const decodedToken = jws.decode(token);
    const user = await User.findOne({ attributes: ['id'], where: { email: decodedToken.payload } });
    const id  = user.id;
    const groups = await Group.findAll({ where: { ownerId: user.id } });
    res.json({ status: true, message: 'User groups retrieved successfully', data: groups });
  },
  async createGroup(req, res) {
    //  créer un nouveau groupe
    // #swagger.summary = 'Create a new group'
    // #swagger.tags = ['Groups']
    // #swagger.description = 'Creates a new group owned by the logged-in user.'
    // #swagger.parameters['name'] = { in: 'body', description: 'Name of the group'}
    const token = req.get('x-access-token');
    const decodedToken = jws.decode(token);
    const user = await User.findOne({ attributes: ['id'], where: { email: decodedToken.payload } });
    const id  = user.id;
    if (!has(req.body, ['name']) || !req.body.name.trim()) throw new CodeError('You must specify the name of group', status.BAD_REQUEST)
    const { name } = req.body
    const old = await Group.findAll({ where: { name : name, ownerId : id } }); // verifier si le gtoup name est deja utulise
    if(old.length !== 0) {
      return res.status(403).json({ status: false, message: 'Group already exists' })
    }
    const group = await Group.create({name : name, ownerId : id})
    const grpId = group.dataValues.id;
    await User_Group.create({memberId: id , groupId : grpId})
    return res.json({ status: true, message: 'Group created' })
  },
  async getGroupMembers(req, res) {
    // récupérer les membre de group dont laquel user est un admin
    // #swagger.tags = ['Groups']
    // #swagger.summary = 'Retrieve members of a group'
    // #swagger.description = 'Retrieves members of a group given its ID.'
    // #swagger.parameters['gid'] = { in: 'path', description: 'ID of the group'} 
    const gid = req.params.gid;
    const members = await User_Group.findAll({where: { groupId : gid}});
    const memberIds = members.map(member => member.memberId);
    const groupMembers = await User.findAll({
        attributes: ['id', 'name'], // specifier les attribut 
        where: { id: memberIds } // condition
      });
    res.json({ status: true, message: 'Group members retrieved successfully', data: groupMembers }); 
  },
  async addUserToGroup(req, res) {
    // ajouter un utilisateur à un groupe
    // #swagger.tags = ['Groups']
    // #swagger.summary = 'Add user to group'
    // #swagger.description = 'Adds a user to a group given their IDs.'
    // #swagger.parameters['gid'] = {in: 'path', description: 'ID of the group'}
    // #swagger.parameters['uid'] = {in: 'path', description: 'ID of the user to add'}
    const gid = req.params.gid;
    const uid = req.params.uid;
    const user = await User.findOne({where: { id : uid} });
    if (!user) {
        return res.status(404).json({ status: false, message: 'Uid user is Invalid' });
    }
    await User_Group.create({memberId: uid , groupId : gid});
    res.json({ status: true, message: 'User added to group' });
  },
  async removeUserFromGroup(req, res) {
    // supprimer un utilisateur d'un groupe
    /*
    #swagger.tags = ['Groups']
    #swagger.summary = 'Remove user from group'
    #swagger.description = 'Removes a user from a group given their IDs.'
    #swagger.parameters['gid'] = { 
        in: 'path', 
        description: 'ID of the group'
    }
    #swagger.parameters['uid'] = { 
        in: 'path', 
        description: 'ID of the user to remove'
    }
    */
    const token = req.get('x-access-token');
    const gid = req.params.gid;
    const uid = req.params.uid;
    const decodedToken = jws.decode(token);
    const admin = await User.findOne({where: { email : decodedToken.payload } });
    if(uid == admin.id ) {
      return res.status(404).json({ status: false, message: 'You  cannot remove your self' });
    } 
    const user = await User.findOne({where: { id : uid} });
    if (!user) {
      return res.status(404).json({ status: false, message: 'User to delete is not found' });
    }
    await User_Group.destroy({where: { memberId : uid , groupId : gid }});
    return res.json({ status: true, message: 'User deleted from group' });
  },
  async getUserGroupMemberships(req, res) {
    // récupérer les groupes dont l'utilisateur est un membre
    // #swagger.tags = ['Groups']
    // #swagger.summary = 'Get user group memberships'
    // #swagger.description = 'Retrieves the groups of which the user is a member.
    const token = req.get('x-access-token');
    const decodedToken = jws.decode(token);
    const userid = await User.findOne({ attributes: ['id'], where: { email : decodedToken.payload } });
    const user_group = await User_Group.findAll({
        attributes: ['groupId'],
        where: { memberId : userid.id } });
    const groupIds = user_group.map(user_group => user_group.groupId);
    const groups = await Group.findAll({
      attributes: ['id', 'name'], // specifier les attribut 
      where: { id: groupIds } // condition
    });
    res.json({ status: true, message: 'User groups retrieved successfully', data: groups });
  },
async getGroups(req, res) {
  // #swagger.tags = ['Groups']
  // #swagger.summary = 'Get all groups'
  // #swagger.description = 'Retrieve all groups. Only accessible by admin users.'
  const token = req.get('x-access-token');
  const decodedToken = jws.decode(token);
  const user = await User.findOne({where: { email : decodedToken.payload } });
  if(user.isAdmin != true) { //check if the user is the root 
    return res.status(403).json({ status: false, message: "You are not an admin" })
  }
  const data = await Group.findAll();
  return res.json({ status: true, message: 'Returning groups', data});
},
async deleteGroup(req, res) {
  /*
  #swagger.tags = ['Groups']
    #swagger.summary = 'Delete a group'
    #swagger.description = 'Delete a group by its ID. Only accessible by root users.'
    #swagger.parameters['gid'] = {
        in: 'path',
        description: 'ID of the group to delete'}
  */
  const token = req.get('x-access-token');
  const decodedToken = jws.decode(token);
  const user = await User.findOne({where: { email : decodedToken.payload } });
  const gid = req.params.gid;
  const group = await Group.findAll({where: {id : gid , ownerId: user.id}});
  if((!user.isAdmin )&& (group.length === 0)) { //check if the user is the root 
    return res.status(403).json({ status: false, message: "You are not an admin" })
  }
  await Group.destroy({where: { id : gid }});
  return res.json({ status: true, message: 'Group deleted' });
}
};
