const rankColors = {
  'Executive':              'badge-gray',
  'Team Leader':            'badge-blue',
  'Sr. Team Leader':        'badge-blue',
  'Silver':                 'badge-gray',
  '3 Star Gold':            'badge-yellow',
  '4 Star Gold':            'badge-yellow',
  '5 Star Ruby':            'badge-red',
  '6 Star Emerald':         'badge-green',
  '7 Star Diamond':         'badge-blue',
  'Director':               'badge-purple',
  'Silver Director':        'badge-gray',
  'Gold Director':          'badge-yellow',
  'Diamond Director':       'badge-blue',
  'Black Diamond Director': 'badge-purple',
};

export default function RankBadge({ rank, size = 'sm' }) {
  const colorClass = rankColors[rank] || 'badge-gray';
  const sizeExtra = size === 'lg' ? 'text-sm px-3 py-1.5' : 'text-xs';

  return (
    <span className={`badge ${colorClass} ${sizeExtra}`}>
      {rank || 'No Rank'}
    </span>
  );
}
