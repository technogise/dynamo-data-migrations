import fs from 'fs-extra';

export function create(description: string) {
    let isFile = false;
    try {
        const stats = fs.statSync('./setup.db/config.ts');
        isFile = stats.isFile();
    } catch {
        console.info('No config.js file found, Please run the init command first');
    }
    if (isFile) {
        try {
            if (!fs.existsSync('setup.db/migrations')) {
                fs.mkdirSync('setup.db/migrations');
            }
            const filePath =
                `setup.db/migrations/${ 
                Date.now() 
                }${description === undefined ? '' : `_${  description}` 
                }.ts`;
            fs.createFile(filePath,  (err) => {
                if (err) throw err;
                console.info('File is created successfully.');
            });
        } catch (error) {
            console.error(error);
        }
    }
}
