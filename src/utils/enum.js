export const STATUS = Enum({
    INIT: "INIT"
});

export const STAGE = Enum({
    INIT: "INIT"
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