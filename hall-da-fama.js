document.addEventListener('DOMContentLoaded', () => {
    const pontuacaoContainer = document.getElementById('pontuacao-list');

    function renderRanking(container, players) {
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

            const statHtml = `<span class="eliminations" style="color: #34d399;">⭐ ${player.pontos} Pontos</span>`;

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

    // O fetch agora espera um array simples de jogadores, não mais um objeto complexo
    fetch('hall_of_fame_stats.json?' + new Date().getTime())
        .then(response => response.json())
        .then(data => {
            renderRanking(pontuacaoContainer, data);
        })
        .catch(error => {
            console.error(error);
            pontuacaoContainer.innerHTML = `<p class="loading-message" style="color: #ff6b6b;">Erro ao carregar os dados.</p>`;
        });
});