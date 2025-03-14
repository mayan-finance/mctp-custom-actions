/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/mctp.json`.
 */
export type Mctp = {
  "address": "dkpZqrxHFrhziEMQ931GLtfy11nFkCsfMftH9u6QwBU",
  "metadata": {
    "name": "mctp",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "bridgeLockedFee",
      "discriminator": [
        112,
        171,
        205,
        105,
        227,
        59,
        197,
        128
      ],
      "accounts": [
        {
          "name": "ledger",
          "writable": true
        },
        {
          "name": "ledgerAcc",
          "writable": true
        },
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "relayerAcc",
          "writable": true,
          "optional": true
        },
        {
          "name": "lockedFee",
          "writable": true
        },
        {
          "name": "lockedFeeAcc",
          "writable": true
        },
        {
          "name": "mintFrom",
          "writable": true
        },
        {
          "name": "cctpDeposit",
          "accounts": [
            {
              "name": "cctpTokenSenderAuthority"
            },
            {
              "name": "cctpTokenTokenMessenger"
            },
            {
              "name": "cctpTokenRemoteTokenMessenger"
            },
            {
              "name": "cctpTokenTokenMinter"
            },
            {
              "name": "cctpTokenLocalToken",
              "writable": true
            },
            {
              "name": "cctpTokenEventAuth"
            },
            {
              "name": "cctpCoreMessageTransmitter",
              "writable": true
            },
            {
              "name": "message",
              "writable": true,
              "signer": true
            },
            {
              "name": "tokenMessengerMinter"
            },
            {
              "name": "messageTransmitter"
            }
          ]
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram"
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": []
    },
    {
      "name": "bridgeWithFee",
      "discriminator": [
        141,
        239,
        37,
        224,
        28,
        231,
        237,
        51
      ],
      "accounts": [
        {
          "name": "ledger",
          "writable": true
        },
        {
          "name": "ledgerAcc",
          "writable": true
        },
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "relayerAcc",
          "writable": true,
          "optional": true
        },
        {
          "name": "mintFrom",
          "writable": true
        },
        {
          "name": "cctpDeposit",
          "accounts": [
            {
              "name": "cctpTokenSenderAuthority"
            },
            {
              "name": "cctpTokenTokenMessenger"
            },
            {
              "name": "cctpTokenRemoteTokenMessenger"
            },
            {
              "name": "cctpTokenTokenMinter"
            },
            {
              "name": "cctpTokenLocalToken",
              "writable": true
            },
            {
              "name": "cctpTokenEventAuth"
            },
            {
              "name": "cctpCoreMessageTransmitter",
              "writable": true
            },
            {
              "name": "message",
              "writable": true,
              "signer": true
            },
            {
              "name": "tokenMessengerMinter"
            },
            {
              "name": "messageTransmitter"
            }
          ]
        },
        {
          "name": "wormholePostMessage",
          "accounts": [
            {
              "name": "emitter"
            },
            {
              "name": "config",
              "writable": true
            },
            {
              "name": "emitterSequence",
              "writable": true
            },
            {
              "name": "feeCollector",
              "writable": true
            },
            {
              "name": "message",
              "writable": true,
              "signer": true
            },
            {
              "name": "coreBridgeProgram"
            },
            {
              "name": "clock"
            },
            {
              "name": "rent"
            }
          ]
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": []
    },
    {
      "name": "claimOrder",
      "discriminator": [
        164,
        202,
        83,
        197,
        77,
        171,
        96,
        234
      ],
      "accounts": [
        {
          "name": "cctpClaim",
          "accounts": [
            {
              "name": "payer",
              "writable": true,
              "signer": true
            },
            {
              "name": "caller"
            },
            {
              "name": "main"
            },
            {
              "name": "cctpMint"
            },
            {
              "name": "cctpCoreAuthority"
            },
            {
              "name": "cctpCoreMessageTransmitter"
            },
            {
              "name": "cctpCoreUsedNonces",
              "writable": true
            },
            {
              "name": "cctpCoreEventAuth"
            },
            {
              "name": "cctpTokenTokenMessenger"
            },
            {
              "name": "cctpTokenRemoteTokenMessenger"
            },
            {
              "name": "cctpTokenTokenMinter",
              "writable": true
            },
            {
              "name": "cctpTokenLocalToken",
              "docs": [
                "with seeds constraint we will sure the cctp_mint is correct"
              ],
              "writable": true
            },
            {
              "name": "cctpTokenTokenPair"
            },
            {
              "name": "cctpReceiverAcc",
              "writable": true
            },
            {
              "name": "cctpTokenCustody",
              "writable": true
            },
            {
              "name": "cctpTokenEventAuth"
            },
            {
              "name": "tokenMessengerMinter"
            },
            {
              "name": "messageTransmitter"
            }
          ]
        },
        {
          "name": "order",
          "writable": true
        },
        {
          "name": "orderFromAcc",
          "writable": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "claimOrderParams"
            }
          }
        }
      ]
    },
    {
      "name": "closeOrder",
      "discriminator": [
        90,
        103,
        209,
        28,
        7,
        63,
        168,
        4
      ],
      "accounts": [
        {
          "name": "state",
          "docs": [
            "but as we want to close it and change its type we should use AccountInfo type"
          ],
          "writable": true
        },
        {
          "name": "relayer",
          "writable": true
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": []
    },
    {
      "name": "createOrder",
      "discriminator": [
        141,
        54,
        37,
        207,
        237,
        210,
        250,
        215
      ],
      "accounts": [
        {
          "name": "ledger",
          "writable": true
        },
        {
          "name": "ledgerAcc",
          "writable": true
        },
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "relayerAcc",
          "writable": true,
          "optional": true
        },
        {
          "name": "mintFrom",
          "writable": true
        },
        {
          "name": "orderState",
          "writable": true
        },
        {
          "name": "cctpDeposit",
          "accounts": [
            {
              "name": "cctpTokenSenderAuthority"
            },
            {
              "name": "cctpTokenTokenMessenger"
            },
            {
              "name": "cctpTokenRemoteTokenMessenger"
            },
            {
              "name": "cctpTokenTokenMinter"
            },
            {
              "name": "cctpTokenLocalToken",
              "writable": true
            },
            {
              "name": "cctpTokenEventAuth"
            },
            {
              "name": "cctpCoreMessageTransmitter",
              "writable": true
            },
            {
              "name": "message",
              "writable": true,
              "signer": true
            },
            {
              "name": "tokenMessengerMinter"
            },
            {
              "name": "messageTransmitter"
            }
          ]
        },
        {
          "name": "feeManagerProgram"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": []
    },
    {
      "name": "flashSwapFinish",
      "discriminator": [
        31,
        43,
        233,
        57,
        62,
        243,
        215,
        107
      ],
      "accounts": [
        {
          "name": "order",
          "writable": true
        },
        {
          "name": "orderToAcc",
          "writable": true
        },
        {
          "name": "mintTo"
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": []
    },
    {
      "name": "flashSwapStart",
      "discriminator": [
        210,
        86,
        206,
        176,
        90,
        195,
        113,
        50
      ],
      "accounts": [
        {
          "name": "order",
          "writable": true
        },
        {
          "name": "orderFromAcc",
          "writable": true
        },
        {
          "name": "driver",
          "signer": true
        },
        {
          "name": "driverFromAcc",
          "writable": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "instructionSysvar"
        }
      ],
      "args": [
        {
          "name": "finishInsIndex",
          "type": "u16"
        }
      ]
    },
    {
      "name": "initBridgeLedger",
      "discriminator": [
        167,
        102,
        128,
        106,
        121,
        118,
        186,
        76
      ],
      "accounts": [
        {
          "name": "trader",
          "writable": true,
          "signer": true
        },
        {
          "name": "ledger",
          "writable": true
        },
        {
          "name": "ledgerAcc"
        },
        {
          "name": "customPayloadStore",
          "docs": [
            "We will hash all data of it and store it in ledger as custom payload."
          ],
          "optional": true
        },
        {
          "name": "mintFrom"
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "initBridgeLedgerParams"
            }
          }
        }
      ]
    },
    {
      "name": "initOrderLedger",
      "discriminator": [
        143,
        235,
        252,
        194,
        211,
        90,
        134,
        77
      ],
      "accounts": [
        {
          "name": "trader",
          "writable": true,
          "signer": true
        },
        {
          "name": "ledger",
          "writable": true
        },
        {
          "name": "ledgerAcc"
        },
        {
          "name": "mintFrom"
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "initOrderLedgerParams"
            }
          }
        }
      ]
    },
    {
      "name": "postSourceOrder",
      "discriminator": [
        12,
        95,
        149,
        164,
        83,
        122,
        255,
        241
      ],
      "accounts": [
        {
          "name": "orderState"
        },
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "wormholePostMessage",
          "accounts": [
            {
              "name": "emitter"
            },
            {
              "name": "config",
              "writable": true
            },
            {
              "name": "emitterSequence",
              "writable": true
            },
            {
              "name": "feeCollector",
              "writable": true
            },
            {
              "name": "message",
              "writable": true,
              "signer": true
            },
            {
              "name": "coreBridgeProgram"
            },
            {
              "name": "clock"
            },
            {
              "name": "rent"
            }
          ]
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": []
    },
    {
      "name": "redeemWithFee",
      "discriminator": [
        246,
        208,
        184,
        183,
        114,
        154,
        68,
        122
      ],
      "accounts": [
        {
          "name": "vaa"
        },
        {
          "name": "cctpClaim",
          "accounts": [
            {
              "name": "payer",
              "writable": true,
              "signer": true
            },
            {
              "name": "caller"
            },
            {
              "name": "main"
            },
            {
              "name": "cctpMint"
            },
            {
              "name": "cctpCoreAuthority"
            },
            {
              "name": "cctpCoreMessageTransmitter"
            },
            {
              "name": "cctpCoreUsedNonces",
              "writable": true
            },
            {
              "name": "cctpCoreEventAuth"
            },
            {
              "name": "cctpTokenTokenMessenger"
            },
            {
              "name": "cctpTokenRemoteTokenMessenger"
            },
            {
              "name": "cctpTokenTokenMinter",
              "writable": true
            },
            {
              "name": "cctpTokenLocalToken",
              "docs": [
                "with seeds constraint we will sure the cctp_mint is correct"
              ],
              "writable": true
            },
            {
              "name": "cctpTokenTokenPair"
            },
            {
              "name": "cctpReceiverAcc",
              "writable": true
            },
            {
              "name": "cctpTokenCustody",
              "writable": true
            },
            {
              "name": "cctpTokenEventAuth"
            },
            {
              "name": "tokenMessengerMinter"
            },
            {
              "name": "messageTransmitter"
            }
          ]
        },
        {
          "name": "dest",
          "writable": true
        },
        {
          "name": "destAcc",
          "writable": true
        },
        {
          "name": "relayerAcc",
          "writable": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "redeemWithFeeParams"
            }
          }
        }
      ],
      "returns": "u64"
    },
    {
      "name": "redeemWithFeeCustomPayload",
      "discriminator": [
        207,
        144,
        189,
        10,
        243,
        75,
        250,
        30
      ],
      "accounts": [
        {
          "name": "vaa"
        },
        {
          "name": "cctpClaim",
          "accounts": [
            {
              "name": "payer",
              "writable": true,
              "signer": true
            },
            {
              "name": "caller"
            },
            {
              "name": "main"
            },
            {
              "name": "cctpMint"
            },
            {
              "name": "cctpCoreAuthority"
            },
            {
              "name": "cctpCoreMessageTransmitter"
            },
            {
              "name": "cctpCoreUsedNonces",
              "writable": true
            },
            {
              "name": "cctpCoreEventAuth"
            },
            {
              "name": "cctpTokenTokenMessenger"
            },
            {
              "name": "cctpTokenRemoteTokenMessenger"
            },
            {
              "name": "cctpTokenTokenMinter",
              "writable": true
            },
            {
              "name": "cctpTokenLocalToken",
              "docs": [
                "with seeds constraint we will sure the cctp_mint is correct"
              ],
              "writable": true
            },
            {
              "name": "cctpTokenTokenPair"
            },
            {
              "name": "cctpReceiverAcc",
              "writable": true
            },
            {
              "name": "cctpTokenCustody",
              "writable": true
            },
            {
              "name": "cctpTokenEventAuth"
            },
            {
              "name": "tokenMessengerMinter"
            },
            {
              "name": "messageTransmitter"
            }
          ]
        },
        {
          "name": "dest",
          "writable": true,
          "signer": true
        },
        {
          "name": "destAcc",
          "writable": true
        },
        {
          "name": "relayerAcc",
          "writable": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "redeemWithFeeParams"
            }
          }
        }
      ],
      "returns": "u64"
    },
    {
      "name": "refundOrder",
      "discriminator": [
        164,
        168,
        47,
        144,
        154,
        1,
        241,
        255
      ],
      "accounts": [
        {
          "name": "order",
          "writable": true
        },
        {
          "name": "orderFromAcc",
          "writable": true
        },
        {
          "name": "dest",
          "writable": true
        },
        {
          "name": "destAcc",
          "writable": true
        },
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "relayerFromAcc",
          "writable": true
        },
        {
          "name": "systemProgram"
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": []
    },
    {
      "name": "registerOrder",
      "discriminator": [
        92,
        37,
        29,
        46,
        77,
        250,
        219,
        6
      ],
      "accounts": [
        {
          "name": "vaa"
        },
        {
          "name": "order",
          "writable": true
        },
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "registerOrderParams"
            }
          }
        }
      ]
    },
    {
      "name": "setAuctionWinner",
      "discriminator": [
        63,
        231,
        14,
        33,
        159,
        196,
        43,
        39
      ],
      "accounts": [
        {
          "name": "order",
          "writable": true
        },
        {
          "name": "auction"
        }
      ],
      "args": [
        {
          "name": "expectedWinner",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "settleOrder",
      "discriminator": [
        80,
        74,
        204,
        34,
        12,
        183,
        66,
        66
      ],
      "accounts": [
        {
          "name": "order",
          "writable": true
        },
        {
          "name": "orderFromAcc",
          "writable": true
        },
        {
          "name": "orderToAcc",
          "writable": true
        },
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "relayerFromAcc",
          "writable": true
        },
        {
          "name": "mintTo"
        },
        {
          "name": "dest",
          "writable": true
        },
        {
          "name": "destAcc",
          "writable": true,
          "optional": true
        },
        {
          "name": "referrer"
        },
        {
          "name": "feeCollector"
        },
        {
          "name": "referrerFeeAcc",
          "writable": true,
          "optional": true
        },
        {
          "name": "mayanFeeAcc",
          "writable": true,
          "optional": true
        },
        {
          "name": "tokenProgramOut"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram"
        },
        {
          "name": "associatedTokenProgram"
        }
      ],
      "args": [
        {
          "name": "tryCloseAta",
          "type": "bool"
        }
      ]
    },
    {
      "name": "unlockFee",
      "discriminator": [
        95,
        219,
        253,
        5,
        215,
        222,
        12,
        79
      ],
      "accounts": [
        {
          "name": "vaa"
        },
        {
          "name": "mintFrom"
        },
        {
          "name": "lockedFee",
          "writable": true
        },
        {
          "name": "lockedFeeAcc",
          "writable": true
        },
        {
          "name": "unlocker",
          "signer": true
        },
        {
          "name": "unlockerAcc",
          "writable": true
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "unlockFeeParams"
            }
          }
        }
      ]
    },
    {
      "name": "unlockFeeWithRefine",
      "discriminator": [
        122,
        32,
        107,
        109,
        136,
        250,
        139,
        227
      ],
      "accounts": [
        {
          "name": "vaaUnlock"
        },
        {
          "name": "vaaRefine"
        },
        {
          "name": "mintFrom"
        },
        {
          "name": "lockedFee",
          "writable": true
        },
        {
          "name": "lockedFeeAcc",
          "writable": true
        },
        {
          "name": "unlocker",
          "signer": true
        },
        {
          "name": "unlockerAcc",
          "writable": true
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "unlockFeeWithRefineParams"
            }
          }
        }
      ]
    },
    {
      "name": "withdrawBridgeLedger",
      "discriminator": [
        153,
        164,
        15,
        94,
        22,
        26,
        195,
        138
      ],
      "accounts": [
        {
          "name": "ledger",
          "writable": true
        },
        {
          "name": "ledgerAcc"
        },
        {
          "name": "withdrawShared",
          "accounts": [
            {
              "name": "mintFrom"
            },
            {
              "name": "trader",
              "writable": true,
              "signer": true
            },
            {
              "name": "traderAcc"
            },
            {
              "name": "tokenProgram"
            },
            {
              "name": "systemProgram"
            }
          ]
        }
      ],
      "args": []
    },
    {
      "name": "withdrawOrderLedger",
      "discriminator": [
        173,
        104,
        218,
        246,
        6,
        172,
        116,
        207
      ],
      "accounts": [
        {
          "name": "ledger",
          "writable": true
        },
        {
          "name": "ledgerAcc"
        },
        {
          "name": "withdrawShared",
          "accounts": [
            {
              "name": "mintFrom"
            },
            {
              "name": "trader",
              "writable": true,
              "signer": true
            },
            {
              "name": "traderAcc"
            },
            {
              "name": "tokenProgram"
            },
            {
              "name": "systemProgram"
            }
          ]
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "auctionState",
      "discriminator": [
        252,
        227,
        205,
        147,
        72,
        64,
        250,
        126
      ]
    },
    {
      "name": "bridgeLedgerState",
      "discriminator": [
        34,
        147,
        108,
        255,
        240,
        145,
        64,
        43
      ]
    },
    {
      "name": "lockedFee",
      "discriminator": [
        248,
        71,
        52,
        103,
        114,
        233,
        58,
        19
      ]
    },
    {
      "name": "orderDestSolanaState",
      "discriminator": [
        198,
        129,
        44,
        70,
        167,
        41,
        108,
        44
      ]
    },
    {
      "name": "orderLedgerState",
      "discriminator": [
        55,
        52,
        56,
        210,
        43,
        133,
        8,
        80
      ]
    },
    {
      "name": "orderSourceSolanaState",
      "discriminator": [
        251,
        166,
        188,
        142,
        205,
        71,
        239,
        203
      ]
    }
  ],
  "events": [
    {
      "name": "bridgedLockedFee",
      "discriminator": [
        162,
        129,
        40,
        225,
        193,
        223,
        66,
        62
      ]
    },
    {
      "name": "bridgedWithFee",
      "discriminator": [
        147,
        222,
        57,
        87,
        100,
        194,
        196,
        3
      ]
    },
    {
      "name": "ledgerBridgeInitialized",
      "discriminator": [
        162,
        159,
        206,
        146,
        56,
        81,
        123,
        85
      ]
    },
    {
      "name": "ledgerOrderInitialized",
      "discriminator": [
        184,
        47,
        251,
        219,
        32,
        203,
        91,
        45
      ]
    },
    {
      "name": "orderCreated",
      "discriminator": [
        224,
        1,
        229,
        63,
        254,
        60,
        190,
        159
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidDestinationChain",
      "msg": "Invalid destination chain"
    },
    {
      "code": 6001,
      "name": "amountInTooSmall",
      "msg": "Amount in is less than minimum (slippage tolerance)"
    },
    {
      "code": 6002,
      "name": "invalidZeroAmount"
    },
    {
      "code": 6003,
      "name": "destAddressZero"
    },
    {
      "code": 6004,
      "name": "feesOverflow"
    },
    {
      "code": 6005,
      "name": "feesTooHigh"
    },
    {
      "code": 6006,
      "name": "destSolanaNotAllowed"
    },
    {
      "code": 6007,
      "name": "invalidLedgerMode"
    },
    {
      "code": 6008,
      "name": "suiDoesNotSupportLockedFee"
    },
    {
      "code": 6009,
      "name": "referrerFeeRateTooHigh",
      "msg": "Referrer fee rate too high (max 100)"
    },
    {
      "code": 6010,
      "name": "protocolFeeRateTooHigh"
    },
    {
      "code": 6011,
      "name": "feeRateRefIsNotZero",
      "msg": "Referrer fee rate is not zero when addr red is zero"
    },
    {
      "code": 6012,
      "name": "gasDropNotZeroWhenTokenOutIsNative"
    },
    {
      "code": 6013,
      "name": "invalidCctpDepositMode"
    },
    {
      "code": 6014,
      "name": "invalidPayloadLength"
    },
    {
      "code": 6015,
      "name": "onlyBridgeWithFeeSupportsCustomPayload"
    },
    {
      "code": 6016,
      "name": "invalidTraderForWithdraw"
    },
    {
      "code": 6017,
      "name": "invalidMintFrom"
    },
    {
      "code": 6018,
      "name": "invalidEmitterChain"
    },
    {
      "code": 6019,
      "name": "invalidEmitterAddress"
    },
    {
      "code": 6020,
      "name": "invalidVaaPayloadLength"
    },
    {
      "code": 6021,
      "name": "vaaHashMismatch"
    },
    {
      "code": 6022,
      "name": "mainAccOverflowed"
    },
    {
      "code": 6023,
      "name": "amountCCtpClaimMismatch"
    },
    {
      "code": 6024,
      "name": "invalidCctpVersion"
    },
    {
      "code": 6025,
      "name": "invalidCctpDomain"
    },
    {
      "code": 6026,
      "name": "invalidCctpCaller"
    },
    {
      "code": 6027,
      "name": "invalidCctpRecipient"
    },
    {
      "code": 6028,
      "name": "destShouldBeSignerInCustomPayload",
      "msg": "Dest should be signer in custom payload"
    },
    {
      "code": 6029,
      "name": "unlockFeeNonceMismatch"
    },
    {
      "code": 6030,
      "name": "invalidUnlockFeeGasDrop"
    },
    {
      "code": 6031,
      "name": "gasDropUnlockIsSufficient"
    },
    {
      "code": 6032,
      "name": "invalidChainSource"
    },
    {
      "code": 6033,
      "name": "invalidChainDest"
    },
    {
      "code": 6034,
      "name": "invalidOrderStatus"
    },
    {
      "code": 6035,
      "name": "invalidCctpMessage"
    },
    {
      "code": 6036,
      "name": "invalidAmountClaimed"
    },
    {
      "code": 6037,
      "name": "deadlineIsPassed"
    },
    {
      "code": 6038,
      "name": "deadlineIsNotPassed"
    },
    {
      "code": 6039,
      "name": "mintAndTokenProgramMismatch"
    },
    {
      "code": 6040,
      "name": "invalidMint"
    },
    {
      "code": 6041,
      "name": "invalidExpectedWinner"
    },
    {
      "code": 6042,
      "name": "auctionIsNotFinished"
    },
    {
      "code": 6043,
      "name": "auctionHashMismatch"
    },
    {
      "code": 6044,
      "name": "orderIsNotClaimed"
    },
    {
      "code": 6045,
      "name": "flashSwapIsAlreadyStarted"
    },
    {
      "code": 6046,
      "name": "invalidFinishIndex"
    },
    {
      "code": 6047,
      "name": "invalidFinishProgramId"
    },
    {
      "code": 6048,
      "name": "invalidFinishDiscriminator"
    },
    {
      "code": 6049,
      "name": "invalidFinishOrderAccount"
    },
    {
      "code": 6050,
      "name": "invalidFinishDataLength"
    },
    {
      "code": 6051,
      "name": "flashSwapIsNotStarted"
    },
    {
      "code": 6052,
      "name": "insufficientOutputAmount"
    },
    {
      "code": 6053,
      "name": "winnerIsPrivilegedYet"
    },
    {
      "code": 6054,
      "name": "missingRequiredOptionalAccount"
    },
    {
      "code": 6055,
      "name": "invalidStateAccount"
    },
    {
      "code": 6056,
      "name": "invalidRelayer"
    },
    {
      "code": 6057,
      "name": "overflow"
    },
    {
      "code": 6058,
      "name": "invalidPayloadType"
    }
  ],
  "types": [
    {
      "name": "auctionState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "hash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "initializer",
            "type": "pubkey"
          },
          {
            "name": "closeEpoch",
            "type": "u64"
          },
          {
            "name": "amountOutMin",
            "type": "u64"
          },
          {
            "name": "winner",
            "type": "pubkey"
          },
          {
            "name": "amountPromised",
            "type": "u64"
          },
          {
            "name": "validFrom",
            "type": "u64"
          },
          {
            "name": "seqMsg",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "bridgeLedgerState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "baseInfo",
            "type": {
              "defined": {
                "name": "ledgerBase"
              }
            }
          },
          {
            "name": "customPayload",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "bridgedLockedFee",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "cctpNonce",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "bridgedWithFee",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "cctpNonce",
            "type": "u64"
          },
          {
            "name": "nextSequence",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "claimOrderParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "cctpMessage",
            "type": {
              "array": [
                "u8",
                248
              ]
            }
          },
          {
            "name": "cctpAttestation",
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "initBridgeLedgerParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "addrDest",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "amountInMin",
            "type": "u64"
          },
          {
            "name": "gasDrop",
            "type": "u64"
          },
          {
            "name": "feeRedeem",
            "type": "u64"
          },
          {
            "name": "feeSolana",
            "type": "u64"
          },
          {
            "name": "chainDest",
            "type": "u16"
          },
          {
            "name": "keyRnd",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "mode",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "initOrderLedgerParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "addrDest",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "amountInMin",
            "type": "u64"
          },
          {
            "name": "gasDrop",
            "type": "u64"
          },
          {
            "name": "feeRedeem",
            "type": "u64"
          },
          {
            "name": "feeSolana",
            "type": "u64"
          },
          {
            "name": "chainDest",
            "type": "u16"
          },
          {
            "name": "keyRnd",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "mode",
            "type": "u8"
          },
          {
            "name": "tokenOut",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "amountOutMin",
            "type": "u64"
          },
          {
            "name": "deadline",
            "type": "u64"
          },
          {
            "name": "addrRef",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "feeRateRef",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "ledgerBase",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mode",
            "type": {
              "defined": {
                "name": "ledgerMode"
              }
            }
          },
          {
            "name": "trader",
            "type": "pubkey"
          },
          {
            "name": "keyRnd",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "mintFrom",
            "type": "pubkey"
          },
          {
            "name": "addrDest",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "chainDest",
            "type": "u16"
          },
          {
            "name": "domainDest",
            "type": "u32"
          },
          {
            "name": "gasDrop",
            "type": "u64"
          },
          {
            "name": "feeRedeem",
            "type": "u64"
          },
          {
            "name": "feeSolana",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "ledgerBridgeInitialized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mintFrom",
            "type": "pubkey"
          },
          {
            "name": "amountIn",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "ledgerMode",
      "repr": {
        "kind": "rust"
      },
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "none"
          },
          {
            "name": "bridgeWithFee"
          },
          {
            "name": "bridgeLockedFee"
          },
          {
            "name": "createOrder"
          }
        ]
      }
    },
    {
      "name": "ledgerOrderInitialized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mintFrom",
            "type": "pubkey"
          },
          {
            "name": "amountIn",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "lockedFee",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "cctpNonce",
            "type": "u64"
          },
          {
            "name": "gasDrop",
            "type": "u64"
          },
          {
            "name": "addrDest",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "orderCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "cctpNonce",
            "type": "u64"
          },
          {
            "name": "hash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "orderDestSolanaState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "orderDestSolanaStatus"
              }
            }
          },
          {
            "name": "orderInfo",
            "type": {
              "defined": {
                "name": "orderInfo"
              }
            }
          },
          {
            "name": "relayer",
            "type": "pubkey"
          },
          {
            "name": "swapInfo",
            "type": {
              "defined": {
                "name": "swapInfo"
              }
            }
          }
        ]
      }
    },
    {
      "name": "orderDestSolanaStatus",
      "repr": {
        "kind": "rust"
      },
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "none"
          },
          {
            "name": "registered"
          },
          {
            "name": "claimed"
          },
          {
            "name": "swapped"
          },
          {
            "name": "settled"
          },
          {
            "name": "refunded"
          },
          {
            "name": "closed"
          }
        ]
      }
    },
    {
      "name": "orderInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "payloadType",
            "type": "u8"
          },
          {
            "name": "trader",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "chainSource",
            "type": "u16"
          },
          {
            "name": "tokenIn",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "amountIn",
            "type": "u64"
          },
          {
            "name": "addrDest",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "chainDest",
            "type": "u16"
          },
          {
            "name": "tokenOut",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "amountOutMin",
            "type": "u64"
          },
          {
            "name": "gasDrop",
            "type": "u64"
          },
          {
            "name": "feeRedeem",
            "type": "u64"
          },
          {
            "name": "deadline",
            "type": "u64"
          },
          {
            "name": "addrRef",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "feeRateRef",
            "type": "u8"
          },
          {
            "name": "feeRateMayan",
            "type": "u8"
          },
          {
            "name": "cctpNonce",
            "type": "u64"
          },
          {
            "name": "cctpDomain",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "orderLedgerState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "baseInfo",
            "type": {
              "defined": {
                "name": "ledgerBase"
              }
            }
          },
          {
            "name": "tokenOut",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "amountOutMin",
            "type": "u64"
          },
          {
            "name": "deadline",
            "type": "u64"
          },
          {
            "name": "addrRef",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "feeRateRef",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "orderSourceSolanaState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "ledger",
            "type": "pubkey"
          },
          {
            "name": "hash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "redeemWithFeeParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "payloadType",
            "type": "u8"
          },
          {
            "name": "gasDrop",
            "type": "u64"
          },
          {
            "name": "feeRedeem",
            "type": "u64"
          },
          {
            "name": "customPayload",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "cctpMessage",
            "type": {
              "array": [
                "u8",
                248
              ]
            }
          },
          {
            "name": "cctpAttestation",
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "registerOrderParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "payloadType",
            "type": "u8"
          },
          {
            "name": "trader",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "chainSource",
            "type": "u16"
          },
          {
            "name": "tokenIn",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "amountIn",
            "type": "u64"
          },
          {
            "name": "addrDest",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "tokenOut",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "amountOutMin",
            "type": "u64"
          },
          {
            "name": "gasDrop",
            "type": "u64"
          },
          {
            "name": "feeRedeem",
            "type": "u64"
          },
          {
            "name": "deadline",
            "type": "u64"
          },
          {
            "name": "addrRef",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "feeRateRef",
            "type": "u8"
          },
          {
            "name": "feeRateMayan",
            "type": "u8"
          },
          {
            "name": "cctpNonce",
            "type": "u64"
          },
          {
            "name": "cctpDomain",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "swapInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "winner",
            "type": "pubkey"
          },
          {
            "name": "cctpMint",
            "type": "pubkey"
          },
          {
            "name": "amountPromised",
            "type": "u64"
          },
          {
            "name": "amountOutput",
            "type": "u64"
          },
          {
            "name": "patchVersion",
            "type": "u8"
          },
          {
            "name": "timeFulfill",
            "type": "u64"
          },
          {
            "name": "flashFreeze",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "unlockFeeParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "payloadType",
            "type": "u8"
          },
          {
            "name": "gasDrop",
            "type": "u64"
          },
          {
            "name": "keyRnd",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "unlockFeeWithRefineParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "payloadType",
            "type": "u8"
          },
          {
            "name": "gasDropUnlock",
            "type": "u64"
          },
          {
            "name": "gasDropRefine",
            "type": "u64"
          },
          {
            "name": "addrBadUnlocker",
            "docs": [
              "Who is redeems bridge locked fee with the lower gas_drop"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "keyRnd",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    }
  ]
};
