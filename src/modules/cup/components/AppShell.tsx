import { ChartNoAxesCombined, House, Target, Trophy } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Toast from './Toast';
import { useCupData } from '../hooks/useCupData';
import { useUserId } from '../hooks/useUserId';

const tabs = [
  { to: '/cup', label: 'Inicio', icon: House },
  { to: '/cup/predictions', label: 'Picks', icon: Target },
  { to: '/cup/results', label: 'Resultados', icon: ChartNoAxesCombined },
  { to: '/cup/ranking', label: 'Ranking', icon: Trophy },
];

function AppShell() {
  const userId = useUserId();
  const cupData = useCupData(userId);
  const location = useLocation();
  const isLaunch = location.pathname === '/cup' || location.pathname === '/cup/';

  return (
    <div className={`cup-shell bg-transparent text-white ${isLaunch ? 'cup-shell-launch' : ''}`}>
      <div className="cup-device-wrap">
        <div className={`${isLaunch ? 'cup-launch-frame' : 'cup-glass-panel'} cup-device-frame relative flex w-full flex-1 flex-col overflow-hidden`}>
          <main
            className={`flex-1 overflow-y-auto scroll-smooth animate-fadeIn ${
              isLaunch ? 'p-0' : 'px-3 pb-28 pt-4 sm:px-4 sm:pt-5'
            }`}
            style={{ paddingTop: isLaunch ? 0 : 'max(1rem, env(safe-area-inset-top))' }}
          >
            <Outlet context={cupData} />
          </main>

          {!isLaunch && (
            <nav
              className="sticky bottom-0 z-50 mx-3 mb-3 rounded-[1.6rem] border border-slate-200 bg-white/90 backdrop-blur p-2 shadow-[0_18px_40px_rgba(15,23,42,0.18)] sm:mx-4 sm:mb-4"
              style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
            >
              <div className="grid grid-cols-4 gap-2">
                {tabs.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/cup'}
                    className={({ isActive }) =>
                      `cup-tab flex-col py-2 active:scale-95 ${isActive ? 'cup-tab-active' : ''}`
                    }
                  >
                    <Icon size={18} />
                    <span className="truncate">{label}</span>
                  </NavLink>
                ))}
              </div>
            </nav>
          )}

          <Toast message={cupData.toast} />
        </div>
      </div>
    </div>
  );
}

export default AppShell;
