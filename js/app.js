/**
 * RoyalVegas — Master UI Renderer & Application Boot
 * 12. MASTER UI RENDERER
 **************************************************************/
function refreshAllUI() {
    const u = state.currentUser;
    const level = calculateLevel(u.xp);
    const xpInLevel = u.xp % 500;
    const winRate = u.totalGames > 0 ? Math.round((u.wins / u.totalGames) * 100) : 0;
    const netProfit = u.balance - 10000;

    // Suspended Banner
    const suspBanner = document.getElementById('suspendedBanner');
    if (u.status === 'Suspended') suspBanner.classList.remove('hidden');
    else suspBanner.classList.add('hidden');

    // Header & Hero
    document.getElementById('headerBalance').textContent = formatCoins(u.balance);
    document.getElementById('betPanelAvailableBalance').textContent = formatCoins(u.balance);
    document.getElementById('headerUsername').textContent = u.username;
    document.getElementById('headerUserLevel').textContent = `Lv.${level} • ${u.status}`;
    document.getElementById('heroWelcomeName').textContent = u.username;
    document.getElementById('heroRoleBadge').innerHTML = `<i class="fa-solid fa-star mr-1"></i>Level ${level}`;
    document.getElementById('xpText').textContent = `${xpInLevel} / 500 XP`;
    document.getElementById('xpProgressBar').style.width = `${Math.max(4, (xpInLevel / 500) * 100)}%`;

    // Quick Stats
    document.getElementById('quickWinRate').textContent = `${winRate}%`;
    document.getElementById('quickWinLossSub').textContent = `${u.wins} Menang • ${u.losses} Kalah`;
    const netEl = document.getElementById('quickNetProfit');
    netEl.textContent = `${netProfit >= 0 ? '+' : ''}${formatCoins(netProfit)}`;
    netEl.className = `text-2xl font-bold font-mono mt-2 ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`;
    document.getElementById('quickTotalGamesSub').textContent = `Total ${u.totalGames} Permainan`;

    // Daily Bonus Button State
    const dailyBadge = document.getElementById('dailyBonusStatusBadge');
    const dailyBtn = document.getElementById('btnClaimDaily');
    if (u.dailyBonusClaimed) {
        dailyBadge.textContent = 'SUDAH DIKLAIM';
        dailyBadge.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-gray-700 text-gray-300';
        dailyBtn.disabled = true;
    } else {
        dailyBadge.textContent = 'TERSEDIA';
        dailyBadge.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
        dailyBtn.disabled = false;
    }

    // Game Mode Cards Status Badges
    ['slot', 'dice', 'roulette', 'blackjack'].forEach(g => {
        const cfg = state.gamesConfig[g];
        const badge = document.getElementById(`badge-status-${g}`);
        if (cfg.enabled) {
            badge.textContent = 'Aktif';
            badge.className = 'text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300';
        } else {
            badge.textContent = 'Nonaktif';
            badge.className = 'text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300';
        }
    });

    // Mini History Feed
    const miniList = document.getElementById('miniHistoryList');
    if (state.histories.length === 0) {
        miniList.innerHTML = `<div class="text-xs text-gray-500 italic py-2">Belum ada putaran permainan.</div>`;
    } else {
        miniList.innerHTML = state.histories.slice(0, 5).map(h => `
            <div class="bg-casino-bg/70 px-3 py-2 rounded-lg border border-casino-border/60 flex items-center justify-between text-xs">
                <div class="truncate pr-2">
                    <span class="font-semibold text-white">${h.game}</span>
                    <span class="text-gray-400 text-[11px] block truncate">${h.detail}</span>
                </div>
                <span class="font-mono font-bold shrink-0 ${h.netDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}">
                    ${h.netDelta >= 0 ? '+' : ''}${formatCoins(h.netDelta)}
                </span>
            </div>
        `).join('');
    }

    // Statistics View
    document.getElementById('statTotalGames').textContent = u.totalGames;
    document.getElementById('statWinsLosses').textContent = `${u.wins} / ${u.losses}`;
    document.getElementById('statWinRate').textContent = `${winRate}%`;
    document.getElementById('statTotalWonCoins').textContent = formatCoins(u.totalCoinsWon);
    document.getElementById('statCurrentBalance').textContent = formatCoins(u.balance);
    renderFullHistoryTable();

    // Rewards View (Missions, Achievements, Leaderboard)
    renderMissionsAndAchievements();
    renderLeaderboard();

    // Admin Dashboard View
    renderAdminDashboard();

    // Auth Modal User Switcher
    document.getElementById('modalProfileName').textContent = u.username;
    document.getElementById('modalProfileEmail').textContent = u.email;
    document.getElementById('modalProfileBalance').textContent = `Saldo: ${formatCoins(u.balance)} Koin`;
    document.getElementById('quickSwitchUsersList').innerHTML = state.users.map(usr => `
        <button onclick="switchActiveUser('${usr.id}')" class="w-full p-2.5 rounded-xl border ${usr.id === u.id ? 'border-amber-400 bg-amber-500/10' : 'border-casino-border bg-casino-bg hover:bg-casino-surface'} flex items-center justify-between text-xs transition">
            <div class="flex items-center gap-2">
                <span class="font-bold text-white">${usr.username}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded ${usr.status === 'Aktif' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}">${usr.status}</span>
            </div>
            <span class="font-mono text-amber-300">${formatCoins(usr.balance)} Koin</span>
        </button>
    `).join('');
}

function renderFullHistoryTable() {
    const filter = document.getElementById('historyFilterGame').value;
    const rows = state.histories.filter(h => filter === 'all' || h.game === filter);
    document.getElementById('historyCountLabel').textContent = `${rows.length} entri`;

    const tbody = document.getElementById('fullHistoryTableBody');
    if (rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-gray-500">Belum ada riwayat transaksi untuk filter ini.</td></tr>`;
        return;
    }

    tbody.innerHTML = rows.map(h => `
        <tr class="hover:bg-casino-surface/50 transition">
            <td class="py-3 px-4 text-gray-400">${h.time} <span class="text-purple-400 block text-[10px]">${h.id}</span></td>
            <td class="py-3 px-4 font-sans font-semibold text-white">${h.game}</td>
            <td class="py-3 px-4 font-sans text-gray-300">${h.detail}</td>
            <td class="py-3 px-4 text-right text-gray-300">${formatCoins(h.balanceBefore)}</td>
            <td class="py-3 px-4 text-right text-amber-200">${formatCoins(h.bet)}</td>
            <td class="py-3 px-4 text-right font-bold ${h.netDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}">
                ${h.netDelta >= 0 ? '+' : ''}${formatCoins(h.netDelta)}
            </td>
            <td class="py-3 px-4 text-right font-bold text-amber-300">${formatCoins(h.balanceAfter)}</td>
        </tr>
    `).join('');
}

function renderMissionsAndAchievements() {
    // Missions
    document.getElementById('missionsContainer').innerHTML = state.missions.map(m => {
        const pct = Math.min(100, Math.round((m.progress / m.target) * 100));
        const canClaim = m.progress >= m.target && !m.claimed;
        return `
            <div class="bg-casino-surface border border-casino-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="space-y-1 flex-1">
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-sm text-white">${m.title}</span>
                        <span class="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">+${formatCoins(m.reward)} Koin</span>
                    </div>
                    <p class="text-xs text-gray-400">${m.desc}</p>
                    <div class="w-full h-2 bg-casino-bg rounded-full overflow-hidden mt-1">
                        <div class="h-full bg-amber-400" style="width:${pct}%"></div>
                    </div>
                </div>
                <div>
                    ${m.claimed
                        ? `<span class="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold">Selesai ✓</span>`
                        : `<button onclick="claimMissionReward('${m.id}')" ${!canClaim ? 'disabled' : ''} class="btn-gold px-4 py-2 rounded-xl text-xs">
                            ${canClaim ? 'Klaim Hadiah' : `${m.progress}/${m.target}`}
                           </button>`
                    }
                </div>
            </div>
        `;
    }).join('');

    // Achievements
    const unlockedCount = state.achievements.filter(a => a.unlocked).length;
    document.getElementById('achievementCounterBadge').textContent = `${unlockedCount} / ${state.achievements.length} Terbuka`;
    document.getElementById('achievementsGrid').innerHTML = state.achievements.map(a => `
        <div class="p-3.5 rounded-xl border ${a.unlocked ? 'border-amber-400/60 bg-amber-500/10' : 'border-casino-border bg-casino-bg/60 opacity-60'} flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl ${a.unlocked ? 'bg-amber-400 text-casino-bg' : 'bg-casino-surface text-gray-500'} flex items-center justify-center text-lg shrink-0">
                <i class="fa-solid ${a.icon.toLowerCase()}"></i>
            </div>
            <div>
                <div class="font-bold text-xs text-white">${a.title}</div>
                <div class="text-[11px] text-gray-400">${a.desc}</div>
            </div>
        </div>
    `).join('');
}

function renderLeaderboard() {
    const sorted = [...state.users].sort((a, b) => b.balance - a.balance);
    document.getElementById('leaderboardList').innerHTML = sorted.map((u, idx) => {
        const isMe = u.id === state.currentUser.id;
        const medalColors = ['text-amber-400', 'text-gray-300', 'text-amber-600'];
        return `
            <div class="p-3.5 rounded-xl border ${isMe ? 'border-amber-400 bg-amber-500/10' : 'border-casino-border bg-casino-surface/60'} flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <span class="w-7 text-center font-mono font-bold text-sm ${medalColors[idx] || 'text-gray-400'}">
                        #${idx + 1}
                    </span>
                    <div>
                        <div class="font-bold text-sm text-white flex items-center gap-1.5">
                            <span>${u.username}</span>
                            ${isMe ? '<span class="text-[10px] px-1.5 py-0.5 rounded bg-amber-400 text-casino-bg font-bold">ANDA</span>' : ''}
                        </div>
                        <div class="text-[11px] text-gray-400">Level ${calculateLevel(u.xp)} • ${u.totalGames} Permainan</div>
                    </div>
                </div>
                <div class="text-right font-mono">
                    <div class="font-bold text-sm text-amber-300">${formatCoins(u.balance)}</div>
                    <div class="text-[10px] text-gray-400">Koin Virtual</div>
                </div>
            </div>
        `;
    }).join('');
}

function renderAdminDashboard() {
    const totalSessions = state.histories.filter(h => h.bet > 0).length;
    const totalVolume = state.histories.reduce((acc, h) => acc + h.bet, 0);
    const totalSupply = state.users.reduce((acc, u) => acc + u.balance, 0);

    document.getElementById('adminMetricUsers').textContent = state.users.length;
    document.getElementById('adminMetricSessions').textContent = totalSessions;
    document.getElementById('adminMetricVolume').textContent = formatCoins(totalVolume);
    document.getElementById('adminMetricTotalSupply').textContent = formatCoins(totalSupply);

    // Users Table
    document.getElementById('adminUsersTableBody').innerHTML = state.users.map(u => `
        <tr class="hover:bg-casino-surface/50 transition">
            <td class="py-3 px-4">
                <div class="font-bold text-white">${u.username}</div>
                <div class="text-[11px] text-gray-400">${u.email}</div>
            </td>
            <td class="py-3 px-4">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${u.status === 'Aktif' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}">
                    ${u.status}
                </span>
            </td>
            <td class="py-3 px-4 text-right font-mono font-bold text-amber-300">${formatCoins(u.balance)}</td>
            <td class="py-3 px-4 text-center font-mono text-gray-300">${u.totalGames}</td>
            <td class="py-3 px-4 text-right space-x-1">
                <button onclick="openAdminAdjustModal('${u.id}')" class="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold">
                    Saldo
                </button>
                <button onclick="toggleUserStatusAdmin('${u.id}')" class="px-2.5 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 font-semibold">
                    ${u.status === 'Aktif' ? 'Suspend' : 'Aktifkan'}
                </button>
            </td>
        </tr>
    `).join('');

    // Game Config List
    document.getElementById('adminGameConfigList').innerHTML = Object.values(state.gamesConfig).map(cfg => `
        <div class="bg-casino-surface border border-casino-border rounded-xl p-3.5 space-y-2.5">
            <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-white">${cfg.name}</span>
                <label class="inline-flex items-center gap-2 cursor-pointer text-xs">
                    <input type="checkbox" ${cfg.enabled ? 'checked' : ''}
                        onchange="updateGameConfigAdmin('${cfg.id}', 'enabled', this.checked)"
                        class="rounded accent-amber-400">
                    <span class="${cfg.enabled ? 'text-emerald-300' : 'text-rose-300'} font-semibold">${cfg.enabled ? 'Aktif' : 'Nonaktif'}</span>
                </label>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs">
                <div>
                    <label class="text-[10px] text-gray-400 block">Maks Taruhan (Koin)</label>
                    <input type="number" value="${cfg.maxBet}" step="500"
                        onchange="updateGameConfigAdmin('${cfg.id}', 'maxBet', this.value)"
                        class="w-full mt-0.5 px-2.5 py-1 rounded bg-casino-bg border border-casino-border font-mono text-amber-300">
                </div>
                <div>
                    <label class="text-[10px] text-gray-400 block">Pengali Payout (RTP)</label>
                    <select onchange="updateGameConfigAdmin('${cfg.id}', 'rtpMultiplier', this.value)"
                        class="w-full mt-0.5 px-2 py-1 rounded bg-casino-bg border border-casino-border font-mono text-purple-300">
                        <option value="0.8" ${cfg.rtpMultiplier === 0.8 ? 'selected' : ''}>0.8x (Ketat)</option>
                        <option value="1" ${cfg.rtpMultiplier === 1.0 ? 'selected' : ''}>1.0x (Standar)</option>
                        <option value="1.25" ${cfg.rtpMultiplier === 1.25 ? 'selected' : ''}>1.25x (Murah Hati)</option>
                        <option value="1.5" ${cfg.rtpMultiplier === 1.5 ? 'selected' : ''}>1.5x (Event Sultan)</option>
                    </select>
                </div>
            </div>
        </div>
    `).join('');

    // Audit Logs
    document.getElementById('auditLogCountBadge').textContent = `${state.auditLogs.length} Log Tercatat`;
    document.getElementById('adminAuditTableBody').innerHTML = state.auditLogs.map(log => `
        <tr class="hover:bg-casino-surface/40">
            <td class="py-2.5 px-4 text-gray-400">${log.timestamp}</td>
            <td class="py-2.5 px-4 text-purple-300 font-bold">${log.actor}</td>
            <td class="py-2.5 px-4"><span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">${log.action}</span></td>
            <td class="py-2.5 px-4 text-white">${log.target}</td>
            <td class="py-2.5 px-4 font-sans text-gray-300">${log.reason}</td>
        </tr>
    `).join('');
}

// Initialize on Window Load
window.onload = function () {
    initRouletteWheelGraphics();
    switchMainView('lobby');
    selectGameMode('slot');
    refreshAllUI();
};
