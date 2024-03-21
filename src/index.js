const {runUp, runDown} = require("./util");
const {AUTH, MAIN, BUILD} = require("./constants/TARGETS");
const {logInfo} = require("./Logger");

const up = async (target) => {
    if(target === AUTH.id){
        await runUp(AUTH, process.env.MONGO_ADMIN,process.env.MONGO_ADMIN_PW, process.env.AUTH_MONGO_CONTAINER_NAME, process.env.MONGO_PORT_AUTH, process.env.MONGO_DB_NAME, "admin")
    }else if(target === MAIN.id){
        await runUp(MAIN, process.env.MONGO_ADMIN,process.env.MONGO_ADMIN_PW, process.env.MAIN_MONGO_CONTAINER_NAME, process.env.MONGO_PORT_MAIN, process.env.MONGO_DB_NAME, "admin")
    }else if(target === BUILD.id){
        await runUp(BUILD, process.env.MONGO_ADMIN,process.env.MONGO_ADMIN_PW, process.env.BUILD_MONGO_CONTAINER_NAME, process.env.MONGO_PORT_BUILD, process.env.MONGO_DB_NAME, "admin")
    }
}

/*
 * Currently just for test cases
 */
const down = async (targets = []) => {
    if(targets.includes("AUTH")){
        await runDown(AUTH, process.env.MONGO_ADMIN,process.env.MONGO_ADMIN_PW, process.env.AUTH_MONGO_CONTAINER_NAME, process.env.MONGO_PORT_AUTH, process.env.MONGO_DB_NAME, "admin")
    }else if(targets.includes("MAIN")){
        await runDown(MAIN, process.env.MONGO_ADMIN,process.env.MONGO_ADMIN_PW, process.env.MAIN_MONGO_CONTAINER_NAME, process.env.MONGO_PORT_MAIN, process.env.MONGO_DB_NAME, "admin")
    }else if(targets.includes("BUILD")){
        await runDown(BUILD, process.env.MONGO_ADMIN,process.env.MONGO_ADMIN_PW, process.env.BUILD_MONGO_CONTAINER_NAME, process.env.MONGO_PORT_BUILD, process.env.MONGO_DB_NAME, "admin")
    }
}


module.exports.up = up;
module.exports.down = down;

