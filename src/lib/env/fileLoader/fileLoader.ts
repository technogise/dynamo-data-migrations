export interface AwsConfig {
    profile?: string;
    region: string;
    accessKeyId?: string;
    secretAccessKey?: string;
}

export abstract class FileLoader {
    configExtension: string;

    migrationTemplate: string;

    configPath: string;

    constructor(extension: string, migrationPath: string, configPath: string) {
        this.configExtension = extension;
        this.migrationTemplate = migrationPath;
        this.configPath = configPath;
    }

    abstract loadAWSConfig(): Promise<AwsConfig[]>;
    abstract loadMigrationFile(importPath: string): Promise<any>;
}
