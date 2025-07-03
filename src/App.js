// App.js
import React, { useState, useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { motion, AnimatePresence } from "framer-motion";

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });

  const [darkMode, setDarkMode] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("General");
  const [filter, setFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("");

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const completedCount = tasks.filter(t => t.done).length;
  const progress = tasks.length ? (completedCount / tasks.length) * 100 : 0;

useEffect(() => {
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  const checkTasks = () => {
    const now = new Date();
    const updatedTasks = tasks.map(task => {
      if (task.dueDate && !task.done && !task.notified) {
        const due = new Date(task.dueDate);
        const diff = due.getTime() - now.getTime();
        if (diff <= 60 * 60 * 1000 && diff > 0) {
          new Notification("⏰ Task Reminder!", {
            body: `Task "${task.text}" is due soon!`
          });
          return { ...task, notified: true };
        }
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  const interval = setInterval(checkTasks, 60000);
  return () => clearInterval(interval);
}, [tasks]);


  const saveTask = () => {
    if (transcript.trim()) {
      const newTask = {
        text: transcript.trim(),
        done: false,
        pinned: false,
        dueDate: dueDate || null,
        category: category || "General"
      };
      setTasks([...tasks, newTask]);
      resetTranscript();
      setDueDate("");
      setCategory("General");
    }
  };

  const toggleTaskDone = index => {
    const updated = [...tasks];
    updated[index].done = !updated[index].done;
    setTasks(updated);
  };

  const deleteTask = index => {
    const updated = [...tasks];
    updated.splice(index, 1);
    setTasks(updated);
  };

  const togglePinTask = index => {
    const updated = [...tasks];
    updated[index].pinned = !updated[index].pinned;
    setTasks(updated);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "All") return true;
    if (filter === "Pinned") return task.pinned;
    if (filter === "Completed") return task.done;
    if (filter === "Incomplete") return !task.done;
    return true;
  }).filter(task => {
    if (!categoryFilter || categoryFilter === "All") return true;
    return task.category === categoryFilter;
  });

  const sortedTasks = filteredTasks.sort((a, b) => {
    if (a.pinned === b.pinned) {
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      return 0;
    }
    return b.pinned - a.pinned;
  });

  const uniqueCategories = [...new Set(tasks.map(t => t.category))];

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <p>Your browser does not support speech recognition.</p>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? "dark" : ""} min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 dark:from-gray-900 dark:to-gray-800 p-4 flex flex-col items-center`}>
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-4 right-4 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-full"
      >
        {darkMode ? "☀️ Light" : "🌙 Dark"}
      </button>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-8">
        <h1 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 text-center mb-4">
          🎙️ Voice To-Do
        </h1>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>{completedCount} done</span>
            <span>{tasks.length} total</span>
          </div>
          <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-2 justify-center">
          {["All", "Pinned", "Completed", "Incomplete"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 rounded-full text-xs ${filter === f ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 dark:text-gray-300"}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="mb-4">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full p-2 rounded border bg-white dark:bg-gray-800"
          >
            <option value="All">All Categories</option>
            {uniqueCategories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Voice Input */}
        <p className="text-sm text-center mb-1">
          Status:{" "}
          <span className={`font-medium ${listening ? "text-green-600" : "text-gray-700 dark:text-gray-300"}`}>
            {listening ? "Listening..." : "Click Start"}
          </span>
        </p>
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded mb-4 min-h-[50px]">
          {transcript}
        </div>

        {/* Category & Due Date */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full mb-2 p-2 rounded border bg-white dark:bg-gray-800"
        >
          <option>General</option>
          <option>Work</option>
          <option>Personal</option>
          <option>Shopping</option>
        </select>
        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full mb-4 p-2 rounded border bg-white dark:bg-gray-800"
        />

        {/* Voice Buttons */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => SpeechRecognition.startListening({ continuous: true })}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Start</button>
          <button onClick={SpeechRecognition.stopListening}
            className="flex-1 bg-yellow-500 text-white py-2 rounded-lg">Stop</button>
          <button onClick={resetTranscript}
            className="flex-1 bg-gray-300 py-2 rounded-lg">Reset</button>
        </div>

        <button onClick={saveTask}
          className="w-full bg-blue-500 text-white py-2 rounded-lg mb-4">Save Task</button>

        {/* Task List */}
        <AnimatePresence>
          <ul className="space-y-2">
            {sortedTasks.map((task, index) => (
              <motion.li
                key={task.text + index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                layout
                className={`flex justify-between items-center px-4 py-2 rounded shadow 
                  ${task.done ? "bg-blue-200 dark:bg-blue-900 line-through opacity-60" : "bg-blue-100 dark:bg-blue-800"}
                `}
              >
                <div>
                  <p onClick={() => toggleTaskDone(index)} className="cursor-pointer text-blue-800 dark:text-blue-200">✅ {task.text}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{task.category} {task.dueDate ? "| Due: " + new Date(task.dueDate).toLocaleString() : ""}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => togglePinTask(index)} className="text-yellow-500 hover:text-yellow-600">{task.pinned ? "📌" : "📍"}</button>
                  <button onClick={() => deleteTask(index)} className="text-red-500 hover:text-red-700">❌</button>
                </div>
              </motion.li>
            ))}
          </ul>
        </AnimatePresence>
      </div>
    </div>
  );
}
