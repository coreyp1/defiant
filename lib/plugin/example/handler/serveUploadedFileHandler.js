"use strict";

const Handler = require('../../router/handler');
const File = require('../../http/response/file');

/**
 * Example handler that serves a file that was uploaded via the example file
 * upload form in the admin section.
 * @class
 * @extends Defiant.Plugin.Router.Handler
 * @memberOf Defiant.Plugin.Example
 */
class ServeUploadedFileHandler extends Handler {
  /**
   * Determine whether or not this handler will allow access to the url in
   * [context.request]{@link Defiant.Context#request}.  May also set
   * [context.httpResponse]{@link Defiant.Context#httpResponse}.
   *
   * Verify that the requested `uuid` is valid.
   * @function
   * @async
   * @param {Defiant.Context} context
   *   The request context.
   **/
  async allowAccess(context) {
    let uuid = context.request.urlTokenized[3];
    if (uuid) {
      // Identify the file requested.
      let Orm = context.engine.pluginRegistry.get('Orm');
      let sql = context.engine.sql;
      let exampleUploadTable = sql.define(Orm.entityRegistry.get('exampleFileUpload').schema());
      let fileTable = sql.define(Orm.entityRegistry.get('file').schema());
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
      let row = await new Promise((accept) => {
        stmt.get(query.values, (err, row) => {
          return row ? accept(row) : accept(err);
        });
      });
      await new Promise((accept) => {
        stmt.finalize(e => {return accept(e);});
        return accept();
      });

      if (row) {
        context.exampleUploadedFileHandler = row;
        return true;
      }
    }
    return false;
  }

  /**
   * A request has been made.  Process the request and provide the necessary
   * [Renderable]{@link Defiant.Plugin.Theme.Renderable}.
   * @function
   * @async
   * @param {Defiant.Context} context
   *   The request context.
   */
  async init(context) {
    if (context.exampleUploadedFileHandler) {
      context.httpResponse = new File(context, {
        path: context.exampleUploadedFileHandler.path,
        filename: context.exampleUploadedFileHandler.originalName,
      });
    }
  }
}

ServeUploadedFileHandler.id = 'Example.ServeUploadedFileHandler';
ServeUploadedFileHandler.path = 'file/example/uploaded/*';

module.exports = ServeUploadedFileHandler;
