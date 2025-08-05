/**
 * Utilitaires pour la gestion du temps et la synchronisation d'horloge
 */

// Fonction pour vérifier si l'heure locale est synchronisée
export const checkTimeSync = async (): Promise<{
  isSynchronized: boolean;
  localTime: Date;
  serverTime?: Date;
  timeDiff?: number;
}> => {
  try {
    const localTime = new Date();

    // Essayer de récupérer l'heure du serveur via une requête simple
    // Note: Cette approche peut ne pas fonctionner selon la configuration CORS
    const response = await fetch("https://worldtimeapi.org/api/ip");
    if (response.ok) {
      const data = await response.json();
      const serverTime = new Date(data.datetime);
      const timeDiff = Math.abs(localTime.getTime() - serverTime.getTime());

      // Considérer comme synchronisé si la différence est inférieure à 5 minutes
      const isSynchronized = timeDiff < 5 * 60 * 1000;

      return {
        isSynchronized,
        localTime,
        serverTime,
        timeDiff,
      };
    }

    // Si on ne peut pas récupérer l'heure du serveur, on suppose que c'est OK
    return {
      isSynchronized: true,
      localTime,
    };
  } catch (error) {
    return {
      isSynchronized: true, // Par défaut, on suppose que c'est OK
      localTime: new Date(),
    };
  }
};

// Fonction pour formater l'heure locale
export const formatLocalTime = (date: Date): string => {
  return date.toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// Fonction pour afficher un message d'aide pour la synchronisation d'heure
export const getTimeSyncHelpMessage = (): string => {
  return `Problème de synchronisation d'horloge détecté.

Pour résoudre ce problème :

1. Vérifiez que l'heure de votre appareil est correcte
2. Activez la synchronisation automatique de l'heure
3. Redémarrez l'application

Heure actuelle : ${formatLocalTime(new Date())}`;
};

// Fonction pour vérifier si une erreur Supabase est liée à un problème d'heure
export const isTimeSyncError = (error: any): boolean => {
  if (!error || !error.message) return false;

  const message = error.message.toLowerCase();
  return (
    message.includes("issued in the future") ||
    message.includes("clock for skew") ||
    message.includes("session expired") ||
    message.includes("invalid token")
  );
};
