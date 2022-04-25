import fs from 'fs-extra';

export default class create {
    constructor(description: string) {
        var isFile: boolean = false;
        try {
            var stats = fs.statSync('./setup.db/config.ts');
            isFile = stats.isFile();
        } catch (error) {
            console.log('No config.js file found, Please run the init command first');
        }
        if (isFile) {
            try {
                if (!fs.existsSync('./migrations')) {
                    fs.mkdirSync('migrations');
                }
                let filePath =
                    './migrations/' +
                    new Date().getTime() +
                    (description === undefined ? '' : '_' + description) +
                    '.ts';
                fs.createFile(filePath, function (err) {
                    if (err) throw err;
                    console.log('File is created successfully.');
                });
            } catch (err) {
                console.error(err);
            }
        }
    }
}
