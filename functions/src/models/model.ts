import admin from '../admin';

interface IndexableInterface {
  [key: string]: any;
}

export default class Model {
  id:string|null = null;

  createdAt: admin.firestore.FieldValue|null = null;

  updatedAt: admin.firestore.FieldValue|null = null;

  toPlainObject(excludes: string[] = ['createdAt', 'updatedAt']) {
    const object: IndexableInterface = {};
    const has = Object.prototype.hasOwnProperty;
    const data = <IndexableInterface>this;
    Object.keys(data).forEach((propertyName: string) => {
      if (
        !excludes.includes(propertyName)
        && has.call(this, propertyName)
      ) {
        object[propertyName] = data[propertyName];
      }
    });
    return object;
  }
}
