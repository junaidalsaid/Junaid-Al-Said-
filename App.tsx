
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Moon, 
  Sun, 
  Sparkles, 
  Heart,
  Calendar as CalendarIcon,
  Info,
  MoonStar,
  Circle,
  Star,
  CheckCircle2,
  Trophy,
  Plus,
  X,
  Trash2,
  Clock
} from 'lucide-react';
import { getHijriDate } from './services/hijriConverter';
import { getDailyInsight } from './services/geminiService';
import { CalendarDay, DailyInsight, CalendarEvent } from './types';
import { DAYS_OF_WEEK, HIJRI_MONTHS, PASTEL_COLORS } from './constants';

const EVENT_COLORS = [
  { name: 'Pink', bg: 'bg-pink-100', text: 'text-pink-600', border: 'border-pink-200' },
  { name: 'Blue', bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
  { name: 'Purple', bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
  { name: 'Green', bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
  { name: 'Amber', bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200' },
];

const App: React.FC = () => {
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const [insight, setInsight] = useState<DailyInsight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const [events, setEvents] = useState<Record<string, CalendarEvent[]>>({});
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventColor, setNewEventColor] = useState(EVENT_COLORS[0]);

  const today = new Date();
  const currentHijri = useMemo(() => getHijriDate(today), [today]);

  // Load persistence
  useEffect(() => {
    const savedHabits = localStorage.getItem('junus-plan-habits');
    const savedEvents = localStorage.getItem('junus-plan-events');
    if (savedHabits) {
      try { setCompletedDates(JSON.parse(savedHabits)); } catch (e) {}
    }
    if (savedEvents) {
      try { setEvents(JSON.parse(savedEvents)); } catch (e) {}
    }
  }, []);

  // Save persistence
  useEffect(() => {
    localStorage.setItem('junus-plan-habits', JSON.stringify(completedDates));
  }, [completedDates]);

  useEffect(() => {
    localStorage.setItem('junus-plan-events', JSON.stringify(events));
  }, [events]);

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDay = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const days: CalendarDay[] = [];
    
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date: d, hijri: getHijriDate(d), isCurrentMonth: false, isToday: d.toDateString() === today.toDateString() });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, hijri: getHijriDate(d), isCurrentMonth: true, isToday: d.toDateString() === today.toDateString() });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, hijri: getHijriDate(d), isCurrentMonth: false, isToday: d.toDateString() === today.toDateString() });
    }
    return days;
  }, [currentViewDate, today]);

  const monthStats = useMemo(() => {
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    const monthPrefix = `${year}-${month + 1}-`;
    const count = completedDates.filter(d => d.startsWith(monthPrefix)).length;
    const totalDays = new Date(year, month + 1, 0).getDate();
    return { count, totalDays };
  }, [completedDates, currentViewDate]);

  useEffect(() => {
    const fetchInsight = async () => {
      setLoadingInsight(true);
      const data = await getDailyInsight(currentHijri);
      setInsight(data);
      setLoadingInsight(false);
    };
    fetchInsight();
  }, [currentHijri.day, currentHijri.month]);

  const changeMonth = (offset: number) => {
    setCurrentViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const toggleHabit = (e: React.MouseEvent, date: Date) => {
    e.stopPropagation();
    const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    setCompletedDates(prev => 
      prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
    );
  };

  const openEventModal = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    setSelectedDate(dateStr);
    setIsModalOpen(true);
  };

  const addEvent = () => {
    if (!newEventTitle.trim() || !selectedDate) return;
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: newEventTitle,
      color: newEventColor.name
    };
    setEvents(prev => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), newEvent]
    }));
    setNewEventTitle('');
    setIsModalOpen(false);
  };

  const deleteEvent = (dateStr: string, eventId: string) => {
    setEvents(prev => ({
      ...prev,
      [dateStr]: prev[dateStr].filter(e => e.id !== eventId)
    }));
  };

  const monthName = currentViewDate.toLocaleString('default', { month: 'long' });
  const viewYear = currentViewDate.getFullYear();

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center bg-[#fffafb]">
      {/* Simplified Header Section */}
      <header className="w-full max-w-5xl mb-8 text-center space-y-4">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 tracking-tight">
          Junu's <span className="text-pink-400">Plan</span>
        </h1>
      </header>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-3xl cute-shadow border-2 border-pink-100 flex flex-col items-center">
            <div className="bg-pink-100 p-4 rounded-full mb-4">
              <Moon size={32} className="text-pink-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Today's Moon</h2>
            <p className="text-pink-500 font-semibold mb-4">
              {currentHijri.day} {currentHijri.monthName} {currentHijri.year} AH
            </p>
            <div className="w-full border-t border-pink-100 my-4"></div>
            <div className="text-center">
              <p className="text-gray-400 text-sm font-medium">Gregorian Date</p>
              <p className="text-gray-700 font-bold">{today.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border-2 border-purple-50 cute-shadow">
            <div className="flex items-center gap-2 mb-4 text-purple-400">
              <Trophy size={18} />
              <h3 className="font-bold">Monthly Tracker</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-3xl font-black text-gray-800">{monthStats.count}</span>
                <span className="text-sm font-bold text-gray-400 mb-1">/ {monthStats.totalDays} days</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-300 to-pink-300 h-full transition-all duration-500 ease-out"
                  style={{ width: `${(monthStats.count / monthStats.totalDays) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 font-medium italic text-center leading-relaxed">
                Log habits & add events for each day!
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border-2 border-blue-50 cute-shadow">
            <div className="flex items-center gap-2 mb-4 text-blue-400">
              <Info size={18} />
              <h3 className="font-bold">Daily Insight</h3>
            </div>
            {loadingInsight ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                <div className="h-20 bg-gray-100 rounded"></div>
              </div>
            ) : insight ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{insight.emoji}</span>
                  <p className="font-bold text-gray-800 leading-tight">{insight.topic}</p>
                </div>
                <p className="text-gray-600 text-sm italic leading-relaxed">"{insight.content}"</p>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Failed to load lunar insights.</p>
            )}
          </div>
        </aside>

        {/* Main Calendar View */}
        <main className="lg:col-span-3">
          <div className="bg-white rounded-[2.5rem] cute-shadow border-4 border-pink-50 overflow-hidden">
            <div className="bg-gradient-to-r from-pink-50 to-blue-50 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => changeMonth(-1)} className="p-3 bg-white hover:bg-pink-100 rounded-2xl text-pink-400 transition-colors shadow-sm">
                  <ChevronLeft size={24} />
                </button>
                <div className="text-left">
                  <h2 className="text-2xl font-black text-gray-800 leading-none">{monthName}</h2>
                  <p className="text-gray-500 font-bold text-sm tracking-wider">{viewYear}</p>
                </div>
                <button onClick={() => changeMonth(1)} className="p-3 bg-white hover:bg-pink-100 rounded-2xl text-pink-400 transition-colors shadow-sm">
                  <ChevronRight size={24} />
                </button>
              </div>
              <div className="hidden md:flex bg-white/60 px-4 py-2 rounded-2xl items-center gap-3 backdrop-blur-sm">
                <CalendarIcon size={18} className="text-blue-400" />
                <span className="text-sm font-bold text-gray-600">Event Planner</span>
              </div>
            </div>

            <div className="grid grid-cols-7 bg-white border-b border-gray-50">
              {DAYS_OF_WEEK.map(day => (
                <div key={day} className="py-4 text-center text-xs font-black uppercase tracking-widest text-pink-300">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                const dateStr = `${day.date.getFullYear()}-${day.date.getMonth() + 1}-${day.date.getDate()}`;
                const isCompleted = completedDates.includes(dateStr);
                const dayEvents = events[dateStr] || [];

                return (
                  <div 
                    key={idx}
                    onClick={() => day.isCurrentMonth && openEventModal(day.date)}
                    className={`
                      relative h-28 md:h-40 p-1 border-r border-b border-gray-50 transition-all group cursor-pointer
                      ${day.isCurrentMonth ? 'bg-white hover:bg-pink-50/10' : 'bg-gray-50/30'}
                      ${day.isToday ? 'bg-pink-50/20' : ''}
                    `}
                  >
                    <span className={`absolute top-2 left-2 text-[10px] md:text-xs font-bold ${day.isCurrentMonth ? 'text-gray-400' : 'text-gray-300'}`}>
                      {day.date.getDate()}
                    </span>

                    {/* Habit Tracker Box */}
                    {day.isCurrentMonth && (
                      <button 
                        onClick={(e) => toggleHabit(e, day.date)}
                        className={`
                          absolute top-2 right-2 w-5 h-5 md:w-6 md:h-6 rounded-lg border-2 transition-all flex items-center justify-center
                          ${isCompleted 
                            ? 'bg-gradient-to-br from-pink-300 to-purple-400 border-transparent shadow-sm' 
                            : 'bg-white border-gray-100 hover:border-pink-200'}
                        `}
                      >
                        {isCompleted && <CheckCircle2 size={12} className="text-white" />}
                      </button>
                    )}

                    {/* Hijri Date Display */}
                    <div className="mt-6 flex flex-col items-center">
                      <span className={`text-base md:text-xl font-black ${day.isToday ? 'text-pink-500' : (day.isCurrentMonth ? 'text-gray-700' : 'text-gray-300')}`}>
                        {day.hijri.day}
                      </span>
                      <span className={`text-[8px] md:text-[9px] uppercase font-bold tracking-tighter text-center ${day.isToday ? 'text-pink-400' : (day.isCurrentMonth ? 'text-gray-400' : 'text-gray-200')}`}>
                        {day.hijri.monthName.split(' ')[0]}
                      </span>
                    </div>

                    {/* Events List */}
                    <div className="mt-1 space-y-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map((event) => {
                        const style = EVENT_COLORS.find(c => c.name === event.color) || EVENT_COLORS[0];
                        return (
                          <div key={event.id} className={`${style.bg} ${style.text} ${style.border} border text-[8px] md:text-[10px] px-1.5 py-0.5 rounded-md truncate font-bold`}>
                            {event.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-[8px] text-gray-400 font-bold px-1.5">+{dayEvents.length - 2} more</div>
                      )}
                    </div>

                    {/* Traditions Indicators */}
                    {(day.date.getDay() === 1 || day.date.getDay() === 4) && day.isCurrentMonth && (
                      <div className="absolute bottom-1.5 left-2 opacity-50">
                        <div className="relative">
                          <Star size={12} className="text-amber-400 fill-amber-100" />
                          <div className="absolute inset-0 flex items-center justify-center"><div className="w-[110%] h-[1px] bg-red-400/80 rotate-45"></div></div>
                        </div>
                      </div>
                    )}

                    {/* White Days Indicator (Hijri 13, 14, 15) */}
                    {[13, 14, 15].includes(day.hijri.day) && day.isCurrentMonth && (
                      <div className="absolute bottom-1.5 left-8 opacity-70">
                        <Star size={12} className="text-yellow-400 fill-yellow-200" />
                      </div>
                    )}

                    {day.isToday && (
                      <div className="absolute bottom-1.5 right-1.5">
                        <Heart size={12} className="text-pink-400 fill-pink-400 animate-bounce" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 justify-center">
             <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm text-xs font-medium text-gray-500">
               <Plus size={14} className="text-pink-400" />
               Click day to add events
             </div>
             <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm text-xs font-medium text-gray-500">
               <div className="w-2 h-2 rounded-full bg-pink-400"></div>
               Today
             </div>
             <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm text-xs font-medium text-gray-500">
               <CheckCircle2 size={12} className="text-purple-400" />
               Habit Logged
             </div>
             <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm text-xs font-medium text-gray-500">
               <Star size={12} className="text-yellow-400 fill-yellow-200" />
               White Days
             </div>
          </div>
        </main>
      </div>

      {/* Event Management Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border-4 border-pink-50">
            <div className="p-6 bg-gradient-to-r from-pink-50 to-blue-50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-gray-800">Events</h3>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{selectedDate}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Existing Events List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Star size={12} /> Scheduled
                </h4>
                {selectedDate && (events[selectedDate]?.length || 0) > 0 ? (
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-pink-100">
                    {events[selectedDate].map((event) => {
                      const style = EVENT_COLORS.find(c => c.name === event.color) || EVENT_COLORS[0];
                      return (
                        <div key={event.id} className={`flex items-center justify-between p-3 rounded-2xl border ${style.bg} ${style.border}`}>
                          <span className={`text-sm font-bold ${style.text}`}>{event.title}</span>
                          <button onClick={() => deleteEvent(selectedDate, event.id)} className="p-1.5 hover:bg-white/50 rounded-lg text-red-400 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No events planned for this day yet.</p>
                )}
              </div>

              <div className="h-px bg-gray-100"></div>

              {/* Add New Event Form */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">New Event</h4>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder="E.g. Coffee with Junu..."
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-pink-200 focus:bg-white rounded-2xl text-sm font-medium outline-none transition-all"
                  />
                  <div className="flex gap-2 justify-center">
                    {EVENT_COLORS.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setNewEventColor(c)}
                        className={`w-8 h-8 rounded-full border-4 transition-transform hover:scale-110 ${c.bg} ${newEventColor.name === c.name ? 'border-gray-800' : 'border-white'}`}
                      />
                    ))}
                  </div>
                  <button 
                    onClick={addEvent}
                    disabled={!newEventTitle.trim()}
                    className="w-full py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-black rounded-2xl shadow-lg shadow-pink-100 active:scale-95 transition-all disabled:opacity-50"
                  >
                    Add Event ✨
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
