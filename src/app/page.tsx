"use client";

import { useState, useCallback, useRef } from "react";

// API Key - 生产环境应该通过环境变量或用户输入
const REMOVE_BG_API_KEY = process.env.NEXT_PUBLIC_REMOVE_BG_API_KEY || "";

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxSize = 25 * 1024 * 1024; // 25MB

  const validateFile = (file: File): string | null => {
    if (!validTypes.includes(file.type)) {
      return "仅支持 JPG / PNG / WebP 格式";
    }
    if (file.size > maxSize) {
      return "图片大小不能超过 25MB";
    }
    return null;
  };

  const handleFile = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Reset state
    setError(null);
    setResultUrl(null);
    setIsLoading(true);

    // Show preview
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    try {
      // 直接调用 Remove.bg API
      const formData = new FormData();
      formData.append("image_file", file, file.name);
      formData.append("size", "auto");

      const response = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": REMOVE_BG_API_KEY,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "处理失败，请重试";
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.errors && errorJson.errors[0]) {
            errorMessage = errorJson.errors[0].title || errorMessage;
          }
        } catch {
          // Keep default message
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "处理失败，请重试");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDownload = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `no-bg-${Date.now()}.png`;
    a.click();
  }, [resultUrl]);

  const handleReset = useCallback(() => {
    setPreviewUrl(null);
    setResultUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🖼️ 图片背景移除
          </h1>
          <p className="text-purple-200">
            基于 AI 的智能抠图工具 · 一键去除背景
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Upload Zone */}
          {!previewUrl && (
            <div
              className={`border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragging
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-6xl mb-4">📤</div>
              <p className="text-gray-600 text-lg mb-2">
                点击或拖拽上传图片
              </p>
              <p className="text-gray-400 text-sm">
                支持 JPG / PNG / WebP · 最大 25MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleInputChange}
                className="hidden"
              />
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">正在处理中，请稍候...</p>
            </div>
          )}

          {/* Preview & Result */}
          {previewUrl && !isLoading && (
            <div className="space-y-6">
              {/* Image Preview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original */}
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">原图</p>
                  <div className="bg-gray-100 rounded-xl p-4">
                    <img
                      src={previewUrl}
                      alt="原图"
                      className="max-w-full max-h-64 mx-auto rounded-lg shadow"
                    />
                  </div>
                </div>

                {/* Result */}
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">处理结果</p>
                  <div
                    className="bg-gray-100 rounded-xl p-4 min-h-[200px] flex items-center justify-center"
                    style={{
                      backgroundImage: "linear-gradient(45deg, #e5e5e5 25%, transparent 25%), linear-gradient(-45deg, #e5e5e5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e5e5 75%), linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)",
                      backgroundSize: "20px 20px",
                      backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px"
                    }}
                  >
                    {resultUrl ? (
                      <img
                        src={resultUrl}
                        alt="处理结果"
                        className="max-w-full max-h-64 mx-auto rounded-lg shadow"
                      />
                    ) : error ? (
                      <p className="text-red-500">处理失败</p>
                    ) : (
                      <p className="text-gray-400">等待处理</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                {resultUrl && (
                  <button
                    onClick={handleDownload}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <span>⬇️</span>
                    <span>下载无背景图片</span>
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  重新上传
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-center">
              ❌ {error}
            </div>
          )}

          {/* Features */}
          <div className="mt-8 pt-8 border-t border-gray-100">
            <h3 className="text-center text-gray-700 font-medium mb-4">
              ✨ 产品特色
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-3xl mb-2">🚀</div>
                <div className="text-sm text-gray-600">极速处理</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-3xl mb-2">🔒</div>
                <div className="text-sm text-gray-600">隐私安全</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-3xl mb-2">💯</div>
                <div className="text-sm text-gray-600">高清输出</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-purple-200 text-sm mt-6">
          Powered by Remove.bg API
        </p>
      </div>
    </main>
  );
}