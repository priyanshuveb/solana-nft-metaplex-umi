import {
    findMetadataPda,
    mplTokenMetadata,
    verifyCollectionV1
} from '@metaplex-foundation/mpl-token-metadata'

import {
    airdropIfRequired,
    getExplorerLink,
    getKeypairFromFile
} from '@solana-developers/helpers'

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'

import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { keypairIdentity, publicKey } from '@metaplex-foundation/umi'


const connection = new Connection(clusterApiUrl("devnet"))
// Note: This fetches the keypair from the ~/.config/solana/id.json
// So, we can put out actual keypair in here for the default import
const user = await getKeypairFromFile()

await airdropIfRequired(connection, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL)
console.log("Loaded user", user.publicKey.toBase58())

const umi = createUmi(connection.rpcEndpoint)
umi.use(mplTokenMetadata())

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey)
umi.use(keypairIdentity(umiUser))

console.log("Set up Umi instances for the user");

const collectionAddress = publicKey("2NDYt7bYkfhpkADiaFcATwLCbWSKQkLkb4NmC2H6jddU")

const nftAddress = publicKey("HYdJ1oH8fx9RCg5nDdwrnc4er4obf55XZgv1qPYtepxX")

const transaction = await verifyCollectionV1(umi, {
    metadata: findMetadataPda(umi, {mint: nftAddress}),
    collectionMint: collectionAddress,
    authority: umi.identity
})

transaction.sendAndConfirm(umi)

console.log("NFT verified ✅", nftAddress, "For the collection", collectionAddress, "Explorer link", getExplorerLink("address", nftAddress,"devnet"));

