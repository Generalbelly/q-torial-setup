import admin from './admin';

interface storageConfig {
  gzip: boolean,
  destination: string,
  metadata: object,
}

export const putFile = async (filename: string, config: storageConfig): Promise<boolean> => new Promise(
  async (resolve, reject) => {
    try {
      const storage = admin.storage();
      await storage.bucket().upload(filename, config);
      resolve(true);
    } catch (e) {
      console.error(e);
      reject(e);
    }
  },
);

export const makePublic = async (filename: string): Promise<boolean> => new Promise(
  async (resolve, reject) => {
    try {
      const storage = admin.storage();
      await storage.bucket().file(filename).makePublic();
      resolve(true);
    } catch (e) {
      console.error(e);
      reject(e);
    }
  },
);
