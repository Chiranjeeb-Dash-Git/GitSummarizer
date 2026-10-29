import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import Tabs from '../components/ui/Tabs.jsx';
import StatsSentence from '../components/dashboard/StatsSentence.jsx';
import HistoryList from '../components/dashboard/HistoryList.jsx';
import SavedList from '../components/dashboard/SavedList.jsx';

const DASHBOARD_TABS = [
  { value: 'history', label: 'History' },
  { value: 'saved', label: 'Saved' },
];

export default function Dashboard() {
  const [params, setParams] = useSearchParams();
  const currentTab = params.get('tab') === 'saved' ? 'saved' : 'history';

  const { data: statsData, isPending: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get('/me/stats').then((r) => r.data),
  });

  const onTabChange = (val) => {
    setParams({ tab: val });
  };

  return (
    <div className="mx-auto max-w-[1280px] px-5 py-12 md:px-10 xl:px-16">
      <h1 className="font-display text-h1 font-extrabold tracking-tight">Your library</h1>

      <div className="mt-4">
        <StatsSentence stats={statsData} loading={statsLoading} />
      </div>

      <div className="mt-10">
        <Tabs
          tabs={DASHBOARD_TABS}
          value={currentTab}
          onChange={onTabChange}
          label="Library sections"
        />
      </div>

      {currentTab === 'history' ? <HistoryList /> : <SavedList />}
    </div>
  );
}

