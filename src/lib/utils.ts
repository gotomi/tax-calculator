export function convertToReadableString(str: string) {
    const words = str.split(/(?=[A-Z])/);
    return words.map((word) => word.toLowerCase()).join(" ");
}

export function round(value: string | number) {
    return typeof value === "number"
        ? Math.round(value * 100) / 100
        : value;
}