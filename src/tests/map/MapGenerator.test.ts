import { describe, it, expect } from 'vitest';
import { MapGenerator, generateFloor } from '@/map/MapGenerator';
import { NodeType } from '@/types';

describe('MapGenerator', () => {
  describe('determinism', () => {
    it('produces identical maps with same seed', () => {
      const map1 = generateFloor(1, 'test_seed');
      const map2 = generateFloor(1, 'test_seed');

      // Check all node IDs match
      const ids1 = map1.rows.flat().map((n) => n.id);
      const ids2 = map2.rows.flat().map((n) => n.id);
      expect(ids1).toEqual(ids2);

      // Check all connections match
      const conns1 = map1.rows.flat().map((n) => n.connections);
      const conns2 = map2.rows.flat().map((n) => n.connections);
      expect(conns1).toEqual(conns2);

      // Check all types match
      const types1 = map1.rows.flat().map((n) => n.type);
      const types2 = map2.rows.flat().map((n) => n.type);
      expect(types1).toEqual(types2);
    });

    it('produces different maps with different seeds', () => {
      const map1 = generateFloor(1, 'seed_a');
      const map2 = generateFloor(1, 'seed_b');

      // Types or connections should differ
      const types1 = map1.rows.flat().map((n) => n.type).join(',');
      const types2 = map2.rows.flat().map((n) => n.type).join(',');
      expect(types1).not.toEqual(types2);
    });

    it('produces different maps for different acts with same seed', () => {
      const map1 = generateFloor(1, 'same_seed');
      const map2 = generateFloor(2, 'same_seed');

      // Should have different content due to act-specific seeding
      const types1 = map1.rows.flat().map((n) => n.type).join(',');
      const types2 = map2.rows.flat().map((n) => n.type).join(',');
      expect(types1).not.toEqual(types2);
    });
  });

  describe('structure', () => {
    it('generates 15 rows per act', () => {
      const map = generateFloor(1, 'structure_test');
      expect(map.rows.length).toBe(15);
    });

    it('has single entry node in row 0', () => {
      const map = generateFloor(1, 'entry_test');
      expect(map.rows[0].length).toBe(1);
      expect(map.rows[0][0].type).toBe(NodeType.COMBAT);
    });

    it('has single boss node in row 14', () => {
      const map = generateFloor(1, 'boss_test');
      expect(map.rows[14].length).toBe(1);
      expect(map.rows[14][0].type).toBe(NodeType.BOSS);
      expect(map.bossNode.id).toBe(map.rows[14][0].id);
    });

    it('has 2-4 nodes in middle rows', () => {
      const map = generateFloor(1, 'middle_test');
      for (let row = 1; row < 14; row++) {
        expect(map.rows[row].length).toBeGreaterThanOrEqual(2);
        expect(map.rows[row].length).toBeLessThanOrEqual(4);
      }
    });

    it('assigns correct act and row to nodes', () => {
      const map = generateFloor(2, 'meta_test');
      for (let row = 0; row < map.rows.length; row++) {
        for (const node of map.rows[row]) {
          expect(node.act).toBe(2);
          expect(node.row).toBe(row);
        }
      }
    });
  });

  describe('connections', () => {
    it('every node except boss has at least one outgoing connection', () => {
      const map = generateFloor(1, 'outgoing_test');
      for (let row = 0; row < 14; row++) {
        for (const node of map.rows[row]) {
          expect(node.connections.length).toBeGreaterThan(0);
        }
      }
    });

    it('every node except entry has at least one incoming connection', () => {
      const map = generateFloor(1, 'incoming_test');

      // Build incoming connection counts
      const incomingCount = new Map<string, number>();
      for (const row of map.rows) {
        for (const node of row) {
          incomingCount.set(node.id, 0);
        }
      }

      for (const row of map.rows) {
        for (const node of row) {
          for (const connId of node.connections) {
            incomingCount.set(connId, (incomingCount.get(connId) || 0) + 1);
          }
        }
      }

      // Check all nodes except entry have incoming
      for (let row = 1; row < map.rows.length; row++) {
        for (const node of map.rows[row]) {
          expect(incomingCount.get(node.id)).toBeGreaterThan(0);
        }
      }
    });

    it('connections only point to nodes in the next row', () => {
      const map = generateFloor(1, 'valid_conn_test');

      const nodeMap = new Map<string, number>();
      for (const row of map.rows) {
        for (const node of row) {
          nodeMap.set(node.id, node.row);
        }
      }

      for (const row of map.rows) {
        for (const node of row) {
          for (const connId of node.connections) {
            const connRow = nodeMap.get(connId);
            expect(connRow).toBe(node.row + 1);
          }
        }
      }
    });
  });

  describe('node type distribution', () => {
    it('places elites only in rows 4+', () => {
      // Test multiple maps to ensure rule is respected
      for (let i = 0; i < 10; i++) {
        const map = generateFloor(1, `elite_placement_${i}`);
        for (let row = 0; row <= 3; row++) {
          for (const node of map.rows[row]) {
            expect(node.type).not.toBe(NodeType.ELITE);
          }
        }
      }
    });

    it('places no campfires in row 13', () => {
      for (let i = 0; i < 10; i++) {
        const map = generateFloor(1, `campfire_placement_${i}`);
        for (const node of map.rows[13]) {
          expect(node.type).not.toBe(NodeType.CAMPFIRE);
        }
      }
    });

    it('contains 2-3 elite nodes per act', () => {
      const map = generateFloor(1, 'elite_count_test');
      const eliteCount = map.rows.flat().filter((n) => n.type === NodeType.ELITE).length;
      expect(eliteCount).toBeGreaterThanOrEqual(2);
      expect(eliteCount).toBeLessThanOrEqual(3);
    });

    it('contains 2-3 campfire nodes per act', () => {
      const map = generateFloor(1, 'campfire_count_test');
      const campfireCount = map.rows
        .flat()
        .filter((n) => n.type === NodeType.CAMPFIRE).length;
      expect(campfireCount).toBeGreaterThanOrEqual(2);
      expect(campfireCount).toBeLessThanOrEqual(3);
    });

    it('contains 1-2 merchant nodes per act', () => {
      const map = generateFloor(1, 'merchant_count_test');
      const merchantCount = map.rows
        .flat()
        .filter((n) => n.type === NodeType.MERCHANT).length;
      expect(merchantCount).toBeGreaterThanOrEqual(1);
      expect(merchantCount).toBeLessThanOrEqual(2);
    });

    it('contains 1-2 shrine nodes per act', () => {
      const map = generateFloor(1, 'shrine_count_test');
      const shrineCount = map.rows.flat().filter((n) => n.type === NodeType.SHRINE).length;
      expect(shrineCount).toBeGreaterThanOrEqual(1);
      expect(shrineCount).toBeLessThanOrEqual(2);
    });

    it('remaining nodes are combat type', () => {
      const map = generateFloor(1, 'combat_fill_test');
      const combatCount = map.rows.flat().filter((n) => n.type === NodeType.COMBAT).length;
      // Entry is combat, boss is boss, 2-3 elites, 2-3 campfires, 1-2 merchants, 1-2 shrines
      // At minimum: 1 boss + 2 + 2 + 1 + 1 = 7 non-combat special nodes
      // Expect remaining ~30+ nodes to be combat (including entry)
      expect(combatCount).toBeGreaterThanOrEqual(30);
    });
  });

  describe('validation', () => {
    it('generated maps pass validation', () => {
      const generator = new MapGenerator('validation_test');
      for (let act = 1; act <= 3; act++) {
        const map = generator.generateFloor(act, `validation_${act}`);
        const result = generator.validateMap(map);
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      }
    });

    it('all nodes are reachable from start', () => {
      const map = generateFloor(1, 'reachable_test');
      const generator = new MapGenerator('reachable_test');
      const result = generator.validateMap(map);

      // Validation checks reachability
      expect(result.errors.filter((e) => e.includes('not reachable'))).toEqual([]);
    });

    it('all nodes can reach boss', () => {
      const map = generateFloor(1, 'boss_reach_test');
      const generator = new MapGenerator('boss_reach_test');
      const result = generator.validateMap(map);

      // Validation checks boss reachability
      expect(result.errors.filter((e) => e.includes('cannot reach boss'))).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('handles empty seed', () => {
      const map = generateFloor(1, '');
      expect(map.rows.length).toBe(15);
    });

    it('handles very long seed', () => {
      const longSeed = 'x'.repeat(10000);
      const map = generateFloor(1, longSeed);
      expect(map.rows.length).toBe(15);
    });

    it('handles special characters in seed', () => {
      const map = generateFloor(1, '!@#$%^&*()');
      expect(map.rows.length).toBe(15);
    });
  });
});
