export function shuffleInPlace<T>(arr: T[], rnd: () => number = Math.random): T[]
{
    for (let i = arr.length - 1; i > 0; i--)
    {
        const j = Math.floor(rnd() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}