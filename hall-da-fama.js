document.addEventListener('DOMContentLoaded', () => {
    const pontuacaoContainer = document.getElementById('pontuacao-list');
    const searchInput = document.getElementById('searchInput');
    let allPlayersData = [];

    // Função que desenha o ranking na tela
    function renderRanking(playersToRender) {
        pontuacaoContainer.innerHTML = ''; // Limpa a lista

        if (!playersToRender || playersToRender.length === 0) {
            pontuacaoContainer.innerHTML = `<p class="loading-message">Nenhum jogador encontrado.</p>`;
            return;
        }

        playersToRender.forEach((player) => {
            const rank = player.realRank; // Usa o rank real calculado
            
            const playerElement = document.createElement('div');
            playerElement.classList.add('ranking-item'); 

            if (rank === 1) playerElement.classList.add('gold');
            if (rank === 2) playerElement.classList.add('silver');
            if (rank === 3) playerElement.classList.add('bronze');

            
            // --- LÓGICA DO RANK CHANGE (RE-ADICIONADA) ---
            // (Verifica se seu style.css tem as classes .rank-change.up, .down, .stable, .new)
            let rankChangeHtml = '';
            if (player.rankChange === 'new') {
                rankChangeHtml = `<span class="rank-change new">⭐ Novo</span>`;
            } else if (player.rankChange > 0) {
                rankChangeHtml = `<span class="rank-change up">▲ ${player.rankChange}</span>`;
            } else if (player.rankChange < 0) {
                rankChangeHtml = `<span class="rank-change down">▼ ${Math.abs(player.rankChange)}</span>`;
            } else {
                // Se a mudança for 0, mostramos 'stable'
                rankChangeHtml = `<span class="rank-change stable">–</span>`;
            }
            // --- FIM DA LÓGICA DO RANK CHANGE ---


            // Lógica dos pontos (corrigida)
            const statHtml = `<span class="eliminations" style="color: #34d399;">⭐ ${player.pontosAcumulados} Pontos</span>`;

            
            // --- LÓGICA DO MELHOR RANK (RE-ADICIONADA) ---
            // (Verifica se seu style.css tem a classe .best-rank)
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
            // --- FIM DA LÓGICA DO MELHOR RANK ---


            // Monta o HTML interno do <div> do jogador
            playerElement.innerHTML = `
                <div class="rank"><span>${rank}º</span></div>
                <img src="${player.imageUrl}" alt="Foto de ${player.username}" class="profile-pic">
                <div class="user-info">
                    <a href="perfil.html?user=${player.username}" class="username-link">
                        <span class="username">@${player.username}</span>
                    </a>
                    ${statHtml}
                    ${bestRankHtml}  </div>
                ${rankChangeHtml} `;
            
            pontuacaoContainer.appendChild(playerElement);
        });
    }

    // Busca o arquivo JSON
    fetch('hall_of_fame_stats.json?' + new Date().getTime()) // Adiciona cache-bust
        .then(response => response.json())
        .then(data => {
            
            // Ordena os jogadores pelos 'pontosAcumulados' (maior primeiro)
            // O script gerar-stats já salva ordenado, mas garantimos aqui.
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