/**
 * RoyalVegas — Application State, Constants & Helper Functions
 */
/**************************************************************
 * 2. APPLICATION STATE (Relational In-Memory Model per PRD)
 **************************************************************/
const state = {
    currentView: 'lobby',
    activeGame: 'slot',
    isBusy: false,
    adjustingUserId: null,

    // Users & Wallets (Initial 10.000 virtual coins per PRD 4.2)
    users: [
        {
            id: 'USR-001',
            username: 'Sultan_Virtual',
            email: 'sultan@royalvegas.sim',
            status: 'Aktif',
            balance: 10000,
            xp: 120,
            totalGames: 0,
            wins: 0,
            losses: 0,
            pushes: 0,
            totalCoinsWon: 0,
            dailyBonusClaimed: false,
            highRollerDone: false,
            slotWinDone: false,
            blackjack21Done: false
        },
        {
            id: 'USR-002',
            username: 'DewiFortuna88',
            email: 'dewi@royalvegas.sim',
            status: 'Aktif',
            balance: 28450,
            xp: 1650,
            totalGames: 34,
            wins: 19,
            losses: 15,
            pushes: 0,
            totalCoinsWon: 41200,
            dailyBonusClaimed: true
        },
        {
            id: 'USR-003',
            username: 'RajaBlackjack',
            email: 'raja21@royalvegas.sim',
            status: 'Aktif',
            balance: 19200,
            xp: 1120,
            totalGames: 22,
            wins: 12,
            losses: 9,
            pushes: 1,
            totalCoinsWon: 25000,
            dailyBonusClaimed: true
        },
        {
            id: 'USR-004',
            username: 'LuckySpinner77',
            email: 'spinner@royalvegas.sim',
            status: 'Aktif',
            balance: 14800,
            xp: 780,
            totalGames: 16,
            wins: 7,
            losses: 9,
            pushes: 0,
            totalCoinsWon: 18500,
            dailyBonusClaimed: false
        },
        {
            id: 'USR-005',
            username: 'Tester_Demo',
            email: 'tester@royalvegas.sim',
            status: 'Suspended',
            balance: 6500,
            xp: 300,
            totalGames: 8,
            wins: 2,
            losses: 6,
            pushes: 0,
            totalCoinsWon: 3200,
            dailyBonusClaimed: false
        }
    ],
    currentUser: null,

    // Game Configurations (Admin Manageable - PRD 4.6)
    gamesConfig: {
        slot: { id: 'slot', name: 'Slot Machine', enabled: true, maxBet: 5000, rtpMultiplier: 1.0 },
        dice: { id: 'dice', name: 'Royal Dice', enabled: true, maxBet: 5000, rtpMultiplier: 1.0 },
        roulette: { id: 'roulette', name: 'European Roulette', enabled: true, maxBet: 5000, rtpMultiplier: 1.0 },
        blackjack: { id: 'blackjack', name: 'Blackjack 21', enabled: true, maxBet: 5000, rtpMultiplier: 1.0 }
    },

    // Game Specific Selections
    diceSelection: { type: 'under7', label: 'Di Bawah 7 (2-6)', multiplier: 2.0 },
    rouletteSelection: { type: 'red', label: 'Merah (Red)', multiplier: 2.0, number: null },
    rouletteRotation: 0,

    // Blackjack Active Round State
    blackjack: {
        inProgress: false,
        bet: 0,
        balanceBefore: 0,
        deck: [],
        playerHand: [],
        dealerHand: []
    },

    // Game Histories (`game_histories` table)
    histories: [],

    // Daily Missions (PRD 4.5)
    missions: [
        { id: 'MSN-1', title: 'Pemanasan Kasino', desc: 'Mainkan 3 permainan di mode apa saja', target: 3, progress: 0, reward: 1000, claimed: false },
        { id: 'MSN-2', title: 'Pemburu Keberuntungan', desc: 'Raih 2 kemenangan di permainan apa saja', target: 2, reward: 1500, progress: 0, claimed: false },
        { id: 'MSN-3', title: 'Taruhan Berani', desc: 'Pasang taruhan minimal 1.000 Koin dalam 1 putaran', target: 1, reward: 2000, progress: 0, claimed: false }
    ],

    // Achievements (`achievements` & `user_achievements`)
    achievements: [
        { id: 'ACH-1', icon: 'fa-trophy', title: 'First Blood', desc: 'Memenangkan permainan kasino pertama Anda', unlocked: false },
        { id: 'ACH-2', icon: 'fa-GEM', title: 'High Roller VIP', desc: 'Memasang taruhan >= 1.000 Koin dalam satu putaran', unlocked: false },
        { id: 'ACH-3', icon: 'fa-clover', title: 'Spin Master', desc: 'Memenangkan kombinasi di Slot Machine', unlocked: false },
        { id: 'ACH-4', icon: 'fa-spade', title: '21 Club', desc: 'Menang bermain Blackjack melawan Dealer', unlocked: false },
        { id: 'ACH-5', icon: 'fa-fire', title: 'Veteran Kasino', desc: 'Menyelesaikan minimal 5 putaran permainan', unlocked: false },
        { id: 'ACH-6', icon: 'fa-crown', title: 'Sultan 15.000 Koin', desc: 'Mencapai saldo virtual minimal 15.000 Koin', unlocked: false }
    ],

    // Immutable Admin Audit Logs (`audit_logs` PRD Sec 6 & 8)
    auditLogs: [
        {
            timestamp: '10:00:00',
            actor: 'SYSTEM_INIT',
            action: 'INIT_WALLET',
            target: 'Sultan_Virtual',
            reason: 'Pemberian saldo awal registrasi sebesar 10.000 Koin Virtual (PRD 4.2)'
        },
        {
            timestamp: '10:05:12',
            actor: 'Admin_Root',
            action: 'SUSPEND_USER',
            target: 'Tester_Demo',
            reason: 'Simulasi akun ditangguhkan untuk pengujian validasi Business Rules'
        }
    ]
};

// Initialize current user
state.currentUser = state.users[0];

/**************************************************************
 * 3. HELPER & FORMATTING FUNCTIONS
 **************************************************************/
function formatCoins(num) {
    return Math.round(num).toLocaleString('id-ID');
}

function getNowTimeStr() {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
}

function generateRngHash() {
    const chars = '0123456789ABCDEF';
    let hash = '#RNG-';
    for (let i = 0; i < 6; i++) hash += chars[Math.floor(Math.random() * chars.length)];
    return hash;
}

function calculateLevel(xp) {
    return Math.floor(xp / 500) + 1;
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    const colorMap = {
        success: 'border-emerald-400 bg-emerald-950/95 text-emerald-200',
        error: 'border-rose-500 bg-rose-950/95 text-rose-200',
        warning: 'border-amber-400 bg-amber-950/95 text-amber-200',
        info: 'border-purple-400 bg-casino-surface/95 text-gray-100'
    };
    const iconMap = {
        success: 'fa-circle-check text-emerald-400',
        error: 'fa-triangle-exclamation text-rose-400',
        warning: 'fa-Coins text-amber-400',
        info: 'fa-bell text-purple-400'
    };

    toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl text-xs font-medium transition-all duration-300 ${colorMap[type] || colorMap.info}`;
    toast.innerHTML = `
        <i class="fa-solid ${iconMap[type] || iconMap.info} text-base"></i>
        <div class="flex-1">${message}</div>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3400);
}

/**************************************************************
