document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const username = params.get('user');

    const profileTitle = document.getElementById('profile-title');
    const profileContent = document.getElementById('profile-content');
    const errorMessage = document.getElementById('error-message');

    if (!username) {
        showError("Nenhum usuário especificado.");
        return;
    }

    loadProfileData(username);

    async function loadProfileData(user) {
        try {
            const response = await fetch(`./stats/${user}.json?` + new Date().getTime());
            if (!response.ok) {
                throw new Error(`Perfil para "${user}" não encontrado.`);
            }
            const data = await response.json();
            displayProfile(data);
        } catch (error) {
            console.error(error);
            showError(error.message);
        }
    }

    function displayProfile(data) {
        profileTitle.innerHTML = `<img src="${data.imageUrl}" class="profile-pic" alt="${data.username}"> @${data.username}`;
        
        document.getElementById('total-participacoes').textContent = data.totalParticipacoes;
        document.getElementById('total-eliminacoes').textContent = data.totalEliminacoes;
        document.getElementById('media-rank').textContent = `~${Math.round(data.mediaRank)}º`;
        
        // Adiciona uma verificação para o caso de o jogador ainda não ter um rank
        if (data.melhorRank && data.melhorRank.date) {
            const [ano, mes, dia] = data.melhorRank.date.split('-');
            document.getElementById('melhor-rank').textContent = `${data.melhorRank.rank}º (${dia}/${mes}/${ano})`;
        } else {
            document.getElementById('melhor-rank').textContent = 'N/A';
        }
        
        // AS LINHAS QUE CAUSAVAM O ERRO FORAM REMOVIDAS DAQUI:
        // populateRivalsList('maiores-vitimas', data.maioresVitimas, 'kills');
        // populateRivalsList('maiores-carrascos', data.maioresCarrascos, 'vezes');
        
        createHistoryChart(data.historicoDeBatalhas);

        profileContent.style.display = 'block';
    }
    
    // A FUNÇÃO "populateRivalsList" FOI COMPLETAMENTE REMOVIDA,
    // POIS NÃO É MAIS NECESSÁRIA.
    
    function createHistoryChart(history) {
        const ctx = document.getElementById('historyChart').getContext('2d');
        
        const labels = history.map(h => {
            const [ano, mes, dia] = h.date.split('-');
            return `${dia}/${mes}`;
        });
        const ranks = history.map(h => h.rank);
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Posição no Ranking',
                    data: ranks,
                    borderColor: '#f1c40f',
                    backgroundColor: 'rgba(241, 196, 15, 0.2)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                scales: {
                    y: {
                        reverse: true, // Inverte o eixo Y para que o 1º lugar fique no topo
                        beginAtZero: false,
                        ticks: { color: '#ecf0f1' }
                    },
                    x: {
                        ticks: { color: '#ecf0f1' }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    function showError(message) {
        profileTitle.textContent = "Erro";
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
});