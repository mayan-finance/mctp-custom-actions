use anchor_lang::prelude::*;

#[error_code]
pub enum SolayerMayanRedeemerError {
    #[msg("custom payload is not match with the expected")]
    InvalidCustomPayload,
    MintAndTokenProgramMismatch,
}