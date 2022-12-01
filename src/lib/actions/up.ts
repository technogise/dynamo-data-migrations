import _ from 'lodash';
import { status } from './status';

export async function up() {
    const statusItems = await status();
}
