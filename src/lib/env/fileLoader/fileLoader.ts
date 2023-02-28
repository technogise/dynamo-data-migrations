export abstract class FileLoader {
    configExtension: string;

    migrationTemplate: string;

    constructor(extension: string, migrationPath: string) {
        this.configExtension = extension;
        this.migrationTemplate = migrationPath;
    }

    abstract loadMigrationFile(importPath: string): Promise<any>;
}
