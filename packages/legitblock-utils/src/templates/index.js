import { FOR_PROFIT_TEMPLATES } from "./forProfit.js";
import { NON_PROFIT_TEMPLATES } from "./nonProfit.js";
import { COOPERATIVE_TEMPLATES } from "./cooperative.js";

export { FOR_PROFIT_TEMPLATES, NON_PROFIT_TEMPLATES, COOPERATIVE_TEMPLATES };

/**
 * Complete list of all 32+ organization templates
 */
export const ALL_TEMPLATES = [
  ...FOR_PROFIT_TEMPLATES,
  ...NON_PROFIT_TEMPLATES,
  ...COOPERATIVE_TEMPLATES
];

/**
 * Get organization template by its ID
 * @param {string} templateId
 * @returns {object|null}
 */
export function getTemplateById(templateId) {
  return ALL_TEMPLATES.find(t => t.id === templateId) || null;
}

/**
 * Filter templates by category
 * @param {"for-profit"|"non-profit"|"cooperative"} category
 * @returns {Array<object>}
 */
export function getTemplatesByCategory(category) {
  return ALL_TEMPLATES.filter(t => t.category === category);
}

/**
 * Search templates by query keyword
 * @param {string} query
 * @returns {Array<object>}
 */
export function searchTemplates(query = "") {
  if (!query) return ALL_TEMPLATES;
  const q = query.toLowerCase().trim();
  return ALL_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q) ||
    t.id.toLowerCase().includes(q)
  );
}

/**
 * Get all available categories with counts
 * @returns {Array<{ id: string, name: string, count: number }>}
 */
export function getTemplateCategories() {
  return [
    {
      id: "for-profit",
      name: "For-Profit Businesses",
      description: "Corporations, LLCs, and partnerships for commercial enterprise.",
      count: FOR_PROFIT_TEMPLATES.length
    },
    {
      id: "non-profit",
      name: "Non-Profit Organizations",
      description: "501(c)(3) charities, foundations, civic leagues, and social clubs.",
      count: NON_PROFIT_TEMPLATES.length
    },
    {
      id: "cooperative",
      name: "Cooperatives & Mutuals",
      description: "Worker, consumer, housing, platform, and producer cooperatives.",
      count: COOPERATIVE_TEMPLATES.length
    }
  ];
}
