// Conteúdo para o novo arquivo: js/hall-da-fama.js

document.addEventListener('DOMContentLoaded', function() {
    fetch('../data/hall_of_fame_stats.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar os dados do Hall da Fama. Status: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            const topKillersContainer = document.getElementById('top-killers-container');
            const topPodiumsContainer = document.getElementById('top-podiums-container');

            populateRanking(topKillersContainer, data.topKillers, 'totalKills');
            populateRanking(topPodiumsContainer, data.topPodiums, 'podiums');
        })
        .catch(error => {
            console.error('Erro:', error);
            const container = document.querySelector('.row.justify-content-center');
            container.innerHTML = `<div class="col-12 text-center"><p class="text-danger">Não foi possível carregar o Hall da Fama. Tente novamente mais tarde.</p><p class="text-muted">Detalhe do erro: ${error.message}</p></div>`;
        });
});

function populateRanking(container, players, statType) {
    if (!players || players.length === 0) {
        container.innerHTML = '<p class="text-muted text-center mt-3">Nenhum jogador classificado ainda.</p>';
        return;
    }

    let rankHtml = '';
    players.forEach((player, index) => {
        const statValue = player[statType];
        const statLabel = getStatLabel(statType);

        rankHtml += `
            <div class="player-entry">
                <span class="player-rank">${index + 1}</span>
                <img src="${player.imageUrl}" alt="Foto de ${player.username}" class="player-img">
                <div class="player-info">
                    <a href="https://www.instagram.com/${player.username}" target="_blank" class="player-name">${player.username}</a>
                    <div class="player-stats">
                        <span><i class="fas fa-skull-crossbones"></i> ${player.totalKills}</span>
                        <span><i class="fas fa-trophy"></i> ${player.wins}</span>
                        <span><i class="fas fa-medal"></i> ${player.podiums}</span>
                        <span><i class="fas fa-gamepad"></i> ${player.participations}</span>
                    </div>
                </div>
                <span class="player-main-stat">${statValue} ${statLabel}</span>
            </div>
        `;
    });
    container.innerHTML = rankHtml;
}

function getStatLabel(statType) {
    switch (statType) {
        case 'totalKills':
            return 'Kills';
        case 'wins':
            return 'Vitórias';
        case 'podiums':
            return 'Pódios';
        default:
            return '';
    }
}