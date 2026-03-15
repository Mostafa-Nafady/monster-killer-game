/* SDFREb Component - Special Defense and Evasion Battle System */

/* Configuration constants */
const SDFREb_DEFENSE_BOOST = 15;
const SDFREb_EVASION_CHANCE = 0.25;
const SDFREb_COUNTER_DAMAGE = 8;
const SDFREb_SHIELD_DURATION = 3;

/* State variables */
let defenseModeActive = false;
let evasionModeActive = false;
let shieldTurnsRemaining = 0;
let consecutiveDefenses = 0;
let totalDamageBlocked = 0;
let evasionSuccessCount = 0;
let sdfrebLogEntries = [];

/* DOM Element References */
const defenseBtn = document.getElementById('defense-btn');
const evasionBtn = document.getElementById('evasion-btn');
const counterBtn = document.getElementById('counter-btn');
const shieldBtn = document.getElementById('shield-btn');
const sdfrebLogBtn = document.getElementById('sdfreb-log-btn');
const defenseStatus = document.getElementById('defense-status');
const evasionStatus = document.getElementById('evasion-status');
const shieldStatus = document.getElementById('shield-status');

/* Defense mode activation */
function activateDefenseMode() {
    if (defenseModeActive) {
        alert('Defense mode already active!');
        return;
    }
    
    defenseModeActive = true;
    consecutiveDefenses++;
    
    /* Apply defense boost to player health bar visually */
    const playerHealthBar = document.getElementById('player-health');
    const currentMax = parseInt(playerHealthBar.getAttribute('max'));
    playerHealthBar.setAttribute('max', currentMax + SDFREb_DEFENSE_BOOST);
    
    updateDefenseStatus();
    logSDFREbEvent('DEFENSE_ACTIVATED', 'player', SDFREb_DEFENSE_BOOST, currentPlayerHealth, currentMonsterHealth);
    
    /* Auto-deactivate after 2 turns */
    setTimeout(() => {
        deactivateDefenseMode();
    }, 4000);
}

/* Defense mode deactivation */
function deactivateDefenseMode() {
    if (!defenseModeActive) return;
    
    defenseModeActive = false;
    
    const playerHealthBar = document.getElementById('player-health');
    const currentMax = parseInt(playerHealthBar.getAttribute('max'));
    playerHealthBar.setAttribute('max', currentMax - SDFREb_DEFENSE_BOOST);
    
    updateDefenseStatus();
    logSDFREbEvent('DEFENSE_DEACTIVATED', 'player', 0, currentPlayerHealth, currentMonsterHealth);
}

/* Evasion mode activation */
function activateEvasionMode() {
    if (evasionModeActive) {
        alert('Evasion mode already active!');
        return;
    }
    
    evasionModeActive = true;
    updateEvasionStatus();
    logSDFREbEvent('EVASION_ACTIVATED', 'player', SDFREb_EVASION_CHANCE, currentPlayerHealth, currentMonsterHealth);
}

/* Attempt evasion when monster attacks */
function attemptEvasion(incomingDamage) {
    if (!evasionModeActive) return false;
    
    const roll = Math.random();
    if (roll < SDFREb_EVASION_CHANCE) {
        evasionSuccessCount++;
        evasionModeActive = false;
        updateEvasionStatus();
        logSDFREbEvent('EVASION_SUCCESS', 'player', incomingDamage, currentPlayerHealth, currentMonsterHealth);
        alert('Evasion successful! Damage avoided!');
        return true;
    }
    
    logSDFREbEvent('EVASION_FAILED', 'player', incomingDamage, currentPlayerHealth, currentMonsterHealth);
    return false;
}

/* Counter attack function */
function executeCounterAttack() {
    if (!defenseModeActive) {
        alert('Counter attack requires active defense mode!');
        return;
    }
    
    /* Deal counter damage to monster */
    const actualDamage = SDFREb_COUNTER_DAMAGE + (consecutiveDefenses * 2);
    currentMonsterHealth -= actualDamage;
    
    /* Update monster health bar */
    const monsterHealthBar = document.getElementById('monster-health');
    monsterHealthBar.value = currentMonsterHealth;
    
    logSDFREbEvent('COUNTER_ATTACK', 'monster', actualDamage, currentPlayerHealth, currentMonsterHealth);
    
    /* Check for monster defeat */
    if (currentMonsterHealth <= 0) {
        alert('Counter attack defeated the monster!');
        reset();
    }
    
    /* Deactivate defense after counter */
    deactivateDefenseMode();
}

/* Shield activation */
function activateShield() {
    if (shieldTurnsRemaining > 0) {
        alert('Shield already active!');
        return;
    }
    
    shieldTurnsRemaining = SDFREb_SHIELD_DURATION;
    updateShieldStatus();
    logSDFREbEvent('SHIELD_ACTIVATED', 'player', SDFREb_SHIELD_DURATION, currentPlayerHealth, currentMonsterHealth);
}

/* Process shield damage reduction */
function processShieldDamage(incomingDamage) {
    if (shieldTurnsRemaining <= 0) return incomingDamage;
    
    const reducedDamage = Math.floor(incomingDamage * 0.5);
    totalDamageBlocked += (incomingDamage - reducedDamage);
    shieldTurnsRemaining--;
    
    updateShieldStatus();
    logSDFREbEvent('SHIELD_BLOCKED', 'player', incomingDamage - reducedDamage, currentPlayerHealth, currentMonsterHealth);
    
    if (shieldTurnsRemaining === 0) {
        logSDFREbEvent('SHIELD_EXPIRED', 'player', 0, currentPlayerHealth, currentMonsterHealth);
    }
    
    return reducedDamage;
}

/* Update status displays */
function updateDefenseStatus() {
    if (defenseStatus) {
        defenseStatus.textContent = defenseModeActive ? 'ACTIVE' : 'INACTIVE';
        defenseStatus.style.color = defenseModeActive ? '#00ff00' : '#ff0062';
    }
}

function updateEvasionStatus() {
    if (evasionStatus) {
        evasionStatus.textContent = evasionModeActive ? 'ACTIVE (' + (SDFREb_EVASION_CHANCE * 100) + '%)' : 'INACTIVE';
        evasionStatus.style.color = evasionModeActive ? '#00ff00' : '#ff0062';
    }
}

function updateShieldStatus() {
    if (shieldStatus) {
        shieldStatus.textContent = shieldTurnsRemaining > 0 ? 'ACTIVE (' + shieldTurnsRemaining + ' turns)' : 'INACTIVE';
        shieldStatus.style.color = shieldTurnsRemaining > 0 ? '#00ff00' : '#ff0062';
    }
}

/* Logging function for SDFREb events */
function logSDFREbEvent(eventType, target, value, playerHealth, monsterHealth) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        event: eventType,
        target: target,
        value: value,
        playerHealth: playerHealth,
        monsterHealth: monsterHealth,
        defenseActive: defenseModeActive,
        evasionActive: evasionModeActive,
        shieldTurns: shieldTurnsRemaining,
        totalBlocked: totalDamageBlocked,
        evasionsSuccessful: evasionSuccessCount
    };
    
    sdfrebLogEntries.push(logEntry);
}

/* Display SDFREb battle log */
function displaySDFREbLog() {
    console.log('=== SDFREb Battle Log ===');
    console.log('Total Entries:', sdfrebLogEntries.length);
    console.log('Total Damage Blocked:', totalDamageBlocked);
    console.log('Successful Evasions:', evasionSuccessCount);
    console.log('Consecutive Defenses:', consecutiveDefenses);
    console.log('Log Entries:', sdfrebLogEntries);
    
    /* Create a formatted summary */
    const summary = {
        sessionStats: {
            totalEvents: sdfrebLogEntries.length,
            damageBlocked: totalDamageBlocked,
            evasionsSuccessful: evasionSuccessCount,
            defenseActivations: consecutiveDefenses
        },
        entries: sdfrebLogEntries
    };
    
    console.table(summary.sessionStats);
}

/* Reset SDFREb state */
function resetSDFREb() {
    defenseModeActive = false;
    evasionModeActive = false;
    shieldTurnsRemaining = 0;
    consecutiveDefenses = 0;
    totalDamageBlocked = 0;
    evasionSuccessCount = 0;
    sdfrebLogEntries = [];
    
    updateDefenseStatus();
    updateEvasionStatus();
    updateShieldStatus();
}

/* Event Listeners */
if (defenseBtn) {
    defenseBtn.addEventListener('click', activateDefenseMode);
}

if (evasionBtn) {
    evasionBtn.addEventListener('click', activateEvasionMode);
}

if (counterBtn) {
    counterBtn.addEventListener('click', executeCounterAttack);
}

if (shieldBtn) {
    shieldBtn.addEventListener('click', activateShield);
}

if (sdfrebLogBtn) {
    sdfrebLogBtn.addEventListener('click', displaySDFREbLog);
}

/* Export functions for integration with main app.js */
window.SDFREb = {
    attemptEvasion: attemptEvasion,
    processShieldDamage: processShieldDamage,
    reset: resetSDFREb,
    getStats: function() {
        return {
            defenseActive: defenseModeActive,
            evasionActive: evasionModeActive,
            shieldTurns: shieldTurnsRemaining,
            totalBlocked: totalDamageBlocked,
            evasionSuccess: evasionSuccessCount
        };
    }
};

