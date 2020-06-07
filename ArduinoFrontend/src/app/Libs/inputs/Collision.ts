
export interface Vector {
  x: number;
  y: number;
}

export enum Orienation {
  COLINEAR,
  CLOCKWISE,
  COUNTER_CLOCKWISE
}

// https://www.geeksforgeeks.org/how-to-check-if-a-given-point-lies-inside-a-polygon/

export class Collision {
  static inLine(p: Vector, q: Vector, r: Vector) {
    if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
      q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)) {
      return true;
    }
    return false;
  }

  static orientation(p: Vector, q: Vector, r: Vector) {
    const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (val === 0) {
      return Orienation.COLINEAR;
    }
    return (val > 0) ? Orienation.CLOCKWISE : Orienation.COUNTER_CLOCKWISE;
  }

  static isIntersecting(p1: Vector, q1: Vector, p2: Vector, q2: Vector) {
    const o1 = Collision.orientation(p1, q1, p2);
    const o2 = Collision.orientation(p1, q1, q2);
    const o3 = Collision.orientation(p2, q2, p1);
    const o4 = Collision.orientation(p2, q2, q1);
    if (o1 !== o2 && o3 !== o4) {
      return true;
    }
    // p1, q1 and p2 are colinear and p2 lies on segment p1q1
    if (o1 === 0 && Collision.inLine(p1, p2, q1)) { return true; }

    // p1, q1 and p2 are colinear and q2 lies on segment p1q1
    if (o2 === 0 && Collision.inLine(p1, q2, q1)) { return true; }

    // p2, q2 and p1 are colinear and p1 lies on segment p2q2
    if (o3 === 0 && Collision.inLine(p2, p1, q2)) { return true; }

    // p2, q2 and q1 are colinear and q1 lies on segment p2q2
    if (o4 === 0 && Collision.inLine(p2, q1, q2)) { return true; }

    return false; // Doesn't fall in any of the above cases
  }

  static isPointInsidePolygon(point: number[][], p: number[]) {
    const extreme: Vector = {
      x: 10000000,
      y: p[1]
    };
    const n = point.length;
    let count = 0;
    let i = 0;
    do {
      const next = (i + 1) % n;
      const a: Vector = { x: point[i][0], y: point[i][1] };
      const b: Vector = { x: point[next][0], y: point[next][1] };
      const c = { x: p[0], y: p[1] };
      if (Collision.isIntersecting(a, b, c, extreme)) {
        if (Collision.orientation(a, c, b) === Orienation.COLINEAR) {
          return Collision.inLine(a, c, b);
        }
        count += 1;
      }
      i = next;
    } while (i !== 0);
    return (count % 2) !== 0;
  }

  static EuclideanDistance(a: Vector, b: Vector) {
    return ((a.x - b.x) * (a.x - b.x)) + ((a.y - b.y) * (a.y - b.y));
  }
}
