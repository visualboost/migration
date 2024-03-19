const {logInfo} = require("../../src/Logger");
const {AUTH} = require("../../src/constants/TARGETS");

module.exports = {
  async up(db, client) {
    logInfo(AUTH, "Start - Add userRole")
    await addDefaultUserRole(db);
    logInfo(AUTH, "Finished - Add userRole")
  },

  async down(db, client) {
  }
};

const addDefaultUserRole = async (db) => {
  const numberOfUsersToUpdate = await db.collection('users').count({ userRole: { $exists: false } });
  if(numberOfUsersToUpdate === 0){
    logInfo(AUTH, "No documents found with: userRole does not exist")
    return;
  }

  logInfo(AUTH, `Start - Add userRole ´${JSON.stringify({userRole: {"name": "USER", "privileges": []}})} to ${numberOfUsersToUpdate} user`)
  await db.collection('users').updateMany({ userRole: { $exists: false } }, {
    $set: {
      userRole: {
        "name": "USER",
        "privileges": []
      }
    }
  });
}