// 复现：查询参数每次读都重新解析，而且整体赋值直接抛错
const express = require('../');
const http = require('http');

const app = express();

app.use((req, res, next) => {
  const first = req.query;
  const second = req.query;
  console.log('第一次读与第二次读同一个对象 =', first === second);
  try {
    req.query = Object.assign({ offset: 20 }, first);
    console.log('整体赋值 = 成功');
  } catch (e) {
    console.log('整体赋值 = 抛', e.constructor.name);
  }
  req.query.extra = 'added';
  next();
});

app.get('/', (req, res) => {
  console.log('后面拿到的 offset =', req.query.offset === undefined ? '拿不到' : req.query.offset,
    '；extra =', req.query.extra === undefined ? '拿不到' : req.query.extra);
  res.json({ page: req.query.page || null });
});

const srv = app.listen(0, '127.0.0.1', () => {
  http.get({ port: srv.address().port, path: '/?page=7' }, r => {
    r.resume();
    r.on('end', () => {
      srv.close();
      process.exit(0);
    });
  });
});
