[![Build Status](https://travis-ci.com/OnGridSystems/hack_moscow_contracts.svg?token=euVuUJTLZXyJyBPXi81v&branch=master)](https://travis-ci.com/OnGridSystems/hack_moscow_contracts)
[![Hackathon Hack.Moscow v3](https://img.shields.io/badge/hacken%20moscow-v3-green.svg)](https://hack.moscow/)

Blockchain-Secured Delivery Platform can use any blockchain which supports arbitrary code execution (smart contracts) like Ethereum, TRON, EOS, PlasmaPay and others.

# Smart Contracts for PlasmaPay
We spent 20+ of hours studying documentation, snippets and examples at original plasmaPay resources. During this time with official discord support we performed the following steps:
* Registered at the control panel app.plasmapay.com
* generated keypair
* started blockchain node and established peering
* But still unable to compile contracts from source code

# Smart Contracts for Ethereum
Ethereum is more common and mature platform so we used this option as a backup if PlasmaPay integration become impossible in hackathon tight time constraints.

## ERC-20 stablecoin
* **Interface: ERC-20** ERC-20 is the most liquid form of the token natively supported by the most crypto exchanges, both legacy and decentralized.
* **Decimals: 8** - some exchanges recommend this value for pairing with BTC. 8 decimal digits give reasonable granularity and still doesn't need big integer math.
* **Symbol: STC**;
* **Name: stableCoin**;
* **Network: any Ethereum Blockchain**;
* **Burnable: yes** - the ability to discard user's **own** tokens is always a good idea. Any holder can throw its tokens (obviously having no interest to do this).
* **Approvable: yes** - transferFrom, approve, and allowance ERC-20 methods are widely used in DEX workflow, allowing contracts to send tokens on your behalf. Used in pull-mode deposit process in DeliveryEscrow.
* **Mintable: yes, onlyOwner** - The owner can emit new tokens.
* **Ownable: Yes** - Owner can mint new tokens. We use this to test behavior;
* **Cap: no** - The maximum circulating amount of tokens is not limited.

## DeliveryEscrow
DeliveryEscrow contract implements the locking mechanism to guarantee fair behavior of participants. In the simplest case we've implemented lockup of Carrier's funds in given amount while he transfers the order from one location to another.

# Install
Install submodules (OpenZeppelin)
```
git submodule init
git submodule update
```
Install NPM dependencies
```
npm install
```
# Test
```
npm run test
```

# Authors
* [Alexander Samoylenko](https://github.com/lxmnk)
* [Kirill Varlamov](https://github.com/ongrid)
* other guys from [OnGrid Systems]((https://github.com/OnGridSystems/))
