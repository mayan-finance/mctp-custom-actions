use anchor_lang::prelude::*;

#[error_code]
pub enum MctpPayloadWriterError {
    #[msg("Payload account already initialized")]
    AlreadyInitialized,
    #[msg("Invalid PDA for payload")]
    InvalidPda,
}