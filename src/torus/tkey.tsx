import {TORUS_SAPPHIRE_NETWORK} from "@toruslabs/constants";
import {CommonPrivateKeyProvider} from "@web3auth/base-provider";
import TorusStorageLayer from '@tkey/storage-layer-torus';
import {ShareSerializationModule} from '@tkey/share-serialization';
import {WebStorageModule} from '@tkey/web-storage';
import ThresholdKey from '@tkey/core';
import BN from "bn.js";
import SfaServiceProvider from "@tkey/service-provider-sfa";
import TorusUtils from "@toruslabs/torus.js";
import FetchNodeDetails from "@toruslabs/fetch-node-details";

const W3A_CLIENT_ID = "--put here a valid client id";
const W3A_ClICK_VERIFIER = "csprclick-sdk-wallet-dev";
const network = TORUS_SAPPHIRE_NETWORK.SAPPHIRE_MAINNET;

export const getTKey = async (postboxKey: string) => {

    const chainConfig = {
        chainId: "0x1",
        rpcTarget: `https://rpc.target.url`,
        displayName: "Display Name",
        blockExplorer: "https://chain.explorer.link",
        ticker: "TKR",
        tickerName: "Ticker Name",
        decimals: 9,
    };

    const commonPrivateKeyProvider = new CommonPrivateKeyProvider({
        config: {
            chainConfig,
        },
    });

    const web3AuthOptions: any = {
        clientId: W3A_CLIENT_ID,
        chainConfig,
        web3AuthNetwork: network,
        enableOneKey: true,
    };

    const serviceProvider = new SfaServiceProvider({
        postboxKey: postboxKey,
        web3AuthOptions
    });

    const storageLayer = new TorusStorageLayer({
        hostUrl: 'https://metadata.tor.us',
        enableLogging: true,
    });

    const webStorage = new WebStorageModule();
    const shareSerialization = new ShareSerializationModule();

    const tKey = new ThresholdKey({
        serviceProvider,
        storageLayer,
        modules: {
            shareSerialization,
            webStorage,
        },
        manualSync: true,
    });

    try {
        await (tKey.serviceProvider as SfaServiceProvider).init(
            commonPrivateKeyProvider
        );
    } catch (error) {
        console.error(error);
    }

    return tKey;
}

export const criticalResetAccount = async (postboxKey: string) => {
    const tKey = await getTKey(postboxKey);

    await tKey.storageLayer.setMetadata({
        privKey: tKey.serviceProvider.postboxKey,
        input: {message: "KEY_NOT_FOUND", upgraded: true},
    });
}

export const initializeTkey = async (postboxKey: string) => {
    const tKey = await getTKey(postboxKey);

    try {

        const privKey = new BN("e5836692f1f8b13fd71d63df6ff59072e3c31a543f3da4db8495f3be9a6f58b1", 'hex');

        await tKey.initialize(
            {
                importKey: privKey,
                delete1OutOf1: true,
            }
        );

        await tKey.syncLocalMetadataTransitions();
        return;
    } catch (err) {
        console.error(err);
    }
}

export const removeNonce = async (postboxKey: string) => {
    const tKey = await getTKey(postboxKey);

    try {
        await tKey.storageLayer.setMetadata({
            input: {message: "__ONE_KEY_DELETE_NONCE__"},
            privKey: new BN(postboxKey, 'hex')
        });
        // await tKey.syncLocalMetadataTransitions();

        return;
    } catch (err) {
        console.error(err);
    }
}

export const getPublicAddress = async (verifierId: string,) => {
    const torus = new TorusUtils({
        enableOneKey: true,
        network: TORUS_SAPPHIRE_NETWORK.SAPPHIRE_MAINNET,
        clientId: W3A_CLIENT_ID
    });

    const fetchNodeDetails = new FetchNodeDetails({
        network: network,
    });

    const nonce = 0;
    const tssTag = "default";
    const tssVerifierId = `${verifierId}\u0015${tssTag}\u0016${nonce}`;

    const verifierDetails = {
        verifier: W3A_ClICK_VERIFIER,
        verifierId: verifierId,
    };

    const {torusNodeEndpoints, torusNodePub, torusIndexes} = await fetchNodeDetails.getNodeDetails(verifierDetails);

    const publicAddress = await torus.getPublicAddress(
        torusNodeEndpoints,
        torusNodePub,
        verifierDetails
    );

    console.log("getPublicAddress", publicAddress);
}