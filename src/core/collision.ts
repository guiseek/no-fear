import {Capsule, Octree} from 'three/examples/jsm/Addons.js'
import {Object3D} from 'three'

export class Collision {
  #octree = new Octree()

  constructor(graph: Object3D) {
    this.#octree.fromGraphNode(graph)
  }

  checkCollision(capsule: Capsule) {
    const intersect = this.#octree.capsuleIntersect(capsule)

    // console.log(intersect);
    
    return intersect
  }
}
