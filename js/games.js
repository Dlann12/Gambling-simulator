/**
 * RoyalVegas — Casino Game Engines (Slot, Dice, Roulette, Blackjack)
 */
 * 4. NAVIGATION & VIEW MANAGEMENT
 **************************************************************/
function switchMainView(viewName) {
    state.currentView = viewName;
    ['lobby', 'stats', 'rewards', 'admin'].forEach(v => {
        const section = document.getElementById(`view-${v}`);
        const navBtn = document.getElementById(`nav-${v}`);
        if (v === viewName) {
            section.classList.remove('hidden');
            navBtn.className = 'nav-tab px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-casino-bg shadow transition flex items-center gap-1.5';
        } else {
            section.classList.add('hidden');
            navBtn.className = 'nav-tab px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-gray-300 hover:text-white hover:bg-casino-surface transition flex items-center gap-1.5';
        }
    });
    refreshAllUI();
}

function selectGameMode(gameKey) {
    if (state.blackjack.inProgress && gameKey !== 'blackjack') {
        showToast('Selesaikan putaran Blackjack Anda terlebih dahulu!', 'warning');
        return;
    }
    state.activeGame = gameKey;
    ['slot', 'dice', 'roulette', 'blackjack'].forEach(g => {
        const stage = document.getElementById(`stage-${g}`);
        const card = document.getElementById(`card-game-${g}`);
        if (g === gameKey) {
            stage.classList.remove('hidden');
            card.className = 'game-selector-card group text-left p-4 rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-purple-900/50 to-casino-card gold-glow transition-all relative overflow-hidden';
        } else {
            stage.classList.add('hidden');
            card.className = 'game-selector-card group text-left p-4 rounded-2xl border border-casino-border bg-casino-card hover:bg-casino-surface transition-all relative overflow-hidden';
        }
    });

    const cfg = state.gamesConfig[gameKey];
    document.getElementById('betPanelGameTitle').textContent = cfg.name;
    document.getElementById('betPanelMaxBetBadge').textContent = `Maks: ${formatCoins(cfg.maxBet)}`;
    document.getElementById('stageMultiplierBadge').textContent = `Multiplier Config: ${(cfg.rtpMultiplier * 100).toFixed(0)}%`;
    playSfx('tick');
}

/**************************************************************
 * 5. BETTING VALIDATION & TRANSACTION ENGINE (PRD Sec 6)
 **************************************************************/
function setBetAmount(amount) {
    if (state.blackjack.inProgress) {
        showToast('Tidak dapat mengubah taruhan saat kartu Blackjack sedang dibagikan.', 'warning');
        return;
    }
    const cfg = state.gamesConfig[state.activeGame];
    const clean = Math.max(10, Math.min(Math.floor(amount), cfg.maxBet, Math.max(10, state.currentUser.balance)));
    document.getElementById('betInput').value = clean;
    playSfx('tick');
}

function multiplyBet(factor) {
    const current = parseInt(document.getElementById('betInput').value) || 100;
    setBetAmount(current * factor);
}

function setMaxAllowedBet() {
    const cfg = state.gamesConfig[state.activeGame];
    setBetAmount(Math.min(state.currentUser.balance, cfg.maxBet));
}

function validateBetInput() {
    const val = parseInt(document.getElementById('betInput').value) || 100;
    setBetAmount(val);
}

// Strict Backend-Simulated Pre-Game Validation (PRD Sec 6 & 9)
function validateAndPrepareBet(gameKey) {
    const user = state.currentUser;
    const cfg = state.gamesConfig[gameKey];
    const bet = parseInt(document.getElementById('betInput').value);

    if (user.status === 'Suspended') {
        showToast('Akun Anda berstatus Suspended! Tidak dapat memasang taruhan.', 'error');
        return null;
    }
    if (!cfg.enabled) {
        showToast(`Permainan ${cfg.name} sedang dinonaktifkan sementara oleh Admin.`, 'error');
        return null;
    }
    if (isNaN(bet) || bet <= 0) {
        showToast('Jumlah taruhan harus lebih besar dari 0 koin!', 'error');
        return null;
    }
    if (bet > user.balance) {
        showToast('Taruhan melebihi saldo virtual yang tersedia! Klaim bonus atau turunkan taruhan.', 'error');
        return null;
    }
    if (bet > cfg.maxBet) {
        showToast(`Taruhan maksimal untuk ${cfg.name} adalah ${formatCoins(cfg.maxBet)} koin.`, 'warning');
        setBetAmount(cfg.maxBet);
        return null;
    }
    return bet;
}

// Unified Post-Round Settlement & History Recorder
function recordGameOutcome({ gameName, detail, bet, grossPayout, balanceBefore, isPush = false }) {
    const user = state.currentUser;
    const netDelta = grossPayout - bet;
    const balanceAfter = balanceBefore + netDelta;

    // Enforce non-negative balance rule (PRD Sec 6)
    user.balance = Math.max(0, Math.round(balanceAfter));
    user.totalGames += 1;

    if (isPush) {
        user.pushes += 1;
        user.xp += 25;
    } else if (netDelta > 0) {
        user.wins += 1;
        user.totalCoinsWon += Math.round(grossPayout);
        user.xp += 50;
    } else {
        user.losses += 1;
        user.xp += 25;
    }

    // Update Missions Progress
    state.missions[0].progress = Math.min(state.missions[0].target, state.missions[0].progress + 1);
    if (netDelta > 0) {
        state.missions[1].progress = Math.min(state.missions[1].target, state.missions[1].progress + 1);
    }
    if (bet >= 1000) {
        state.missions[2].progress = 1;
        user.highRollerDone = true;
    }

    const rngHash = generateRngHash();

    // Record into `game_histories`
    state.histories.unshift({
        id: rngHash,
        time: getNowTimeStr(),
        username: user.username,
        game: gameName,
        detail: detail,
        balanceBefore: Math.round(balanceBefore),
        bet: Math.round(bet),
        payout: Math.round(grossPayout),
        netDelta: Math.round(netDelta),
        balanceAfter: user.balance
    });

    // Update Audit Box in Left Panel
    document.getElementById('lastRoundHash').textContent = rngHash;
    document.getElementById('auditBalanceBefore').textContent = formatCoins(balanceBefore);
    document.getElementById('auditBalanceAfter').textContent = formatCoins(user.balance);
    const deltaEl = document.getElementById('auditNetDelta');
    if (netDelta > 0) {
        deltaEl.textContent = `+${formatCoins(netDelta)} Koin`;
        deltaEl.className = 'font-mono font-bold text-emerald-400';
    } else if (netDelta < 0) {
        deltaEl.textContent = `${formatCoins(netDelta)} Koin`;
        deltaEl.className = 'font-mono font-bold text-rose-400';
    } else {
        deltaEl.textContent = `0 Koin (PUSH)`;
        deltaEl.className = 'font-mono font-bold text-amber-300';
    }

    // Update Stage Banner
    const bannerTitle = document.getElementById('stageResultTitle');
    const bannerSub = document.getElementById('stageResultSub');
    const bannerIcon = document.getElementById('stageResultIcon');

    if (netDelta > 0) {
        bannerTitle.textContent = `MENANG! Anda memperoleh +${formatCoins(grossPayout)} Koin Virtual (Bersih +${formatCoins(netDelta)})`;
        bannerTitle.className = 'text-sm font-bold text-emerald-300';
        bannerSub.textContent = `${gameName}: ${detail} • Validated ${rngHash}`;
        bannerIcon.className = 'w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold';
        bannerIcon.innerHTML = '<i class="fa-solid fa-trophy"></i>';
        playSfx('win');
    } else if (isPush) {
        bannerTitle.textContent = `SERI (PUSH)! Taruhan ${formatCoins(bet)} Koin dikembalikan ke saldo.`;
        bannerTitle.className = 'text-sm font-bold text-amber-300';
        bannerSub.textContent = `${gameName}: ${detail} • Validated ${rngHash}`;
        bannerIcon.className = 'w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold';
        bannerIcon.innerHTML = '<i class="fa-solid fa-handshake"></i>';
    } else {
        bannerTitle.textContent = `Belum Beruntung (${formatCoins(netDelta)} Koin). Coba lagi putaran berikutnya!`;
        bannerTitle.className = 'text-sm font-bold text-rose-300';
        bannerSub.textContent = `${gameName}: ${detail} • Validated ${rngHash}`;
        bannerIcon.className = 'w-8 h-8 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold';
        bannerIcon.innerHTML = '<i class="fa-solid fa-dice-d20"></i>';
        playSfx('lose');
    }

    checkAndUnlockAchievements();
    refreshAllUI();
}

/**************************************************************
 * 6. GAME MODE A: SLOT MACHINE ENGINE (PRD 4.3.A)
 **************************************************************/
const slotSymbols = [
    { sym: '💎', weight: 8, mult3: 25 },
    { sym: '7️⃣', weight: 12, mult3: 15 },
    { sym: '🔔', weight: 16, mult3: 10 },
    { sym: '🍀', weight: 20, mult3: 6 },
    { sym: '🍒', weight: 22, mult3: 4 },
    { sym: '🍋', weight: 22, mult3: 3 }
];

function pickWeightedSymbol() {
    const totalWeight = slotSymbols.reduce((acc, s) => acc + s.weight, 0);
    let r = Math.random() * totalWeight;
    for (const item of slotSymbols) {
        if (r < item.weight) return item;
        r -= item.weight;
    }
    return slotSymbols[slotSymbols.length - 1];
}

function playSlotMachine() {
    if (state.isBusy) return;
    const bet = validateAndPrepareBet('slot');
    if (!bet) return;

    state.isBusy = true;
    const balanceBefore = state.currentUser.balance;
    const btn = document.getElementById('btnSpinSlot');
    btn.disabled = true;

    const r1El = document.getElementById('slotReel1');
    const r2El = document.getElementById('slotReel2');
    const r3El = document.getElementById('slotReel3');

    r1El.classList.add('reel-spinning');
    r2El.classList.add('reel-spinning');
    r3El.classList.add('reel-spinning');

    const spinInterval = setInterval(() => {
        r1El.textContent = slotSymbols[Math.floor(Math.random() * slotSymbols.length)].sym;
        r2El.textContent = slotSymbols[Math.floor(Math.random() * slotSymbols.length)].sym;
        r3El.textContent = slotSymbols[Math.floor(Math.random() * slotSymbols.length)].sym;
        playSfx('tick');
    }, 95);

    setTimeout(() => {
        clearInterval(spinInterval);
        r1El.classList.remove('reel-spinning');
        r2El.classList.remove('reel-spinning');
        r3El.classList.remove('reel-spinning');

        const res1 = pickWeightedSymbol();
        const res2 = pickWeightedSymbol();
        const res3 = pickWeightedSymbol();

        r1El.textContent = res1.sym;
        r2El.textContent = res2.sym;
        r3El.textContent = res3.sym;

        // Evaluate Paytable
        const cfgMult = state.gamesConfig.slot.rtpMultiplier;
        let baseMultiplier = 0;
        let comboLabel = `${res1.sym} ${res2.sym} ${res3.sym}`;

        if (res1.sym === res2.sym && res2.sym === res3.sym) {
            baseMultiplier = res1.mult3;
            comboLabel += ` (JACKPOT 3x ${res1.sym}!)`;
        } else if (res1.sym === res2.sym || res2.sym === res3.sym || res1.sym === res3.sym) {
            baseMultiplier = 1.5;
            comboLabel += ` (2 Simbol Kembar)`;
        } else if (res1.sym === '💎' || res2.sym === '💎' || res3.sym === '💎') {
            baseMultiplier = 1.2;
            comboLabel += ` (Bonus Berlian 💎)`;
        } else {
            comboLabel += ` (Tidak ada kombinasi)`;
        }

        const finalMultiplier = baseMultiplier * cfgMult;
        const grossPayout = Math.round(bet * finalMultiplier);

        if (grossPayout > bet) {
            state.currentUser.slotWinDone = true;
        }

        recordGameOutcome({
            gameName: 'Slot Machine',
            detail: comboLabel,
            bet: bet,
            grossPayout: grossPayout,
            balanceBefore: balanceBefore
        });

        btn.disabled = false;
        state.isBusy = false;
    }, 950);
}

/**************************************************************
 * 7. GAME MODE B: ROYAL DICE ENGINE (PRD 4.3.D)
 **************************************************************/
const diceClasses = [
    'fa-dice-one', 'fa-dice-two', 'fa-dice-three',
    'fa-dice-four', 'fa-dice-five', 'fa-dice-six'
];

function selectDiceBet(type, label, multiplier) {
    state.diceSelection = { type, label, multiplier };
    ['under7', 'lucky7', 'over7', 'even', 'odd'].forEach(k => {
        const el = document.getElementById(`dice-opt-${k}`);
        if (k === type) {
            el.className = 'dice-bet-btn p-3 rounded-xl border-2 border-amber-400 bg-amber-500/20 text-center transition';
        } else {
            el.className = 'dice-bet-btn p-3 rounded-xl border border-casino-border bg-casino-surface text-center transition';
        }
    });
    playSfx('tick');
}

function playDiceGame() {
    if (state.isBusy) return;
    const bet = validateAndPrepareBet('dice');
    if (!bet) return;

    state.isBusy = true;
    const balanceBefore = state.currentUser.balance;
    const btn = document.getElementById('btnRollDice');
    btn.disabled = true;

    const box1 = document.getElementById('diceBox1');
    const box2 = document.getElementById('diceBox2');
    const icon1 = document.getElementById('diceIcon1');
    const icon2 = document.getElementById('diceIcon2');

    box1.classList.add('dice-rolling');
    box2.classList.add('dice-rolling');

    const rollAnim = setInterval(() => {
        icon1.className = `fa-solid ${diceClasses[Math.floor(Math.random() * 6)]} text-purple-900`;
        icon2.className = `fa-solid ${diceClasses[Math.floor(Math.random() * 6)]} text-purple-900`;
        playSfx('tick');
    }, 90);

    setTimeout(() => {
        clearInterval(rollAnim);
        box1.classList.remove('dice-rolling');
        box2.classList.remove('dice-rolling');

        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const sum = d1 + d2;

        icon1.className = `fa-solid ${diceClasses[d1 - 1]} text-purple-900`;
        icon2.className = `fa-solid ${diceClasses[d2 - 1]} text-purple-900`;
        document.getElementById('diceSumBadge').textContent = sum;

        const sel = state.diceSelection;
        let won = false;
        if (sel.type === 'under7' && sum < 7) won = true;
        if (sel.type === 'lucky7' && sum === 7) won = true;
        if (sel.type === 'over7' && sum > 7) won = true;
        if (sel.type === 'even' && sum % 2 === 0) won = true;
        if (sel.type === 'odd' && sum % 2 !== 0) won = true;

        const cfgMult = state.gamesConfig.dice.rtpMultiplier;
        const grossPayout = won ? Math.round(bet * sel.multiplier * cfgMult) : 0;

        recordGameOutcome({
            gameName: 'Royal Dice',
            detail: `Dadu ${d1}+${d2}=${sum} (Pilihan: ${sel.label})`,
            bet: bet,
            grossPayout: grossPayout,
            balanceBefore: balanceBefore
        });

        btn.disabled = false;
        state.isBusy = false;
    }, 850);
}

/**************************************************************
 * 8. GAME MODE C: EUROPEAN ROULETTE ENGINE (PRD 4.3.B)
 **************************************************************/
const rouletteRedNumbers = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const rouletteWheelOrder = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];

function initRouletteWheelGraphics() {
    const g = document.getElementById('rouletteSectors');
    const total = rouletteWheelOrder.length;
    const angleStep = (2 * Math.PI) / total;
    let html = '';

    rouletteWheelOrder.forEach((num, idx) => {
        const a1 = idx * angleStep - Math.PI / 2;
        const a2 = (idx + 1) * angleStep - Math.PI / 2;
        const x1 = 100 + 92 * Math.cos(a1);
        const y1 = 100 + 92 * Math.sin(a1);
        const x2 = 100 + 92 * Math.cos(a2);
        const y2 = 100 + 92 * Math.sin(a2);

        let color = '#059669'; // Green 0
        if (num !== 0) {
            color = rouletteRedNumbers.has(num) ? '#be123c' : '#111827';
        }

        html += `<path d="M100,100 L${x1.toFixed(2)},${y1.toFixed(2)} A92,92 0 0,1 ${x2.toFixed(2)},${y2.toFixed(2)} Z" fill="${color}" stroke="#fbbf24" stroke-width="0.4"/>`;
    });
    g.innerHTML = html;
}

function selectRouletteBet(type, label, multiplier) {
    state.rouletteSelection = { type, label, multiplier, number: null };
    document.getElementById('rouletteActiveBetLabel').textContent = `${label} — ${multiplier.toFixed(1)}x`;
    playSfx('tick');
}

function selectSpecificRouletteNumber() {
    const val = parseInt(document.getElementById('rouletteSpecificInput').value);
    if (isNaN(val) || val < 0 || val > 36) {
        showToast('Masukkan nomor Roulette yang valid antara 0 hingga 36!', 'warning');
        return;
    }
    state.rouletteSelection = { type: 'exact', label: `Nomor Spesifik #${val}`, multiplier: 35, number: val };
    document.getElementById('rouletteActiveBetLabel').textContent = `Nomor Spesifik #${val} — 35.0x`;
    showToast(`Taruhan Roulette diatur ke Nomor #${val} (Payout 35x)`, 'info');
    playSfx('tick');
}

function playRoulette() {
    if (state.isBusy) return;
    const bet = validateAndPrepareBet('roulette');
    if (!bet) return;

    state.isBusy = true;
    const balanceBefore = state.currentUser.balance;
    const btn = document.getElementById('btnSpinRoulette');
    btn.disabled = true;

    const winningIndex = Math.floor(Math.random() * rouletteWheelOrder.length);
    const winningNumber = rouletteWheelOrder[winningIndex];

    // Rotate SVG wheel smoothly
    state.rouletteRotation += 1440 + Math.floor(Math.random() * 360);
    const wheel = document.getElementById('rouletteWheelSvg');
    wheel.style.transform = `rotate(${state.rouletteRotation}deg)`;
    playSfx('tick');

    setTimeout(() => {
        const isRed = rouletteRedNumbers.has(winningNumber);
        const colorName = winningNumber === 0 ? 'Hijau' : (isRed ? 'Merah' : 'Hitam');

        const centerBadge = document.getElementById('rouletteCenterBadge');
        centerBadge.textContent = winningNumber;
        centerBadge.className = `absolute w-14 h-14 rounded-full border-2 border-amber-300 flex items-center justify-center font-mono font-extrabold text-xl text-white shadow-inner ${
            winningNumber === 0 ? 'bg-emerald-600' : (isRed ? 'bg-rose-600' : 'bg-gray-900')
        }`;

        const sel = state.rouletteSelection;
        let won = false;
        if (sel.type === 'red' && isRed) won = true;
        if (sel.type === 'black' && winningNumber !== 0 && !isRed) won = true;
        if (sel.type === 'zero' && winningNumber === 0) won = true;
        if (sel.type === 'even' && winningNumber !== 0 && winningNumber % 2 === 0) won = true;
        if (sel.type === 'odd' && winningNumber !== 0 && winningNumber % 2 !== 0) won = true;
        if (sel.type === 'low' && winningNumber >= 1 && winningNumber <= 18) won = true;
        if (sel.type === 'high' && winningNumber >= 19 && winningNumber <= 36) won = true;
        if (sel.type === 'exact' && winningNumber === sel.number) won = true;

        const cfgMult = state.gamesConfig.roulette.rtpMultiplier;
        const grossPayout = won ? Math.round(bet * sel.multiplier * cfgMult) : 0;

        recordGameOutcome({
            gameName: 'Roulette',
            detail: `Bola berhenti di #${winningNumber} ${colorName} (Taruhan: ${sel.label})`,
            bet: bet,
            grossPayout: grossPayout,
            balanceBefore: balanceBefore
        });

        btn.disabled = false;
        state.isBusy = false;
    }, 3450);
}

/**************************************************************
 * 9. GAME MODE D: BLACKJACK 21 ENGINE (PRD 4.3.C)
 **************************************************************/
const cardSuits = [
    { sym: '♠', color: 'text-gray-900' },
    { sym: '♥', color: 'text-rose-600' },
    { sym: '♦', color: 'text-rose-600' },
    { sym: '♣', color: 'text-gray-900' }
];
const cardRanks = [
    { r: 'A', v: 11 }, { r: '2', v: 2 }, { r: '3', v: 3 }, { r: '4', v: 4 },
    { r: '5', v: 5 }, { r: '6', v: 6 }, { r: '7', v: 7 }, { r: '8', v: 8 },
    { r: '9', v: 9 }, { r: '10', v: 10 }, { r: 'J', v: 10 }, { r: 'Q', v: 10 }, { r: 'K', v: 10 }
];

function buildShuffledDeck() {
    const deck = [];
    for (const s of cardSuits) {
        for (const rk of cardRanks) {
            deck.push({ rank: rk.r, value: rk.v, suit: s.sym, color: s.color });
        }
    }
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function calcHandScore(hand) {
    let total = 0;
    let aces = 0;
    for (const c of hand) {
        total += c.value;
        if (c.rank === 'A') aces++;
    }
    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }
    return total;
}

function renderCardHtml(card, hidden = false) {
    if (hidden) {
        return `<div class="playing-card playing-card-back flex items-center justify-center">
            <i class="fa-solid fa-crown text-2xl text-amber-400"></i>
        </div>`;
    }
    return `
        <div class="playing-card p-2 flex flex-col justify-between select-none ${card.color}">
            <div class="text-left font-bold text-sm leading-none">${card.rank}<br><span class="text-xs">${card.suit}</span></div>
            <div class="text-center text-2xl sm:text-3xl">${card.suit}</div>
            <div class="text-right font-bold text-sm leading-none rotate-180">${card.rank}<br><span class="text-xs">${card.suit}</span></div>
        </div>
    `;
}

function updateBlackjackTableUI(revealDealer = false) {
    const bj = state.blackjack;
    const dealerContainer = document.getElementById('bjDealerCards');
    const playerContainer = document.getElementById('bjPlayerCards');

    dealerContainer.innerHTML = bj.dealerHand.map((c, idx) => renderCardHtml(c, idx === 1 && !revealDealer)).join('');
    playerContainer.innerHTML = bj.playerHand.map(c => renderCardHtml(c, false)).join('');

    const pScore = calcHandScore(bj.playerHand);
    document.getElementById('bjPlayerScore').textContent = `Total: ${pScore}`;

    if (revealDealer) {
        document.getElementById('bjDealerScore').textContent = `Total: ${calcHandScore(bj.dealerHand)}`;
    } else if (bj.dealerHand.length > 0) {
        document.getElementById('bjDealerScore').textContent = `Total: ${bj.dealerHand[0].value} + ?`;
    }

    document.getElementById('btnBjDeal').disabled = bj.inProgress;
    document.getElementById('btnBjHit').disabled = !bj.inProgress;
    document.getElementById('btnBjStand').disabled = !bj.inProgress;
    document.getElementById('btnBjDouble').disabled = !(bj.inProgress && bj.playerHand.length === 2 && state.currentUser.balance >= bj.bet * 2);
}

function startBlackjackRound() {
    if (state.blackjack.inProgress) return;
    const bet = validateAndPrepareBet('blackjack');
    if (!bet) return;

    const deck = buildShuffledDeck();
    state.blackjack = {
        inProgress: true,
        bet: bet,
        balanceBefore: state.currentUser.balance,
        deck: deck,
        playerHand: [deck.pop(), deck.pop()],
        dealerHand: [deck.pop(), deck.pop()]
    };

    playSfx('card');
    updateBlackjackTableUI(false);

    const pScore = calcHandScore(state.blackjack.playerHand);
    if (pScore === 21) {
        // Instant Natural Blackjack check
        finishBlackjackRound(true);
    }
}

function blackjackHit() {
    const bj = state.blackjack;
    if (!bj.inProgress) return;

    bj.playerHand.push(bj.deck.pop());
    playSfx('card');
    updateBlackjackTableUI(false);

    if (calcHandScore(bj.playerHand) > 21) {
        finishBlackjackRound(false);
    } else if (calcHandScore(bj.playerHand) === 21) {
        blackjackStand();
    }
}

function blackjackDouble() {
    const bj = state.blackjack;
    if (!bj.inProgress || bj.playerHand.length !== 2) return;
    if (state.currentUser.balance < bj.bet * 2) {
        showToast('Saldo tidak cukup untuk Double Down!', 'error');
        return;
    }
    bj.bet *= 2;
    bj.playerHand.push(bj.deck.pop());
    playSfx('card');
    updateBlackjackTableUI(false);

    if (calcHandScore(bj.playerHand) > 21) {
        finishBlackjackRound(false);
    } else {
        blackjackStand();
    }
}

function blackjackStand() {
    const bj = state.blackjack;
    if (!bj.inProgress) return;

    while (calcHandScore(bj.dealerHand) < 17) {
        bj.dealerHand.push(bj.deck.pop());
    }
    finishBlackjackRound(false);
}

function finishBlackjackRound(isNaturalBlackjack) {
    const bj = state.blackjack;
    bj.inProgress = false;
    updateBlackjackTableUI(true);

    const pScore = calcHandScore(bj.playerHand);
    const dScore = calcHandScore(bj.dealerHand);
    const cfgMult = state.gamesConfig.blackjack.rtpMultiplier;

    let grossPayout = 0;
    let isPush = false;
    let detail = `Anda ${pScore} vs Dealer ${dScore}`;

    if (pScore > 21) {
        detail += ' (BUST! Lebih dari 21)';
        grossPayout = 0;
    } else if (isNaturalBlackjack && dScore !== 21) {
        detail += ' (BLACKJACK MURNI 21! Payout 2.5x)';
        grossPayout = Math.round(bj.bet * 2.5 * cfgMult);
        state.currentUser.blackjack21Done = true;
    } else if (dScore > 21) {
        detail += ' (Dealer BUST! Anda Menang)';
        grossPayout = Math.round(bj.bet * 2.0 * cfgMult);
        state.currentUser.blackjack21Done = true;
    } else if (pScore > dScore) {
        detail += ' (Kartu Anda Lebih Tinggi)';
        grossPayout = Math.round(bj.bet * 2.0 * cfgMult);
        state.currentUser.blackjack21Done = true;
    } else if (pScore === dScore) {
        detail += ' (PUSH / Seri)';
        grossPayout = bj.bet;
        isPush = true;
    } else {
        detail += ' (Dealer Menang)';
        grossPayout = 0;
    }

    recordGameOutcome({
        gameName: 'Blackjack',
        detail: detail,
        bet: bj.bet,
        grossPayout: grossPayout,
        balanceBefore: bj.balanceBefore,
        isPush: isPush
    });
}

