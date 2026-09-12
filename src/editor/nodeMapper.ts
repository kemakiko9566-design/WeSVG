// Node Mapper — bidirectional mapping between Layer ↔ HTML node
export interface NodeMapping {
  layerId: string
  nodeId: string
}

class NodeMapper {
  private map = new Map<string, NodeMapping>()

  register(layerId: string, nodeId: string) {
    this.map.set(layerId, { layerId, nodeId })
  }

  unregister(layerId: string) {
    this.map.delete(layerId)
  }

  getByLayerId(layerId: string): NodeMapping | undefined {
    return this.map.get(layerId)
  }

  getByNodeId(nodeId: string): NodeMapping | undefined {
    for (const entry of this.map.values()) {
      if (entry.nodeId === nodeId) return entry
    }
    return undefined
  }

  clear() {
    this.map.clear()
  }

  getAll(): NodeMapping[] {
    return Array.from(this.map.values())
  }
}

export const nodeMapper = new NodeMapper()
