const express = require('express')
const router = express.Router()
const user = require('../controllers/user.js')
const middleware = require('../controllers/middleware.js');

router.get('/api/users',middleware.validateRequest, user.getUsers)
router.put('/api/password', middleware.validateRequest, user.updatePassword);
router.put('/api/users/:id', middleware.validateRequest, user.updateUser)
router.delete('/api/users/:id', middleware.validateRequest, user.deleteUser)
router.post('/login', user.login)
router.post('/register', user.newUser)

module.exports = router
