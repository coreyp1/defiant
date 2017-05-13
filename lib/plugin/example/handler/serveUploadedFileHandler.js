"use strict";

const Handler = require('../../router/handler');
const File = require('../../http/response/file');
const {coroutine: co, promisify} = require('bluebird');

class ServeUploadedFileHandler extends Handler {
  constructor(data={}) {
    super(data);
    this.target = this.target || this.constructor.target;
  }

  allowAccess(context) {
    return co(function*(self) {
      let uuid = context.request.urlTokenized[3];
      if (uuid) {
        // Identify the file requested.
        let Orm = context.engine.plugin.get('Orm');
        let sql = context.engine.sql;
        let exampleUploadTable = sql.define(Orm.entity.get('exampleFileUpload').schema());
        let fileTable = sql.define(Orm.entity.get('file').schema());
        let query = exampleUploadTable.select(
          exampleUploadTable.id,
          fileTable.originalName,
          fileTable.path)
          .from(exampleUploadTable
            .leftJoin(fileTable)
              .on(exampleUploadTable.fileId.equals(fileTable.id)))
          .where(fileTable.uuid.equals(uuid))
          .toQuery();

        let stmt = context.engine.database.prepare(query.text);
        let get = promisify(stmt.get, {context: stmt});
        let finalize = promisify(stmt.finalize, {context:stmt});
        let row = yield get(query.values);
        yield finalize();
        
        if (row) {
          context.exampleUploadedFileHandler = row;
          return true;
        }
      }
      return false;
    })(this);
  }

  init(context) {
    return co(function*(self) {
      if (context.exampleUploadedFileHandler) {
        context.httpResponse = new File(context, {
          path: context.exampleUploadedFileHandler.path,
          filename: context.exampleUploadedFileHandler.originalName,
        });
      }
    })(this);
  }
}

ServeUploadedFileHandler.id = 'Example.ServeUploadedFileHandler';
ServeUploadedFileHandler.path = 'file/example/uploaded/*';

module.exports = ServeUploadedFileHandler;
