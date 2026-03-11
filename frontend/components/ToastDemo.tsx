import React from 'react';
import { useToast } from '../contexts/ToastContext';
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';

/**
 * ToastDemo Component
 * 
 * A simple demo page to test the global toast notification system.
 * Add this route to your App.tsx to test:
 * 
 * <Route path="/toast-demo" element={<ToastDemo />} />
 */
const ToastDemo: React.FC = () => {
  const toast = useToast();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Toast Notification Demo</h1>
        <p className="text-gray-400">
          Test the global toast notification system. Click any button below to trigger a toast.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Success Toast */}
        <button
          onClick={() => toast.success('Article published successfully!')}
          className="flex items-center gap-3 p-6 bg-green-950/30 border border-green-700/40 rounded-xl hover:bg-green-950/40 transition-all group"
        >
          <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
          <div className="text-left">
            <div className="font-semibold text-green-400 mb-1">Success Toast</div>
            <div className="text-xs text-gray-400">Shows positive feedback</div>
          </div>
        </button>

        {/* Error Toast */}
        <button
          onClick={() => toast.error('Failed to delete topic. Please try again.')}
          className="flex items-center gap-3 p-6 bg-red-950/30 border border-red-700/40 rounded-xl hover:bg-red-950/40 transition-all group"
        >
          <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
          <div className="text-left">
            <div className="font-semibold text-red-400 mb-1">Error Toast</div>
            <div className="text-xs text-gray-400">Shows error messages</div>
          </div>
        </button>

        {/* Warning Toast */}
        <button
          onClick={() => toast.warning('This action cannot be undone!')}
          className="flex items-center gap-3 p-6 bg-yellow-950/30 border border-yellow-700/40 rounded-xl hover:bg-yellow-950/40 transition-all group"
        >
          <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
          <div className="text-left">
            <div className="font-semibold text-yellow-400 mb-1">Warning Toast</div>
            <div className="text-xs text-gray-400">Shows warnings</div>
          </div>
        </button>

        {/* Info Toast */}
        <button
          onClick={() => toast.info('New articles are pending review.')}
          className="flex items-center gap-3 p-6 bg-cyan-950/30 border border-cyan-700/40 rounded-xl hover:bg-cyan-950/40 transition-all group"
        >
          <Info className="w-6 h-6 text-cyan-400 flex-shrink-0" />
          <div className="text-left">
            <div className="font-semibold text-cyan-400 mb-1">Info Toast</div>
            <div className="text-xs text-gray-400">Shows information</div>
          </div>
        </button>
      </div>

      {/* Multiple Toasts Test */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="font-semibold mb-3">Test Multiple Toasts</h3>
        <p className="text-sm text-gray-400 mb-4">
          Click this button to trigger multiple toasts at once. They will stack vertically.
        </p>
        <button
          onClick={() => {
            toast.success('First toast!');
            setTimeout(() => toast.info('Second toast!'), 200);
            setTimeout(() => toast.warning('Third toast!'), 400);
            setTimeout(() => toast.error('Fourth toast!'), 600);
          }}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-sm font-semibold transition-colors"
        >
          Trigger Multiple Toasts
        </button>
      </div>

      {/* Custom Duration Test */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="font-semibold mb-3">Custom Duration</h3>
        <p className="text-sm text-gray-400 mb-4">
          Test toasts with different durations (default is 3 seconds).
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => toast.success('1 second toast', 1000)}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm transition-colors"
          >
            1s Toast
          </button>
          <button
            onClick={() => toast.info('3 seconds (default)', 3000)}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm transition-colors"
          >
            3s Toast
          </button>
          <button
            onClick={() => toast.warning('5 seconds toast', 5000)}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm transition-colors"
          >
            5s Toast
          </button>
          <button
            onClick={() => toast.error('10 seconds toast', 10000)}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm transition-colors"
          >
            10s Toast
          </button>
        </div>
      </div>

      {/* Usage Example */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="font-semibold mb-3">Usage in Your Code</h3>
        <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 text-xs overflow-x-auto">
          <code className="text-cyan-400">{`import { useToast } from '../contexts/ToastContext';

const YourComponent = () => {
  const toast = useToast();

  const handleAction = async () => {
    try {
      await someApiCall();
      toast.success('Action completed!');
    } catch (err) {
      toast.error('Something went wrong!');
    }
  };

  return <button onClick={handleAction}>Do Something</button>;
};`}</code>
        </pre>
      </div>
    </div>
  );
};

export default ToastDemo;
