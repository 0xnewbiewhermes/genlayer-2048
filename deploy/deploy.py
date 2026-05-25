#!/usr/bin/env python3
"""
Deploy Game2048 Intelligent Contract to GenLayer.

Usage:
    python deploy/deploy.py --network studio
    python deploy/deploy.py --network bradbury --contract Game2048.py
"""
import argparse
import json
import os
import sys
import requests
import time

CONFIG = {
    "studio": {
        "rpc": "https://studio.genlayer.com/api",
        "chain_id": 61999,
    },
    "bradbury": {
        "rpc": "https://rpc-bradbury.genlayer.com",
        "chain_id": 4221,
    },
}


def load_contract(path):
    with open(path, "r") as f:
        return f.read()


def deploy_contract(contract_path, network, sender=None):
    network_config = CONFIG.get(network)
    if not network_config:
        print(f"Error: Unknown network '{network}'")
        sys.exit(1)

    print(f"Loading contract: {contract_path}")
    source = load_contract(contract_path)

    print(f"Deploying to {network} (Chain ID: {network_config['chain_id']})")
    print(f"RPC: {network_config['rpc']}")

    # Read the first line for Depends header
    first_line = source.strip().split('\n')[0]

    payload = {
        "jsonrpc": "2.0",
        "method": "eth_sendTransaction",
        "params": [{
            "from": sender or "0x0000000000000000000000000000000000000000",
            "data": "0x" + source.encode("utf-8").hex(),
        }],
        "id": 1,
    }

    print(f"\nDeploying... (this may take a moment)")
    print(f"Header: {first_line}")

    try:
        resp = requests.post(network_config["rpc"], json=payload, timeout=30)
        result = resp.json()
        if "result" in result:
            print(f"\n✅ Deploy submitted!")
            print(f"Tx hash: {result['result']}")
            print(f"\nContract address will appear after consensus.")
            if network_config.get("explorer"):
                print(f"Explorer: {network_config['explorer']}/tx/{result['result']}")
        else:
            print(f"\n❌ Deploy failed:")
            print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"\n❌ Error: {e}")


def main():
    parser = argparse.ArgumentParser(description="Deploy Game2048 to GenLayer")
    parser.add_argument("--network", choices=["studio", "bradbury"], default="bradbury",
                        help="Target network (default: bradbury)")
    parser.add_argument("--contract", default="contracts/Game2048.py",
                        help="Path to contract file")
    parser.add_argument("--sender", help="Sender address (optional)")

    args = parser.parse_args()
    deploy_contract(args.contract, args.network, args.sender)


if __name__ == "__main__":
    main()
