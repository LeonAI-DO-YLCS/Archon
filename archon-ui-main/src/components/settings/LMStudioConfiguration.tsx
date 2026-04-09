import React, { useState, useEffect } from 'react';
import { Settings, Save, Check, Loader, Server, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../../features/shared/hooks/useToast';
import { lmstudioService } from '../../services/lmstudioService';
import { credentialsService } from '../../services/credentialsService';

interface LMStudioConfigurationProps {
  onConfigChange: () => void;
}

export const LMStudioConfiguration: React.FC<LMStudioConfigurationProps> = ({ onConfigChange }) => {
  const [baseUrl, setBaseUrl] = useState('http://host.docker.internal:1234/v1');
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    models?: number;
  } | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const config = await credentialsService.getLMStudioConfig();
      if (config.baseUrl) {
        setBaseUrl(config.baseUrl);
      }
    } catch (error) {
      console.error('Failed to load LMStudio config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await credentialsService.saveLMStudioConfig({ baseUrl });
      showToast('LMStudio configuration saved', 'success');
      onConfigChange();
      // Auto-test after save
      handleTestConnection();
    } catch (error) {
      showToast('Failed to save configuration', 'error');
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      
      // First save the config to ensure backend uses the URL we are testing if it relies on settings
      // validating directly via service
      const validation = await lmstudioService.validateInstance(baseUrl);

      if (validation.is_valid) {
        setTestResult({
          success: true,
          message: `Connected successfully (${validation.response_time_ms?.toFixed(0)}ms)`,
          models: validation.models_available
        });
        showToast(`Connected to LMStudio: ${validation.models_available} models available`, 'success');
      } else {
         setTestResult({
          success: false,
          message: validation.error_message || 'Connection failed'
        });
        showToast('Failed to connect to LMStudio', 'error');
      }

    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed'
      });
      showToast('Connection test failed', 'error');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 flex justify-center items-center">
        <Loader className="w-6 h-6 animate-spin text-blue-500" />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Server className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              LMStudio Configuration
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Connect to your local LMStudio instance
            </p>
          </div>
        </div>
      </div>

      <Card className="p-6 space-y-4 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            API Base URL
          </label>
          <div className="flex gap-2">
            <Input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="http://localhost:1234/v1"
              className="font-mono text-sm"
            />
            <Button
              onClick={handleSave}
              variant="default"
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Default is usually http://localhost:1234/v1 (or http://host.docker.internal:1234/v1 for Docker)
          </p>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleTestConnection}
                disabled={testing}
                variant="outline"
                className="flex items-center gap-2"
              >
                {testing ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Test Connection
              </Button>
              
              {testResult && (
                <div className={`flex items-center gap-2 text-sm ${
                  testResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {testResult.success ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  {testResult.message}
                  {testResult.models !== undefined && (
                    <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-xs font-medium ml-2 text-gray-600 dark:text-gray-400">
                      {testResult.models} Models
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
