import './index.css';

export { BrainbaseWidget } from './components/BrainbaseWidget';
export type { BrainbaseWidgetProps } from './components/BrainbaseWidget';

export { useBrainbaseChat } from './hooks/useBrainbaseChat';
export type {
  UseBrainbaseChatProps,
  BrainbaseChatContext,
  WidgetState,
  WidgetBranding,
} from './hooks/useBrainbaseChat';

export { BRAINBASE_BACKEND_URL } from './constants';
export { getSafeBackendUrl } from './utils/security';
