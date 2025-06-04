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

// 修改票價資料
router.post('/api/update', async function(req, res) {
  const { price_id, effective_date, type_name, price, note } = req.body;
  if (!price_id || !effective_date || !type_name || !price) {
    return res.status(400).send('缺少必要欄位');
  }
  // 查詢對應的 date_id
  db.get('SELECT date_id FROM ticket_dates WHERE effective_date = ?', [effective_date], function(err, dateRow) {
    if (err || !dateRow) {
      return res.status(400).send('日期不存在');
    }
    // 查詢對應的 type_id
    db.get('SELECT type_id FROM train_types WHERE type_name = ?', [type_name], function(err, typeRow) {
      if (err || !typeRow) {
        return res.status(400).send('車種不存在');
      }
      // 更新票價資料
      db.run('UPDATE ticket_prices SET date_id = ?, type_id = ?, price = ?, note = ? WHERE price_id = ?',
        [dateRow.date_id, typeRow.type_id, price, note, price_id],
        function(err) {
          if (err) {
            res.status(500).send('更新失敗');
          } else {
            res.send('更新成功');
          }
        }
      );
    });
  });
});

module.exports = router;
