const dotenv = require("dotenv");
dotenv.config({path: '.env'});

const fs = require("fs");
const {execSync} = require('child_process');

const {
    create,
    status,
    database,
    up,
    config,
    down
} = require('migrate-mongo');
const {logInfo, logError} = require("./Logger");
const {AUTH, MAIN, BUILD} = require("./constants/TARGETS");

const createMongoUrl = (user, password, domain, port, dbname, authsource) => {
    return `mongodb://${user}:${password}@${domain}:${port}/${dbname}?directConnection=true&authSource=${authsource}`;
}
const setConfig = (target, user, password, domain, port, dbname, authsource) => {
    const url = createMongoUrl(user, password, domain, port, dbname, authsource);

    const myConfig = {
        mongodb: {
            url: url,
            options: {}
        },
        migrationsDir: `./migrations/${target.name}`,
        changelogCollectionName: "__applied_migrations",
        migrationFileExtension: ".js",
        useFileHash: false,
        moduleSystem: 'commonjs',
    };
    config.set(myConfig);
}

const createMigrationDir = (target) => {
    const migrationsDir = `./migrations/${target.name}`;
    if (fs.existsSync(migrationsDir) === false) {
        fs.mkdirSync(migrationsDir, {recursive: true});
    }
    return migrationsDir;
}

const createMigrationFile = (target, description) => {
    createMigrationDir(target);
    setConfig(target)
    create(description);
}

const runUp = async (target, user, password, domain, port, dbname, authsource) => {
    let dbClient;

    try {
        setConfig(target, user, password, domain, port, dbname, authsource);
        createMigrationDir(target);

        const {db, client} = await database.connect();
        dbClient = client;

        const migrationStatus = await status(db);
        const filesToApply = migrationStatus.filter(({appliedAt}) => appliedAt === "PENDING").map(({fileName}) => fileName)
        if (filesToApply.length === 0) {
            logInfo(target,"No pending migrations found. Skip.");
            return;
        }

        //Create backup first before running the migration
        logInfo(target, "Start - Create Backup of target: " + target.id);
        await runBackup(target, user, password, domain, port, dbname, authsource);
        logInfo(target, "Finished - Create Backup of target: " + target.id);

        logInfo(target, "Start migration of: " + JSON.stringify(filesToApply));
        return await up(db, dbClient);
    } finally {
        await dbClient?.close();
    }
}

const runDown = async (target, user, password, domain, port, dbname, authsource) => {
    setConfig(target, user, password, domain, port, dbname, authsource);
    createMigrationDir(target);

    const {db, client} = await database.connect();
    logInfo(target, "Rollback migration");

    await down(db, client);
    await client.close();
}

const runBackup = async (target, user, password, domain, port, dbname, authsource) => {
    const mongoUrl = createMongoUrl(user, password, domain, port, dbname, authsource);

    const backupDir = `./backup/${target.name}`;
    if (fs.existsSync(backupDir) === false) {
        fs.mkdirSync(backupDir, {recursive: true});
    }

    const version = await getVersionOfTarget(target);
    logInfo(target, "Create backup of version: " + version);

    const cmdCode = `mongodump --uri="${mongoUrl}" --gzip --archive=${backupDir}/${version}.zip`;

    try {
        execSync(cmdCode);
    } catch (e) {
        const errorMsg = e.toString();
        await logError(target, errorMsg);
        throw Error(errorMsg)
    }
}

const getVersionOfTarget = async (target) => {
    if (target.id === AUTH.id) {
        return fetchAuthVersion();
    } else if (target.id === MAIN.id) {
        return fetchMainVersion();
    }else if (target.id === BUILD.id) {
        return fetchBuildVersion();
    }
}

const fetchAuthVersion = async () => {
    const url = `http://${process.env.AUTH_APP_CONTAINER_NAME}:${process.env.HTTP_PORT_AUTH}/version`
    const response = await fetch(url);
    const versionData = await response.json();
    return versionData.currentVersion;
}

const fetchMainVersion = async () => {
    const url = `http://${process.env.MAIN_APP_CONTAINER_NAME}:${process.env.HTTP_PORT_MAIN}`
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "internal_key": process.env.INTERNAL_KEY
        },
        body: JSON.stringify({
            query: `query getMetadata {
            getMetadata{
                main{
                    currentVersion
                    latestVersion
                }
                react{
                    latestVersion
                }

            }
        }`,
            variables: null
        }),
    });



    const versionData = await response.json();
    return versionData.data.getMetadata.main.currentVersion;
}

const fetchBuildVersion = async () => {
    const url = `http://${process.env.BUILD_APP_CONTAINER_NAME}:${process.env.HTTP_PORT_BUILD}/version`
    const response = await fetch(url);
    const versionData = await response.json();
    return versionData.Build.currentVersion;
}


module.exports.runUp = runUp;
module.exports.runDown = runDown;
module.exports.createMigrationFile = createMigrationFile;
module.exports.runBackup = runBackup;
module.exports.getVersionOfTarget = getVersionOfTarget;