import {
    createNft,
    fetchDigitalAsset,
    mplTokenMetadata
} from '@metaplex-foundation/mpl-token-metadata'

import {
    airdropIfRequired,
    getExplorerLink,
    getKeypairFromFile
} from '@solana-developers/helpers'

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'

import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { generateSigner, Keypair, keypairIdentity, percentAmount, publicKey } from '@metaplex-foundation/umi'


const connection = new Connection(clusterApiUrl("devnet"))
const user = await getKeypairFromFile()

await airdropIfRequired(connection, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL)
console.log("Loaded user", user.publicKey.toBase58())

const umi = createUmi(connection.rpcEndpoint)
umi.use(mplTokenMetadata())

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey)
umi.use(keypairIdentity(umiUser))

console.log("Set up Umi instances for the user");

// umi has its own format of public key and that's why you might get some warnings/errors ahead when 
//try to use the type public key from the solana web3js library but irrespective the code will work
const collectionAddress = publicKey("2NDYt7bYkfhpkADiaFcATwLCbWSKQkLkb4NmC2H6jddU")
// const collectionAddress = new PublicKey("2NDYt7bYkfhpkADiaFcATwLCbWSKQkLkb4NmC2H6jddU")

console.log({collectionAddress});
console.log('creating nft...')

const mint = generateSigner(umi)

const transaction = createNft(umi, {
    mint: mint,
    name: 'cArA',
    uri: 'https://raw.githubusercontent.com/priyanshuveb/solana-cnft/refs/heads/main/assets/3.json',
    sellerFeeBasisPoints: percentAmount(0),
    collection: {
        key: collectionAddress,
        verified: false
    },
})

await transaction.sendAndConfirm(umi)

const createdNft = await fetchDigitalAsset(umi, mint.publicKey)

console.log('Created NFT Address:', getExplorerLink("address", createdNft.mint.publicKey,"devnet"));
