import SQLite from 'react-native-sqlite-storage';
import config from '../config/config';

SQLite.enablePromise(true);

const database_name = 'Reactoffline.db';
const database_version = '1.0';
const database_displayname = 'SQLite React Offline Database';
const database_size = 10000000;

class Database {
  async initDB(initializationStatement) {
    try {
      await SQLite.echoTest()
      const db = await SQLite.openDatabase(
        database_name,
        database_version,
        database_displayname,
        database_size
      )
      await db.executeSql(initializationStatement)
      return db
    }
    catch (error) {
      console.log('echoTest failed - plugin not functional');
      throw error;
    };
  }

  closeDatabase(db) {
    if (db) {
      db.close()
        .catch(error => {
          // this.errorCB(error);
          // TODO makes unhandled promise reject in addSample function - need to check why
          console.log('Closing the database failed', error)
        })
    }
  }
}


export class UserLocationsDatabase extends Database {
  initDB() {
    return super.initDB('CREATE TABLE IF NOT EXISTS Samples (lat,long,accuracy,startTime,endTime,geoHash,wifiHash,hash);')
  }

  listSamples() {
    return new Promise((resolve) => {
      this.initDB().then((db) => {
        db.transaction((tx) => {
          tx.executeSql('SELECT * FROM Samples', []).then(([tx, results]) => {
            const samples = [];
            const len = results.rows.length;
            for (let i = 0; i < len; i++) {
              const row = results.rows.item(i);
              samples.push(row);
            }
            resolve(samples);
          });
        }).then((result) => {
          this.closeDatabase(db);
        }).catch((err) => {
          console.log(err);
        });
      }).catch((err) => {
        console.log(err);
      });
    });
  }

  updateLastSampleEndTime(endTime) {
    return new Promise((resolve) => {
      this.initDB().then((db) => {
        db.transaction((tx) => {
          tx.executeSql(`UPDATE Samples set endTime=${endTime} WHERE rowid=(SELECT MAX(rowid) from Samples)`).then(([tx, results]) => {
            if (results.rows.length > 0) {
              const row = results.rows.item(0);
              resolve(row);
            } else {
              resolve(null);
            }
          });
        }).then((result) => {
          this.closeDatabase(db);
        }).catch((err) => {
          console.log(err);
        });
      }).catch((err) => {
        console.log(err);
      });
    });
  }

  addSample(sample) {
    return new Promise((resolve) => {
      this.initDB().then((db) => {
        db.transaction((tx) => {
          tx.executeSql('INSERT INTO Samples VALUES (?,?,?,?,?,?,?,?)', [sample.lat, sample.long, sample.accuracy, sample.startTime, sample.endTime, sample.geoHash, sample.wifiHash, sample.hash]).then(([tx, results]) => {
            resolve(results);
          });
        }).then((result) => {
          this.closeDatabase(db);
        }).catch((err) => {
          console.log(err);
        });
      }).catch((err) => {
        console.log(err);
      });
    });
  }
}

export class IntersectionSickDatabase extends Database {
  initDB() {
    return super.initDB('CREATE TABLE IF NOT EXISTS IntersectingSick (OBJECTID,Name,Place,Comments,fromTime,toTime,long,lat);')
  }

  clearDatabase() {
    return new Promise((resolve) => {
      this.initDB().then((db) => {
        db.transaction((tx) => {
          tx.executeSql('DELETE FROM IntersectingSick', []).then(([tx, results]) => {
            const IntersectingSick = [];
            const len = results.rows.length;
            for (let i = 0; i < len; i++) {
              const row = results.rows.item(i);
              IntersectingSick.push(row);
            }
            resolve(IntersectingSick);
          });
        }).then((result) => {
          this.closeDatabase(db);
        }).catch((err) => {
          console.log(err);
        });
      }).catch((err) => {
        console.log(err);
      });
    });
  }

  listAllRecords() {
    return new Promise((resolve) => {
      this.initDB().then((db) => {
        db.transaction((tx) => {
          tx.executeSql('SELECT * FROM IntersectingSick', []).then(([tx, results]) => {
            const IntersectingSick = [];
            const len = results.rows.length;
            for (let i = 0; i < len; i++) {
              const row = results.rows.item(i);
              IntersectingSick.push(row);
            }
            resolve(IntersectingSick);
          });
        }).then((result) => {
          this.closeDatabase(db);
        }).catch((err) => {
          console.log(err);
        });
      }).catch((err) => {
        console.log(err);
      });
    });
  }

  containsObjectID(OBJECTID) {
    return new Promise((resolve) => {
      this.initDB().then((db) => {
        db.transaction((tx) => {
          tx.executeSql(`SELECT * FROM IntersectingSick WHERE OBJECTID =${OBJECTID}`).then(([tx, results]) => {
            resolve(results.rows.length > 0);
          });
        }).then((result) => {
          this.closeDatabase(db);
        }).catch((err) => {
          console.log(err);
        });
      }).catch((err) => {
        console.log(err);
      });
    });
  }

  addSickRecord(record) {
    return new Promise((resolve) => {
      this.initDB().then((db) => {
        db.transaction((tx) => {
          tx.executeSql('INSERT INTO IntersectingSick VALUES (?,?,?,?,?,?,?,?)',
            [
              record.properties.OBJECTID,
              record.properties.Name,
              record.properties.Place,
              record.properties.Comments,
              record.properties.fromTime,
              record.properties.toTime,
              record.geometry.coordinates[config().sickGeometryLongIndex],
              record.geometry.coordinates[config().sickGeometryLatIndex]
            ]).then(([tx, results]) => {
              resolve(results);
            });
        }).then((result) => {
          this.closeDatabase(db);
        }).catch((err) => {
          console.log(err);
        });
      }).catch((err) => {
        console.log(err);
      });
    });
  }
}

export class WifiMacAddressDatabase extends Database {
  initDB() {
    return super.initDB('CREATE TABLE IF NOT EXISTS wifiTable (wifiHash, wifiList);')
  }

  listAllRecords() {
    return new Promise((resolve) => {
      this.initDB().then((db) => {
        db.transaction((tx) => {
          tx.executeSql('SELECT * FROM wifiTable', []).then(([tx, results]) => {
            const IntersectingSick = [];
            const len = results.rows.length;
            for (let i = 0; i < len; i++) {
              const row = results.rows.item(i);
              IntersectingSick.push(row);
            }
            resolve(IntersectingSick);
          });
        }).then((result) => {
          this.closeDatabase(db);
        }).catch((err) => {
          console.log(err);
        });
      }).catch((err) => {
        console.log(err);
      });
    });
  }

  addWifiMacAddresses(record) {
    return new Promise((resolve) => {
      this.initDB().then((db) => {
        db.transaction((tx) => {
          tx.executeSql('INSERT INTO wifiTable VALUES (?,?)', [record.wifiHash, record.wifiList]).then(([tx, results]) => {
            resolve(results);
          });
        }).then((result) => {
          this.closeDatabase(db);
        }).catch((err) => {
          console.log(err);
        });
      }).catch((err) => {
        console.log(err);
      });
    });
  }

  containsWifiHash(wifiHash) {
    return new Promise((resolve) => {
      this.initDB().then((db) => {
        db.transaction((tx) => {
          tx.executeSql('SELECT * FROM wifiTable WHERE wifiHash = ?', [wifiHash]).then(([tx, results]) => {
            resolve(results.rows.length > 0);
          });
        }).then((result) => {
          this.closeDatabase(db);
        }).catch((err) => {
          console.log(err);
        });
      }).catch((err) => {
        console.log(err);
      });
    });
  }
}
