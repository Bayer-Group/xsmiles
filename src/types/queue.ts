export class Queue<T> {
    q: T[] = [];
    push(val: T) {
        this.q.push(val);
    }
    pop(): T | undefined {
        return this.q.shift();
    }
    toArray(): T[] {
        return [...this.q];
    }
}
