/**
 * Checks if two raphael element's bounding boxes intersect
 */
export function areBoundingBoxesIntersecting(box1, box2): boolean {
  if (box1.x >= box2.x2 || box2.x >= box1.x2) {
    return false;
  }
  if (box1.y2 <= box2.y || box2.y2 <= box1.y) {
    return false;
  }
  return true;
}
