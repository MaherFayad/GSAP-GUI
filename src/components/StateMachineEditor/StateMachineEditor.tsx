import { useRef, useEffect, useState, useCallback } from 'react';
import './StateMachineEditor.css';
import type { AnimationData } from '../../types';
import { TriggerSelector, type TriggerConfig } from '../TriggerSelector';

interface StateMachineEditorProps {
  animationData: AnimationData;
  setAnimationData: React.Dispatch<React.SetStateAction<AnimationData>>;
  sendMessage: (type: string, payload?: any) => void;
}

interface Node {
  id: string;
  type: 'start' | 'state' | 'trigger';
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  triggerConfig?: TriggerConfig; // Configuration for trigger nodes
}

interface Connection {
  id: string;
  from: string;
  to: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

interface DragState {
  nodeId: string | null;
  offsetX: number;
  offsetY: number;
}

interface ConnectionDraft {
  fromNodeId: string;
  fromX: number;
  fromY: number;
  currentX: number;
  currentY: number;
}

export const StateMachineEditor: React.FC<StateMachineEditorProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: '1',
      type: 'start',
      label: 'Start',
      x: 250,
      y: 100,
      width: 100,
      height: 50,
    },
  ]);
  
  const [connections, setConnections] = useState<Connection[]>([]);
  const [dragState, setDragState] = useState<DragState>({ nodeId: null, offsetX: 0, offsetY: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [connectionDraft, setConnectionDraft] = useState<ConnectionDraft | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [editingTrigger, setEditingTrigger] = useState<string | null>(null); // Node ID being edited

  // Draw the canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply transforms
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw grid
    drawGrid(ctx, canvas.width / zoom, canvas.height / zoom);

    // Draw connections
    connections.forEach((conn) => {
      drawConnection(ctx, conn);
    });

    // Draw connection draft
    if (connectionDraft) {
      drawConnectionDraft(ctx, connectionDraft);
    }

    // Draw nodes
    nodes.forEach((node) => {
      drawNode(ctx, node, node.id === selectedNode, node.id === hoveredNode);
    });

    ctx.restore();
  }, [nodes, connections, selectedNode, hoveredNode, connectionDraft, pan, zoom]);

  // Draw grid
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20;
    ctx.strokeStyle = 'rgba(45, 45, 45, 0.3)';
    ctx.lineWidth = 0.5;

    // Vertical lines
    for (let x = (-pan.x / zoom) % gridSize; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = (-pan.y / zoom) % gridSize; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  // Draw a node
  const drawNode = (
    ctx: CanvasRenderingContext2D,
    node: Node,
    isSelected: boolean,
    isHovered: boolean
  ) => {
    const colors = {
      start: { bg: '#0078D4', border: '#1084D8' },
      state: { bg: '#10B981', border: '#059669' },
      trigger: { bg: '#EF4444', border: '#DC2626' },
    };

    const color = colors[node.type];

    // Shadow for depth
    if (isSelected || isHovered) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;
    }

    // Node background
    ctx.fillStyle = color.bg;
    ctx.strokeStyle = isSelected ? '#FFFFFF' : color.border;
    ctx.lineWidth = isSelected ? 2 : 1;
    
    const radius = 6;
    ctx.beginPath();
    ctx.roundRect(node.x, node.y, node.width, node.height, radius);
    ctx.fill();
    ctx.stroke();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Node label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '500 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, node.x + node.width / 2, node.y + node.height / 2);

    // Connection handles
    drawHandle(ctx, node.x + node.width, node.y + node.height / 2); // Right
    drawHandle(ctx, node.x, node.y + node.height / 2); // Left
  };

  // Draw connection handle
  const drawHandle = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#2D2D2D';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  };

  // Draw a connection
  const drawConnection = (ctx: CanvasRenderingContext2D, conn: Connection) => {
    const fromNode = nodes.find((n) => n.id === conn.from);
    const toNode = nodes.find((n) => n.id === conn.to);
    
    if (!fromNode || !toNode) return;

    const startX = fromNode.x + fromNode.width;
    const startY = fromNode.y + fromNode.height / 2;
    const endX = toNode.x;
    const endY = toNode.y + toNode.height / 2;

    drawBezierConnection(ctx, startX, startY, endX, endY, '#3B9EFF');
  };

  // Draw connection draft
  const drawConnectionDraft = (ctx: CanvasRenderingContext2D, draft: ConnectionDraft) => {
    drawBezierConnection(ctx, draft.fromX, draft.fromY, draft.currentX, draft.currentY, '#6B6B6B');
  };

  // Draw bezier curve connection
  const drawBezierConnection = (
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    color: string
  ) => {
    const controlOffset = Math.min(Math.abs(endX - startX) / 2, 100);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(
      startX + controlOffset, startY,
      endX - controlOffset, endY,
      endX, endY
    );
    ctx.stroke();

    // Draw arrowhead
    const arrowSize = 6;
    const angle = Math.atan2(endY - startY, endX - startX);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowSize * Math.cos(angle - Math.PI / 6),
      endY - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      endX - arrowSize * Math.cos(angle + Math.PI / 6),
      endY - arrowSize * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  };

  // Get node at position
  const getNodeAtPosition = (x: number, y: number): Node | null => {
    const adjustedX = (x - pan.x) / zoom;
    const adjustedY = (y - pan.y) / zoom;
    
    return nodes.find(
      (node) =>
        adjustedX >= node.x &&
        adjustedX <= node.x + node.width &&
        adjustedY >= node.y &&
        adjustedY <= node.y + node.height
    ) || null;
  };

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const node = getNodeAtPosition(x, y);

    if (e.button === 1 || (e.button === 0 && e.metaKey)) {
      // Middle mouse button or Cmd+Click for panning
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (node) {
      if (e.shiftKey) {
        // Shift+Click starts connection
        const fromX = node.x + node.width;
        const fromY = node.y + node.height / 2;
        setConnectionDraft({
          fromNodeId: node.id,
          fromX: (fromX * zoom) + pan.x,
          fromY: (fromY * zoom) + pan.y,
          currentX: x,
          currentY: y,
        });
      } else {
        // Regular click starts drag
        setDragState({
          nodeId: node.id,
          offsetX: (x - pan.x) / zoom - node.x,
          offsetY: (y - pan.y) / zoom - node.y,
        });
        setSelectedNode(node.id);
      }
    } else {
      setSelectedNode(null);
    }
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (connectionDraft) {
      setConnectionDraft({
        ...connectionDraft,
        currentX: x,
        currentY: y,
      });
    } else if (dragState.nodeId) {
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === dragState.nodeId
            ? {
                ...node,
                x: (x - pan.x) / zoom - dragState.offsetX,
                y: (y - pan.y) / zoom - dragState.offsetY,
              }
            : node
        )
      );
    } else {
      // Update hovered node
      const node = getNodeAtPosition(x, y);
      setHoveredNode(node?.id || null);
    }
  };

  // Handle mouse up
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (connectionDraft) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const targetNode = getNodeAtPosition(x, y);

      if (targetNode && targetNode.id !== connectionDraft.fromNodeId) {
        // Create connection
        const newConnection: Connection = {
          id: `conn_${Date.now()}`,
          from: connectionDraft.fromNodeId,
          to: targetNode.id,
          fromX: connectionDraft.fromX,
          fromY: connectionDraft.fromY,
          toX: targetNode.x,
          toY: targetNode.y + targetNode.height / 2,
        };
        setConnections((prev) => [...prev, newConnection]);
      }

      setConnectionDraft(null);
    }

    setDragState({ nodeId: null, offsetX: 0, offsetY: 0 });
  };

  // Handle wheel for zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prevZoom) => Math.max(0.1, Math.min(3, prevZoom * delta)));
  };

  // Handle double-click to edit trigger
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const node = getNodeAtPosition(x, y);

    if (node && node.type === 'trigger') {
      setEditingTrigger(node.id);
    }
  };

  // Handle key down
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedNode) {
        // Delete selected node
        setNodes((prev) => prev.filter((n) => n.id !== selectedNode));
        setConnections((prev) =>
          prev.filter((c) => c.from !== selectedNode && c.to !== selectedNode)
        );
        setSelectedNode(null);
      }
      if (e.key === 'Escape') {
        // Close trigger editor
        setEditingTrigger(null);
      }
    },
    [selectedNode]
  );

  // Add nodes
  const addStateNode = () => {
    const newNode: Node = {
      id: `state_${Date.now()}`,
      type: 'state',
      label: 'Play Animation',
      x: 250 + Math.random() * 100,
      y: 200 + Math.random() * 100,
      width: 120,
      height: 50,
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const addTriggerNode = () => {
    const newNode: Node = {
      id: `trigger_${Date.now()}`,
      type: 'trigger',
      label: 'On Click',
      x: 250 + Math.random() * 100,
      y: 200 + Math.random() * 100,
      width: 100,
      height: 50,
      triggerConfig: {
        type: 'click',
      },
    };
    setNodes((prev) => [...prev, newNode]);
  };

  // Handle trigger configuration updates
  const handleTriggerConfigChange = (nodeId: string, config: TriggerConfig) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              label: getTriggerLabel(config),
              triggerConfig: config,
            }
          : node
      )
    );
  };

  // Get trigger label based on configuration
  const getTriggerLabel = (config: TriggerConfig): string => {
    switch (config.type) {
      case 'click':
        return 'On Click';
      case 'hover':
        return 'On Hover';
      case 'scroll':
        return 'On Scroll';
      case 'load':
        return 'On Load';
      case 'custom':
        return config.event || 'Custom Event';
      default:
        return 'Trigger';
    }
  };

  const clearWorkflow = () => {
    if (confirm('Are you sure you want to clear the entire workflow?')) {
      setNodes([
        {
          id: '1',
          type: 'start',
          label: 'Start',
          x: 250,
          y: 100,
          width: 100,
          height: 50,
        },
      ]);
      setConnections([]);
      setSelectedNode(null);
    }
  };

  // Resize canvas
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        draw();
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [draw]);

  // Redraw on state changes
  useEffect(() => {
    draw();
  }, [draw]);

  // Listen for keyboard events
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="state-machine-editor">
      {/* Sidebar */}
      <div className="state-machine-sidebar">
        <div className="state-machine-sidebar-header">
          <div className="state-machine-sidebar-title">Add Nodes</div>
        </div>

        <div className="state-machine-sidebar-content">
          <button className="state-machine-node-btn state" onClick={addStateNode}>
            <span>+</span> State Node
          </button>

          <button className="state-machine-node-btn trigger" onClick={addTriggerNode}>
            <span>+</span> Trigger Node
          </button>

          <div className="state-machine-divider" />

          <button className="state-machine-clear-btn" onClick={clearWorkflow}>
            Clear Workflow
          </button>
        </div>

        <div className="state-machine-legend">
          <div className="state-machine-legend-title">Legend</div>
          <div className="state-machine-legend-item">
            <div className="state-machine-legend-dot start" />
            <span>Start: Entry point</span>
          </div>
          <div className="state-machine-legend-item">
            <div className="state-machine-legend-dot state" />
            <span>State: Animation action</span>
          </div>
          <div className="state-machine-legend-item">
            <div className="state-machine-legend-dot trigger" />
            <span>Trigger: Event listener</span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="state-machine-canvas" ref={containerRef}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          onMouseLeave={() => {
            setDragState({ nodeId: null, offsetX: 0, offsetY: 0 });
            setConnectionDraft(null);
            setIsPanning(false);
          }}
          onWheel={handleWheel}
        />

        {/* Instructions Overlay */}
        <div className="state-machine-instructions">
          <div className="state-machine-instructions-title">How to use</div>
          <ul className="state-machine-instructions-list">
            <li>Click sidebar buttons to add nodes</li>
            <li>Drag nodes to reposition them</li>
            <li>Shift+Click and drag to create connections</li>
            <li>Double-click trigger nodes to edit</li>
            <li>Delete nodes by selecting and pressing Delete</li>
            <li>Scroll to zoom, Cmd+Click to pan</li>
          </ul>
        </div>

        {/* Trigger Configuration Panel */}
        {editingTrigger && (
          <div className="state-machine-trigger-editor">
            <TriggerSelector
              value={
                nodes.find((n) => n.id === editingTrigger)?.triggerConfig || {
                  type: 'click',
                }
              }
              onChange={(config) => handleTriggerConfigChange(editingTrigger, config)}
              onClose={() => setEditingTrigger(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

