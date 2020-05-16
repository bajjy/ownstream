const path = require('path');

module.exports = {
    packagerConfig: {
        dir: './',
        platform: 'all',
        overwrite: true,
        icon: path.resolve(__dirname, 'assets/icons/win/icon.ico')
    },
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
                    iconUrl: path.resolve(__dirname, "assets/icons/win/icon.ico"),
                    setupIcon: path.resolve(__dirname, "assets/icons/win/icon.ico")
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
                    icon: "assets/icons/png/64x64.png"
                }
            }
        },
        // {
        //     name: '@electron-forge/maker-dmg',
        //     config: {
        //         name: 'ownstream',
        //         productName: 'Ownstream',
        //         productDescription: 'Your own broadcasting channel. No registration, no subscriptions, your data stays on your machine.',
        //         options: {
        //             maintainer: 'Constantine Dobrovolskiy',
        //             homepage: 'https://bajjy.com',
        //             icon: "assets/icons/mac/icon.icns",
        //             format: 'ULFO'
        //         }
        //     }
        // },
        {
            name: '@electron-forge/maker-flatpak',
            config: {
                name: 'ownstream',
                productName: 'Ownstream',
                productDescription: 'Your own broadcasting channel. No registration, no subscriptions, your data stays on your machine.',
                options: {
                    maintainer: 'Constantine Dobrovolskiy',
                    homepage: 'https://bajjy.com',
                    icon: "assets/icons/png/64x64.png"
                }
            }
        }
        // {
        //   "name": "@electron-forge/maker-wix",
        //   "config": {
        //     "ui": {
        //       "chooseDirectory": true,
        //       "images": {
        //         "background": "[...]/path/to/background-493x312.bmp",
        //         "banner": "[...]/path/to/banner-493x58.bmp"
        //       }
        //     }
        //   }
        // }
    ]
}
