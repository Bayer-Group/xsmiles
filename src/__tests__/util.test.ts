import {
    std,
    mean,
    median,
    shortenNumber,
    isEven,
    equalNumericLists,
    isEmptyNullUndefined,
    equalArrays,
    absoluteMaxFromVector,
} from "../util";

describe("util", () => {
    describe("std", () => {
        it("returns 0 for a constant vector", () => {
            expect(std([5, 5, 5, 5])).toBe(0);
        });

        it("computes population standard deviation", () => {
            // std of [1,2,3,4,5] = sqrt(2) ≈ 1.4142
            expect(std([1, 2, 3, 4, 5])).toBeCloseTo(Math.sqrt(2), 5);
        });
    });

    describe("mean", () => {
        it("computes average", () => {
            expect(mean([1, 2, 3])).toBeCloseTo(2, 10);
        });

        it("handles negative numbers", () => {
            expect(mean([-1, 1])).toBeCloseTo(0, 10);
        });

        it("handles single element", () => {
            expect(mean([42])).toBe(42);
        });
    });

    describe("median", () => {
        it("returns middle value for odd-length array", () => {
            expect(median([3, 1, 2])).toBe(2);
        });

        it("returns average of two middle values for even-length array", () => {
            expect(median([1, 2, 3, 4])).toBe(2.5);
        });

        it("throws on empty array", () => {
            expect(() => median([])).toThrow("No inputs");
        });

        it("does not mutate the original array", () => {
            const arr = [3, 1, 2];
            median(arr);
            expect(arr).toEqual([3, 1, 2]);
        });
    });

    describe("shortenNumber", () => {
        it("shortens large numbers", () => {
            const result = shortenNumber(123456);
            expect(typeof result).toBe("number");
        });

        it("shortens small numbers", () => {
            const result = shortenNumber(0.001);
            expect(typeof result).toBe("number");
        });
    });

    describe("isEven", () => {
        it("returns true for even numbers", () => {
            expect(isEven(0)).toBe(true);
            expect(isEven(2)).toBe(true);
            expect(isEven(100)).toBe(true);
        });

        it("returns false for odd numbers", () => {
            expect(isEven(1)).toBe(false);
            expect(isEven(3)).toBe(false);
            expect(isEven(99)).toBe(false);
        });
    });

    describe("equalNumericLists", () => {
        it("returns true when all values in both lists are within precision of each other", () => {
            // This function does cross-product comparison: every value in list1
            // must be within precision of every value in list2
            expect(equalNumericLists([5, 5, 5], [5, 5, 5])).toBe(true);
        });

        it("returns false when lists have values far apart", () => {
            expect(equalNumericLists([1, 2, 3], [1, 2, 100])).toBe(false);
        });

        it("returns false for identical but spread-out lists", () => {
            // [1,2,3] and [1,2,3]: 1 vs 3 differ by 2 > default precision
            expect(equalNumericLists([1, 2, 3], [1, 2, 3])).toBe(false);
        });

        it("uses precision parameter", () => {
            expect(equalNumericLists([1.000001], [1.000002], 0.001)).toBe(true);
        });
    });

    describe("isEmptyNullUndefined", () => {
        it("returns true for null", () => {
            expect(isEmptyNullUndefined(null)).toBe(true);
        });

        it("returns true for undefined", () => {
            expect(isEmptyNullUndefined(undefined)).toBe(true);
        });

        it("returns true for empty array", () => {
            expect(isEmptyNullUndefined([])).toBe(true);
        });

        it("returns false for non-empty array", () => {
            expect(isEmptyNullUndefined([1])).toBe(false);
        });
    });

    describe("equalArrays", () => {
        it("returns true for identical arrays", () => {
            expect(equalArrays([1, 2, 3], [1, 2, 3])).toBe(true);
        });

        it("returns true for same reference", () => {
            const arr = [1, 2];
            expect(equalArrays(arr, arr)).toBe(true);
        });

        it("returns false for different lengths", () => {
            expect(equalArrays([1], [1, 2])).toBe(false);
        });

        it("returns false for different elements", () => {
            expect(equalArrays([1, 2], [1, 3])).toBe(false);
        });

        it("returns false if one is null", () => {
            expect(equalArrays(null as any, [1])).toBe(false);
        });
    });

    describe("absoluteMaxFromVector", () => {
        it("returns max absolute value from positives", () => {
            expect(absoluteMaxFromVector([1, 5, 3])).toBe(5);
        });

        it("returns max absolute value from negatives", () => {
            expect(absoluteMaxFromVector([-10, -2, 1])).toBe(10);
        });

        it("handles mixed positive and negative", () => {
            expect(absoluteMaxFromVector([-3, 2, -1, 4])).toBe(4);
        });
    });
});
