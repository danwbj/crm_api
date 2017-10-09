import * as Hapi from 'hapi'
import * as Glue from 'glue'
import manifest from './config/manifest'
import config from './config/config'

const database = config.database

Glue.compose(manifest, { relativeTo: __dirname }, (err, server) => {
  if (err) {
    console.log('server.register err:', err);
  }

  (<any>global).models = server.plugins['hapi-sequelize'][database.dbname].models;
  (<any>global).cache = server.cache({ segment: 'cod_cache', expiresIn: 24 * 60 * 60 * 1000 });
  server.start(() => {
    console.log('✅  Server is listening on ' + server.info.uri.toLowerCase());
  });
});

