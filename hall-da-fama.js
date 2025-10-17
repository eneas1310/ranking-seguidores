document.addEventListener('DOMContentLoaded', () => {
    const pontuacaoContainer = document.getElementById('pontuacao-list');
    const carrascosContainer = document.getElementById('carrascos-list');

    function renderRanking(container, players, tipo) {
        container.innerHTML = ''; 

        if (!players || players.length === 0) {
            container.innerHTML = `<p class="loading-message">Ainda não há dados para este ranking.</p>`;
            return;
        }

        players.forEach((player, index) => {
            const rank = index + 1;
            const playerElement = document.createElement('div');
            playerElement.classList.add('ranking-item');

            if (rank === 1) playerElement.classList.add('gold');
            if (rank === 2) playerElement.classList.add('silver');
            if (rank === 3) playerElement.classList.add('bronze');

            // Define o que será exibido (pontos ou eliminações)
            const statHtml = tipo === 'pontos'
                ? `<span class="eliminations" style="color: #34d399;">⭐ ${player.pontos} Pontos</span>`
                : `<span class="eliminations">💀 ${player.eliminacoes} eliminações</span>`;

            playerElement.innerHTML = `
                <div class="rank"><span>${rank}º</span></div>
                <img src="${player.imageUrl}" alt="Foto de ${player.username}" class="profile-pic">
                <div class="user-info">
                    <span class="username">@${player.username}</span>
                    ${statHtml}
                </div>
            `;
            container.appendChild(playerElement);
        });
    }

    fetch('hall_of_fame_stats.json?' + new Date().getTime())
        .then(response => response.json())
        .then(data => {
            // Renderiza o ranking de Pontuação da Temporada
            const pontuacaoTemporada = data.pontuacaoTemporada ? data.pontuacaoTemporada["2025-10"] : [];
            renderRanking(pontuacaoContainer, pontuacaoTemporada, 'pontos');

            // Renderiza o ranking de Maiores Carrascos
            const maioresCarrascos = data.maioresCarrascos || [];
            renderRanking(carrascosContainer, maioresCarrascos, 'carrascos');
        })
        .catch(error => {
            console.error(error);
            pontuacaoContainer.innerHTML = `<p class="loading-message" style="color: #ff6b6b;">Erro ao carregar os dados.</p>`;
            carrascosContainer.innerHTML = `<p class="loading-message" style="color: #ff6b6b;">Erro ao carregar os dados.</p>`;
        });
});