// SSR-safe Telegram WebApp functions
// WebApp ni dynamic import qilish - faqat client-side da
const getWebApp = () => {
    if (typeof window === 'undefined') return null;
    try {
        return require('@twa-dev/sdk').default;
    } catch {
        return null;
    }
};

export const initTelegramApp = () => {
    const WebApp = getWebApp();
    if (!WebApp) return;

    WebApp.enableClosingConfirmation();
    WebApp.setHeaderColor("#222222");
    WebApp.setBackgroundColor("#ffffff");

    // Ready event
    WebApp.ready();
};

export const getUserData = () => {
    const WebApp = getWebApp();
    if (!WebApp) return null;
    return WebApp.initDataUnsafe?.user || null;
};

export const sendDataToBot = (data: unknown) => {
    const WebApp = getWebApp();
    if (!WebApp) return;
    WebApp.sendData(JSON.stringify(data));
};

export const closeApp = () => {
    const WebApp = getWebApp();
    if (!WebApp) return;
    WebApp.close();
};

export const hello = () => {
    const WebApp = getWebApp();
    if (!WebApp) return;
    WebApp.showAlert("Hey there!");
};
