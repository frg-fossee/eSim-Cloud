export class MathUtils {
  static modulo(n, m) {
      return ((n % m) + m) % m;
  }

  static isPointBetween(point: [number, number], point1: [number, number], point2: [number, number]): boolean {
      return (point[0] >= point1[0] && point[0] < point2[0]) && (point[1] >= point1[1] && point[1] < point2[1]);
  }
}
