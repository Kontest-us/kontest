const { Storage } = require('@google-cloud/storage');

//https://stackoverflow.com/questions/39546037/copy-a-file-on-firebase-storage

module.exports = class StorageManager {
    constructor() {
        this.storage = new Storage();
        this.bucket = this.storage.bucket('estimathon-f4ead.appspot.com'); //firebase storage link in Google Storage
    }

    listFiles(prefix, delimiter) {
        return this.bucket.getFiles({ prefix, delimiter });
    }

    deleteFiles(prefix, delimiter) {
        return this.bucket.deleteFiles({ prefix, delimiter, force: true });
    }

    //fromFolder and toFolder are the game codes
    copyFilesInFolder(fromFolder, toFolder) {
        //get all of the files in the folder
        return this.listFiles(fromFolder).then(([files]) => {
            //Promise array - all must be complete before continuing
            let promiseArray = files.map((file) => {
                //for each file, copy into the new folder
                let fileName = file.name;
                let destination = fileName.replace(fromFolder, toFolder);
                return file.copy(destination);
            });
            return Promise.all(promiseArray);
        });
    }
};
