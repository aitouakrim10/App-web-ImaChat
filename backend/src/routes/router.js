const router = require('express').Router()
router.use(require('./user'))
router.use(require('./groups'))
router.use(require('./messages'))
module.exports = router
