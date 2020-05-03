const path = require('path');

module.exports = {
    packagerConfig: {},  
    buildIdentifier: 'pre-alpha',
    makers: [
        {
            name: "@electron-forge/maker-squirrel",
            config: {
                name: "ownstream",
                productName: 'Ownstream',
                productDescription: 'Your own broadcasting channel. No registration, no subscriptions, your data stays on your machine.',
                options: {
                    maintainer: 'Constantine Dobrovolskiy',
                    homepage: 'https://bajjy.com',
                    icon: path.resolve(__dirname, "assets/icons/win/icon.ico"),
                    iconUrl: path.resolve(__dirname, "assets/icons/win/icon.ico")
                }
            }
        },
        {
            name: '@electron-forge/maker-deb',
            config: {
                name: 'ownstream',
                productName: 'Ownstream',
                productDescription: 'Your own broadcasting channel. No registration, no subscriptions, your data stays on your machine.',
                options: {
                    maintainer: 'Constantine Dobrovolskiy',
                    homepage: 'https://bajjy.com',
                    icon: path.resolve(__dirname, "assets/icons/png/64x64.png")
                }
            }
        },
        {
            name: '@electron-forge/maker-dmg',
            config: {
                name: 'ownstream',
                productName: 'Ownstream',
                productDescription: 'Your own broadcasting channel. No registration, no subscriptions, your data stays on your machine.',
                options: {
                    maintainer: 'Constantine Dobrovolskiy',
                    homepage: 'https://bajjy.com',
                    icon: path.resolve(__dirname, "assets/icons/mac/icon.icns"),
                    format: 'ULFO'
                }
            }
        }
    ]
}

//   {
//     packagerConfig: { ... },
//     electronRebuildConfig: { ... },
//     makers: [ ... ],
//     publishers: [ ... ],
//     plugins: [ ... ],
//     hooks: { ... },
//     buildIdentifier: 'my-build'
//   }