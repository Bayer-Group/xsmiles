export const std = (vector: number[]) => {
    const mean = vector.reduce((a, b) => a + b) / vector.length;
    const squaredDiffs = vector.map((x) => Math.pow(x - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((a, b) => a + b) / vector.length);
};

export const median = (values: number[]) => {
    if (values.length === 0) throw new Error("No inputs");

    values = [...values];

    values.sort(function (a, b) {
        return a - b;
    });

    var mid = Math.floor(values.length / 2);

    if (values.length % 2) return values[mid];

    return (values[mid - 1] + values[mid]) / 2.0;
};

export const mean = (vector: number[]) => {
    return vector.reduce((a, b) => a + b) / vector.length;
};

export const shortenNumber = (n: number) => {
    try {
        return parseFloat(
            n.toExponential(Math.max(1, 2 + Math.log10(Math.abs(n))))
        );
    } catch (error) {
        console.error(error);
        console.warn(n);
        return "?";
    }
};

export const isEven = (n: number) => {
    return n % 2 === 0;
};

export const equalNumericLists = (
    list1: number[],
    list2: number[],
    precision = 0.00001
) => {
    return !list1.some((value1) =>
        list2.some((value2) => Math.abs(value1 - value2) > precision)
    );
};

export const clearDivChildren = (parent: HTMLDivElement) => {
    while (parent.children.length > 0) {
        parent.removeChild(parent.children[0]);
    }
};

//<T>(arg: T) => T

export const isEmptyNullUndefined = <T>(
    array: T[] | undefined | null
): boolean => array == null || array.length === 0;

export const equalArrays = <T>(a: T[], b: T[]) => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
};

export const absoluteMaxFromVector = (numbers: number[]) =>
    Math.max(...numbers.map((v) => Math.abs(v)));


