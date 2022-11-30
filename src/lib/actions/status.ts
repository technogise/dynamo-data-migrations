import { find } from 'lodash';

import * as migrationsDir from '../env/migrationsDir';
import * as config from '../env/config';

export async function status() {
    await migrationsDir.shouldExist();
    await config.shouldExist();
}
