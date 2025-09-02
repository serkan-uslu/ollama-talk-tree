import React, { useEffect, useMemo, useState } from 'react';
import type { Nodes } from '../types/index';
import { ChevronDownIcon, ChevronRightIcon, CloseIcon, SearchIcon } from './icons';

interface BranchNavigatorProps {
  nodes: Nodes;
  rootId: string | null;
  activeNodeId: string | null;
  previewNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
}

const BranchNode: React.FC<{
  nodeId: string;
  nodes: Nodes;
  activeNodeId: string | null;
  previewNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
  level: number;
  activePath: Set<string>;
  expandedNodes: Set<string>;
  onToggleExpand: (nodeId: string) => void;
  isLast: boolean;
  parentTreeState: boolean[];
}> = ({
  nodeId,
  nodes,
  activeNodeId,
  previewNodeId,
  onNodeSelect,
  level,
  activePath,
  expandedNodes,
  onToggleExpand,
  isLast,
  parentTreeState,
}) => {
  const node = nodes[nodeId];
  if (!node) return null;

  const isPreviewNode = previewNodeId === nodeId;
  const isActiveNode = activeNodeId === nodeId;
  const isInActivePath = activePath.has(nodeId);
  const isExpanded = expandedNodes.has(nodeId);
  const hasChildren = node.childIds.length > 0;

  const truncate = (text: string, length: number) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  const displayText = node.branchSourceText
    ? `> "${truncate(node.branchSourceText, 20)}"`
    : truncate(node.text, 30);

  let bgClass = 'hover:bg-gray-100 text-black';
  if (isPreviewNode) {
    bgClass = 'bg-blue-600 text-white';
  } else if (isActiveNode) {
    bgClass = 'bg-blue-200 text-black';
  } else if (isInActivePath) {
    bgClass = 'bg-blue-100 text-black';
  }

  const borderClass =
    isPreviewNode || isActiveNode
      ? 'border-l-4 border-blue-500'
      : isInActivePath
        ? 'border-l-4 border-blue-300'
        : 'border-l-4 border-transparent';

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(nodeId);
  };

  return (
    <div>
      <div
        onClick={() => onNodeSelect(nodeId)}
        className={`flex items-stretch pr-3 cursor-pointer transition-colors duration-150 text-sm ${bgClass} ${borderClass}`}
      >
        {/* Tree structure visualization */}
        <div className="flex" aria-hidden="true">
          {parentTreeState.map((wasLast, i) => (
            <div key={i} className="w-5 flex-shrink-0">
              {!wasLast && <div className="w-px h-full mx-auto bg-gray-300"></div>}
            </div>
          ))}
          <div className="w-5 flex-shrink-0 relative">
            <div
              className={`w-px mx-auto bg-gray-300 absolute left-1/2 top-0 -translate-x-1/2 ${isLast ? 'h-1/2' : 'h-full'}`}
            ></div>
            <div className="absolute top-1/2 -translate-y-1/2 left-1/2 w-1/2 h-px bg-gray-300"></div>
          </div>
        </div>

        {/* Chevron and Content */}
        <div className="flex items-center py-2 flex-1 truncate">
          <div className="w-6 h-6 flex items-center justify-center">
            {hasChildren ? (
              <button
                onClick={handleExpandToggle}
                className={`p-1 rounded-full ${isPreviewNode ? 'hover:bg-blue-500' : 'hover:bg-gray-200'}`}
              >
                {isExpanded ? (
                  <ChevronDownIcon className="w-4 h-4" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4" />
                )}
              </button>
            ) : (
              <div className="w-4 h-4" />
            )}
          </div>

          <div className="flex-1 truncate flex items-center gap-2">
            {isActiveNode && !isPreviewNode && (
              <div
                className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"
                aria-label="Current message"
              ></div>
            )}
            <div className="truncate">
              <span
                className={`font-medium ${!isPreviewNode && (node.sender === 'user' ? 'text-blue-600' : 'text-gray-800')}`}
              >
                {node.sender === 'user' ? 'You: ' : 'AI: '}
              </span>
              <span
                className={!isPreviewNode && node.branchSourceText ? 'italic text-gray-600' : ''}
              >
                {displayText}
              </span>
            </div>
          </div>
        </div>
      </div>
      {isExpanded && hasChildren && (
        <div>
          {node.childIds.map((childId, index) => (
            <BranchNode
              key={childId}
              nodeId={childId}
              nodes={nodes}
              activeNodeId={activeNodeId}
              previewNodeId={previewNodeId}
              onNodeSelect={onNodeSelect}
              level={level + 1}
              activePath={activePath}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
              isLast={index === node.childIds.length - 1}
              parentTreeState={[...parentTreeState, isLast]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const HighlightedText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedHighlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-yellow-300 rounded font-semibold">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </span>
  );
};

const BranchNavigator: React.FC<BranchNavigatorProps> = ({
  nodes,
  rootId,
  activeNodeId,
  previewNodeId,
  onNodeSelect,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const activePath = useMemo(() => {
    const path = new Set<string>();
    if (activeNodeId) {
      let currentNode = nodes[activeNodeId];
      while (currentNode) {
        path.add(currentNode.id);
        currentNode = currentNode.parentId ? nodes[currentNode.parentId] : null;
      }
    }
    return path;
  }, [activeNodeId, nodes]);

  useEffect(() => {
    if (activePath.size > 0) {
      setExpandedNodes((prev) => new Set([...prev, ...activePath]));
    }
  }, [activePath]);

  const handleToggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }
    const query = searchQuery.toLowerCase();
    return Object.values(nodes)
      .filter((node) => node.text.toLowerCase().includes(query))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [searchQuery, nodes]);

  const handleSearchResultClick = (nodeId: string) => {
    onNodeSelect(nodeId);
    setSearchQuery('');
  };

  return (
    <div className="w-full bg-white flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-500" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-10 pr-8 py-2 bg-gray-100 text-black border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              aria-label="Clear search"
            >
              <CloseIcon className="w-4 h-4 text-gray-500 hover:text-gray-700" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {searchQuery.trim() ? (
          <div>
            {searchResults.length > 0 ? (
              searchResults.map((node) => (
                <div
                  key={node.id}
                  onClick={() => handleSearchResultClick(node.id)}
                  className="p-3 cursor-pointer hover:bg-gray-100 border-b border-gray-200"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchResultClick(node.id)}
                >
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                    <span
                      className={`font-bold ${node.sender === 'user' ? 'text-blue-600' : 'text-gray-800'}`}
                    >
                      {node.sender === 'user' ? 'You' : 'AI'}
                    </span>
                    <span>{new Date(node.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-black truncate">
                    <HighlightedText text={node.text} highlight={searchQuery} />
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">No messages found.</div>
            )}
          </div>
        ) : rootId ? (
          <BranchNode
            nodeId={rootId}
            nodes={nodes}
            activeNodeId={activeNodeId}
            previewNodeId={previewNodeId}
            onNodeSelect={onNodeSelect}
            level={0}
            activePath={activePath}
            expandedNodes={expandedNodes}
            onToggleExpand={handleToggleExpand}
            isLast={true}
            parentTreeState={[]}
          />
        ) : (
          <div className="p-4 text-center text-gray-500">Start a conversation to see the tree.</div>
        )}
      </div>
    </div>
  );
};

export default BranchNavigator;
