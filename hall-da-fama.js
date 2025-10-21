document.addEventListener('DOMContentLoaded', () => {
    // Pega os elementos do seu HTML
    const pontuacaoContainer = document.getElementById('pontuacao-list');
    const searchInput = document.getElementById('searchInput');
    let allPlayersData = []; // Para guardar os dados dos jogadores

    // Função que desenha o ranking na tela
    function renderRanking(playersToRender) {
        pontuacaoContainer.innerHTML = ''; // Limpa a lista

        if (!playersToRender || playersToRender.length === 0) {
            pontuacaoContainer.innerHTML = `<p class="loading-message">Nenhum jogador encontrado.</p>`;
            return;
        }

        playersToRender.forEach((player) => {
            const rank = player.realRank; // Usa o rank real calculado
            
            // Cria o elemento <div> para o jogador
            const playerElement = document.createElement('div');
            // Adiciona a classe 'ranking-item' (do seu style.css)
            playerElement.classList.add('ranking-item'); 

            // Adiciona classes de medalha (do seu style.css)
            if (rank === 1) playerElement.classList.add('gold');
            if (rank === 2) playerElement.classList.add('silver');
            if (rank === 3) playerElement.classList.add('bronze');

            
            // ===================================================================
            // ### A CORREÇÃO ESTÁ AQUI ###
            // Trocamos 'player.totalEliminacoes' 
            // pela nova propriedade 'player.pontosAcumulados'
            //
            // ANTES:
            // const statHtml = `<span>⭐ ${player.totalEliminacoes} Pontos</span>`;
            //
            // AGORA (CORRETO):
            const statHtml = `<span class="eliminations">⭐ ${player.pontosAcumulados} Pontos</span>`;
            // ===================================================================


            // Monta o HTML interno do <div> do jogador
            // (Ajuste as classes 'rank', 'profile-pic' etc. para bater com seu 'style.css')
            playerElement.innerHTML = `
                <div class="rank"><span>${rank}º</span></div>
                <img src="${player.imageUrl}" alt="Foto de ${player.username}" class="profile-pic">
                <div class="user-info">
                    <a href="perfil.html?user=${player.username}" class="username-link">
                        <span class="username">@${player.username}</span>
                    </a>
                    ${statHtml}
                </div>
            `;
            // Adiciona o elemento do jogador na lista
            pontuacaoContainer.appendChild(playerElement);
        });
    }

    // Busca o arquivo JSON
    fetch('hall_of_fame_stats.json?' + new Date().getTime()) // Adiciona cache-bust
        .then(response => response.json())
        .then(data => {
            
            // --- MUDANÇA NA ORDENAÇÃO ---
            // Ordena os jogadores pelos 'pontosAcumulados' (maior primeiro)
            const sortedData = data.sort((a, b) => b.pontosAcumulados - a.pontosAcumulados);
            
            // Adiciona a posição (rank) correta em cada jogador
            sortedData.forEach((player, index) => {
                player.realRank = index + 1;
            });

            allPlayersData = sortedData; // Salva os dados ordenados
            renderRanking(allPlayersData); // Desenha o ranking na tela
        })
        .catch(error => {
            console.error("Erro ao carregar hall_of_fame_stats.json:", error);
            pontuacaoContainer.innerHTML = `<p class="loading-message" style="color: #ff6b6b;">Erro ao carregar os dados.</p>`;
        });

    // Adiciona o filtro de busca
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        const filteredPlayers = allPlayersData.filter(player => 
            player.username.toLowerCase().includes(searchTerm)
        );
        
        renderRanking(filteredPlayers); // Redesenha o ranking com os resultados filtrados
    });
});


