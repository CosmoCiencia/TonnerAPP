import { Outlet, useLocation } from 'react-router-dom';
import CupTopBar from './CupTopBar';
import Toast from './Toast';
import { useCupData } from '../hooks/useCupData';
import { useUserId } from '../hooks/useUserId';

function AppShell() {
  const userId = useUserId();
  const cupData = useCupData(userId);
  const location = useLocation();
  const isLaunch = location.pathname === '/cup' || location.pathname === '/cup/';

  return (
    <div className={`cup-shell ${isLaunch ? 'cup-shell-launch text-white' : 'cup-shell-app text-tonner-slate'}`}>
      <div className="cup-device-wrap">
        <div className={`${isLaunch ? 'cup-launch-frame' : 'cup-app-panel'} cup-device-frame relative flex w-full flex-1 flex-col overflow-hidden`}>
          {!isLaunch ? <CupTopBar /> : null}
          <main
            className={`flex-1 overflow-y-auto scroll-smooth animate-fadeIn ${
              isLaunch ? 'p-0' : 'px-3 pb-28 pt-4 sm:px-4 sm:pt-5'
            }`}
          >
            <Outlet context={cupData} />
          </main>

          <Toast message={cupData.toast} />
        </div>
      </div>
    </div>
  );
}

export default AppShell;
