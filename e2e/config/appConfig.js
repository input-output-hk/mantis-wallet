const APP_CONF = {
    LINUX:{
        APP_PATH: "../Mantis-Wallet-0.2.2.AppImage",
        APP_CONF_PATH: "~/.mantis-wallet/config.json",
        TEST_CONF_PATH:"./test_data/config.json",
    },
    WINDOWS:{
        APP_PATH: "C:\\Users\\aleks\\AppData\\Local\\Programs\\Mantis-Wallet\\Mantis-Wallet.exe",
        APP_CONF_PATH: "C:\\Users\\aleks\\.mantis-wallet\\config.json",
        TEST_CONF_PATH:"C:\\Users\\aleks\\OneDrive\\Desktop\\IOHK\\iohk-mantis\\test_data\\config.json",
    },
    MAC:{
        APP_PATH: "/Applications/Mantis-Wallet.app/Contents/MacOS/Mantis-Wallet",
        APP_CONF_PATH: "/Users/samko/.mantis-wallet-dev/config.json",
        TEST_CONF_PATH:"./test_data/config.json",
    },
    START_TIMEOUT:120000,
    WAIT:120000
};
module.exports = APP_CONF
