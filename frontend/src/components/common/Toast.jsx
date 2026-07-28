import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Toast = ({ toast }) => {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 bg-slate-900/90 text-white backdrop-blur-md px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700/50"
        >
          <span className="text-2xl">{toast.icon}</span>
          <div>
            <h4 className="font-semibold text-sm text-white">{toast.title}</h4>
            <p className="text-xs text-indigo-200">{toast.message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
