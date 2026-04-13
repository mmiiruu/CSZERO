"use client";

import React, { useState, useEffect } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(1);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const target = 41; // เลขเป้าหมาย
    const duration = 2000; // เวลาที่ใช้โหลด (มิลลิวินาที) -> 2 วินาที
    const intervalTime = duration / target;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= target) {
          clearInterval(timer);
          // เมื่อถึง 41 ให้รอสักแป๊บ แล้วค่อยเฟดหน้าจอออก
          setTimeout(() => {
            setIsFading(true);
            setTimeout(() => onComplete(), 500); // รอเฟดเสร็จค่อยเรียก onComplete
          }, 300);
          return target;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  // คำนวณเปอร์เซ็นต์ของหลอดโหลด (1 ถึง 41 = 0% ถึง 100%)
  const percentage = ((progress - 1) / 40) * 100;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-500 ease-in-out ${
        isFading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* ตัวเลขวิ่งเรืองแสง */}
      <div 
        className="text-8xl md:text-[9rem] font-bold mb-8 select-none"
        style={{
          color: "#39ff14", // สีหลักเขียวนีออน
          textShadow: "0 0 10px #39ff14, 0 0 20px #39ff14, 0 0 40px #39ff14, 0 0 80px #00ff00",
        }}
      >
        {progress}
      </div>

      {/* กรอบของแถบโหลด */}
      <div 
        className="w-64 md:w-96 h-2 md:h-3 rounded-full overflow-hidden relative bg-gray-900 border border-[#39ff14]/30"
        style={{
          boxShadow: "0 0 15px rgba(57, 255, 20, 0.2)"
        }}
      >
        {/* หลอดที่วิ่ง */}
        <div 
          className="h-full rounded-full transition-all duration-75 ease-linear bg-[#39ff14]"
          style={{ 
            width: `${percentage}%`,
            boxShadow: "0 0 10px #39ff14, 0 0 20px #39ff14"
          }}
        />
      </div>
    </div>
  );
}
