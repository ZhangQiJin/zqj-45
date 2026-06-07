import { NavLink } from 'react-router-dom';
import { Shirt, Scissors, Palette, Sparkles } from 'lucide-react';

const navItems = [
  { path: '/', label: '我的衣橱', icon: Shirt },
  { path: '/transform', label: '改造灵感', icon: Scissors },
  { path: '/styling', label: '搭配试排', icon: Palette },
  { path: '/scenes', label: '场景推荐', icon: Sparkles },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-earth-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center">
              <Shirt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-semibold text-earth-800">旧衣新生</h1>
              <p className="text-xs text-earth-500">让每件衣服都有新故事</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-sage-50 text-sage-700'
                        : 'text-earth-600 hover:bg-earth-50 hover:text-earth-800'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-earth-100 px-2 py-2">
            <div className="flex items-center justify-around">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'text-sage-600 bg-sage-50'
                          : 'text-earth-500'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
