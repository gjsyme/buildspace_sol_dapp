use anchor_lang::prelude::*;

declare_id!("GfUN6idVPy7R3Rg4Ymw2ZDpo3PShKgzRQXdd7sPrBW9t");

#[program]
pub mod myepicproject {
  use super::*;
  pub fn start_stuff_off(ctx: Context<StartStuffOff>) -> ProgramResult {
    let base_account = &mut ctx.accounts.base_account;
    base_account.total_gifs= 0;
    Ok(())
  }

  pub fn add_gif(ctx: Context<AddGif>, gif_link: String) -> ProgramResult{
    let base_account = &mut ctx.accounts.base_account;
    let user = &mut ctx.accounts.user;

    let item = ItemStruct{
      gif_link: gif_link.to_string(),
      user_address: *user.to_account_info().key,
      votes: 0,
    };

    base_account.gif_list.push(item);
    base_account.total_gifs+=1;
    Ok(())
  }

  pub fn upvote_gif(ctx: Context<GifVote>, index: u8) -> ProgramResult{
    let base_account = &mut ctx.accounts.base_account;

    // let gif_index = base_account.gif_list.iter().position(|x| x.gif_link==gif_link);
    // if gif_index.is_some() {
    //   base_account.gif_list[gif_index.unwrap()].votes+=1;
    // }
    base_account.gif_list[index as usize].votes+=1;
    Ok(())
  }

  pub fn downvote_gif(ctx: Context<GifVote>, index: u8) -> ProgramResult{
    let base_account = &mut ctx.accounts.base_account;

    // let gif_index = base_account.gif_list.iter().position(|x| x.gif_link==gif_link);
    // if gif_index.is_some() {
    //   base_account.gif_list[gif_index.unwrap()].votes-=1;
    // }
    base_account.gif_list[index as usize].votes-=1;
    Ok(())
  }
}

#[derive(Accounts)]
pub struct StartStuffOff<'info>{
  #[account(init, payer=user, space=9000)]
  pub base_account: Account<'info, BaseAccount>,
  #[account(mut)]
  pub user: Signer<'info>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddGif<'info>{
  #[account(mut)]
  pub base_account: Account<'info, BaseAccount>,
  pub user: Signer<'info>
}

#[derive(Accounts)]
pub struct GifVote<'info>{
  #[account(mut)]
  pub base_account: Account<'info, BaseAccount>,
}

#[derive(Debug,Clone,AnchorSerialize,AnchorDeserialize)]
pub struct ItemStruct{
  pub gif_link: String,
  pub user_address: Pubkey,
  pub votes: i8,
}

#[account]
pub struct BaseAccount{
  pub total_gifs: u64,
  pub gif_list: Vec<ItemStruct>,
}