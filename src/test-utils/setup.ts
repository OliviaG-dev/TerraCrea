// Configuration globale simple pour commencer
global.console = {
  ...console,
  // Ignorer les warnings en tests
  warn: jest.fn(),
  error: jest.fn(),
};
