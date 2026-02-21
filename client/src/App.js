import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/todos';

// Time blocks with motivational quotes and theme colors
const TIME_BLOCKS = {
  morning: {
    title: 'Morning Focus (5:00 AM - 11:00 AM)',
    quote: 'The early morning has gold in its mouth. - Benjamin Franklin',
    priorityColor: '#ff6b35',
    theme: {
      background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 25%, #fdc830 50%, #f37335 75%, #ff6b35 100%)',
      containerBg: 'rgba(255, 255, 255, 0.95)',
      accentColor: '#ff6b35',
      secondaryColor: '#f7931e',
      textColor: '#2c3e50',
      shadowColor: 'rgba(255, 107, 53, 0.2)',
      buttonGradient: 'linear-gradient(135deg, #ff6b35, #f7931e)',
      hoverColor: '#ff5722'
    }
  },
  afternoon: {
    title: 'Afternoon Productivity (12:00 PM - 5:00 PM)',
    quote: 'Focus on being productive instead of busy. - Tim Ferriss',
    priorityColor: '#ffc107',
    theme: {
      background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 25%, #fff59d 50%, #ffeb3b 75%, #ffd700 100%)',
      containerBg: 'rgba(255, 255, 255, 0.95)',
      accentColor: '#ffc107',
      secondaryColor: '#ff9800',
      textColor: '#2c3e50',
      shadowColor: 'rgba(255, 193, 7, 0.2)',
      buttonGradient: 'linear-gradient(135deg, #ffc107, #ff9800)',
      hoverColor: '#ffb300'
    }
  },
  evening: {
    title: 'Evening Wind-down (6:00 PM - 10:00 PM)',
    quote: 'The evening is the time for reflection and renewal. - Unknown',
    priorityColor: '#5c6bc0',
    theme: {
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      containerBg: 'rgba(15, 12, 41, 0.95)',
      accentColor: '#5c6bc0',
      secondaryColor: '#3f51b5',
      textColor: '#000000',
      shadowColor: 'rgba(92, 107, 192, 0.3)',
      buttonGradient: 'linear-gradient(135deg, #5c6bc0, #3f51b5)',
      hoverColor: '#3f51b5'
    }
  }
};

// Common timezones
const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: 0 },
  { value: 'America/New_York', label: 'New York (EST/EDT)', offset: -5 },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)', offset: -6 },
  { value: 'America/Denver', label: 'Denver (MST/MDT)', offset: -7 },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)', offset: -8 },
  { value: 'Europe/London', label: 'London (GMT/BST)', offset: 0 },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)', offset: 1 },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)', offset: 1 },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 9 },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)', offset: 8 },
  { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: 4 },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', offset: 8 },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)', offset: 10 },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)', offset: 12 }
];

// Daily routine templates for new days
const DAILY_ROUTINES = {
  morning: [
    { title: 'Morning meditation and mindfulness', isPriority: true },
    { title: 'Hydration and morning stretch', isPriority: false },
    { title: 'Review daily goals and priorities', isPriority: true },
    { title: 'Healthy breakfast preparation', isPriority: false }
  ],
  afternoon: [
    { title: 'Focused deep work session', isPriority: true },
    { title: 'Team communication and updates', isPriority: false },
    { title: 'Skill development or learning', isPriority: false },
    { title: 'Email and message management', isPriority: false }
  ],
  evening: [
    { title: 'Evening reflection and gratitude', isPriority: true },
    { title: 'Light exercise or walk', isPriority: false },
    { title: 'Reading or personal development', isPriority: false },
    { title: 'Plan tomorrow\'s schedule', isPriority: false }
  ]
};

// Main activity templates by day of week
const MAIN_ACTIVITIES = {
  0: 'Sunday: Family time and relaxation',
  1: 'Monday: Weekly planning and goal setting',
  2: 'Tuesday: Project deep work and focus',
  3: 'Wednesday: Mid-week review and adjustments',
  4: 'Thursday: Creative work and innovation',
  5: 'Friday: Weekly wrap-up and celebration',
  6: 'Saturday: Personal projects and hobbies'
};

// Calendar utility functions
const getDaysInMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getFirstDayOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

// Function to generate daily routine tasks for a specific date
const generateDailyRoutine = (date) => {
  const dateKey = formatDateKey(date);
  const dayOfWeek = date.getDay();
  const mainActivity = MAIN_ACTIVITIES[dayOfWeek];
  
  const routineTasks = [];
  
  // Add main activity as a priority task in morning
  routineTasks.push({
    title: mainActivity,
    timeBlock: 'morning',
    isPriority: true,
    completed: false,
    scheduledDate: dateKey,
    createdAt: new Date().toISOString()
  });
  
  // Add daily routine tasks
  Object.entries(DAILY_ROUTINES).forEach(([timeBlock, tasks]) => {
    tasks.forEach(task => {
      routineTasks.push({
        title: task.title,
        timeBlock: timeBlock,
        isPriority: task.isPriority,
        completed: false,
        scheduledDate: dateKey,
        createdAt: new Date().toISOString()
      });
    });
  });
  
  return routineTasks;
};

// Function to check if a date has routine tasks and generate them if needed
const ensureDailyRoutine = async (date, existingTodos, setTodos) => {
  const dateKey = formatDateKey(date);
  const existingTasksForDate = existingTodos.filter(todo => todo.scheduledDate === dateKey);
  
  // Check if this date already has routine tasks (has more than 2 tasks)
  if (existingTasksForDate.length > 2) {
    return; // Already has routine tasks
  }
  
  // Only generate routines for future dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  if (targetDate <= today) {
    return; // Don't generate for past or today
  }
  
  try {
    // Generate routine tasks
    const routineTasks = generateDailyRoutine(date);
    
    // Add each task to the backend
    for (const task of routineTasks) {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });
      
      if (response.ok) {
        const newTask = await response.json();
        setTodos(prevTodos => [...prevTodos, newTask]);
      }
    }
    
    console.log(`Generated daily routine for ${dateKey}`);
  } catch (error) {
    console.error('Error generating daily routine:', error);
  }
};

const formatDateKey = (date) => {
  return date.toISOString().split('T')[0];
};

const getWeekDates = (date) => {
  const week = [];
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day;
  startOfWeek.setDate(diff);
  
  for (let i = 0; i < 7; i++) {
    const weekDate = new Date(startOfWeek);
    weekDate.setDate(startOfWeek.getDate() + i);
    week.push(new Date(weekDate));
  }
  return week;
};

const getMonthDates = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = getFirstDayOfMonth(date);
  const daysInMonth = getDaysInMonth(date);
  const dates = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    dates.push(null);
  }
  
  // Add all days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    dates.push(new Date(year, month, i));
  }
  
  return dates;
};

function CalendarSidebar({ 
  selectedDate, 
  onDateSelect, 
  todos, 
  calendarView, 
  onCalendarViewChange,
  showCalendar,
  onToggleCalendar,
  setTodos,
  currentTheme
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const [isGeneratingRoutine, setIsGeneratingRoutine] = useState(false);
  
  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };
  
  const navigateWeek = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    onDateSelect(newDate);
  };
  
  const handleDateSelect = async (date) => {
    onDateSelect(date);
    
    // Generate routine for future dates if needed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    if (targetDate > today) {
      setIsGeneratingRoutine(true);
      await ensureDailyRoutine(date, todos, setTodos);
      setIsGeneratingRoutine(false);
    }
  };
  
  const getTodosForDate = (date) => {
    const dateKey = formatDateKey(date);
    return todos.filter(todo => todo.scheduledDate === dateKey);
  };
  
  const isToday = (date) => {
    const today = new Date();
    return formatDateKey(date) === formatDateKey(today);
  };
  
  const isSelected = (date) => {
    return formatDateKey(date) === formatDateKey(selectedDate);
  };
  
  const renderMonthView = () => {
    const dates = getMonthDates(currentMonth);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="calendar-month-view" style={{ 
        background: 'rgba(255, 255, 255, 0.5)',
        borderColor: currentTheme.accentColor + '20'
      }}>
        <div className="calendar-header" style={{ borderBottomColor: currentTheme.accentColor + '40' }}>
          <button 
            onClick={() => navigateMonth(-1)} 
            className="nav-btn"
            style={{
              background: currentTheme.accentColor + '10',
              borderColor: currentTheme.accentColor + '30',
              color: currentTheme.accentColor
            }}
          >
            ‹
          </button>
          <h3 style={{ color: currentTheme.textColor }}>
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button 
            onClick={() => navigateMonth(1)} 
            className="nav-btn"
            style={{
              background: currentTheme.accentColor + '10',
              borderColor: currentTheme.accentColor + '30',
              color: currentTheme.accentColor
            }}
          >
            ›
          </button>
        </div>
        
        <div className="week-days">
          {weekDays.map(day => (
            <div key={day} className="week-day" style={{ color: currentTheme.textColor + '80' }}>{day}</div>
          ))}
        </div>
        
        <div className="calendar-days">
          {dates.map((date, index) => (
            <div
              key={index}
              className={`calendar-day ${!date ? 'empty' : ''} ${date && isToday(date) ? 'today' : ''} ${date && isSelected(date) ? 'selected' : ''}`}
              onClick={() => date && handleDateSelect(date)}
              style={{
                borderColor: date && isToday(date) ? currentTheme.accentColor : (date ? currentTheme.accentColor + '20' : 'transparent'),
                background: date && isSelected(date) ? currentTheme.buttonGradient : (date && isToday(date) ? currentTheme.accentColor + '20' : 'rgba(255, 255, 255, 0.8)'),
                color: date && isSelected(date) ? 'white' : currentTheme.textColor
              }}
            >
              {date && (
                <>
                  <span className="day-number" style={{ 
                    fontWeight: isToday(date) || isSelected(date) ? '700' : '500',
                    color: isSelected(date) ? 'white' : (isToday(date) ? currentTheme.accentColor : 'inherit')
                  }}>{date.getDate()}</span>
                  {getTodosForDate(date).length > 0 && (
                    <span className="task-indicator" style={{ 
                      background: isSelected(date) ? 'rgba(255, 255, 255, 0.9)' : currentTheme.secondaryColor,
                      color: isSelected(date) ? currentTheme.accentColor : 'white'
                    }}>{getTodosForDate(date).length}</span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const renderWeekView = () => {
    const weekDates = getWeekDates(selectedDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="calendar-week-view" style={{ 
        background: 'rgba(255, 255, 255, 0.5)',
        borderColor: currentTheme.accentColor + '20'
      }}>
        <div className="calendar-header" style={{ borderBottomColor: currentTheme.accentColor + '40' }}>
          <button 
            onClick={() => navigateWeek(-1)} 
            className="nav-btn"
            style={{
              background: currentTheme.accentColor + '10',
              borderColor: currentTheme.accentColor + '30',
              color: currentTheme.accentColor
            }}
          >
            ‹
          </button>
          <h3 style={{ color: currentTheme.textColor }}>Week View</h3>
          <button 
            onClick={() => navigateWeek(1)} 
            className="nav-btn"
            style={{
              background: currentTheme.accentColor + '10',
              borderColor: currentTheme.accentColor + '30',
              color: currentTheme.accentColor
            }}
          >
            ›
          </button>
        </div>
        
        <div className="week-days">
          {weekDays.map(day => (
            <div key={day} className="week-day" style={{ color: currentTheme.textColor + '80' }}>{day}</div>
          ))}
        </div>
        
        <div className="week-dates">
          {weekDates.map((date, index) => (
            <div
              key={index}
              className={`week-date ${isToday(date) ? 'today' : ''} ${isSelected(date) ? 'selected' : ''}`}
              onClick={() => handleDateSelect(date)}
              style={{
                borderColor: isToday(date) ? currentTheme.accentColor : currentTheme.accentColor + '20',
                background: isSelected(date) ? currentTheme.accentColor + '20' : (isToday(date) ? currentTheme.accentColor + '10' : 'rgba(255, 255, 255, 0.8)')
              }}
            >
              <div className="date-header" style={{ borderBottomColor: currentTheme.accentColor + '30' }}>
                <span className="day-number" style={{ 
                  color: isToday(date) ? currentTheme.accentColor : currentTheme.textColor,
                  fontWeight: isToday(date) ? '700' : '600'
                }}>{date.getDate()}</span>
                <span className="month-name" style={{ color: currentTheme.textColor + '70' }}>
                  {date.toLocaleDateString('en-US', { month: 'short' })}
                </span>
              </div>
              <div className="date-todos">
                {getTodosForDate(date).slice(0, 3).map(todo => (
                  <div key={todo.id} className="mini-todo" style={{ 
                    background: 'rgba(255, 255, 255, 0.6)',
                    borderColor: currentTheme.accentColor + '20'
                  }}>
                    <span className={`priority-dot ${todo.isPriority ? 'priority' : ''}`} style={{ 
                      background: todo.isPriority ? currentTheme.accentColor : '#e0e0e0'
                    }}></span>
                    <span className="mini-todo-text" style={{ color: currentTheme.textColor }}>
                      {todo.title}
                    </span>
                  </div>
                ))}
                {getTodosForDate(date).length > 3 && (
                  <div className="more-todos" style={{ color: currentTheme.textColor + '60' }}>
                    +{getTodosForDate(date).length - 3} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className={`calendar-sidebar ${showCalendar ? 'open' : 'closed'}`} style={{
      background: 'rgba(255, 255, 255, 0.95)',
      borderColor: currentTheme.accentColor + '20'
    }}>
      <div className="calendar-header" style={{ borderBottomColor: currentTheme.accentColor + '40' }}>
        <h3 style={{ color: currentTheme.accentColor }}>📅 Calendar</h3>
        <button 
          onClick={onToggleCalendar} 
          className="toggle-btn"
          style={{ color: currentTheme.accentColor }}
        >
          {showCalendar ? '×' : '📅'}
        </button>
      </div>
      
      {showCalendar && (
        <>
          <div className="view-switcher">
            <button
              onClick={() => onCalendarViewChange('month')}
              className={`view-btn ${calendarView === 'month' ? 'active' : ''}`}
              style={{
                background: calendarView === 'month' ? currentTheme.buttonGradient : 'rgba(255, 255, 255, 0.8)',
                color: calendarView === 'month' ? 'white' : currentTheme.accentColor,
                borderColor: currentTheme.accentColor + '30'
              }}
            >
              Month
            </button>
            <button
              onClick={() => onCalendarViewChange('week')}
              className={`view-btn ${calendarView === 'week' ? 'active' : ''}`}
              style={{
                background: calendarView === 'week' ? currentTheme.buttonGradient : 'rgba(255, 255, 255, 0.8)',
                color: calendarView === 'week' ? 'white' : currentTheme.accentColor,
                borderColor: currentTheme.accentColor + '30'
              }}
            >
              Week
            </button>
          </div>
          
          <div className="calendar-content">
            {isGeneratingRoutine && (
              <div className="routine-loading" style={{
                background: currentTheme.accentColor + '10',
                borderColor: currentTheme.accentColor + '20'
              }}>
                <div className="loading-spinner" style={{ color: currentTheme.accentColor }}>
                  <span className="spinner" style={{ borderTopColor: currentTheme.accentColor }}></span>
                  Generating daily routine...
                </div>
              </div>
            )}
            {calendarView === 'month' ? renderMonthView() : renderWeekView()}
          </div>
          
          <div className="selected-date-info" style={{
            background: `linear-gradient(135deg, ${currentTheme.accentColor}10, ${currentTheme.secondaryColor}10)`,
            borderLeftColor: currentTheme.accentColor
          }}>
            <h4 style={{ color: currentTheme.accentColor }}>
              Selected: {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h4>
            <p style={{ color: currentTheme.textColor + '60' }}>
              {getTodosForDate(selectedDate).length} tasks scheduled
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function WorldClock({ selectedTimezone, onTimezoneChange, currentTheme }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getTimeInTimezone = (timezone) => {
    try {
      const options = {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      };
      return new Intl.DateTimeFormat('en-US', options).format(currentTime);
    } catch (error) {
      return 'Invalid timezone';
    }
  };

  const getTimezoneOffset = (timezone) => {
    try {
      const tz = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'short'
      });
      const parts = tz.formatToParts(currentTime);
      const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value || '';
      return timeZoneName;
    } catch (error) {
      return '';
    }
  };

  const getLocalTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getLocalDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="world-clock" style={{ 
      background: currentTheme.containerBg,
      borderColor: currentTheme.accentColor + '30'
    }}>
      <div className="clock-header" style={{ borderBottomColor: currentTheme.accentColor + '40' }}>
        <h3 style={{ color: currentTheme.accentColor }}>🌍 World Clock</h3>
        <div className="local-time">
          <span className="local-label">Local Time:</span>
          <span className="local-time-value" style={{ color: currentTheme.textColor }}>{getLocalTime()}</span>
          <span className="local-date" style={{ color: currentTheme.accentColor }}>{getLocalDate()}</span>
        </div>
      </div>
      
      <div className="timezone-selector">
        <select 
          value={selectedTimezone} 
          onChange={(e) => onTimezoneChange(e.target.value)}
          className="timezone-select"
          style={{ 
            borderColor: currentTheme.accentColor + '40',
            color: currentTheme.textColor
          }}
        >
          <option value="">Select a timezone...</option>
          {TIMEZONES.map(tz => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>

      {selectedTimezone && (
        <div className="timezone-display" style={{ 
          background: `linear-gradient(135deg, ${currentTheme.accentColor}10, ${currentTheme.secondaryColor}10)`,
          borderLeftColor: currentTheme.accentColor
        }}>
          <div className="timezone-time" style={{ color: currentTheme.textColor }}>
            {getTimeInTimezone(selectedTimezone)}
          </div>
          <div className="timezone-info">
            <span className="timezone-name" style={{ color: currentTheme.accentColor }}>
              {TIMEZONES.find(tz => tz.value === selectedTimezone)?.label.split(' (')[0]}
            </span>
            <span className="timezone-offset" style={{ 
              background: currentTheme.containerBg,
              color: currentTheme.textColor
            }}>
              {getTimezoneOffset(selectedTimezone)}
            </span>
          </div>
        </div>
      )}

      <div className="quick-timezones">
        {TIMEZONES.slice(0, 6).map(tz => (
          <button
            key={tz.value}
            onClick={() => onTimezoneChange(tz.value)}
            className={`quick-tz-btn ${selectedTimezone === tz.value ? 'active' : ''}`}
            title={tz.label}
            style={{
              borderColor: currentTheme.accentColor + '40',
              color: selectedTimezone === tz.value ? 'white' : currentTheme.accentColor,
              background: selectedTimezone === tz.value ? currentTheme.buttonGradient : 'rgba(255, 255, 255, 0.7)'
            }}
          >
            {tz.label.split(' (')[0]}
          </button>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [selectedTimeBlock, setSelectedTimeBlock] = useState('morning');
  const [selectedTimezone, setSelectedTimezone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(true);
  const [calendarView, setCalendarView] = useState('month'); // 'month' or 'week'

  // Apply theme to body
  useEffect(() => {
    const currentTheme = TIME_BLOCKS[selectedTimeBlock].theme;
    document.body.style.background = currentTheme.background;
    document.body.style.color = currentTheme.textColor;
    
    // Add or remove evening theme class
    if (selectedTimeBlock === 'evening') {
      document.body.classList.add('evening-theme');
    } else {
      document.body.classList.remove('evening-theme');
    }
    
    return () => {
      // Cleanup if needed
    };
  }, [selectedTimeBlock]);

  // Fetch all todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      console.log('Fetched todos:', data); // Debug log
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    
    // Validation
    const trimmedTodo = newTodo.trim();
    if (!trimmedTodo) {
      setFeedback({ message: 'Please enter a task description', type: 'error' });
      setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
      return;
    }
    
    if (trimmedTodo.length < 2) {
      setFeedback({ message: 'Task must be at least 2 characters long', type: 'error' });
      setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
      return;
    }
    
    if (trimmedTodo.length > 200) {
      setFeedback({ message: 'Task must be less than 200 characters', type: 'error' });
      setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
      return;
    }
    
    // Check for duplicate tasks in current time block
    const isDuplicate = todos.some(todo => 
      todo.timeBlock === selectedTimeBlock && 
      todo.title.toLowerCase() === trimmedTodo.toLowerCase()
    );
    
    if (isDuplicate) {
      setFeedback({ message: 'This task already exists in this time block', type: 'warning' });
      setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
      return;
    }
    
    setIsLoading(true);
    setFeedback({ message: '', type: '' });
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title: trimmedTodo,
          timeBlock: selectedTimeBlock,
          isPriority: false,
          completed: false,
          createdAt: new Date().toISOString(),
          scheduledDate: formatDateKey(selectedDate)
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const addedTodo = await response.json();
      console.log('Response from server:', addedTodo); // Debug log
      setTodos(prevTodos => {
        const newTodos = [...prevTodos, addedTodo];
        console.log('Updated todos:', newTodos); // Debug log
        return newTodos;
      });
      setNewTodo('');
      setFeedback({ message: 'Task added successfully!', type: 'success' });
      
      // Clear success message after 2 seconds
      setTimeout(() => setFeedback({ message: '', type: '' }), 2000);
      
    } catch (error) {
      console.error('Error adding todo:', error);
      setFeedback({ message: 'Failed to add task. Please try again.', type: 'error' });
      setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTodo = async (id) => {
    const todo = todos.find(t => t.id === id);
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      const updatedTodo = await response.json();
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      setTodos(todos.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const startEditing = (id, title) => {
    setEditingId(id);
    setEditingText(title);
  };

  const saveEdit = async (id) => {
    if (!editingText.trim()) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editingText }),
      });
      const updatedTodo = await response.json();
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
      setEditingId(null);
      setEditingText('');
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const togglePriority = async (id) => {
    const todo = todos.find(t => t.id === id);
    const newPriority = !todo.isPriority;
    
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPriority: newPriority }),
      });
      const updatedTodo = await response.json();
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
    } catch (error) {
      console.error('Error toggling priority:', error);
    }
  };

  // Group todos by time block and date
  const getTodosByTimeBlock = (timeBlock) => {
    const selectedDateKey = formatDateKey(selectedDate);
    return todos.filter(todo => 
      todo.timeBlock === timeBlock && 
      todo.scheduledDate === selectedDateKey
    );
  };

  const getTaskStats = (timeBlock) => {
    const blockTodos = getTodosByTimeBlock(timeBlock);
    const completed = blockTodos.filter(t => t.completed).length;
    const total = blockTodos.length;
    return { completed, total };
  };

  const currentTheme = TIME_BLOCKS[selectedTimeBlock].theme;

  return (
    <div className="App">
      {/* Floating Calendar Toggle Button */}
      <button 
        className={`floating-calendar-btn ${showCalendar ? 'active' : ''}`}
        onClick={() => setShowCalendar(!showCalendar)}
        title={showCalendar ? 'Hide Calendar' : 'Show Calendar'}
        style={{
          background: showCalendar ? currentTheme.buttonGradient : 'rgba(255, 255, 255, 0.9)',
          color: showCalendar ? 'white' : currentTheme.accentColor,
          borderColor: currentTheme.accentColor + '40',
          boxShadow: showCalendar ? `0 12px 35px ${currentTheme.shadowColor}` : `0 8px 25px ${currentTheme.shadowColor}`
        }}
      >
        📅
      </button>
      
      <CalendarSidebar
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        todos={todos}
        calendarView={calendarView}
        onCalendarViewChange={setCalendarView}
        showCalendar={showCalendar}
        onToggleCalendar={() => setShowCalendar(!showCalendar)}
        setTodos={setTodos}
        currentTheme={currentTheme}
      />
      
      <div className="main-content">
        <div className="container" style={{ 
          background: currentTheme.containerBg,
          boxShadow: `0 20px 40px ${currentTheme.shadowColor}`
        }}>
          <div className="header-section">
            <h1 style={{ color: currentTheme.textColor }}>Daily Structured To-Do List</h1>
            <div className="date-selector" style={{
              background: 'rgba(255, 255, 255, 0.5)',
              borderColor: currentTheme.accentColor + '40'
            }}>
              <button 
                onClick={() => setSelectedDate(new Date())} 
                className="today-btn"
                style={{
                  background: currentTheme.buttonGradient,
                  boxShadow: `0 5px 15px ${currentTheme.shadowColor}`
                }}
              >
                Today
              </button>
              <span 
                className="selected-date-display"
                style={{ color: currentTheme.accentColor }}
              >
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <WorldClock 
              selectedTimezone={selectedTimezone} 
              onTimezoneChange={setSelectedTimezone}
              currentTheme={currentTheme}
            />
          </div>
        
        <div className="time-block-selector">
          {Object.keys(TIME_BLOCKS).map(block => (
            <button
              key={block}
              onClick={() => setSelectedTimeBlock(block)}
              className={`time-block-btn ${selectedTimeBlock === block ? 'active' : ''}`}
              style={{
                background: selectedTimeBlock === block ? currentTheme.buttonGradient : 'rgba(255, 255, 255, 0.7)',
                color: selectedTimeBlock === block ? 'white' : currentTheme.accentColor,
                borderColor: currentTheme.accentColor + '40'
              }}
            >
              {block === 'morning' ? '🌅 Morning' : block === 'afternoon' ? '☀️ Afternoon' : '🌙 Evening'}
            </button>
          ))}
        </div>

        {Object.entries(TIME_BLOCKS).map(([blockKey, blockData]) => (
          <div key={blockKey} className={`time-block ${selectedTimeBlock === blockKey ? 'active' : 'hidden'}`}>
            <div className="time-block-header" style={{ borderBottomColor: currentTheme.accentColor + '40' }}>
              <h2 style={{ color: currentTheme.textColor }}>{blockData.title}</h2>
              <div className="task-stats" style={{ background: currentTheme.buttonGradient }}>
                {getTaskStats(blockKey).completed}/{getTaskStats(blockKey).total} completed
              </div>
            </div>
            
            {/* Feedback Message */}
            {feedback.message && (
              <div className={`feedback-message ${feedback.type}`}>
                {feedback.message}
              </div>
            )}
            
            <form onSubmit={addTodo} className="add-form">
              <div className="input-wrapper">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder={`Add a task for ${blockKey}...`}
                  className={`todo-input ${feedback.type === 'error' ? 'error' : ''}`}
                  style={{
                    borderColor: feedback.type === 'error' ? '#dc3545' : currentTheme.accentColor + '40',
                    color: currentTheme.textColor,
                    background: 'rgba(255, 255, 255, 0.9)'
                  }}
                  disabled={isLoading}
                  maxLength={200}
                />
                <div className="input-hint">
                  {newTodo.length}/200 characters
                </div>
              </div>
              <button 
                type="submit" 
                className={`add-btn ${isLoading ? 'loading' : ''}`}
                style={{ background: currentTheme.buttonGradient }}
                disabled={isLoading || !newTodo.trim()}
              >
                {isLoading ? (
                  <span className="loading-spinner">
                    <span className="spinner"></span>
                    Adding...
                  </span>
                ) : (
                  'Add Task'
                )}
              </button>
            </form>

            <ul className="todo-list">
              {getTodosByTimeBlock(blockKey).map(todo => (
                <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''} ${todo.isPriority ? 'priority' : ''}`}>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="todo-checkbox"
                    style={{ accentColor: currentTheme.accentColor }}
                  />
                  
                  {todo.isPriority && (
                    <span className="priority-badge" style={{ background: `linear-gradient(135deg, ${blockData.priorityColor}, ${currentTheme.secondaryColor})` }}>
                      ⭐ Priority
                    </span>
                  )}
                  
                  {editingId === todo.id ? (
                    <div className="edit-form">
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="edit-input"
                        style={{
                          borderColor: currentTheme.accentColor,
                          color: currentTheme.textColor
                        }}
                      />
                      <button onClick={() => saveEdit(todo.id)} className="save-btn" style={{ background: currentTheme.buttonGradient }}>Save</button>
                      <button onClick={cancelEdit} className="cancel-btn">Cancel</button>
                    </div>
                  ) : (
                    <>
                      <span 
                        className="todo-text"
                        onDoubleClick={() => startEditing(todo.id, todo.title)}
                        style={{ color: currentTheme.textColor }}
                      >
                        {todo.title}
                      </span>
                      <div className="todo-actions">
                        <button 
                          onClick={() => togglePriority(todo.id)} 
                          className={`priority-btn ${todo.isPriority ? 'priority-active' : ''}`}
                          title={todo.isPriority ? 'Remove priority' : 'Set as priority'}
                          style={{
                            background: todo.isPriority ? blockData.priorityColor : currentTheme.accentColor
                          }}
                        >
                          {todo.isPriority ? '⭐' : '☆'}
                        </button>
                        <button 
                          onClick={() => startEditing(todo.id, todo.title)} 
                          className="edit-btn"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => deleteTodo(todo.id)} 
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>

            {getTodosByTimeBlock(blockKey).length === 0 && (
              <div className="empty-state" style={{ borderColor: currentTheme.accentColor + '40' }}>
                <p style={{ color: currentTheme.accentColor }}>No tasks scheduled for this time block.</p>
                <p style={{ color: currentTheme.textColor }}>Add 5-7 focused tasks to maximize productivity!</p>
              </div>
            )}

            <div className="motivational-quote" style={{ 
              background: `linear-gradient(135deg, ${currentTheme.accentColor}10, ${currentTheme.secondaryColor}10)`,
              borderLeftColor: currentTheme.accentColor
            }}>
              <p style={{ color: currentTheme.accentColor }}>"{blockData.quote}"</p>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}

export default App;
