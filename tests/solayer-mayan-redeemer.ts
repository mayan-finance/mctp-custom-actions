import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolayerMayanRedeemer } from "../target/types/solayer_mayan_redeemer";

describe("solayer-mayan-redeemer", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SolayerMayanRedeemer as Program<SolayerMayanRedeemer>;
});
