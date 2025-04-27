export const STATUS = Enum({
    INIT        : "INIT",
    MAPS_WORLD  : "MAPS.WORLD",
    MASP_COUNTRY: "MAPS.COUNTRY",

    PHOTOS_OPENED: "PHOTOS.OPENEND"
});

export const STAGE = Enum({
    INIT   : "INIT",
    LOADING: "LOADING",
    LOADED : "LOADED"
});

export function Enum(
    baseEnum
) {
    return new Proxy(baseEnum, {
        get(
            target, 
            name
        ) {
            if (!baseEnum.hasOwnProperty(name)) {
                throw new Error(`${name} does not exists.`);
            }

            return baseEnum[name];
        }
    });
}