const express = require('express')
const router = express.Router()
const messages = require('../controllers/messages.js')
const middleware = require('../controllers/middleware.js');

router.get('/api/messages/:gid', middleware.validateRequestMember, messages.getGroupMessages);
router.post('/api/messages/:gid', middleware.validateRequestMember, messages.createGroupMessage);

module.exports = router