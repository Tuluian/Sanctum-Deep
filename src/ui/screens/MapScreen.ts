/**
 * MapScreen - Displays the dungeon map for navigation between encounters
 */

import { Screen } from '../ScreenManager';
import { FloorMap, MapNode, NodeType } from '@/types';

const NODE_ICONS: Record<NodeType, string> = {
  [NodeType.COMBAT]: '⚔️',
  [NodeType.ELITE]: '💀',
  [NodeType.CAMPFIRE]: '🔥',
  [NodeType.MERCHANT]: '💰',
  [NodeType.SHRINE]: '⛩️',
  [NodeType.BOSS]: '👑',
};

export interface MapScreenCallbacks {
  onNodeSelected: (node: MapNode) => void;
  onAbandon: () => void;
}

export function createMapScreen(callbacks: MapScreenCallbacks): Screen {
  const element = document.createElement('div');
  element.id = 'map-screen';
  element.className = 'screen map-screen';

  let currentFloor: FloorMap | null = null;
  let currentNodeId: string | null = null;
  let availableNodeIds: Set<string> = new Set();

  const getNodeState = (node: MapNode): 'current' | 'available' | 'visited' | 'locked' => {
    if (node.id === currentNodeId) return 'current';
    if (node.visited) return 'visited';
    if (availableNodeIds.has(node.id)) return 'available';
    return 'locked';
  };

  const renderNode = (node: MapNode): string => {
    const state = getNodeState(node);
    const icon = NODE_ICONS[node.type];
    const typeClass = `map-node--${node.type.toLowerCase()}`;
    const stateClass = `map-node--${state}`;

    return `
      <div class="map-node ${typeClass} ${stateClass}"
           data-node-id="${node.id}"
           title="${node.type}">
        <span class="map-node-icon">${icon}</span>
        ${state === 'visited' ? '<span class="map-node-check">✓</span>' : ''}
      </div>
    `;
  };

  const renderColumn = (nodes: MapNode[], columnIndex: number): string => {
    return `
      <div class="map-column" data-column="${columnIndex}">
        ${nodes.map(renderNode).join('')}
      </div>
    `;
  };

  const calculateConnections = (): string => {
    if (!currentFloor) return '';

    // We need to render connections after DOM is created
    // This will be called in onEnter after initial render
    return `<svg class="map-connections" id="map-connections-svg"></svg>`;
  };

  const render = () => {
    if (!currentFloor) {
      element.innerHTML = '<div class="map-loading">Loading map...</div>';
      return;
    }

    // Render columns from left (start) to right (boss)
    // Each "row" in the data represents a vertical slice (column) in the horizontal layout
    const columnsHtml: string[] = [];
    for (let i = 0; i < currentFloor.rows.length; i++) {
      columnsHtml.push(renderColumn(currentFloor.rows[i], i));
    }

    element.innerHTML = `
      <div class="map-header">
        <h2 class="map-title">Act ${currentFloor.act} - The Forgotten Sanctum</h2>
        <button class="back-btn" id="map-abandon-btn">Abandon Run</button>
      </div>
      <div class="map-container">
        <div class="map-scroll-area">
          <div class="map-nodes">
            ${calculateConnections()}
            ${columnsHtml.join('')}
          </div>
        </div>
      </div>
      <div class="map-legend">
        <span class="legend-item"><span class="legend-icon">⚔️</span> Combat</span>
        <span class="legend-item"><span class="legend-icon">💀</span> Elite</span>
        <span class="legend-item"><span class="legend-icon">🔥</span> Rest</span>
        <span class="legend-item"><span class="legend-icon">💰</span> Shop</span>
        <span class="legend-item"><span class="legend-icon">⛩️</span> Shrine</span>
        <span class="legend-item"><span class="legend-icon">👑</span> Boss</span>
      </div>
    `;

    // Attach event listeners
    element.querySelector('#map-abandon-btn')?.addEventListener('click', callbacks.onAbandon);

    // Node click handlers
    element.querySelectorAll('.map-node--available').forEach((nodeEl) => {
      nodeEl.addEventListener('click', () => {
        const nodeId = nodeEl.getAttribute('data-node-id');
        if (nodeId && currentFloor) {
          const node = findNode(currentFloor, nodeId);
          if (node) {
            callbacks.onNodeSelected(node);
          }
        }
      });
    });

    // Draw connection lines after DOM is ready
    requestAnimationFrame(() => drawConnections());

    // Setup drag-to-scroll functionality
    setupDragScroll();
  };

  // Drag-to-scroll state
  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;

  const setupDragScroll = () => {
    const scrollArea = element.querySelector('.map-scroll-area') as HTMLElement;
    if (!scrollArea) return;

    scrollArea.addEventListener('mousedown', (e) => {
      // Don't start drag if clicking on a node
      if ((e.target as HTMLElement).closest('.map-node')) return;

      isDragging = true;
      scrollArea.classList.add('dragging');
      startX = e.pageX - scrollArea.offsetLeft;
      scrollLeft = scrollArea.scrollLeft;
    });

    scrollArea.addEventListener('mouseleave', () => {
      isDragging = false;
      scrollArea.classList.remove('dragging');
    });

    scrollArea.addEventListener('mouseup', () => {
      isDragging = false;
      scrollArea.classList.remove('dragging');
    });

    scrollArea.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - scrollArea.offsetLeft;
      const walk = (x - startX) * 1.5; // Scroll speed multiplier
      scrollArea.scrollLeft = scrollLeft - walk;
    });
  };

  const findNode = (floor: FloorMap, nodeId: string): MapNode | null => {
    for (const row of floor.rows) {
      for (const node of row) {
        if (node.id === nodeId) return node;
      }
    }
    return null;
  };

  const drawConnections = () => {
    if (!currentFloor) return;

    const svg = document.getElementById('map-connections-svg');
    if (!svg) return;

    const mapNodesContainer = element.querySelector('.map-nodes') as HTMLElement;
    if (!mapNodesContainer) return;

    // Clear existing lines
    svg.innerHTML = '';

    // Set SVG size to match the map nodes container (not scroll area)
    // This ensures the SVG covers all nodes even at the end of the map
    const containerRect = mapNodesContainer.getBoundingClientRect();
    svg.setAttribute('width', String(mapNodesContainer.offsetWidth));
    svg.setAttribute('height', String(mapNodesContainer.offsetHeight));

    // Show connections only for nodes reachable from current position
    if (!currentNodeId) return;

    // Build set of reachable node IDs using BFS from current node
    const reachableNodes = new Set<string>();
    const queue: string[] = [currentNodeId];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (reachableNodes.has(nodeId)) continue;
      reachableNodes.add(nodeId);

      const node = findNode(currentFloor, nodeId);
      if (node) {
        for (const connId of node.connections) {
          if (!reachableNodes.has(connId)) {
            queue.push(connId);
          }
        }
      }
    }

    // Draw connections only for reachable nodes
    for (const nodeId of reachableNodes) {
      const node = findNode(currentFloor, nodeId);
      if (!node) continue;

      const fromEl = element.querySelector(`[data-node-id="${nodeId}"]`) as HTMLElement;
      if (!fromEl) continue;

      for (const connId of node.connections) {
        const toEl = element.querySelector(`[data-node-id="${connId}"]`) as HTMLElement;
        if (!toEl) continue;

        // Use offsetLeft/offsetTop relative to the map-nodes container
        // This gives us positions that don't change with scroll
        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();

        // Calculate positions relative to the map nodes container
        const x1 = fromRect.left - containerRect.left + fromRect.width / 2;
        const y1 = fromRect.top - containerRect.top + fromRect.height / 2;
        const x2 = toRect.left - containerRect.left + toRect.width / 2;
        const y2 = toRect.top - containerRect.top + toRect.height / 2;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(x1));
        line.setAttribute('y1', String(y1));
        line.setAttribute('x2', String(x2));
        line.setAttribute('y2', String(y2));

        // Brighter lines for immediate choices, dimmer for future paths
        if (nodeId === currentNodeId) {
          line.classList.add('map-line', 'map-line--available');
        } else {
          line.classList.add('map-line', 'map-line--future');
        }

        svg.appendChild(line);
      }
    }
  };

  const scrollToCurrentNode = () => {
    if (!currentNodeId) return;

    const currentEl = element.querySelector(`[data-node-id="${currentNodeId}"]`);
    if (currentEl) {
      // For horizontal layout, use inline: 'center' to center horizontally
      currentEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  };

  return {
    id: 'map-screen',
    element,
    onEnter: () => {
      render();
      setTimeout(scrollToCurrentNode, 100);
    },
    onExit: () => {},

    // Custom methods for updating map state
    setFloor: (floor: FloorMap) => {
      currentFloor = floor;
    },
    setCurrentNode: (nodeId: string) => {
      currentNodeId = nodeId;
      // Calculate available nodes (connections from current node)
      availableNodeIds.clear();
      if (currentFloor) {
        const currentNode = findNode(currentFloor, nodeId);
        if (currentNode) {
          for (const connId of currentNode.connections) {
            availableNodeIds.add(connId);
          }
        }
      }
    },
    refresh: () => {
      render();
      setTimeout(scrollToCurrentNode, 100);
    },
  } as Screen & {
    setFloor: (floor: FloorMap) => void;
    setCurrentNode: (nodeId: string) => void;
    refresh: () => void;
  };
}
