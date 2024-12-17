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

import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { generateSigner, Keypair, keypairIdentity, percentAmount } from '@metaplex-foundation/umi'


const connection = new Connection(clusterApiUrl("devnet"))
// Note: This fetches the keypair from the ~/.config/solana/id.json
// So, we can put out actual keypair in here for the default import
const user = await getKeypairFromFile()
console.log(user.secretKey);


await airdropIfRequired(connection, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL)
console.log("Loaded user", user.publicKey.toBase58())

const umi = createUmi(connection.rpcEndpoint)
umi.use(mplTokenMetadata())

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey)
umi.use(keypairIdentity(umiUser))

console.log("Set up Umi instances for the user");

const collectionMint = generateSigner(umi)

const transaction = await createNft(umi,{
    mint: collectionMint,
    name: "Hija collection",
    symbol: "HJA",
    uri: "https://raw.githubusercontent.com/priyanshuveb/solana-cnft/refs/heads/main/assets/collection.json",
    sellerFeeBasisPoints: percentAmount(0), // royalty
    isCollection: true

})

await transaction.sendAndConfirm(umi)

const createdCollectionNft = await fetchDigitalAsset(umi, collectionMint.publicKey)

console.log("Created Collection 👕", getExplorerLink("address",createdCollectionNft.mint.publicKey));




