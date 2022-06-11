// adapted from https://github.com/Chia-Network/chia-blockchain-gui

import yaml from 'js-yaml';
import fs from 'fs';
import os from 'os';
import path from 'path';
import _ from 'lodash';
import untildify from './untildify.js';

const homeDirectory = os.homedir();

export function loadUIConfig(net = 'mainnet') {
    const config = readConfigFile(net);

    const selfHostname = _.get(config, 'ui.daemon_host', 'localhost');
    const daemonPort = _.get(config, 'ui.daemon_port', 55400);

    const configRootDir = getConfigRootDir(net);

    const certPath = path.resolve(
        configRootDir,
        _.get(
            config,
            'ui.daemon_ssl.private_crt',
            'config/ssl/daemon/private_daemon.crt',
        ),
    );
    const keyPath = path.resolve(
        configRootDir,
        _.get(
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

    return yaml.load(fs.readFileSync(path.resolve(configRootDir, 'config/config.yaml'), 'utf8'));
}
