# chia-daemon

[![Node.js CI](https://github.com/dkackman/chia-daemon/actions/workflows/node.js.yml/badge.svg)](https://github.com/dkackman/chia-daemon/actions/workflows/node.js.yml)
[![CodeQL](https://github.com/dkackman/chia-daemon/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/dkackman/chia-daemon/actions/workflows/codeql-analysis.yml)

[![NPM](https://nodei.co/npm/chia-daemon.png?mini=true)](https://npmjs.org/package/chia-daemon)

A JS client for chia daemon with dynamically generated end points

## Getting Started

```bash
npm install
npm test
```

## Basic Usage

Each service is a field on the `services` property of the `ChiaDaemon`.

- Since all service calls go through the daemon there is no need for other endpoint configuration
- All RPC calls are async
- Since all rpc call are dyanmically invoked there is no need to update the library with new chia release.
(i.e. if you invoke `daemon.wallet.foo()` it will call make an RPC to a function named `foo` at that endpoint and error if it doesn't exist there)

```javascript
import loadUIConfig from 'config'
import { ChiaDaemon } from 'chia-daemon';

const daemon = new ChiaDaemon(loadUIConfig(), 'my-chia-app');
const connected = await daemon.connect();
if (connected) {
    const state = await daemon.services.full_node.get_blockchain_state();
    console.log(state);
}

```
