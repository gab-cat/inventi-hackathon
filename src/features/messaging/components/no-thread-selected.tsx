'use client';

import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function NoThreadSelected() {
  return (
    <div className='h-full flex items-center justify-center'>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className='text-center'
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
        >
          <MessageCircle className='h-16 w-16 text-gray-400 mx-auto mb-4' />
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className='text-lg font-medium text-gray-900 mb-2'
        >
          Select a conversation
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className='text-gray-500'
        >
          Choose a conversation from the sidebar to start messaging.
        </motion.p>
      </motion.div>
    </div>
  );
}
