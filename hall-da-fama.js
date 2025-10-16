document.addEventListener('DOMContentLoaded', () => {
    const rankingListContainer = document.getElementById('ranking-list');

    fetch('hall_of_fame_stats.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Não foi possível carregar o Hall da Fama. Execute o script de geração de stats.');
            }
            return response.json();
        })
        .then(data => {
            rankingListContainer.innerHTML = ''; 
            const top50 = data.slice(0, 50);

            if (top50.length === 0) {
                rankingListContainer.innerHTML = '<p class="loading-message">Ainda não há dados no Hall da Fama.</p>';
                return;
            }

            top50.forEach((player, index) => {
                const rank = index + 1;
                const playerElement = document.createElement('div');
                playerElement.classList.add('ranking-item');

                if (rank === 1) playerElement.classList.add('gold');
                if (rank === 2) playerElement.classList.add('silver');
                if (rank === 3) playerElement.classList.add('bronze');

                playerElement.innerHTML = `
                    <div class="rank">
                        <span>${rank}º</span>
                    </div>
                    <img src="${player.imageUrl}" alt="Foto de ${player.username}" class="profile-pic">
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