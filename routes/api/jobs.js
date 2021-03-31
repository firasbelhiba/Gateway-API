const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');



//@author Iheb Laribi
//@Route GET api/jobs
// @Description  Test route 
// @Access Public 
router.get('/', auth, (req, res) => res.send('Jobs route '));


module.exports = router;
