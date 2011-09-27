var cluster = require('cluster');

cluster('./server')
  // force 50 server instances
  .set('workers', 50)
  .use(cluster.stats())
  .use(cluster.pidfiles('pids'))
  .use(cluster.cli())
  .listen(8082);
