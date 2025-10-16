document.addEventListener('DOMContentLoaded', () => {
    const rankingListContainer = document.getElementById('ranking-list');
    const searchInput = document.getElementById('searchInput');

    // Função para renderizar a lista de jogadores
    function renderRanking(players) {
        rankingListContainer.innerHTML = ''; // Limpa a lista antes de renderizar

        if (players.length === 0) {
            rankingListContainer.innerHTML = '<p class="loading-message">Nenhum jogador encontrado.</p>';
            return;
        }

        players.forEach((player, index) => {
            const rank = index + 1; // O rank é baseado na ordem da lista original
            const playerElement = document.createElement('div');
            playerElement.classList.add('ranking-item');
            playerElement.dataset.username = player.username.toLowerCase(); // Guarda o username para a busca

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
    }

    // Variável para guardar todos os jogadores carregados
    let allPlayersData = [];

    // Busca os dados do JSON
    fetch('hall_of_fame_stats.json')
        .then(response => response.json())
        .then(data => {
            allPlayersData = data;
            // ### ALTERADO ### Remove o limite de 50 e renderiza TODOS os jogadores
            renderRanking(allPlayersData); 
        })
        .catch(error => {
            console.error(error);
            rankingListContainer.innerHTML = `<p class="loading-message" style="color: #ff6b6b;">Não foi possível carregar o Hall da Fama.</p>`;
        });

    // ### FUNCIONALIDADE DE BUSCA ADICIONADA ###
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const todosOsItens = rankingListContainer.querySelectorAll('.ranking-item');

        todosOsItens.forEach(item => {
            const username = item.dataset.username;
            // Se o username do item incluir o termo da busca, mostra; senão, esconde.
            if (username.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
});