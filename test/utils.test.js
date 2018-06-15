const BigNumber = web3.BigNumber;


/**
 * Return amount without default fee
 * 0.2% (any limits are disabled by design)
 * @param amount
 */
export function amountWithoutFee(amount)  
{
    return amount.sub(amount.mul(2).div(1000));
}

/**
 * Return default fee from amount
 * 0.2% (any limits are disabled by design)
 * @param amount
 */
export function getFeeOfAmount(amount)  
{
    return amount.mul(2).div(1000);
}


export function getBigNumberTokens(amount, decimals) 
{
    return new BigNumber(amount).mul( new BigNumber(10).pow(decimals) );
}
/**
 * value - stake
 * timeSeconds - time stake was locked
 * compareNumber - expected result
 * timeErrorSeconds - error allowed
 * 
 * */ 
export function isValueEqualWithError(value, timeSeconds, compareValue, timeErrorSeconds)
{
    const delta = new BigNumber(value).mul(timeSeconds).sub(compareValue).abs();
    return (delta.lte(timeErrorSeconds * value));
}

export async function getTransferTime(transferResult)
{
    const blockInfo = await web3.eth.getBlock(transferResult.receipt.blockNumber)
    return blockInfo.timestamp;
} 