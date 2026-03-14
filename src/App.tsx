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

  return (
    <div className="flex h-screen bg-[#0a0c10] text-white font-sans overflow-hidden">
      <Sidebar />
      <MainContent onOpenImageModal={() => setIsImageModalOpen(true)} />
      <RightSidebar />
      {isImageModalOpen && <ImageGeneratorModal onClose={() => setIsImageModalOpen(false)} />}
    </div>
  );
}
