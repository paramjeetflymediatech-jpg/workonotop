import 'dotenv/config';
import { execute } from './src/lib/db.js';

async function checkIndices() {
    try {
        const indices = await execute('SHOW INDEX FROM mobile_auth_users');
        const groups = {};
        indices.forEach(idx => {
            if (!groups[idx.Key_name]) groups[idx.Key_name] = [];
            groups[idx.Key_name].push(idx.Column_name);
        });
        console.log(JSON.stringify(groups, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

checkIndices();
