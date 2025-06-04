var express = require('express');
var router = express.Router();
const db = require('../db');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// 刪除票價資料
router.post('/api/delete', function(req, res) {
  const price_id = req.body.price_id;
  if (!price_id) return res.status(400).send('缺少 price_id');
  db.run('DELETE FROM ticket_prices WHERE price_id = ?', [price_id], function(err) {
    if (err) {
      res.status(500).send('刪除失敗');
    } else {
      res.send('刪除成功');
    }
  });
});

module.exports = router;
