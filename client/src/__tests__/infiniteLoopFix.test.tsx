import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useGameStore } from '../store/gameStore';

// Mock all components to avoid import issues
jest.mock('../components/MainMenu', () => {
  return function MockMainMenu() {
    return <div>Bot Royale Main Menu</div>;
  };
});

jest.mock('../components/BotBuilder', () => {
  return function MockBotBuilder() {
    return <div>Bot Builder</div>;
  };
});

jest.mock('../components/Matchmaking', () => {
  return function MockMatchmaking() {
    return <div>Matchmaking</div>;
  };
});

jest.mock('../components/BattleArena', () => {
  return function MockBattleArena() {
    return <div>Battle Arena</div>;
  };
});

jest.mock('../components/ResultsScreen', () => {
  return function MockResultsScreen() {
    return <div>Results Screen</div>;
  };
});

jest.mock('../components/NotificationSystem', () => {
  return function MockNotificationSystem() {
    return <div>Notifications</div>;
  };
});

jest.mock('../components/LoadingScreen', () => {
  return function MockLoadingScreen() {
    return <div>Loading</div>;
  };
});

jest.mock('../components/ConnectionStatus', () => {
  return function MockConnectionStatus() {
    return <div>Connection Status</div>;
  };
});

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Import App after mocking
import App from '../App';

describe('Infinite Loop Fix Tests', () => {
  beforeEach(() => {
    // Reset the store before each test
    useGameStore.getState().reset();
    // Clear any console spies
    jest.clearAllMocks();
  });

  test('App component initializes without infinite loops', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Render the App component
    const { getByText } = render(<App />);

    // Wait for initial effects to complete
    await waitFor(() => {
      expect(getByText('Bot Royale Main Menu')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Check that no React infinite loop errors occurred
    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('Maximum update depth exceeded')
    );

    consoleSpy.mockRestore();
  });

  test('setConnected does not cause infinite loops', async () => {
    const { setConnected } = useGameStore.getState();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Call setConnected multiple times rapidly
    act(() => {
      setConnected(true);
      setConnected(false);
      setConnected(true);
    });

    // Wait for any potential side effects
    await waitFor(() => {
      expect(useGameStore.getState().isConnected).toBe(true);
    });

    // Check that no infinite loop errors occurred
    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('Maximum update depth exceeded')
    );

    consoleSpy.mockRestore();
  });

  test('notification actions do not cause infinite loops', async () => {
    const { addNotification, saveBotConfig, startMatchmaking } = useGameStore.getState();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Test various actions that add notifications
    act(() => {
      addNotification({
        type: 'info',
        title: 'Test',
        message: 'Test message',
        duration: 1000
      });

      saveBotConfig({
        id: 'test-bot',
        name: 'Test Bot',
        chassis: {
          id: 'chassis_1',
          type: 'MEDIUM' as any,
          stats: {
            health: 100,
            armor: 20,
            speed: 5,
            weaponSlots: 2,
            energyCapacity: 100,
            mass: 80
          }
        },
        weapons: [],
        defensiveModules: [],
        utilityModules: [],
        customization: {
          primaryColor: '#ff0000',
          secondaryColor: '#00ff00',
          pattern: 'solid'
        }
      });

      startMatchmaking('RANKED' as any);
    });

    // Wait for notifications to be processed
    await waitFor(() => {
      const notifications = useGameStore.getState().uiState.notifications;
      expect(notifications.length).toBeGreaterThan(0);
    });

    // Check that no infinite loop errors occurred
    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('Maximum update depth exceeded')
    );

    consoleSpy.mockRestore();
  });

  test('store actions are properly deferred to prevent cascading updates', async () => {
    const { setConnected } = useGameStore.getState();

    // Track the number of notifications before and after
    const initialNotificationCount = useGameStore.getState().uiState.notifications.length;

    act(() => {
      setConnected(true);
    });

    // Immediately after the action, notifications should not be added yet
    expect(useGameStore.getState().uiState.notifications.length).toBe(initialNotificationCount);

    // Wait for the deferred notification to be added
    await waitFor(() => {
      expect(useGameStore.getState().uiState.notifications.length).toBe(initialNotificationCount + 1);
    }, { timeout: 1000 });

    // Verify the notification was added correctly
    const notifications = useGameStore.getState().uiState.notifications;
    const lastNotification = notifications[notifications.length - 1];
    expect(lastNotification.title).toBe('Connected');
  });

  test('multiple rapid state updates do not cause infinite loops', async () => {
    const { setCurrentScreen, setLoading, setError } = useGameStore.getState();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Rapidly call multiple state-updating actions
    act(() => {
      for (let i = 0; i < 10; i++) {
        setCurrentScreen('menu');
        setLoading(true);
        setError('Test error');
        setLoading(false);
        setError(undefined);
        setCurrentScreen('bot_builder');
      }
    });

    // Wait for all updates to settle
    await waitFor(() => {
      expect(useGameStore.getState().uiState.currentScreen).toBe('bot_builder');
    });

    // Check that no infinite loop errors occurred
    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('Maximum update depth exceeded')
    );

    consoleSpy.mockRestore();
  });

  test('useEffect in App component only runs once', async () => {
    const originalSetPlayer = useGameStore.getState().setPlayer;
    const originalSetConnected = useGameStore.getState().setConnected;

    const setPlayerSpy = jest.fn(originalSetPlayer);
    const setConnectedSpy = jest.fn(originalSetConnected);

    // Mock the store actions to track calls
    act(() => {
      useGameStore.setState({
        setPlayer: setPlayerSpy,
        setConnected: setConnectedSpy
      });
    });

    render(<App />);

    // Wait for the effect to run
    await waitFor(() => {
      expect(setPlayerSpy).toHaveBeenCalledTimes(1);
      expect(setConnectedSpy).toHaveBeenCalledTimes(1);
    }, { timeout: 1000 });

    // Restore original functions
    act(() => {
      useGameStore.setState({
        setPlayer: originalSetPlayer,
        setConnected: originalSetConnected
      });
    });
  });
});
