'use strict';

const mkdirp = require('../..').util.mkdirp;
const expect = require('chai').expect;
const fs = require('fs');
const os = require('os');
const path = require('path');
const {coroutine: co, promisify} = require('bluebird');

function deleteFolderRecursive(directoryToDelete) {
  let files;
  if (fs.existsSync(directoryToDelete)) {
    files = fs.readdirSync(directoryToDelete);
    files.map(file => {
      let curPath = path.join(directoryToDelete, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      }
      else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(directoryToDelete);
  }
}

function* getNonexistentDirectory() {
  let dirIncrement = -1,
      dirName, stat;
  while (1) {
    dirIncrement++;
    dirName = path.join(os.tmpDir(), dirIncrement.toString());
    try {
      stat = fs.statSync(dirName);
    }
    catch (e) {
      yield dirName;
    }
  }
};

const baseDir = getNonexistentDirectory().next().value;

describe('Defiant utility mkdirp()', () => {
  describe('when invoked', () => {
    it('should create a directory if it does not exist', done => {
      co(function*() {
        let dirName = baseDir;
        let result = yield mkdirp(dirName);
        expect(result).to.be.true;
        done();
      })();
    });
    it('should create all parent directories needed, as required', done => {
      co(function*() {
        let dirName = path.join(baseDir, 'createSubdirectories', 'foo', 'bar', 'baz');
        let result = yield mkdirp(dirName);
        expect(result).to.be.true;
        done();
      })();
    });
    it('should not return an error if the directory already exists', done => {
      co(function*() {
        let dirName = path.join(baseDir, 'directoryExists');
        yield mkdirp(dirName);
        let result = yield mkdirp(dirName);
        expect(result).to.be.true;
        done();
      })();
    });
    it('should return an error if the directory cannot be created', done => {
      co(function*() {
        let dirName = '/../foo';
        yield mkdirp(dirName);
        let result = yield mkdirp(dirName);
        expect(result).to.not.be.true;
        done();
      })();
    });
    it('should return an error if a file exists with the same name as the directory', done => {
      co(function*() {
        let dirName = path.join(baseDir, 'fileExists'),
            filePath = path.join(dirName, 'foo');
        yield mkdirp(dirName);
        fs.writeFileSync(filePath, '', {mode: 0o600});
        let result = yield mkdirp(filePath);
        expect(result).to.not.be.true;
        done();
      })();
    });
    it('should clean up after itself', done => {
      co(function*() {
        deleteFolderRecursive(baseDir);
        done();
      })();
    });
  });
});
