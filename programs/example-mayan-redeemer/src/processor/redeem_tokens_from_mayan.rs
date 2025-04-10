use anchor_lang::prelude::*;
use anchor_spl::{token::{self, TokenAccount, Token}};
use anchor_lang::system_program;
use mctp::{
    cpi::{
        accounts::{RedeemWithFeeCustomPayload, CctpClaim},
        redeem_with_fee_custom_payload,
    },
    RedeemWithFeeParams,
    program::Mctp,
    message_transmitter_legacy::program::MessageTransmitter,
    token_messenger_minter_legacy::program::TokenMessengerMinter,
};

use crate::{
    REDEEMER_SEED,
};
use solana_program::keccak;

/// This instruction first redeems tokens from Mayan and then transfers them as a gift to the
/// gift_recipient account. It also logs the gift message. Both the gift_recipient and the
/// gift_message were established on the source chain, and their hashes were bridged alongside
/// the funds. By recalculating the hash within this instruction, we ensure that the gift_recipient
/// and gift_message are correct; when passing the custom payload hash to the redeem_with_fee
/// instruction, it is validated against the payload set on the source chain.

#[error_code]
pub enum RedeemerError {
    InvalidCustomPayload,
    InvalidGiftMessage,
}

#[derive(Accounts)]
pub struct Redeem<'info> {
    /// CHECK: This is a simple PDA that must be passed to the Mayan redeem_with_fee instruction.
    /// On the source chain, the addr_dest should be set to this PDA. You can use any PDA with any
    /// seed phrases, as the redeem_with_fee instruction requires this account as a signer to prove
    /// that it was called via the dest_addr, thereby granting access to the custom payload.
    #[account(
        seeds = [
            REDEEMER_SEED,
        ],
        bump,
    )]
    redeemer: UncheckedAccount<'info>,

    /// CHECK: Funds redeemed from Mayan will be transferred to this account.
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = redeemer,
    )]
    redeemer_acc: Box<Account<'info, TokenAccount>>,

    /// CHECK: This is the token mint that will be received from Mayan.
    /// Typically this is USDC, but it could also be EURC. It will be verified by the
    /// redeem_with_fee CPI. If necessary, integrators can add custom constraints (for example, to require USDC).
    mint: UncheckedAccount<'info>,

    /// CHECK: This account is used for the program's custom logic.
    /// In this instruction, tokens redeemed from Mayan will be transferred as a gift to this account.
    /// The program validates the account by checking the custom payload, and its hash is compared
    /// with the custom payload hash from the source chain.
    #[account(mut)]
    gift_recipient: UncheckedAccount<'info>,

    /// CHECK: Token account associated with the gift_recipient.
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = gift_recipient,
    )]
    gift_recipient_acc: Box<Account<'info, TokenAccount>>,

    /// CHECK: This is the relayer account that executes this transaction to initiate the redeem.
    /// The redeem_with_fee instruction incurs no cost except for the gas_drop fee if it is greater than zero
    /// in the bridge parameters. The gas_drop is transferred to the Mayan bridge's addr_dest, which in this
    /// example is the redeemer account. Although any account can be used as the relayer's token account,
    /// it is more straightforward to pass the actual relayer token account.
    #[account(mut)]
    relayer: Signer<'info>,

    /// CHECK: Token account belonging to the relayer.
    #[account(
        mut,
        token::mint = mint,
    )]
    relayer_acc: Box<Account<'info, TokenAccount>>,

    /// Accounts below are required for the redeem_with_fee CPI.

    /// CHECK: Used for the redeem_with_fee CPI.
    vaa: UncheckedAccount<'info>,
    /// CHECK: Used for the redeem_with_fee CPI.
    mayan_caller: UncheckedAccount<'info>,
    /// CHECK: Used for the redeem_with_fee CPI.
    mayan_main: UncheckedAccount<'info>,
    /// CHECK: Used for the redeem_with_fee CPI.
    cctp_core_authority: UncheckedAccount<'info>,
    /// CHECK: Used for the redeem_with_fee CPI.
    cctp_core_message_transmitter: UncheckedAccount<'info>,
    /// CHECK: Used for the redeem_with_fee CPI.
    #[account(mut)]
    cctp_core_used_nonces: UncheckedAccount<'info>,
    /// CHECK: Used for the redeem_with_fee CPI.
    cctp_core_event_auth: UncheckedAccount<'info>,
    /// CHECK: Used for the redeem_with_fee CPI.
    cctp_token_token_messenger: UncheckedAccount<'info>,
    /// CHECK: Used for the redeem_with_fee CPI.
    cctp_token_remote_token_messenger: UncheckedAccount<'info>,
    /// CHECK: Used for the redeem_with_fee CPI.
    #[account(mut)]
    cctp_token_token_minter: UncheckedAccount<'info>,
    /// CHECK: Used for the redeem_with_fee CPI.
    #[account(mut)]
    cctp_token_local_token: UncheckedAccount<'info>,
    /// CHECK: Used for the redeem_with_fee CPI.
    cctp_token_token_pair: UncheckedAccount<'info>,
    /// CHECK: Used for the redeem_with_fee CPI.
    #[account(mut)]
    mayan_main_receiver_acc: UncheckedAccount<'info>,
    /// CHECK: Used for the redeem_with_fee CPI.
    #[account(mut)]
    cctp_token_custody: UncheckedAccount<'info>,
    /// CHECK: Used for the redeem_with_fee CPI.
    cctp_token_event_auth: UncheckedAccount<'info>,
    token_messenger_minter: Program<'info, TokenMessengerMinter>,
    message_transmitter: Program<'info, MessageTransmitter>,

    mctp: Program<'info, Mctp>,
    token_program: Program<'info, Token>,
    system_program: Program<'info, System>,
}

pub fn handle_redeem<'info>(
    ctx: Context<Redeem<'info>>,
    redeem_params: RedeemWithFeeParams,
    gift_message: Vec<u8>,
) -> Result<()> {
    let redeemer = &mut ctx.accounts.redeemer;
    let relayer = &ctx.accounts.relayer;

    let mint = &ctx.accounts.mint;

    // Recreate the custom payload hash to verify its validity.
    let custom_payload_hash = keccak::hashv(&[
        ctx.accounts.gift_recipient.key().as_ref(),
        gift_message.as_ref(),
    ]).0;

    msg!("Custom payload hash mismatched {:?} != {:?}",
        custom_payload_hash,
        redeem_params.custom_payload,
    );
    require!(custom_payload_hash == redeem_params.custom_payload, RedeemerError::InvalidCustomPayload);

    // A neat feature enables the end user to receive gas on the destination to top up their wallet.
    // The gas_drop is a built-in feature of the Mayan bridge. In the Mayan Mctp program, the redeemer
    // (set as addr_dest) is eligible to receive the gas_drop. After invoking the redeem_with_fee
    // instruction, you could subsequently transfer the gas_drop to the actual user if desired.
    let gas_drop = redeem_params.gas_drop;

    msg!("Redeeming Mayan");
    let redeemer_signer_seeds = &[
        REDEEMER_SEED,
        &[ctx.bumps.redeemer],
    ];
    let redeemed_result = redeem_with_fee_custom_payload(
        CpiContext::new_with_signer(
            ctx.accounts.mctp.to_account_info(),
            RedeemWithFeeCustomPayload {
                vaa: ctx.accounts.vaa.to_account_info(),
                cctp_claim: CctpClaim {
                    payer: relayer.to_account_info(),
                    caller: ctx.accounts.mayan_caller.to_account_info(),
                    main: ctx.accounts.mayan_main.to_account_info(),
                    cctp_mint: mint.to_account_info(),
                    cctp_core_authority: ctx.accounts.cctp_core_authority.to_account_info(),
                    cctp_core_message_transmitter: ctx.accounts.cctp_core_message_transmitter.to_account_info(),
                    cctp_core_used_nonces: ctx.accounts.cctp_core_used_nonces.to_account_info(),
                    cctp_core_event_auth: ctx.accounts.cctp_core_event_auth.to_account_info(),
                    cctp_token_token_messenger: ctx.accounts.cctp_token_token_messenger.to_account_info(),
                    cctp_token_remote_token_messenger: ctx.accounts.cctp_token_remote_token_messenger.to_account_info(),
                    cctp_token_token_minter: ctx.accounts.cctp_token_token_minter.to_account_info(),
                    cctp_token_local_token: ctx.accounts.cctp_token_local_token.to_account_info(),
                    cctp_token_token_pair: ctx.accounts.cctp_token_token_pair.to_account_info(),
                    cctp_receiver_acc: ctx.accounts.mayan_main_receiver_acc.to_account_info(),
                    cctp_token_custody: ctx.accounts.cctp_token_custody.to_account_info(),
                    cctp_token_event_auth: ctx.accounts.cctp_token_event_auth.to_account_info(),
                    token_messenger_minter: ctx.accounts.token_messenger_minter.to_account_info(),
                    message_transmitter: ctx.accounts.message_transmitter.to_account_info(),
                },
                dest: redeemer.to_account_info(),
                dest_acc: ctx.accounts.redeemer_acc.to_account_info(),
                relayer_acc: ctx.accounts.relayer_acc.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            },
            &[redeemer_signer_seeds],
        ),
        redeem_params,
    )?;

    // The redeemed amount is the number of new tokens transferred to the redeemer account
    // after the redeem_fee has been paid to the relayer.
    let redeemed_amount: u64 = redeemed_result.get();

    // In this simple example, we transfer the redeemed amount to the gift_recipient.
    // You may implement additional logic, such as depositing the redeemed amount, as needed.
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.redeemer_acc.to_account_info(),
                to: ctx.accounts.gift_recipient.to_account_info(),
                authority: redeemer.to_account_info(),
            },
            &[redeemer_signer_seeds],
        ),
        redeemed_amount,
    )?;

    // Next, transfer the gas_drop to the gift_recipient.
    // This is an example implementation only; you may incorporate your own logic, such as retaining the
    // gas_drop for other purposes.
    if gas_drop > 0 {
        // In Mayan, gas_drop is normalized to 8 decimals, so to calculate the number of lamports,
        // multiply the gas_drop value by 10.
        let gas_drop_denormalized = gas_drop.saturating_mul(10);
        system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.redeemer.to_account_info(),
                    to: ctx.accounts.gift_recipient.to_account_info(),
                },
                &[redeemer_signer_seeds],
            ),
            gas_drop_denormalized,
        )?;
    }

    // Finally, print the gift message.
    let log_str = std::str::from_utf8(&gift_message)
        .map_err(|_| RedeemerError::InvalidGiftMessage)?;
    msg!("Logged data: {}", log_str);
    Ok(())
}
