import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, AlertCircle, X } from 'lucide-react';

declare global {
  interface Window {
    electronAPI: {
      getAppVersion: () => Promise<string>;
      checkForUpdates: () => Promise<void>;
      onUpdateMessage: (callback: (event: any, message: string) => void) => void;
      removeUpdateListener: (callback: (event: any, message: string) => void) => void;
      platform: string;
      version: any;
    };
  }
}

interface UpdateNotificationProps {
  isVisible: boolean;
  onClose: () => void;
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({ isVisible, onClose }) => {
  const [updateMessage, setUpdateMessage] = useState<string>('');
  const [appVersion, setAppVersion] = useState<string>('');
  const [isChecking, setIsChecking] = useState<boolean>(false);

  useEffect(() => {
    // Get app version on mount
    const getVersion = async () => {
      try {
        if (window.electronAPI) {
          const version = await window.electronAPI.getAppVersion();
          setAppVersion(version);
        }
      } catch (error) {
        console.error('Failed to get app version:', error);
      }
    };

    getVersion();

    // Listen for update messages
    const handleUpdateMessage = (event: any, message: string) => {
      setUpdateMessage(message);
      // Only stop checking if it's not a progress message
      if (!message.includes('Download') && !message.includes('%')) {
        setIsChecking(false);
      }
    };

    if (window.electronAPI) {
      window.electronAPI.onUpdateMessage(handleUpdateMessage);
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeUpdateListener(handleUpdateMessage);
      }
    };
  }, []);

  const handleCheckForUpdates = async () => {
    setIsChecking(true);
    setUpdateMessage('Checking for updates...');

    try {
      if (window.electronAPI) {
        await window.electronAPI.checkForUpdates();
      }
    } catch (error) {
      setUpdateMessage('Failed to check for updates');
      setIsChecking(false);
    }
  };

  const getStatusIcon = () => {
    if (isChecking) return <Download className="w-5 h-5 text-blue-500 animate-pulse" />;
    if (updateMessage.includes('Update available')) return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    if (updateMessage.includes('downloaded')) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (updateMessage.includes('failed') || updateMessage.includes('error') || updateMessage.includes('Error')) {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
    if (updateMessage.includes('not available') || updateMessage.includes('up to date')) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <CheckCircle className="w-5 h-5 text-gray-500" />;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-white rounded-lg shadow-lg border border-moss-monochrome-sage-veil p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <h3 className="font-semibold text-moss-monochrome-deep-fern">
              App Updates
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-moss-monochrome-pine-vault hover:text-moss-monochrome-deep-fern"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-moss-monochrome-pine-vault">
            Current version: {appVersion || 'Loading...'}
          </div>

          {updateMessage && (
            <div className="text-sm text-moss-monochrome-deep-fern bg-moss-monochrome-mist-canopy p-2 rounded">
              {updateMessage}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleCheckForUpdates}
              disabled={isChecking}
              className="flex-1 bg-moss-primary-green text-white px-3 py-2 rounded text-sm hover:bg-moss-monochrome-pine-vault disabled:opacity-50"
            >
              {isChecking ? 'Checking...' : 'Check for Updates'}
            </button>
          </div>
        </div>

        <div className="mt-3 text-xs text-moss-monochrome-sage-veil">
          Updates are checked automatically on startup
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;
