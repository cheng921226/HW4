
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// 資料庫檔案路徑
const dbDir = path.join(__dirname, 'db');
const dbPath = path.join(dbDir, 'sqlite.db');

// 確保 db 目錄存在
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

// 開啟（或建立）資料庫
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('無法開啟資料庫:', err.message);
  } else {
    console.log('成功開啟資料庫:', dbPath);
    // 檢查並建立 ticket_dates table
    db.run(`CREATE TABLE IF NOT EXISTS ticket_dates (
      date_id INTEGER PRIMARY KEY AUTOINCREMENT,
      effective_date DATE NOT NULL,
      note TEXT
    )`, (err) => {
      if (err) {
        console.error('建立 ticket_dates table 失敗:', err.message);
      } else {
        console.log('已確認 ticket_dates table 存在');
        console.log('已插入 ticket_dates 初始資料');
      }
    });

    // 建立 train_types table 並插入資料
    db.run(`CREATE TABLE IF NOT EXISTS train_types (
      type_id INTEGER PRIMARY KEY AUTOINCREMENT,
      type_name TEXT NOT NULL
    )`, (err) => {
      if (err) {
        console.error('建立 train_types table 失敗:', err.message);
      } else {
        console.log('已確認 train_types table 存在');
        const insertSQL = `INSERT OR IGNORE INTO train_types (type_id, type_name) VALUES (?, ?)`;
        const data = [
          [1, "普通車"],
          [2, "柴油車"],
          [3, "快車"],
          [4, "對號快車"],
          [5, "光華號"],
          [6, "通勤車"],
          [7, "觀光號"],
          [8, "宮光號"],
          [9, "自強號"],
          [10, "EMU 行駛"],
          [11, "EMU 停駛"]
        ];
        data.forEach(row => {
          db.run(insertSQL, row, (err) => {
            if (err) {
              console.error('插入 train_types 資料失敗:', err.message);
            }
          });
        });
        console.log('已插入 train_types 初始資料');
      }
    });

    // 建立 ticket_prices table 並插入資料
    db.run(`CREATE TABLE IF NOT EXISTS ticket_prices (
      price_id INTEGER PRIMARY KEY AUTOINCREMENT,
      date_id INTEGER NOT NULL,
      type_id INTEGER NOT NULL,
      price REAL,
      note TEXT,
      FOREIGN KEY (date_id) REFERENCES ticket_dates(date_id),
      FOREIGN KEY (type_id) REFERENCES train_types(type_id)
    )`, (err) => {
      if (err) {
        console.error('建立 ticket_prices table 失敗:', err.message);
      } else {
        console.log('已確認 ticket_prices table 存在');
        const insertSQL = `INSERT OR IGNORE INTO ticket_prices (price_id, date_id, type_id, price, note) VALUES (?, ?, ?, ?, ?)`;
        const data = [
          [1,1,1,0.16,null],[2,1,2,0.20,null],[3,1,3,0.24,null],[4,1,4,0.32,null],[5,1,7,0.40,"行駛"],[6,2,7,0.42,"行駛"],[7,3,1,0.19,null],[8,3,2,0.24,null],[9,3,3,0.27,null],[10,3,4,0.34,null],[11,3,7,0.42,null],[12,4,7,0.50,null],[13,5,5,0.42,"行駛"],[14,6,1,0.22,null],[15,6,2,0.28,"東線"],[16,6,3,0.31,null],[17,6,4,0.40,null],[18,6,5,0.48,null],[19,6,7,0.57,null],[20,7,7,0.69,"行駛"],[21,8,1,0.29,null],[22,8,2,0.36,"行駛"],[23,8,3,0.43,null],[24,8,4,0.58,null],[25,8,5,0.72,null],[26,8,7,0.88,null],[27,8,8,1.10,null],[28,9,6,67.425,"停駛"],[29,9,8,1.10,null],[30,9,9,1.32,"EMU 行駛"],[31,10,1,0.54,null],[32,10,2,0.54,null],[33,10,3,0.58,null],[34,10,4,0.70,null],[35,10,5,0.90,null],[36,10,8,1.10,null],[37,10,9,1.32,null],[38,11,6,0.90,"行駛"],[39,12,1,0.57,null],[40,12,2,0.57,null],[41,12,3,0.61,null],[42,12,4,0.74,null],[43,12,5,0.95,null],[44,12,6,0.95,null],[45,12,7,1.16,null],[46,12,9,1.32,null],[47,13,1,0.61,null],[48,13,2,0.61,null],[49,13,3,0.61,null],[50,13,4,0.79,null],[51,13,5,1.00,null],[52,13,6,1.00,null],[53,13,7,1.21,null],[54,13,9,1.37,null],[55,14,1,0.60,null],[56,14,2,0.60,null],[57,14,3,0.60,null],[58,14,5,71.627,"停駛"],[59,15,1,0.66,null],[60,15,2,0.66,null],[61,15,3,0.66,null],[62,15,4,0.85,null],[63,15,6,1.11,null],[64,15,7,1.32,null],[65,15,9,1.53,null],[66,16,1,0.62,"不含稅"],[67,16,2,0.62,"不含稅"],[68,16,3,0.62,"不含稅"],[69,16,4,0.80,null],[70,16,6,1.04,"不含稅"],[71,16,7,1.26,"不含稅"],[72,16,9,1.46,"不含稅"],[73,17,1,0.91,null],[74,17,2,0.91,null],[75,17,3,0.91,null],[76,17,4,null,"停駛"],[77,17,6,1.17,null],[78,17,7,1.39,null],[79,17,9,1.70,null],[80,18,1,0.98,null],[81,18,2,0.98,null],[82,18,3,0.98,null],[83,18,6,1.27,null],[84,18,7,1.52,null],[85,18,9,1.89,null],[86,19,1,1.06,null],[87,19,2,1.06,null],[88,19,3,1.06,null],[89,19,6,1.46,null],[90,19,7,1.75,null],[91,19,9,2.27,null]
        ];
        data.forEach(row => {
          db.run(insertSQL, row, (err) => {
            if (err) {
              console.error('插入 ticket_prices 資料失敗:', err.message);
            }
          });
        });
        console.log('已插入 ticket_prices 初始資料');
      }
    });
  }
});

module.exports = db;

