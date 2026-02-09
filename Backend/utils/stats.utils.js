/**
 * Calcule les statistiques mensuelles en pourcentage
 * @param {Array} currentData - Données du mois actuel
 * @param {Array} lastMonthData - Données du mois dernier
 * @returns {string} Statistique formatée avec le signe + ou - et le pourcentage
 */
export const calculateMonthlyStat = (currentCount, lastMonthCount) => {
  if (lastMonthCount === 0) {
    // Si pas de données le mois dernier, c'est une augmentation de 100%
    return currentCount > 0 ? "+100%" : "0%";
  }

  const difference = currentCount - lastMonthCount;
  const percentage = Math.round((difference / lastMonthCount) * 100);

  if (percentage > 0) {
    return `+${percentage}%`;
  } else if (percentage < 0) {
    return `${percentage}%`;
  } else {
    return "0%";
  }
};

/**
 * Obtient les dates du mois actuel et du mois dernier
 * @returns {object} Objet avec startOfCurrentMonth, endOfCurrentMonth, startOfLastMonth, endOfLastMonth
 */
export const getMonthlyDateRange = () => {
  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  return {
    startOfCurrentMonth,
    endOfCurrentMonth,
    startOfLastMonth,
    endOfLastMonth,
  };
};
