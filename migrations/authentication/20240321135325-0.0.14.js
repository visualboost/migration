const {logInfo} = require("../../src/Logger");
const {AUTH} = require("../../src/constants/TARGETS");
module.exports = {
  async up(db, client) {
    //Recreate the index for tenant.name after removing the unique constraint
    logInfo(AUTH, `Recreate index of field tenant.name to remove unique constraint`);

    logInfo(AUTH, `Start - drop index of field tenant.name`);
    db.collection('tenants').dropIndex( "name_1" )
    logInfo(AUTH, `End - drop index of field tenant.name`);

    logInfo(AUTH, `Start - Create new index without constraint 'unique' of field tenant.name`);
    db.collection('tenants').createIndex(
        {"name_1": 1 },
        {}
    )
    logInfo(AUTH, `End - Create new index without constraint 'unique' of field tenant.name`);
  },

  async down(db, client) {
    logInfo(AUTH, `Recreate index of field tenant.name to add unique constraint`);

    //Set unique constraint again
    logInfo(AUTH, `Start - drop index of field tenant.name`);
    db.collection('tenants').dropIndex( "name_1" )
    logInfo(AUTH, `End - drop index of field tenant.name`);

    logInfo(AUTH, `Start - Create new index with constraint 'unique' of field tenant.name`);
    db.collection('tenants').createIndex(
        {"name": 1 },
        {
          unique: true
        }
    )
    logInfo(AUTH, `End - Create new index with constraint 'unique' of field tenant.name`);
  }
};
