export type TokenType = {
    address: string;
    name: string;
    symbol: string;
    iconSrc: string;
    decimals: number;
};

export const TOKEN_LIST: TokenType[] = [
    {
        name: "BAPT",
        symbol: "TestBAPT",
        iconSrc: "/external_media/baptlabs-mini.png",
        address:
            "0x97c8aca6082f2ef7a0046c72eb81ebf203ca23086baf15557579570c86a89fd3::test_coins::TestBAPT",
        decimals: 6,
    },
    {
        name: "Aptos",
        symbol: "APT",
        iconSrc: "/external_media/aptos-bg-black.png",
        address: "0x1::aptos_coin::AptosCoin",
        decimals: 8,
    },
    {
        name: "USDC",
        symbol: "USDC",
        iconSrc: "/external_media/usd-coin.png",
        address:
            "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC",
        decimals: 6,
    },
    {
        name: "Layer Zero - Tether USD",
        symbol: "TestUSDT",
        iconSrc: "/external_media/USDT.png",
        address:
            "0x97c8aca6082f2ef7a0046c72eb81ebf203ca23086baf15557579570c86a89fd3::test_coins::TestUSDT",
        decimals: 6,
    },
    {
        name: "PEPE",
        symbol: "PEPE",
        iconSrc: "/external_media/pepelogo.png",
        address:
            "0xc567557b65618aa413428e558bafa965284d23bcbdcc864af15848e0ab73598e::pepe::PEPE",
        decimals: 8,
    },
    {
        name: "Pancakeswap Token",
        symbol: "CAKE",
        iconSrc: "/external_media/CAKE.png",
        address:
            "0x159df6b7689437016108a019fd5bef736bac692b6d4a1f10c941f6fbb9a74ca6::oft::CakeOFT",
        decimals: 8,
    },
    {
        name: "War Coin",
        symbol: "WAR",
        iconSrc: "/external_media/war_coin.svg",
        address:
            "0x52ab49a4039c3d2b0aa6e0a00aaed75dcff72a3120ba3610f62d1d0b6032345a::war_coin::WarCoin",
        decimals: 8,
    },
    {
        name: "The Nebula",
        symbol: "NEBULA",
        iconSrc: "/external_media/nebula.png",
        address:
            "0xfc2c54cd877d119618171927f283a2dd73f4860f76ae26dec43b3d1c05106f38::nebula::Nebula",
        decimals: 8,
    },
    {
        name: "Thala Token",
        symbol: "THL",
        iconSrc: "/external_media/THL.png",
        address:
            "0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL",
        decimals: 8,
    },
    {
        name: "BAPT V1",
        symbol: "BAPTv1",
        iconSrc: "/external_media/baptlabs-mini.png",
        address:
            "0xb73a7b82af68fc1ba6e123688b95adec1fec0bcfc256b5d3a43de227331a7abd::baptlabs::BaptLabs",
        decimals: 8,
    },
    {
        name: "MAU V2",
        symbol: "MAUv2",
        iconSrc: "/external_media/MAU-icon.jpeg",
        address:
            "0x757cc7c94f646573bb30b2699e3aa265b97d54a135a8d1bbc0129212cc64ae6b::MAU::MAU",
        decimals: 8,
    },
];