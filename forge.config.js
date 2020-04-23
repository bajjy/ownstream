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
                    homepage: 'https://bajjy.com'
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
                    homepage: 'https://bajjy.com'
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