export function sayHello(name: string): string {
  return `Hello ${name}`;
}

// 实现斐波那契数列
export function fibonacci(n: number): number {
  if (n === 0 || n === 1) {
    return n;
  }

  return fibonacci(n - 1) + fibonacci(n - 2);
}