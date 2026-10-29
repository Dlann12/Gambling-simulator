/**
 * RoyalVegas — Authentication, Daily Bonus, Missions & Admin Panel
 */
/**************************************************************
 * 10. DAILY BONUS, MISSIONS & ACHIEVEMENTS (PRD 4.2 & 4.5)
 **************************************************************/
function openDailyBonusModal() {
    claimDailyBonus();
}

function claimDailyBonus() {
    const user = state.currentUser;
    if (user.dailyBonusClaimed) {
        showToast('Bonus harian sudah diklaim hari ini! Gunakan tombol "+5K Reset" jika butuh koin latihan tambahan.', 'info');
        return;
    }
    const before = user.balance;
    user.balance += 2500;
    user.dailyBonusClaimed = true;

    state.histories.unshift({
        id: '#BONUS-DAILY',
        time: getNowTimeStr(),
        username: user.username,
        game: 'Bonus / Sistem',
        detail: 'Klaim Bonus Harian (+2.500 Koin Virtual)',
        balanceBefore: before,
        bet: 0,
        payout: 2500,
        netDelta: 2500,
        balanceAfter: user.balance
    });

    playSfx('win');
    showToast('Berhasil mengklaim Bonus Harian +2.500 Koin Virtual!', 'success');
    checkAndUnlockAchievements();
    refreshAllUI();
}

function claimFaucetAid() {
    const user = state.currentUser;
    const before = user.balance;
    user.balance += 5000;

    state.histories.unshift({
        id: '#SIM-REFILL',
        time: getNowTimeStr(),
        username: user.username,
        game: 'Bonus / Sistem',
        detail: 'Isi Ulang Bantuan Simulasi (+5.000 Koin Virtual)',
        balanceBefore: before,
        bet: 0,
        payout: 5000,
        netDelta: 5000,
        balanceAfter: user.balance
    });

    playSfx('win');
    showToast('+5.000 Koin Simulasi ditambahkan ke dompet virtual Anda!', 'success');
    checkAndUnlockAchievements();
    refreshAllUI();
}

function claimMissionReward(missionId) {
    const m = state.missions.find(x => x.id === missionId);
    if (!m || m.claimed || m.progress < m.target) return;

    const user = state.currentUser;
    const before = user.balance;
    user.balance += m.reward;
    user.xp += 100;
    m.claimed = true;

    state.histories.unshift({
        id: `#${m.id}`,
        time: getNowTimeStr(),
        username: user.username,
        game: 'Bonus / Sistem',
        detail: `Hadiah Misi: ${m.title}`,
        balanceBefore: before,
        bet: 0,
        payout: m.reward,
        netDelta: m.reward,
        balanceAfter: user.balance
    });

    playSfx('win');
    showToast(`Misi selesai! +${formatCoins(m.reward)} Koin & +100 XP diterima.`, 'success');
    checkAndUnlockAchievements();
    refreshAllUI();
}

function checkAndUnlockAchievements() {
    const u = state.currentUser;
    const rules = [
        { id: 'ACH-1', cond: u.wins >= 1 },
        { id: 'ACH-2', cond: !!u.highRollerDone },
        { id: 'ACH-3', cond: !!u.slotWinDone },
        { id: 'ACH-4', cond: !!u.blackjack21Done },
        { id: 'ACH-5', cond: u.totalGames >= 5 },
        { id: 'ACH-6', cond: u.balance >= 15000 }
    ];

    rules.forEach(r => {
        const ach = state.achievements.find(a => a.id === r.id);
        if (ach && !ach.unlocked && r.cond) {
            ach.unlocked = true;
            showToast(`🏆 Achievement Terbuka: ${ach.title}!`, 'warning');
        }
    });
}

/**************************************************************
 * 11. AUTHENTICATION & ADMIN MANAGEMENT (PRD 4.1 & 4.6)
 **************************************************************/
function openAuthModal() {
    document.getElementById('authModal').classList.remove('hidden');
    refreshAllUI();
}

function closeAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
}

function switchActiveUser(userId) {
    if (state.blackjack.inProgress) {
        showToast('Selesaikan putaran Blackjack sebelum berganti pengguna.', 'warning');
        return;
    }
    const found = state.users.find(u => u.id === userId);
    if (!found) return;
    state.currentUser = found;
    showToast(`Berpindah akun ke ${found.username}`, 'info');
    closeAuthModal();
    refreshAllUI();
}

function registerNewUser() {
    const username = document.getElementById('regUsernameInput').value.trim();
    const email = document.getElementById('regEmailInput').value.trim() || `${username.toLowerCase()}@royalvegas.sim`;

    if (username.length < 3) {
        showToast('Username minimal harus terdiri dari 3 karakter!', 'error');
        return;
    }

    const newUser = {
        id: `USR-00${state.users.length + 1}`,
        username: username,
        email: email,
        status: 'Aktif',
        balance: 10000, // Initial 10.000 virtual coins per PRD 4.2
        xp: 0,
        totalGames: 0,
        wins: 0,
        losses: 0,
        pushes: 0,
        totalCoinsWon: 0,
        dailyBonusClaimed: false
    };

    state.users.unshift(newUser);
    state.currentUser = newUser;

    state.auditLogs.unshift({
        timestamp: getNowTimeStr(),
        actor: 'AUTH_SYSTEM',
        action: 'REGISTER_USER',
        target: newUser.username,
        reason: 'Registrasi akun baru dengan saldo awal 10.000 Koin Virtual (PRD 4.2)'
    });

    document.getElementById('regUsernameInput').value = '';
    document.getElementById('regEmailInput').value = '';
    closeAuthModal();
    playSfx('win');
    showToast(`Selamat datang ${newUser.username}! Saldo awal 10.000 Koin Virtual telah aktif.`, 'success');
    refreshAllUI();
}

// Admin Actions with Mandatory Audit Trail (PRD Sec 6)
function toggleUserStatusAdmin(userId) {
    const u = state.users.find(x => x.id === userId);
    if (!u) return;
    u.status = u.status === 'Aktif' ? 'Suspended' : 'Aktif';

    state.auditLogs.unshift({
        timestamp: getNowTimeStr(),
        actor: 'Admin_Dashboard',
        action: 'STATUS_CHANGE',
        target: u.username,
        reason: `Status akun diubah menjadi ${u.status}`
    });

    showToast(`Status pengguna ${u.username} diubah menjadi ${u.status}`, 'info');
    refreshAllUI();
}

function openAdminAdjustModal(userId) {
    const u = state.users.find(x => x.id === userId);
    if (!u) return;
    state.adjustingUserId = userId;
    document.getElementById('adjustTargetUsername').textContent = `${u.username} (Saldo saat ini: ${formatCoins(u.balance)})`;
    document.getElementById('adjustAmountInput').value = 5000;
    document.getElementById('adjustReasonInput').value = '';
    document.getElementById('adminAdjustModal').classList.remove('hidden');
}

function closeAdminAdjustModal() {
    document.getElementById('adminAdjustModal').classList.add('hidden');
}

function submitAdminBalanceAdjustment() {
    const u = state.users.find(x => x.id === state.adjustingUserId);
    if (!u) return;

    const delta = parseInt(document.getElementById('adjustAmountInput').value) || 0;
    const reason = document.getElementById('adjustReasonInput').value.trim();

    if (!reason) {
        showToast('Alasan Audit wajib diisi sesuai Business Rules PRD Bab 6!', 'error');
        return;
    }

    const before = u.balance;
    u.balance = Math.max(0, u.balance + delta);

    state.auditLogs.unshift({
        timestamp: getNowTimeStr(),
        actor: 'Admin_Dashboard',
        action: 'WALLET_ADJUST',
        target: u.username,
        reason: `Perubahan ${delta >= 0 ? '+' : ''}${formatCoins(delta)} Koin (${formatCoins(before)} → ${formatCoins(u.balance)}). Alasan: ${reason}`
    });

    state.histories.unshift({
        id: '#ADMIN-AUDIT',
        time: getNowTimeStr(),
        username: u.username,
        game: 'Bonus / Sistem',
        detail: `Penyesuaian Admin: ${reason}`,
        balanceBefore: before,
        bet: 0,
        payout: Math.max(0, delta),
        netDelta: u.balance - before,
        balanceAfter: u.balance
    });

    closeAdminAdjustModal();
    showToast(`Saldo ${u.username} diperbarui & tercatat di Audit Log.`, 'success');
    refreshAllUI();
}

function updateGameConfigAdmin(gameKey, field, value) {
    const cfg = state.gamesConfig[gameKey];
    if (!cfg) return;

    const oldVal = cfg[field];
    if (field === 'enabled') cfg.enabled = value;
    if (field === 'maxBet') cfg.maxBet = Math.max(100, parseInt(value) || 5000);
    if (field === 'rtpMultiplier') cfg.rtpMultiplier = parseFloat(value) || 1.0;

    state.auditLogs.unshift({
        timestamp: getNowTimeStr(),
        actor: 'Admin_Dashboard',
        action: 'GAME_CONFIG',
        target: cfg.name,
        reason: `Mengubah parameter ${field} dari [${oldVal}] menjadi [${cfg[field]}]`
    });

    showToast(`Konfigurasi ${cfg.name} diperbarui dan dicatat di Audit Log.`, 'info');
    selectGameMode(state.activeGame);
    refreshAllUI();
}

function openSchemaModal() {
    const tables = [
        { name: 'users', rows: state.users.length, cols: 'id, username, email, password_hash, status, xp, created_at' },
        { name: 'wallets', rows: state.users.length, cols: 'id, user_id, balance, updated_at' },
        { name: 'games', rows: 4, cols: 'id, code, name, is_enabled, max_bet, rtp_multiplier' },
        { name: 'game_sessions', rows: state.histories.length, cols: 'id, user_id, game_id, server_seed_hash, status' },
        { name: 'game_histories', rows: state.histories.length, cols: 'id, session_id, bet_amount, payout, balance_before, balance_after' },
        { name: 'achievements', rows: state.achievements.length, cols: 'id, code, title, description, icon' },
        { name: 'user_achievements', rows: state.achievements.filter(a => a.unlocked).length, cols: 'id, user_id, achievement_id, unlocked_at' },
        { name: 'daily_bonuses', rows: state.users.filter(u => u.dailyBonusClaimed).length, cols: 'id, user_id, amount, claimed_date' },
        { name: 'audit_logs', rows: state.auditLogs.length, cols: 'id, admin_id, action_type, target_entity, details, reason, created_at' }
    ];

    document.getElementById('schemaInspectorGrid').innerHTML = tables.map(t => `
        <div class="bg-casino-surface border border-casino-border rounded-2xl p-3.5 space-y-1.5">
            <div class="flex items-center justify-between">
                <span class="font-mono font-bold text-xs text-amber-300"><i class="fa-solid fa-table mr-1"></i>${t.name}</span>
                <span class="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px]">${t.rows} baris</span>
            </div>
            <p class="text-[11px] font-mono text-gray-400 leading-relaxed">${t.cols}</p>
        </div>
    `).join('');

    document.getElementById('schemaModal').classList.remove('hidden');
}

function closeSchemaModal() {
    document.getElementById('schemaModal').classList.add('hidden');
}
