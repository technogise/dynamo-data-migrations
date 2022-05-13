import fs from 'fs-extra';

export function create(description: string) {
    let isFile: boolean = false;
    try {
        let stats = fs.statSync('./setup.db/config.ts');
        isFile = stats.isFile();
    } catch (error) {
        console.log('No config.js file found, Please run the init command first');
    }
    if (isFile) {
        try {
            if (!fs.existsSync('setup.db/migrations')) {
                fs.mkdirSync('setup.db/migrations');
            }
            let filePath =
                'setup.db/migrations/' +
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
