const express = require('express');
const router = express.Router();
const groups = require('../controllers/groups.js');
const middleware = require('../controllers/middleware.js');

router.get('/api/mygroups', middleware.validateRequest, groups.getUserGroups); // get my groups
router.post('/api/mygroups', middleware.validateRequest, groups.createGroup); // create group
router.get('/api/mygroups/:gid', middleware.validateRequestAdmin, groups.getGroupMembers); // get the members of my group

router.put('/api/mygroups/:gid/:uid', middleware.validateRequestAdmin, groups.addUserToGroup); //add user to my group
router.delete('/api/mygroups/:gid/:uid', middleware.validateRequestAdmin, groups.removeUserFromGroup); // remove user from my group
router.get('/api/groupsmember',middleware.validateRequest, groups.getUserGroupMemberships); // Retrieve all the groups that I belong to


router.delete('/api/groups/:gid', middleware.validateRequest, groups.deleteGroup); // delete group by admin
router.get('/api/groups', middleware.validateRequest, groups.getGroups); // Retrieve all the groups admin

module.exports = router;
