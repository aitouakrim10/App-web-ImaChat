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
     // Vérifier si le token est valide...
    // Vérifier si l'utilisateur identifié par le TOKEN existe dans la base de données...
    async validateRequest(req, res, next) {
        /*
        #swagger.tags = ['Authentication']
        #swagger.summary = 'Validate user token'
        #swagger.description = 'Middleware function to validate the user token and check if the user exists in the database.'
        #swagger.parameters['x-access-token'] = {in: 'header',description: 'Access token provided in the request header'}
        */ 
        const token = req.get('x-access-token');
        if (!token || !jws.verify(token, 'HS256', process.env.TOKENSECRET)) {
            return res.status(403).json({ status: false, message: "Invalid token" });
        }
        const decodedToken = jws.decode(token);
        const user = await User.findOne({ attributes: ['id'], where: { email: decodedToken.payload } });
        if (!user || user.length == 0) {
            return res.status(403).json({ status: false, message: "User not found" });
        }
        // Si le token est valide et l'utilisateur existe, on appelle next() pour passer à la fonction suivante
        const id = user.id;
        next();
        
    },

    async validateRequestAdmin(req, res, next) {
        /*
        #swagger.tags = ['Authentication']
        #swagger.summary = 'Validate user as group admin'
        #swagger.description = 'Middleware function to validate the user token and check if the user exists in the database and  to validate if the user is an admin of the specified group.'
        #swagger.parameters['x-access-token'] = {in: 'header',description: 'Access token provided in the request header'}
        #swagger.parameters['gid'] = {in: 'path',description: 'Group ID',
        */
        const token = req.get('x-access-token');
         if (!token || !jws.verify(token, 'HS256', TOKENSECRET)) {
            return res.status(403).json({ status: false, message: "Invalid token" });
        }
        const decodedToken = jws.decode(token);
        const user = await User.findOne({attributes: ['id'], where: { email : decodedToken.payload } });
        if(!user || user.length == 0) {
            return res.status(403).json({ status: false, message: "User not found" });
        }
        const gid = req.params.gid;
        const id = user.id;
        const admingroup = await Group.findOne({
              where: { ownerId : id , id : gid } });
        if (!admingroup) {
            return res.status(404).json({ status: false, message: 'User is not admin for this group' });
        }
        next();
    },

    async validateRequestMember(req, res, next) {
        /*
        #swagger.tags = ['Authentication']
        #swagger.summary = 'Validate user as group member'
        #swagger.description = 'Middleware function to validate if the user is a member of the specified group.'
        #swagger.parameters['x-access-token'] = {in: 'header',description: 'Access token provided in the request header'}
        #swagger.parameters['gid'] = {in: 'path',description: 'Group ID'}
        */  
        const gid = req.params.gid;
        const token = req.get('x-access-token');
        if (!token ||!jws.verify(token,'HS256',TOKENSECRET)) {
          return res.status(403).json({ status: false, message: "Invalid token" });
        }
        const decodedToken = jws.decode(token);
        const user = await User.findOne({attributes: ['id'] ,where: { email: decodedToken.payload } });
        if(!user) {
          return res.status(403).json({ status: false, message: "User not found" });
        }
        const id = user.id;
        const user_group = await User_Group.findOne({where: { memberId : id , groupId:gid } });
        if(!user_group) {
          return res.status(403).json({ status: false, message: "User is not a member in this Group"});
        }
        next();
       
    }
}

    
