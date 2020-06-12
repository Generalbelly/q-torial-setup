#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const { Storage } = require('@google-cloud/storage');

const projectId =
  process.env.NODE_ENV === 'production' ? 'q-torial' : 'still-protocol-228301';
const keyFilename = path.join(
  __dirname,
  `../${
    process.env.NODE_ENV === 'production'
      ? 'q-torial-firebase-adminsdk-ejl4w-29ec1987ad.json'
      : 'still-protocol-228301-firebase-adminsdk-i9ol4-8b98dccfe2.json'
  }`
);
const storage = new Storage({
  projectId,
  keyFilename,
});

const extractExtensionData = () => {
  const extPackageJson = require('../package.json');

  return {
    name: extPackageJson.name,
    version: extPackageJson.version,
  };
};

const makeDestZipDirIfNotExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

const buildZip = (src, dist, zipFilename) => {
  console.info(`Building ${zipFilename}...`);
  makeDestZipDirIfNotExists(dist);
  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = fs.createWriteStream(path.join(dist, zipFilename));

  return new Promise((resolve, reject) => {
    archive
      .directory(src, false)
      .on('error', err => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve());
    archive.finalize();
  });
};

async function upload(bucket, filepath, name) {
  try {
    // Uploads a local file to the bucket
    const b = storage.bucket(bucket);
    const destination = name || filepath;
    await b.upload(filepath, {
      destination,
    });
    await b.file(destination).makePublic();
    console.log(`${filepath} uploaded to ${bucket}.`);
  } catch (e) {
    console.log(e);
  }
}

const main = async () => {
  const { name, version } = extractExtensionData();
  const zipFilename = `${name}-v${version}.zip`;

  const destDir = path.join(__dirname, '../functions');
  const destZipDir = path.join(__dirname, '../functions-zip');
  await buildZip(destDir, destZipDir, zipFilename);
  const bucketName = process.env.NODE_ENV === 'production' ? 'q-torial' : 'still-protocol-228301';
  await upload(bucketName, path.join(destZipDir, zipFilename), `functions/${zipFilename}`);
  await upload(bucketName, path.join(__dirname, '../firestore.indexes.json'), 'firestore.indexes.json');
  // await upload(bucketName, path.join(__dirname, '../firestore.rules'), 'firestore.rules');
  // await upload(bucketName, path.join(__dirname, '../storage.rules'), 'storage.rules');
};

(async () => {
  await main();
})();
