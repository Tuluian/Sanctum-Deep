import { FloorMap, MapNode, NodeType } from '@/types';
import { SeededRandom } from './SeededRandom';

/**
 * Configuration for node type distribution per act
 */
interface NodeDistribution {
  elites: { min: number; max: number };
  campfires: { min: number; max: number };
  merchants: { min: number; max: number };
  shrines: { min: number; max: number };
}

const DEFAULT_DISTRIBUTION: NodeDistribution = {
  elites: { min: 2, max: 3 },
  campfires: { min: 2, max: 3 },
  merchants: { min: 1, max: 2 },
  shrines: { min: 1, max: 2 },
};

/**
 * MapGenerator - Creates procedurally generated floor maps
 */
export class MapGenerator {
  private rng: SeededRandom;
  private distribution: NodeDistribution;

  constructor(seed: string, distribution: NodeDistribution = DEFAULT_DISTRIBUTION) {
    this.rng = new SeededRandom(seed);
    this.distribution = distribution;
  }

  /**
   * Generate a complete floor map for an act
   */
  generateFloor(act: number, seed: string): FloorMap {
    // Create new RNG with act-specific seed for determinism
    const actSeed = `${seed}_act${act}`;
    this.rng = new SeededRandom(actSeed);

    const rows: MapNode[][] = [];

    // Row 0: Single entry node (always COMBAT)
    rows.push([this.createNode(NodeType.COMBAT, 0, 0, act)]);

    // Rows 1-13: 2-4 nodes each (14 rows total, 0-indexed)
    for (let row = 1; row < 14; row++) {
      const nodeCount = this.rng.nextInt(2, 4);
      const rowNodes: MapNode[] = [];
      for (let col = 0; col < nodeCount; col++) {
        // Temporarily set as COMBAT, will assign types later
        rowNodes.push(this.createNode(NodeType.COMBAT, row, col, act));
      }
      rows.push(rowNodes);
    }

    // Row 14: Boss node (row index 14, but it's the 15th row)
    rows.push([this.createNode(NodeType.BOSS, 14, 0, act)]);

    // Generate connections between rows
    this.generateConnections(rows);

    // Assign node types (elite, campfire, merchant, shrine)
    this.assignNodeTypes(rows, act);

    const bossNode = rows[14][0];

    return { act, rows, bossNode, seed: actSeed };
  }

  /**
   * Create a new map node
   */
  private createNode(type: NodeType, row: number, column: number, act: number): MapNode {
    return {
      id: `act${act}_row${row}_col${column}`,
      type,
      row,
      column,
      act,
      connections: [],
      visited: false,
    };
  }

  /**
   * Generate connections between all rows
   * Ensures every node has at least one incoming and outgoing connection
   */
  private generateConnections(rows: MapNode[][]): void {
    for (let rowIdx = 0; rowIdx < rows.length - 1; rowIdx++) {
      const fromRow = rows[rowIdx];
      const toRow = rows[rowIdx + 1];

      this.connectRows(fromRow, toRow);
    }
  }

  /**
   * Connect nodes between two adjacent rows
   * Ensures no orphan nodes
   */
  private connectRows(fromRow: MapNode[], toRow: MapNode[]): void {
    // Track which nodes in toRow have incoming connections
    const hasIncoming = new Set<string>();

    // First pass: Give each fromRow node at least one connection
    for (const fromNode of fromRow) {
      const toNode = this.rng.pick(toRow);
      if (!fromNode.connections.includes(toNode.id)) {
        fromNode.connections.push(toNode.id);
        hasIncoming.add(toNode.id);
      }
    }

    // Second pass: Ensure every toRow node has at least one incoming connection
    for (const toNode of toRow) {
      if (!hasIncoming.has(toNode.id)) {
        const fromNode = this.rng.pick(fromRow);
        if (!fromNode.connections.includes(toNode.id)) {
          fromNode.connections.push(toNode.id);
        }
      }
    }

    // Third pass: Add additional random connections (0-2 per node)
    for (const fromNode of fromRow) {
      const additionalCount = this.rng.nextInt(0, 2);
      for (let i = 0; i < additionalCount; i++) {
        const toNode = this.rng.pick(toRow);
        if (!fromNode.connections.includes(toNode.id)) {
          fromNode.connections.push(toNode.id);
        }
      }
    }

    // Sort connections for deterministic order
    for (const fromNode of fromRow) {
      fromNode.connections.sort();
    }
  }

  /**
   * Assign node types according to distribution rules
   */
  private assignNodeTypes(rows: MapNode[][], _act: number): void {
    // Get all non-entry, non-boss nodes that can be assigned
    const assignableNodes: MapNode[] = [];
    for (let rowIdx = 1; rowIdx < rows.length - 1; rowIdx++) {
      for (const node of rows[rowIdx]) {
        assignableNodes.push(node);
      }
    }

    // Calculate quotas
    const eliteCount = this.rng.nextInt(
      this.distribution.elites.min,
      this.distribution.elites.max
    );
    const campfireCount = this.rng.nextInt(
      this.distribution.campfires.min,
      this.distribution.campfires.max
    );
    const merchantCount = this.rng.nextInt(
      this.distribution.merchants.min,
      this.distribution.merchants.max
    );
    const shrineCount = this.rng.nextInt(
      this.distribution.shrines.min,
      this.distribution.shrines.max
    );

    // Create list of types to assign
    const typesToAssign: NodeType[] = [
      ...Array(eliteCount).fill(NodeType.ELITE),
      ...Array(campfireCount).fill(NodeType.CAMPFIRE),
      ...Array(merchantCount).fill(NodeType.MERCHANT),
      ...Array(shrineCount).fill(NodeType.SHRINE),
    ];

    // Shuffle the types
    this.rng.shuffle(typesToAssign);

    // Assign types respecting placement rules
    for (const type of typesToAssign) {
      const validNodes = assignableNodes.filter((node) => {
        // Already assigned
        if (node.type !== NodeType.COMBAT) return false;

        // Elite: not in first 3 rows (rows 0-3)
        if (type === NodeType.ELITE && node.row < 4) return false;

        // Campfire: not adjacent to boss (row 13)
        if (type === NodeType.CAMPFIRE && node.row === 13) return false;

        return true;
      });

      if (validNodes.length > 0) {
        const node = this.rng.pick(validNodes);
        node.type = type;
      }
    }

    // Remaining nodes stay as COMBAT
  }

  /**
   * Validate that a generated map has no issues
   */
  validateMap(floor: FloorMap): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check row count
    if (floor.rows.length !== 15) {
      errors.push(`Expected 15 rows, got ${floor.rows.length}`);
    }

    // Check entry node
    if (floor.rows[0].length !== 1) {
      errors.push(`Row 0 should have 1 node, has ${floor.rows[0].length}`);
    }

    // Check boss node
    if (floor.rows[14].length !== 1 || floor.rows[14][0].type !== NodeType.BOSS) {
      errors.push('Row 14 should have exactly 1 BOSS node');
    }

    // Check all nodes are reachable from start
    const reachable = this.getReachableNodes(floor);
    const allNodes = floor.rows.flat();
    for (const node of allNodes) {
      if (!reachable.has(node.id)) {
        errors.push(`Node ${node.id} is not reachable from start`);
      }
    }

    // Check all nodes can reach boss
    const canReachBoss = this.getNodesCanReachBoss(floor);
    for (const node of allNodes) {
      if (!canReachBoss.has(node.id)) {
        errors.push(`Node ${node.id} cannot reach boss`);
      }
    }

    // Check elite placement (not in rows 0-3)
    for (let row = 0; row <= 3; row++) {
      for (const node of floor.rows[row]) {
        if (node.type === NodeType.ELITE) {
          errors.push(`Elite found in row ${row}, should only be in rows 4+`);
        }
      }
    }

    // Check campfire placement (not in row 13)
    for (const node of floor.rows[13]) {
      if (node.type === NodeType.CAMPFIRE) {
        errors.push('Campfire found in row 13, should not be adjacent to boss');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Get all nodes reachable from the start node
   */
  private getReachableNodes(floor: FloorMap): Set<string> {
    const reachable = new Set<string>();
    const nodeMap = new Map<string, MapNode>();

    // Build node lookup
    for (const row of floor.rows) {
      for (const node of row) {
        nodeMap.set(node.id, node);
      }
    }

    // BFS from start
    const queue: string[] = [floor.rows[0][0].id];
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (reachable.has(nodeId)) continue;

      reachable.add(nodeId);
      const node = nodeMap.get(nodeId);
      if (node) {
        for (const connId of node.connections) {
          if (!reachable.has(connId)) {
            queue.push(connId);
          }
        }
      }
    }

    return reachable;
  }

  /**
   * Get all nodes that can reach the boss node
   */
  private getNodesCanReachBoss(floor: FloorMap): Set<string> {
    const canReach = new Set<string>();
    const nodeMap = new Map<string, MapNode>();

    // Build node lookup and reverse adjacency
    const reverseAdj = new Map<string, string[]>();
    for (const row of floor.rows) {
      for (const node of row) {
        nodeMap.set(node.id, node);
        reverseAdj.set(node.id, []);
      }
    }

    // Build reverse connections
    for (const row of floor.rows) {
      for (const node of row) {
        for (const connId of node.connections) {
          reverseAdj.get(connId)!.push(node.id);
        }
      }
    }

    // BFS backwards from boss
    const bossId = floor.bossNode.id;
    const queue: string[] = [bossId];
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (canReach.has(nodeId)) continue;

      canReach.add(nodeId);
      const incoming = reverseAdj.get(nodeId) || [];
      for (const prevId of incoming) {
        if (!canReach.has(prevId)) {
          queue.push(prevId);
        }
      }
    }

    return canReach;
  }
}

/**
 * Convenience function to generate a single floor
 */
export function generateFloor(act: number, seed: string): FloorMap {
  const generator = new MapGenerator(seed);
  return generator.generateFloor(act, seed);
}
