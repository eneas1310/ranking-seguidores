document.addEventListener('DOMContentLoaded', () => {
    const pontuacaoContainer = document.getElementById('pontuacao-list');
    const searchInput = document.getElementById('searchInput');
    let allPlayersData = []; // Guarda todos os jogadores carregados

    function renderRanking(playersToRender) {
        pontuacaoContainer.innerHTML = ''; 

        if (!playersToRender || playersToRender.length === 0) {
            pontuacaoContainer.innerHTML = `<p class="loading-message">Nenhum jogador encontrado.</p>`;
            return;
        }

        playersToRender.forEach((player, index) => {
            const rank = index + 1;
            const playerElement = document.createElement('div');
            playerElement.classList.add('ranking-item');

            if (rank === 1) playerElement.classList.add('gold');
            if (rank === 2) playerElement.classList.add('silver');
            if (rank === 3) playerElement.classList.add('bronze');

            // Lógica para o indicador de posição
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

            const statHtml = `<span class="eliminations" style="color: #34d399;">⭐ ${player.pontos} Pontos</span>`;

            playerElement.innerHTML = `
                <div class="rank"><span>${rank}º</span></div>
                <img src="${player.imageUrl}" alt="Foto de ${player.username}" class="profile-pic">
                <div class="user-info">
                    <span class="username">@${player.username}</span>
                    ${statHtml}
                </div>
                ${rankChangeHtml}
            `;
            pontuacaoContainer.appendChild(playerElement);
        });
    }

    // Carrega os dados iniciais
    fetch('hall_of_fame_stats.json?' + new Date().getTime())
        .then(response => response.json())
        .then(data => {
            allPlayersData = data;
            renderRanking(allPlayersData); // Renderiza a lista completa
        })
        .catch(error => {
            console.error(error);
            pontuacaoContainer.innerHTML = `<p class="loading-message" style="color: #ff6b6b;">Erro ao carregar os dados.</p>`;
        });

    // Lógica da busca automática
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        // Filtra o array de DADOS original, não o HTML
        const filteredPlayers = allPlayersData.filter(player => 
            player.username.toLowerCase().includes(searchTerm)
        );
        
        // Re-renderiza a lista apenas com os jogadores filtrados
        renderRanking(filteredPlayers);
    });
});