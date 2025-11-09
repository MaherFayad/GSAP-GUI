import { useCallback } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  Connection,
  Edge,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './StateMachineEditor.css';
import type { AnimationData } from '../../types';

interface StateMachineEditorProps {
  animationData: AnimationData;
  setAnimationData: React.Dispatch<React.SetStateAction<AnimationData>>;
  sendMessage: (type: string, payload?: any) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start' },
    position: { x: 250, y: 50 },
    style: {
      background: '#3498db',
      color: '#fff',
      border: '1px solid #2980b9',
      borderRadius: '8px',
      padding: '10px',
    },
  },
];

const initialEdges: Edge[] = [];

export const StateMachineEditor: React.FC<StateMachineEditorProps> = ({
  // animationData, // Future use: will store workflow data
  // setAnimationData, // Future use: will update workflow data
  // sendMessage, // Future use: will send workflow commands to iframe
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      console.log('[StateMachineEditor] Connection created:', params);
      setEdges((eds) => addEdge(params, eds));
      
      // Store connection logic (future enhancement)
      // This will eventually store workflow logic in animationData
    },
    [setEdges]
  );

  const addStateNode = () => {
    const newNode = {
      id: `state_${Date.now()}`,
      type: 'default',
      data: { label: 'Play Animation' },
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      style: {
        background: '#27ae60',
        color: '#fff',
        border: '1px solid #229954',
        borderRadius: '8px',
        padding: '10px',
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addTriggerNode = () => {
    const newNode = {
      id: `trigger_${Date.now()}`,
      type: 'output',
      data: { label: 'On Click' },
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      style: {
        background: '#e74c3c',
        color: '#fff',
        border: '1px solid #c0392b',
        borderRadius: '8px',
        padding: '10px',
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const clearWorkflow = () => {
    if (confirm('Are you sure you want to clear the entire workflow?')) {
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  };

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

      {/* React Flow Canvas */}
      <div className="state-machine-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Controls />
          <Background
            variant={BackgroundVariant.Dots}
            gap={16}
            size={1}
          />
        </ReactFlow>

        {/* Instructions Overlay */}
        <div className="state-machine-instructions">
          <div className="state-machine-instructions-title">How to use</div>
          <ul className="state-machine-instructions-list">
            <li>Click sidebar buttons to add nodes</li>
            <li>Drag nodes to reposition them</li>
            <li>Connect nodes by dragging from one handle to another</li>
            <li>Delete nodes by selecting and pressing Delete</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

