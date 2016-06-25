// Ensure this is treated as a module.
export {};

declare global {
    interface Window {
        tagitTestMode: boolean;
    }

    interface RangyStatic {
        init: () => void;
        saveSelection: any;
        removeMarkers: any;
        serializeRange: any;
        deserializeRange: any;
        restoreSelection: any;
    }
}

