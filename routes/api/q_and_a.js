const express = require('express');
const router = express.Router();


//@author Motez Ayari
//@Route GET api/users
// @Description  Test route 
// @Access Public 
router.get('/', (req, res) => res.send('Q & A route '));


module.exports = router;
