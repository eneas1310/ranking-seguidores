document.addEventListener('DOMContentLoaded', () => {
    const rankingListContainer = document.getElementById('ranking-list');

    // Busca o arquivo JSON com as estatísticas compiladas
    fetch('hall_of_fame_stats.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Não foi possível carregar o Hall da Fama. Execute o script de geração de stats.');
            }
            return response.json();
        })
        .then(data => {
            // Limpa a mensagem de "carregando"
            rankingListContainer.innerHTML = ''; 

            // Pega apenas os 50 primeiros do ranking
            const top50 = data.slice(0, 50);

            if (top50.length === 0) {
                rankingListContainer.innerHTML = '<p class="loading-message">Ainda não há dados no Hall da Fama.</p>';
                return;
            }

            // Cria e adiciona cada item do ranking na página
            top50.forEach((player, index) => {
                const rank = index + 1;
                const playerElement = document.createElement('div');
                playerElement.classList.add('ranking-item');

                // Adiciona classes especiais para o pódio (1º, 2º, 3º)
                if (rank === 1) playerElement.classList.add('gold');
                if (rank === 2) playerElement.classList.add('silver');
                if (rank === 3) playerElement.classList.add('bronze');

                playerElement.innerHTML = `
                    <div class="rank">
                        <span>${rank}º</span>
                    </div>
                    <img src="${player.profile_pic_url}" alt="Foto de ${player.username}" class="profile-pic">
                    <div class="user-info">
                        <span class="username">@${player.username}</span>
                        <span class="eliminations">💀 ${player.eliminacoes} eliminações</span>
                    </div>
                `;
                rankingListContainer.appendChild(playerElement);
            });
        })
        .catch(error => {
            console.error(error);
            rankingListContainer.innerHTML = `<p class="loading-message" style="color: #ff6b6b;">${error.message}</p>`;
        });
});