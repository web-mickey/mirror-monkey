"use client";

import { useState } from "react";
import { SignInButton, UserButton, useUser, useWallet } from "@civic/auth-web3/react";
import { FaCog, FaTimes } from "react-icons/fa";

export const Header = () => {
  const { user, isAuthenticated } = useUser();
  const { address } = useWallet({ type: "ethereum" });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [positionSize, setPositionSize] = useState("");

  const handleSaveSettings = () => {
    // Store settings in localStorage or state management
    localStorage.setItem(
      "tradingSettings",
      JSON.stringify({
        positionSize: parseFloat(positionSize) || 0,
      }),
    );
    setIsSettingsOpen(false);
    alert("Settings saved!");
  };

  return (
    <div className="topbar">
      <div className="topbar-spacer"></div>
      <div className="topbar-center">
        <div className="topbar-title">🐒 MirrorMonkey</div>
        <div className="topbar-subtitle">
          <span className="hidden sm:inline">Multichain Perps Aggregator With Copytrading</span>
          <span className="sm:hidden">Multichain Perps Copytrading</span>
        </div>
      </div>
      <div className="topbar-auth">
        {isAuthenticated ? (
          <>
            <div className="user-info">
              {user?.email && <span className="hidden sm:inline">{user.email}</span>}
              {address && (
                <span className="ml-2">
                  <span className="sm:hidden">
                    {address.slice(0, 4)}...{address.slice(-2)}
                  </span>
                  <span className="hidden sm:inline">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                </span>
              )}
            </div>
            <UserButton className="logout-button" />
            <button className="settings-button" onClick={() => setIsSettingsOpen(true)} title="Trading Settings">
              <FaCog />
            </button>
          </>
        ) : (
          <>
            <SignInButton className="auth-button" />
            <button className="settings-button" onClick={() => setIsSettingsOpen(true)} title="Trading Settings">
              <FaCog />
            </button>
          </>
        )}
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="modal-overlay" onClick={() => setIsSettingsOpen(false)}>
          <div className="modal-content mx-4 max-w-md sm:mx-auto" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title text-lg sm:text-xl">Trading Settings</h2>
              <button className="close-button text-lg sm:text-xl" onClick={() => setIsSettingsOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="form-group">
              <label className="form-label text-sm sm:text-base">Position Size (USD)</label>
              <input
                type="number"
                className="form-input text-sm sm:text-base"
                placeholder="Enter position size in dollars"
                value={positionSize}
                onChange={e => setPositionSize(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                className="modern-btn modern-btn-outline text-xs sm:text-sm px-3 sm:px-4 py-2"
                onClick={() => setIsSettingsOpen(false)}
              >
                Cancel
              </button>
              <button
                className="modern-btn modern-btn-active text-xs sm:text-sm px-3 sm:px-4 py-2"
                onClick={handleSaveSettings}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
