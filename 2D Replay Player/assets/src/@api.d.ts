declare namespace Raudy {
    interface API {
        closeWindow: () => void;
        maximizeWindow: () => void;
        minimizeWindow: () => void;
    }
}

interface Window
{
    api: Raudy.API;
}