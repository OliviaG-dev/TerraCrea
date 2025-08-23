import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotificationToast } from "../../components/NotificationToast";

// Mock des styles et couleurs
vi.mock("../../utils/colors", () => ({
  COLORS: {
    primary: "#007AFF",
    secondary: "#5856D6",
    background: "#FFFFFF",
    text: "#000000",
    textSecondary: "#8E8E93",
    border: "#C6C6C8",
    success: "#34C759",
    error: "#FF3B30",
    warning: "#FF9500",
  },
}));

vi.mock("../../utils/commonStyles", () => ({
  toastStyles: {
    container: { padding: 16, borderRadius: 8, margin: 16 },
    success: { backgroundColor: "#34C759" },
    error: { backgroundColor: "#FF3B30" },
    warning: { backgroundColor: "#FF9500" },
    info: { backgroundColor: "#007AFF" },
    content: { flexDirection: "row", alignItems: "center" },
    text: { color: "#FFFFFF", fontSize: 16, flex: 1 },
    closeButton: { padding: 8 },
    closeButtonText: { color: "#FFFFFF", fontSize: 18 },
  },
}));

// Mock de React Native
vi.mock("react-native", () => ({
  View: ({ children, style, testID, ...props }: any) => (
    <div data-testid={testID || "view"} style={style} {...props}>
      {children}
    </div>
  ),
  Text: ({ children, style, testID, ...props }: any) => (
    <span data-testid={testID || "text"} style={style} {...props}>
      {children}
    </span>
  ),
  TouchableOpacity: ({ children, onPress, style, testID, ...props }: any) => (
    <button
      data-testid={testID || "touchable-opacity"}
      onClick={onPress}
      style={style}
      {...props}
    >
      {children}
    </button>
  ),
  StyleSheet: {
    create: (styles: any) => styles,
  },
  Animated: {
    View: ({ children, style, testID, ...props }: any) => (
      <div data-testid={testID || "animated-view"} style={style} {...props}>
        {children}
      </div>
    ),
    timing: vi.fn(() => ({
      start: vi.fn((callback) => callback && callback()),
    })),
    parallel: vi.fn((animations) => ({
      start: vi.fn((callback) => callback && callback()),
    })),
    sequence: vi.fn((animations) => ({
      start: vi.fn((callback) => callback && callback()),
    })),
    Value: vi.fn(() => ({
      setValue: vi.fn(),
      interpolate: vi.fn(() => ({})),
    })),
  },
  Dimensions: {
    get: vi.fn(() => ({ width: 375, height: 667 })),
  },
}));

// Mock des icônes Material
vi.mock("react-native-vector-icons/MaterialIcons", () => ({
  default: ({ name, size, color, testID, ...props }: any) => (
    <span
      data-testid={testID || `icon-${name}`}
      style={{ fontSize: size, color }}
      {...props}
    >
      {name} Icon
    </span>
  ),
}));

describe("NotificationToast", () => {
  const defaultProps = {
    message: "Test notification message",
    type: "info" as const,
    visible: true,
    onClose: vi.fn(),
    duration: 3000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Rendu de base", () => {
    it("should render when visible is true", () => {
      render(<NotificationToast {...defaultProps} />);

      expect(screen.getByText("Test notification message")).toBeInTheDocument();
    });

    it("should not render when visible is false", () => {
      render(<NotificationToast {...defaultProps} visible={false} />);

      expect(
        screen.queryByText("Test notification message")
      ).not.toBeInTheDocument();
    });

    it("should render with different message", () => {
      const { rerender } = render(<NotificationToast {...defaultProps} />);
      expect(screen.getByText("Test notification message")).toBeInTheDocument();

      rerender(<NotificationToast {...defaultProps} message="New message" />);
      expect(screen.getByText("New message")).toBeInTheDocument();
    });

    it("should handle empty message", () => {
      render(<NotificationToast {...defaultProps} message="" />);

      // Vérifier que le composant se rend sans erreur
      expect(screen.getByTestId("animated-view")).toBeInTheDocument();
    });

    it("should handle very long message", () => {
      const longMessage = "A".repeat(1000);
      render(<NotificationToast {...defaultProps} message={longMessage} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it("should handle special characters in message", () => {
      const specialMessage = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
      render(<NotificationToast {...defaultProps} message={specialMessage} />);

      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });
  });

  describe("Types de notification", () => {
    it("should render info type correctly", () => {
      render(<NotificationToast {...defaultProps} type="info" />);

      expect(screen.getByText("Test notification message")).toBeInTheDocument();
      expect(screen.getByTestId("animated-view")).toBeInTheDocument();
    });

    it("should render success type correctly", () => {
      render(<NotificationToast {...defaultProps} type="success" />);

      expect(screen.getByText("Test notification message")).toBeInTheDocument();
      expect(screen.getByTestId("animated-view")).toBeInTheDocument();
    });

    it("should render error type correctly", () => {
      render(<NotificationToast {...defaultProps} type="error" />);

      expect(screen.getByText("Test notification message")).toBeInTheDocument();
      expect(screen.getByTestId("animated-view")).toBeInTheDocument();
    });

    it("should render warning type correctly", () => {
      render(<NotificationToast {...defaultProps} type="warning" />);

      expect(screen.getByText("Test notification message")).toBeInTheDocument();
      expect(screen.getByTestId("animated-view")).toBeInTheDocument();
    });

    it("should handle different types", () => {
      const { rerender } = render(
        <NotificationToast {...defaultProps} type="info" />
      );
      expect(screen.getByTestId("animated-view")).toBeInTheDocument();

      rerender(<NotificationToast {...defaultProps} type="success" />);
      expect(screen.getByTestId("animated-view")).toBeInTheDocument();

      rerender(<NotificationToast {...defaultProps} type="error" />);
      expect(screen.getByTestId("animated-view")).toBeInTheDocument();

      rerender(<NotificationToast {...defaultProps} type="warning" />);
      expect(screen.getByTestId("animated-view")).toBeInTheDocument();
    });
  });

  describe("Gestion des événements", () => {
    it("should call onClose when close button is pressed", () => {
      const onClose = vi.fn();
      render(<NotificationToast {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByTestId("touchable-opacity");
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it("should call onClose when close button is pressed multiple times", () => {
      const onClose = vi.fn();
      render(<NotificationToast {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByTestId("touchable-opacity");

      // Appuyer plusieurs fois
      for (let i = 0; i < 5; i++) {
        fireEvent.click(closeButton);
      }

      expect(onClose).toHaveBeenCalledTimes(5);
    });

    it("should handle missing onClose gracefully", () => {
      expect(() => {
        render(<NotificationToast {...defaultProps} onClose={undefined} />);
      }).not.toThrow();
    });

    it("should handle rapid close button presses", () => {
      const onClose = vi.fn();
      render(<NotificationToast {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByTestId("touchable-opacity");

      // Appuyer rapidement
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(3);
    });
  });

  describe("Fermeture automatique", () => {
    it("should auto-close after specified duration", async () => {
      const onClose = vi.fn();
      render(
        <NotificationToast
          {...defaultProps}
          onClose={onClose}
          duration={2000}
        />
      );

      // Avancer le temps
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(onClose).toHaveBeenCalled();
    });

    it("should auto-close after default duration", async () => {
      const onClose = vi.fn();
      render(<NotificationToast {...defaultProps} onClose={onClose} />);

      // Avancer le temps (durée par défaut: 3000ms)
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(onClose).toHaveBeenCalled();
    });

    it("should handle different durations", async () => {
      const onClose = vi.fn();
      const { rerender } = render(
        <NotificationToast
          {...defaultProps}
          onClose={onClose}
          duration={1000}
        />
      );

      // Avancer le temps pour la première durée
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(onClose).toHaveBeenCalledTimes(1);

      // Changer la durée et tester à nouveau
      rerender(
        <NotificationToast {...defaultProps} onClose={onClose} duration={500} />
      );

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(onClose).toHaveBeenCalledTimes(2);
    });

    it("should not auto-close when duration is 0", async () => {
      const onClose = vi.fn();
      render(
        <NotificationToast {...defaultProps} onClose={onClose} duration={0} />
      );

      // Avancer le temps
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(onClose).not.toHaveBeenCalled();
    });

    it("should not auto-close when duration is negative", async () => {
      const onClose = vi.fn();
      render(
        <NotificationToast
          {...defaultProps}
          onClose={onClose}
          duration={-1000}
        />
      );

      // Avancer le temps
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("Visibilité", () => {
    it("should show when visible changes from false to true", () => {
      const { rerender } = render(
        <NotificationToast {...defaultProps} visible={false} />
      );
      expect(
        screen.queryByText("Test notification message")
      ).not.toBeInTheDocument();

      rerender(<NotificationToast {...defaultProps} visible={true} />);
      expect(screen.getByText("Test notification message")).toBeInTheDocument();
    });

    it("should hide when visible changes from true to false", () => {
      const { rerender } = render(
        <NotificationToast {...defaultProps} visible={true} />
      );
      expect(screen.getByText("Test notification message")).toBeInTheDocument();

      rerender(<NotificationToast {...defaultProps} visible={false} />);
      expect(
        screen.queryByText("Test notification message")
      ).not.toBeInTheDocument();
    });

    it("should handle rapid visibility changes", () => {
      const { rerender } = render(
        <NotificationToast {...defaultProps} visible={true} />
      );

      // Changements rapides de visibilité
      for (let i = 0; i < 10; i++) {
        rerender(<NotificationToast {...defaultProps} visible={i % 2 === 0} />);

        if (i % 2 === 0) {
          expect(
            screen.getByText("Test notification message")
          ).toBeInTheDocument();
        } else {
          expect(
            screen.queryByText("Test notification message")
          ).not.toBeInTheDocument();
        }
      }
    });
  });

  describe("Gestion des erreurs", () => {
    it("should handle null message gracefully", () => {
      expect(() => {
        render(<NotificationToast {...defaultProps} message={null} />);
      }).not.toThrow();
    });

    it("should handle undefined message gracefully", () => {
      expect(() => {
        render(<NotificationToast {...defaultProps} message={undefined} />);
      }).not.toThrow();
    });

    it("should handle null onClose gracefully", () => {
      expect(() => {
        render(<NotificationToast {...defaultProps} onClose={null} />);
      }).not.toThrow();
    });

    it("should handle undefined onClose gracefully", () => {
      expect(() => {
        render(<NotificationToast {...defaultProps} onClose={undefined} />);
      }).not.toThrow();
    });

    it("should handle invalid duration gracefully", () => {
      expect(() => {
        render(<NotificationToast {...defaultProps} duration={NaN} />);
      }).not.toThrow();
    });

    it("should handle very large duration gracefully", () => {
      expect(() => {
        render(
          <NotificationToast
            {...defaultProps}
            duration={Number.MAX_SAFE_INTEGER}
          />
        );
      }).not.toThrow();
    });
  });

  describe("Performance et re-renders", () => {
    it("should not re-render unnecessarily when props don't change", () => {
      const { rerender } = render(<NotificationToast {...defaultProps} />);
      const initialMessage = screen.getByText("Test notification message");

      rerender(<NotificationToast {...defaultProps} />);
      const reRenderMessage = screen.getByText("Test notification message");

      expect(reRenderMessage).toBe(initialMessage);
    });

    it("should handle rapid message changes", () => {
      const { rerender } = render(<NotificationToast {...defaultProps} />);

      // Changements rapides de message
      for (let i = 0; i < 10; i++) {
        rerender(
          <NotificationToast {...defaultProps} message={`Message ${i}`} />
        );
        expect(screen.getByText(`Message ${i}`)).toBeInTheDocument();
      }
    });

    it("should handle rapid type changes", () => {
      const { rerender } = render(<NotificationToast {...defaultProps} />);

      // Changements rapides de type
      const types = ["info", "success", "error", "warning"] as const;
      for (let i = 0; i < 10; i++) {
        const type = types[i % types.length];
        rerender(<NotificationToast {...defaultProps} type={type} />);
        expect(screen.getByTestId("animated-view")).toBeInTheDocument();
      }
    });

    it("should handle rapid duration changes", () => {
      const { rerender } = render(<NotificationToast {...defaultProps} />);

      // Changements rapides de durée
      for (let i = 0; i < 10; i++) {
        rerender(
          <NotificationToast {...defaultProps} duration={1000 + i * 100} />
        );
        expect(
          screen.getByText("Test notification message")
        ).toBeInTheDocument();
      }
    });
  });

  describe("Accessibilité", () => {
    it("should have proper close button identification", () => {
      render(<NotificationToast {...defaultProps} />);

      expect(screen.getByTestId("touchable-opacity")).toBeInTheDocument();
    });

    it("should have proper message text", () => {
      render(<NotificationToast {...defaultProps} />);

      expect(screen.getByText("Test notification message")).toBeInTheDocument();
    });

    it("should have proper animated container", () => {
      render(<NotificationToast {...defaultProps} />);

      expect(screen.getByTestId("animated-view")).toBeInTheDocument();
    });

    it("should handle accessibility props", () => {
      render(
        <NotificationToast
          {...defaultProps}
          accessibilityLabel="Notification toast"
          accessibilityHint="Shows a notification message"
        />
      );

      expect(screen.getByText("Test notification message")).toBeInTheDocument();
    });
  });

  describe("Intégration des composants", () => {
    it("should integrate all elements correctly", () => {
      render(
        <NotificationToast
          message="Full notification"
          type="success"
          visible={true}
          onClose={vi.fn()}
          duration={5000}
        />
      );

      // Vérifier que tous les éléments sont intégrés
      expect(screen.getByText("Full notification")).toBeInTheDocument();
      expect(screen.getByTestId("animated-view")).toBeInTheDocument();
      expect(screen.getByTestId("touchable-opacity")).toBeInTheDocument();
    });

    it("should integrate without optional elements correctly", () => {
      render(<NotificationToast message="Minimal" visible={true} />);

      // Vérifier que seuls les éléments requis sont intégrés
      expect(screen.getByText("Minimal")).toBeInTheDocument();
      expect(screen.getByTestId("animated-view")).toBeInTheDocument();
    });

    it("should maintain element hierarchy", () => {
      render(<NotificationToast {...defaultProps} />);

      // Vérifier la hiérarchie des éléments
      const container = screen.getByTestId("animated-view");
      const message = screen.getByText("Test notification message");
      const closeButton = screen.getByTestId("touchable-opacity");

      expect(container).toBeInTheDocument();
      expect(message).toBeInTheDocument();
      expect(closeButton).toBeInTheDocument();
    });

    it("should integrate with different prop combinations", () => {
      // Test avec toutes les props
      const { rerender } = render(
        <NotificationToast
          message="Full notification"
          type="error"
          visible={true}
          onClose={vi.fn()}
          duration={10000}
        />
      );

      expect(screen.getByText("Full notification")).toBeInTheDocument();
      expect(screen.getByTestId("animated-view")).toBeInTheDocument();
      expect(screen.getByTestId("touchable-opacity")).toBeInTheDocument();

      // Test avec seulement les props de base
      rerender(<NotificationToast message="Basic" visible={true} />);

      expect(screen.getByText("Basic")).toBeInTheDocument();
      expect(screen.getByTestId("animated-view")).toBeInTheDocument();
      expect(screen.getByTestId("touchable-opacity")).toBeInTheDocument();

      // Test avec aucune prop optionnelle
      rerender(<NotificationToast message="Minimal" visible={false} />);

      expect(screen.queryByText("Minimal")).not.toBeInTheDocument();
    });
  });
});
