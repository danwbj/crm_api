import * as fs from 'fs'
import * as path from 'path'

let configPath = path.join(path.dirname(fs.realpathSync(__filename)), '../config.json');

let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

export default config
