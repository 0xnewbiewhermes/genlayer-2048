#!/usr/bin/env node
/**
 * Generate deployment hex data for GenLayer Testnet Chain.
 * 
 * Usage:
 *   node deploy/generate-deploy-hex.js         # print deploy hex
 *   node deploy/generate-deploy-hex.js --tx    # print as MetaMask tx params
 * 
 * Output:
 *   - deployData: The hex data field for eth_sendTransaction
 *   - to: 0x0000000000000000000000000000000000000000 (zero address for deploy)
 */

import('genlayer-js').then(async ({ abi }) => {
  const fs = await import('fs');
  const path = await import('path');

  const source = fs.readFileSync(path.resolve('contracts/Game2048.py'), 'utf-8');
  console.error(`Contract: Game2048.py (${source.length} bytes)`);

  // Deploy data: [sourceCode, constructorCalldata, leaderOnly]
  const constructorCalldata = abi.calldata.encode(
    abi.calldata.makeCalldataObject(undefined, [], undefined)
  );
  const deployData = [source, constructorCalldata, false];
  const serialized = abi.transactions.serialize(deployData);

  const isTx = process.argv.includes('--tx');

  if (isTx) {
    console.log(JSON.stringify({
      to: '0x0000000000000000000000000000000000000000',
      from: '<YOUR_METAMASK_ADDRESS>',
      data: serialized,
      value: '0x0',
    }, null, 2));
  } else {
    console.log(serialized);
  }
}).catch(e => {
  console.error('Failed:', e.message);
  process.exit(1);
});
