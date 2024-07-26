export interface GearComp {
    c: number;
    v: number;
}

export interface GearJSON {
    Name: string;
    publicName: { data: string; }
    Comps: {
        Length: number;
        a: GearComp;
        b: GearComp;
        c: GearComp;
        d: GearComp;
        e: GearComp;
        f: GearComp;
        g: GearComp;
        h: GearComp;
        i: GearComp;
        j: GearComp;
        k: GearComp;
        l: GearComp;
        m: GearComp;
        n: GearComp;
        o: GearComp;
        p: GearComp;
        q: GearComp;
        r: GearComp;
        s: GearComp;
        t: GearComp;
    }
}

export const componentTypes = [
    "None",
    "FireMode",
    "Category",
    "BaseItem",
    "ItemFPSSettings",
    "AudioSetting",
    "MuzzleFlash",
    "ShellCasing",
    "Pattern",
    "Palette",
    "DecalA",
    "DecalB",
    "FrontPart",
    "FrontPartAttachmentA",
    "FrontPartAttachmentB",
    "FrontPartPerk",
    "ReceiverPart",
    "ReceiverPartAttachment",
    "ReceiverPartPerk",
    "StockPart",
    "StockPartPerk",
    "SightPart",
    "SightPartPerk",
    "MagPart",
    "MagPartPerk",
    "FlashlightPart",
    "FlashlightPartPerk",
    "ToolMainPart",
    "ToolMainPartPerk",
    "ToolMainPartAttachment",
    "ToolGripPart",
    "ToolGripPartPerk",
    "ToolDeliveryType",
    "ToolDeliveryPart",
    "ToolDeliveryPartPerk",
    "ToolDeliveryPartAttachment",
    "ToolPayloadType",
    "ToolPayloadPart",
    "ToolPayloadPartPerk",
    "ToolTargetingType",
    "ToolTargetingPart",
    "ToolTargetingPartPerk",
    "ToolScreenPart",
    "ToolScreenPartPerk",
    "MeleeHeadPart",
    "MeleeHeadPartPerk",
    "MeleeNeckPart",
    "MeleeNeckPartPerk",
    "MeleeHandlePart",
    "MeleeHandlePartPerk",
    "MeleePommelPart",
    "MeleePommelPartPerk",
    "PlatformPerkAID",
    "PlatformPerkBID",
    "PlatformPerkCID"
] as const;
export type ComponentType = typeof componentTypes[number];

export const alignTypes = {
    0: "Muzzle",
    1: "ShellEject",
    2: "Magazine",
    4: "Sight",
    5: "Flashlight",
    6: "SightLook",
    7: "LeftHand",
    8: "RightHand",
    9: "Receiver",
    10: "Front",
    12: "ToolGrip",
    13: "ToolDelivery",
    14: "ToolPayload",
    15: "ToolTargeting",
    16: "ToolScreen",
    17: "ToolDetection",
    18: "ToolScanning",
    20: "MeleeHead",
    40: "RotationPivot",
    41: "GroundPlacement"
} as const;
export type AlignType = typeof alignTypes[keyof typeof alignTypes];