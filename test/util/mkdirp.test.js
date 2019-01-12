'use strict';

const mkdirp = require('../..').util.mkdirp;
const expect = require('chai').expect;
const fs = require('fs');
const os = require('os');
const path = require('path');

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
    dirName = path.join(os.tmpdir(), dirIncrement.toString());
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
    it('should create a directory if it does not exist', async () => {
      let dirName = baseDir;
      let result = await mkdirp(dirName);
      expect(result).to.be.undefined;
    });
    it('should create all parent directories needed, as required', async () => {
      let dirName = path.join(baseDir, 'createSubdirectories', 'foo', 'bar', 'baz');
      let result = await mkdirp(dirName);
      expect(result).to.be.undefined;
    });
    it('should not return an error if the directory already exists', async () => {
      let dirName = path.join(baseDir, 'directoryExists');
      await mkdirp(dirName);
      let result = await mkdirp(dirName);
      expect(result).to.be.undefined;
    });
    it('should return an error if the directory cannot be created', async () => {
      let dirName = '/../foo';
      await mkdirp(dirName);
      let result = await mkdirp(dirName);
      expect(result).to.not.be.undefined;
    });
    it('should return an error if a file exists with the same name as the directory', async () => {
      let dirName = path.join(baseDir, 'fileExists'),
          filePath = path.join(dirName, 'foo');
      await mkdirp(dirName);
      fs.writeFileSync(filePath, '', {mode: 0o600});
      let result = await mkdirp(filePath);
      expect(result).to.not.be.undefined;
    });
    it('should clean up after itself', async () => {
      deleteFolderRecursive(baseDir);
    });
  });
});
