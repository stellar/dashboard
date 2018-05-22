import express from 'express';
import proxy from 'express-http-proxy';
import logger from 'morgan';

import * as nodes from "./nodes.js";
import * as lumens from "./lumens.js";
import * as ledgers from "./ledgers.js";

var app = express();
app.set('port', (process.env.PORT || 5000));
app.set('json spaces', 2);

app.use(logger('combined'));

if (process.env.DEV) {
  app.use('/', proxy('localhost:3000', {
    filter: function(req, res) {
      return req.path == "/" || req.path.indexOf(".js") >= 0 || req.path.indexOf(".html") >= 0 || req.path.indexOf(".css") >= 0;
    }
  }));
} else {
  app.use(express.static('dist'));
}

app.get('/api/ledgers/public', ledgers.handler);
app.get('/api/lumens', lumens.handler);
app.get('/api/nodes', nodes.handler);

app.listen(app.get('port'), function() {
  console.log('Listening on port', app.get('port'));
});
