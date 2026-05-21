import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Tree from 'react-d3-tree';
import api from '../services/api';
import toast from 'react-hot-toast';

const NodeLabel = ({ nodeData }) => {
  const isActive = nodeData.attributes?.active;

  return (
    <div className={`px-3 py-2 rounded-lg text-center text-xs shadow-md border-2 min-w-[80px] ${
      isActive ? 'bg-white border-red-500 text-gray-800'
      : 'bg-red-50 border-red-300 text-red-700'
    }`}>
      <p className="font-bold truncate max-w-[80px]">{nodeData.name}</p>
      {nodeData.attributes?.referralCode && (
        <p className="text-gray-500 text-[10px]">{nodeData.attributes.referralCode}</p>
      )}
    </div>
  );
};

export default function TreePage() {
  const { userId } = useParams();
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [translate, setTranslate] = useState({ x: 0, y: 60 });
  const containerRef = useRef(null);

  const isAdminView = Boolean(userId);

  useEffect(() => {
    const endpoint = isAdminView ? `/tree/${userId}` : '/tree/my';
    api.get(endpoint)
      .then(res => setTreeData(res.data.tree))
      .catch(() => toast.error('Failed to load tree'))
      .finally(() => setLoading(false));
  }, [userId, isAdminView]);

  useEffect(() => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect();
      setTranslate({ x: width / 2, y: 60 });
    }
  }, [treeData]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isAdminView ? 'Member Network Tree' : 'My Network Tree'}
        </h1>
        <p className="text-gray-500 text-sm">
          Your network structure — unlimited direct referrals per member
        </p>
      </div>

      <div className="card flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border-2 border-red-500 bg-white" /><span>Active Member</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border-2 border-red-300 bg-red-50" /><span>Inactive Member</span></div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-red-700 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !treeData ? (
        <div className="card text-center py-12 text-gray-500">No tree data available</div>
      ) : (
        <div ref={containerRef} className="card overflow-hidden" style={{ height: '70vh' }}>
          <Tree
            data={treeData}
            translate={translate}
            orientation="vertical"
            pathFunc="step"
            separation={{ siblings: 1.5, nonSiblings: 1.8 }}
            nodeSize={{ x: 100, y: 100 }}
            renderCustomNodeElement={({ nodeDatum }) => (
              <foreignObject width="100" height="70" x="-50" y="-35">
                <NodeLabel nodeData={nodeDatum} />
              </foreignObject>
            )}
            zoom={0.6}
            scaleExtent={{ min: 0.2, max: 2 }}
          />
        </div>
      )}
    </div>
  );
}
