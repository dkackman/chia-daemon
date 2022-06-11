import yaml from 'js-yaml';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { get } from 'lodash';
import untildify from './untildify';

const homeDirectory = os.homedir();

export default async function loadUIConfig(net = 'mainnet') {
    const config = readConfigFile(net);

    const selfHostname = get(config, 'ui.daemon_host', 'localhost');
    const daemonPort = get(config, 'ui.daemon_port', 55400);

    // store these in the global object so they can be used by both main and renderer processes
    const configRootDir = getConfigRootDir(net);

    const certPath = path.resolve(
        configRootDir,
        get(
            config,
            'ui.daemon_ssl.private_crt',
            'config/ssl/daemon/private_daemon.crt',
        ),
    );
    const keyPath = path.resolve(
        configRootDir,
        get(
            config,
            'ui.daemon_ssl.private_key',
            'config/ssl/daemon/private_daemon.key',
        ),
    );

    return {
        host: selfHostname,
        port: daemonPort,
        key_path: keyPath,
        cert_path: certPath,
        timeout_seconds: 30,
    };
}

export function getConfigRootDir(net = 'mainnet') {
    return 'CHIA_ROOT' in process.env ? untildify(process.env.CHIA_ROOT)
        : path.join(homeDirectory, '.chia', net);
}

export function readConfigFile(net = 'mainnet') {
    const configRootDir = getConfigRootDir(net);

    return yaml.load(
        fs.readFileSync(path.resolve(configRootDir, 'config/config.yaml'), 'utf8'),
    );
}
