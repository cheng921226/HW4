var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 直接在 app.js 使用 sqlite3 開啟資料庫
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, 'db', 'sqlite.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('無法開啟資料庫:', err.message);
  } else {
    console.log('成功開啟資料庫:', dbPath);
  }
});

// /api/date 路由，查詢 ticket_dates table 所有資料
app.get('/api/date', (req, res) => {
  db.all('SELECT * FROM ticket_dates', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// /api/all 路由，查詢三個 table 並回傳 json
app.get('/api/all', (req, res) => {
  const result = {};
  db.all('SELECT * FROM ticket_dates', (err, dates) => {
    if (err) return res.status(500).json({ error: err.message });
    result.ticket_dates = dates;
    db.all('SELECT * FROM train_types', (err, types) => {
      if (err) return res.status(500).json({ error: err.message });
      result.train_types = types;
      db.all('SELECT * FROM ticket_prices', (err, prices) => {
        if (err) return res.status(500).json({ error: err.message });
        result.ticket_prices = prices;
        res.json(result);
      });
    });
  });
});

// POST /api/insert 路由，插入一組資料到三個資料表，回傳純文字訊息
app.post('/api/insert', (req, res) => {
  const { effective_date, type_name, price, note } = req.body;
  if (!effective_date || !type_name || !price) {
    return res.status(400).send('缺少必要參數');
  }
  // 1. 新增或查詢 ticket_dates
  db.get('SELECT date_id FROM ticket_dates WHERE effective_date = ?', [effective_date], (err, dateRow) => {
    if (err) return res.status(500).send('查詢日期失敗');
    const insertDate = (cb) => {
      db.run('INSERT INTO ticket_dates (effective_date, note) VALUES (?, ?)', [effective_date, null], function(err) {
        if (err) return res.status(500).send('新增日期失敗');
        cb(this.lastID);
      });
    };
    const date_id = dateRow ? dateRow.date_id : null;
    const handleDateId = (date_id) => {
      // 2. 新增或查詢 train_types
      db.get('SELECT type_id FROM train_types WHERE type_name = ?', [type_name], (err, typeRow) => {
        if (err) return res.status(500).send('查詢車種失敗');
        const insertType = (cb) => {
          db.run('INSERT INTO train_types (type_name) VALUES (?)', [type_name], function(err) {
            if (err) return res.status(500).send('新增車種失敗');
            cb(this.lastID);
          });
        };
        const type_id = typeRow ? typeRow.type_id : null;
        const handleTypeId = (type_id) => {
          // 3. 新增 ticket_prices，note 只寫入這裡
          db.run('INSERT INTO ticket_prices (date_id, type_id, price, note) VALUES (?, ?, ?, ?)', [date_id, type_id, price, note || null], function(err) {
            if (err) return res.status(500).send('新增票價失敗');
            res.send('資料新增成功');
          });
        };
        if (type_id) handleTypeId(type_id);
        else insertType(handleTypeId);
      });
    };
    if (date_id) handleDateId(date_id);
    else insertDate(handleDateId);
  });
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
