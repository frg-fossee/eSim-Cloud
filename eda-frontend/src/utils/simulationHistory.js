/**
 * simulationHistory.js
 *
 * Pure localStorage utility for local simulation run history.
 * No backend API calls — works for all users whether logged in or not.
 *
 * Storage key : 'esim_simulation_history'
 * Max entries : 20 (oldest removed when exceeded)
 *
 * Each stored entry shape:
 * {
 *   id             : string   — Date.now().toString(), unique per run
 *   timestamp      : string   — ISO-8601 date string
 *   success        : boolean  — true = sim succeeded, false = failed
 *   simulationType : string   — 'DcSolver' | 'DcSweep' | 'Transient' | 'Ac' | etc.
 *   result         : object   — raw result object from the API (may be large)
 *   errorHelp      : object|null — structured error_help or null
 *   netlist        : string   — the netlist text submitted
 * }
 */

const STORAGE_KEY = 'esim_simulation_history'
const MAX_ENTRIES = 20

/**
 * Reads the current history array from localStorage.
 * Returns an empty array if localStorage is unavailable or data is corrupt.
 *
 * @returns {Array} — entries sorted newest first
 */
export function getSimulationHistory () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.warn('[simulationHistory] getSimulationHistory failed:', err)
    return []
  }
}

/**
 * Saves a new simulation run to localStorage.
 * Prepends the new entry (newest-first order) and trims to MAX_ENTRIES.
 *
 * @param {object} runData
 * @param {string}       runData.timestamp      — ISO-8601 string, e.g. new Date().toISOString()
 * @param {boolean}      runData.success        — true if simulation succeeded
 * @param {string}       runData.simulationType — e.g. 'Transient', 'DcSolver'
 * @param {object|null}  runData.result         — raw API result object
 * @param {object|null}  runData.errorHelp      — structured error_help or null
 * @param {string}       runData.netlist        — the netlist string submitted
 */
export function saveSimulationRun (runData) {
  try {
    const existing = getSimulationHistory()
    const entry = {
      id: Date.now().toString(),
      timestamp: runData.timestamp || new Date().toISOString(),
      success: !!runData.success,
      simulationType: runData.simulationType || 'Unknown',
      result: runData.result || null,
      errorHelp: runData.errorHelp || null,
      netlist: runData.netlist || ''
    }
    // Newest first — prepend, then cap at MAX_ENTRIES.
    const updated = [entry, ...existing].slice(0, MAX_ENTRIES)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (err) {
    console.warn('[simulationHistory] saveSimulationRun failed:', err)
  }
}

/**
 * Clears all stored simulation history from localStorage.
 */
export function clearSimulationHistory () {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.warn('[simulationHistory] clearSimulationHistory failed:', err)
  }
}
