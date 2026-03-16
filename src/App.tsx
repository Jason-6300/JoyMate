/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import MainContent from './components/MainContent';
import ImageGeneratorModal from './components/ImageGeneratorModal';

export default function App() {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [quickPrompt, setQuickPrompt] = useState<{ id: number; text: string } | null>(null);

  return (
    <div className="flex h-screen bg-[#0a0c10] text-white font-sans overflow-hidden">
      <Sidebar onPresetQuestion={(text) => setQuickPrompt({ id: Date.now(), text })} />
      <MainContent onOpenImageModal={() => setIsImageModalOpen(true)} quickPrompt={quickPrompt} />
      <RightSidebar />
      {isImageModalOpen && <ImageGeneratorModal onClose={() => setIsImageModalOpen(false)} />}
    </div>
  );
}
