// @ts-nocheck
import { abi } from 'genlayer-js';

const BRADBURY_RPC = 'https://rpc-bradbury.genlayer.com';
const CONTRACT_ADDRESS = '0xf74a806A9B0A03e3442c9e68218d29eF51885021';

/**
 * Encode a function call using genlayer-js SDK serialization format.
 * Use this to generate the `data` field for MetaMask eth_sendTransaction.
 */
export function encodeFunctionCall(functionName: string, args: any[] = []): string {
  const calldataObj = abi.calldata.makeCalldataObject(functionName, args, undefined);
  const encoded = abi.calldata.encode(calldataObj);
  const serialized = abi.transactions.serialize([encoded, false]);
  return serialized;
}

/**
 * Read contract state via gen_call on Bradbury RPC.
 * Uses SDK serialization format.
 */
export async function readContract(functionName: string, args: any[] = []): Promise<any> {
  const data = encodeFunctionCall(functionName, args);
  
  const res = await fetch(BRADBURY_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'gen_call',
      params: [{
        to: CONTRACT_ADDRESS,
        data,
        type: 'read',
      }],
      id: 1,
    }),
  });
  
  const result = await res.json();
  if (result.error) throw new Error(result.error.message || JSON.stringify(result.error));
  
  // Parse gen_call result: { data: <hex>, status: { code: 0, message: 'success' } }
  if (result.result && typeof result.result === 'object' && result.result.data) {
    const hexData = result.result.data.startsWith('0x') ? result.result.data.slice(2) : result.result.data;
    const rawBytes = new Uint8Array(hexData.match(/.{1,2}/g)?.map(b => parseInt(b, 16)) || []);
    
    // Try to decode via SDK
    try {
      const decoded = abi.calldata.decode(rawBytes);
      return decoded;
    } catch {
      // Fallback: raw text
      const text = new TextDecoder().decode(rawBytes);
      if (text.startsWith('{') || text.startsWith('[')) {
        try { return JSON.parse(text); } catch {}
      }
      return text;
    }
  }
  
  if (typeof result.result === 'string') {
    return result.result;
  }
  
  return result.result;
}

export { CONTRACT_ADDRESS, BRADBURY_RPC };
