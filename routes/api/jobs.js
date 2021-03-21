const express = require('express');
const router = express.Router();


//@author Iheb Laribi
//@Route GET api/users
// @Description  Test route 
// @Access Public 
router.get('/', (req, res) => res.send('Jobs route '));


module.exports = router;
