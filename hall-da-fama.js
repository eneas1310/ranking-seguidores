document.addEventListener('DOMContentLoaded', () => {
    const pontuacaoContainer = document.getElementById('pontuacao-list');
    const searchInput = document.getElementById('searchInput');
    let allPlayersData = [];

    function renderRanking(playersToRender) {
        pontuacaoContainer.innerHTML = '';

        if (!playersToRender || playersToRender.length === 0) {
            pontuacaoContainer.innerHTML = `<p class="loading-message">Nenhum jogador encontrado.</p>`;
            return;
        }

        playersToRender.forEach((player) => {
            const rank = player.realRank;
            const playerElement = document.createElement('div');
            playerElement.classList.add('ranking-item');

            if (rank === 1) playerElement.classList.add('gold');
            if (rank === 2) playerElement.classList.add('silver');
            if (rank === 3) playerElement.classList.add('bronze');

            let rankChangeHtml = '';
            if (player.rankChange === 'new') {
                rankChangeHtml = `<span class="rank-change new">⭐ Novo</span>`;
            } else if (player.rankChange > 0) {
                rankChangeHtml = `<span class="rank-change up">▲ ${player.rankChange}</span>`;
            } else if (player.rankChange < 0) {
                rankChangeHtml = `<span class="rank-change down">▼ ${Math.abs(player.rankChange)}</span>`;
            } else {
                rankChangeHtml = `<span class="rank-change stable">–</span>`;
            }

            // ### LINHA CORRIGIDA ABAIXO ###
            // Trocamos 'player.pontos' por 'player.totalEliminacoes'
            const statHtml = `<span class="eliminations" style="color: #34d399;">⭐ ${player.totalEliminacoes} Pontos</span>`;

            let bestRankHtml = '';
            if (player.bestRank && player.bestRankDate) {
                const [ano, mes, dia] = player.bestRankDate.split('-');
                const dataFormatada = `${dia}/${mes}/${ano}`;
                bestRankHtml = `
                    <small class="best-rank">
                        🏆 Melhor Posição: <strong>${player.bestRank}º lugar</strong> (${dataFormatada})
                    </small>
                `;
            }

            playerElement.innerHTML = `
                <div class="rank"><span>${rank}º</span></div>
                <img src="${player.imageUrl}" alt="Foto de ${player.username}" class="profile-pic">
                <div class="user-info">
                    <a href="perfil.html?user=${player.username}" class="username-link">
                        <span class="username">@${player.username}</span>
                    </a>
                    ${statHtml}
                    ${bestRankHtml}
                </div>
                ${rankChangeHtml}
            `;
            pontuacaoContainer.appendChild(playerElement);
        });
    }

    fetch('hall_of_fame_stats.json?' + new Date().getTime())
        .then(response => response.json())
        .then(data => {
            // Ordenar os dados por 'totalEliminacoes' em ordem decrescente
            const sortedData = data.sort((a, b) => b.totalEliminacoes - a.totalEliminacoes);
            
            // Adicionar o 'realRank' baseado na ordem
            sortedData.forEach((player, index) => {
                player.realRank = index + 1;
            });

            allPlayersData = sortedData;
            renderRanking(allPlayersData);
        })
        .catch(error => {
            console.error(error);
            pontuacaoContainer.innerHTML = `<p class="loading-message" style="color: #ff6b6b;">Erro ao carregar os dados.</p>`;
        });

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        const filteredPlayers = allPlayersData.filter(player => 
            player.username.toLowerCase().includes(searchTerm)
        );
        
        renderRanking(filteredPlayers);
    });
});